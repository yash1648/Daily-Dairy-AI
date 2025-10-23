import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { Note } from "@/contexts/NotesContext.tsx";

// Types for better type safety
interface LoginPayload {
    username: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user?: any;
}

interface ApiError {
    message: string;
    status?: number;
    data?: any;
}

// Base configuration
const BASE_URL = "http://localhost:6969/api";
const REQUEST_TIMEOUT = 10000;

// Create main API instance with JWT interceptor
const api = axios.create({
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Create auth API instance (no JWT interceptor)
const authApi = axios.create({
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// JWT Request Interceptor - Add token to all requests except auth
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request for debugging (remove in production)
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data
        });

        return config;
    },
    (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor - Handle common errors
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log successful responses (remove in production)
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error: AxiosError) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
            // Unauthorized - token expired or invalid
            console.warn('🔒 Token expired or invalid, logging out...');
            localStorage.removeItem('token');

            // Avoid redirect loop
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            console.warn('🚫 Access forbidden');
        } else if (error.response?.status === 404) {
            console.warn('🔍 Resource not found');
        } else if (error.response?.status >= 500) {
            console.error('🔥 Server error');
        } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
            console.error('🌐 Network error - check if backend is running');
        }

        return Promise.reject(error);
    }
);

// Auth API Response Interceptor (simpler, no token handling)
authApi.interceptors.response.use(
    (response: AxiosResponse) => {
        console.log(`✅ Auth ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status
        });
        return response;
    },
    (error: AxiosError) => {
        console.error('❌ Auth API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

// Utility function to handle API errors
const handleApiError = (error: unknown): ApiError => {
    if (error instanceof AxiosError) {
        return {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status,
            data: error.response?.data
        };
    }

    return {
        message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
};

// Auth functions
export const authService = {
    login: async (email: string, password: string): Promise<string> => {
        const payload: LoginPayload = {
            username: email,
            password: password,
        };

        console.log("🔐 Attempting login for:", email);

        try {
            const response = await authApi.post<LoginResponse>("/auth/signin", payload);

            const token = response.data.token;
            if (!token) {
                throw new Error('No token received from server');
            }

            // Store token securely
            localStorage.setItem('token', token);
            console.log("✅ Login successful");

            return token;
        } catch (error) {
            const apiError = handleApiError(error);
            console.error("❌ Login failed:", apiError);
            throw new Error(apiError.message);
        }
    },

    logout: (): void => {
        console.log("🚪 Logging out...");
        localStorage.removeItem('token');

        // Optional: Call backend logout endpoint
        // authApi.post('/auth/logout').catch(() => {});
    },

    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    getToken: (): string | null => {
        return localStorage.getItem('token');
    }
};

// Notes API service
export const notesApi = {
    // Get all notes
    getAllNotes: async (): Promise<Note[]> => {
        try {
            console.log("📝 Fetching all notes...");
            const res = await api.get('/notes');
            const response=res.data;
            // Validate response data
            if (!Array.isArray(response.data)) {
                console.warn('⚠️ Invalid notes data format, expected array');
                return [];
            }

            console.log(`✅ Fetched ${response.data.length} notes`);
            return response.data;
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('❌ Failed to fetch notes:', apiError);
            throw new Error(apiError.message);
        }
    },

    // Create a new note
    createNote: async (noteData: { title: string; content: string }): Promise<Note> => {
        try {
            console.log("➕ Creating new note:", noteData.title);
            const res = await api.post('/notes', noteData);
            const response=res.data;
            console.log("✅ Note created with ID:", response.data.id);
            return response.data;
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('❌ Failed to create note:', apiError);
            throw new Error(apiError.message);
        }
    },

    // Update an existing note
    updateNote: async (id: string, data: Partial<Note>): Promise<Note> => {
        try {
            console.log("✏️ Updating note:", id);
            const res = await api.put(`/notes/${id}`, data);
            const response=res.data;
            console.log("✅ Note updated:", id);
            return response.data;
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('❌ Failed to update note:', apiError);
            throw new Error(apiError.message);
        }
    },

    // Delete a note
    deleteNote: async (id: string): Promise<void> => {
        try {
            console.log("🗑️ Deleting note:", id);
            await api.delete(`/notes/${id}`);
            console.log("✅ Note deleted:", id);
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('❌ Failed to delete note:', apiError);
            throw new Error(apiError.message);
        }
    },

    // Get a specific note by ID
    getNoteById: async (id: string): Promise<Note> => {
        try {
            console.log("🔍 Fetching note:", id);
            const response = await api.get<Note>(`/notes/${id}`);
            console.log("✅ Note fetched:", id);
            return response.data;
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('❌ Failed to fetch note:', apiError);
            throw new Error(apiError.message);
        }
    },
};

// Health check function
export const healthCheck = async (): Promise<boolean> => {
    try {
        const response = await authApi.get('/health', { timeout: 5000 });
        return response.status === 200;
    } catch (error) {
        console.warn('⚡ Backend health check failed');
        return false;
    }
};

// Export individual functions for backward compatibility
export const {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
} = notesApi;

// Legacy exports
export const loginUser = authService.login;
export const logoutUser = authService.logout;

// Export instances for advanced usage
export { api, authApi };

// Default export
export default {
    auth: authService,
    notes: notesApi,
    healthCheck,
};