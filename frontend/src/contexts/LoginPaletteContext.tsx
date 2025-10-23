import React, { createContext, useContext, useState, ReactNode } from 'react';
import {authService, loginUser, logoutUser} from "@/apis/Apis.tsx";
import {useGlobalAlert} from "@/contexts/AlertContext.tsx";


interface LoginPaletteContextType {
    isOpen: boolean;
    openLoginPalette: () => void;
    closeLoginPalette: () => void;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const LoginPaletteContext = createContext<LoginPaletteContextType | undefined>(undefined);

interface LoginPaletteProviderProps {
    children: ReactNode;
}

export const LoginPaletteProvider = ({ children }: LoginPaletteProviderProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { showAlert } = useGlobalAlert(); // 👈 inject
    // Open/close functions
    const openLoginPalette = () => setIsOpen(true);
    const closeLoginPalette = () => setIsOpen(false);

    // Mock login/logout functions
    const login = async (email: string, password: string) => {
        // Add real auth logic here (e.g., API call)
        try {
            const token = await authService.login(email, password);
            console.log('Logged in!');
        } catch (error) {
            console.error('Login failed:', error.message);
            setIsOpen(false);
        }
        if (authService.isAuthenticated()) {
            setIsLoggedIn(true);
            closeLoginPalette();
            showAlert({
                title: "Login Successful",
                message: `Welcome ${email} !`,
                variant: "default",
            });
            return true;
        }

    };

    const logout = () => {
        if(authService.isAuthenticated()) {
            logoutUser();
            setIsLoggedIn(false);
            closeLoginPalette();
            showAlert({
                title: "Logout Successful",
                message: "See you again !",
                variant: "default",
            });
        }
    }

    // Keyboard shortcuts (optional)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closeLoginPalette();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    return (
        <LoginPaletteContext.Provider
            value={{
                isOpen,
                openLoginPalette,
                closeLoginPalette,
                isLoggedIn,
                login,
                logout,
            }}
        >
            {children}
        </LoginPaletteContext.Provider>
    );
};

export const useLoginPalette = () => {
    const context = useContext(LoginPaletteContext);
    if (context === undefined) {
        throw new Error('useLoginPalette must be used within a LoginPaletteProvider');
    }
    return context;
};
