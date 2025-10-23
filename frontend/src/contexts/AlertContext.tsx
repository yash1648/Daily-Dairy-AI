import React, { createContext, useContext, useState, ReactNode } from "react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
interface AlertData {
    message: string;
    title?: string;
    variant?: "default" | "destructive";
}

interface AlertContextType {
    showAlert: (data: AlertData) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useGlobalAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error("useGlobalAlert must be used within AlertProvider");
    return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alert, setAlert] = useState<AlertData | null>(null);

    const showAlert = (data: AlertData) => {
        setAlert(data);
        setTimeout(() => setAlert(null), 3000); // Auto-hide
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
    {children}
    {alert && (
        <div className="fixed top-4 right-4 z-50 w-[24rem]">
        <div className="animate-fade-in">
        <Alert variant={alert.variant || "default"}>
        <div className="flex items-start">
            <div>
                <AlertTitle>{alert.title || "Notice"}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
            </div>
            </div>
            </Alert>
            </div>
            </div>
    )}
    </AlertContext.Provider>
);
};
