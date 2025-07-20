import React, { createContext, useContext, useState, ReactNode } from 'react';
import {loginUser, logoutUser} from "@/apis/Apis.tsx";


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

    // Open/close functions
    const openLoginPalette = () => setIsOpen(true);
    const closeLoginPalette = () => setIsOpen(false);

    // Mock login/logout functions
    const login = async (email: string, password: string) => {
        // Add real auth logic here (e.g., API call)
        try {
            const token = await loginUser(email, password);
            setIsLoggedIn(true);
            closeLoginPalette();
            return true;

        } catch (err) {
            console.error("Login failed", err);
            return false;
        }


    };

    const logout = () => {
        logoutUser();
        setIsLoggedIn(false);
        closeLoginPalette();
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
