import axios, {AxiosError} from "axios";
const api = axios.create({
    baseURL: "http://localhost:6969/api",
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add interceptor to include JWT in headers
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function loginUser(email: string, password: string): Promise<string> {
    const payload = {
        username: email,
        password: password,
    };
    console.log("Sending login request with payload:", payload);
    try {

        const response = await api.post("/auth/signin", payload);

        // Store token in localStorage for future requests
        localStorage.setItem('token', response.data.token);

        return response.data.token;
    } catch (error) {
        if (error instanceof AxiosError) {
            // This is the important part - log the response data
            console.error("Full error response:", error.response?.data);
            console.error("Status:", error.response?.status);
            console.error("Headers:", error.response?.headers);
        }
        throw error;
    }
}

export function logoutUser() {
    localStorage.removeItem('token');
}