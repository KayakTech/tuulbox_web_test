import React, { createContext, useContext, useState, ReactNode } from "react";
import { MyToast } from "../components/MyToast";

type ToastContextType = {
    showToast: (config: ShowToastProps) => void;
    hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type ShowToastProps = {
    heading?: string;
    message: string;
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "dark" | "light";
    showToast?: boolean;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toastProps, setToastProps] = useState<ShowToastProps>({
        showToast: false,
        heading: "",
        message: "",
        variant: "light",
    });

    const showToast = (config: Partial<ShowToastProps>) => {
        setToastProps({
            ...toastProps,
            ...config,
            showToast: true,
        });
    };

    const hideToast = () => {
        setToastProps(prev => ({ ...prev, showToast: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            <MyToast
                showToast={toastProps.showToast ?? false}
                setShowToast={hideToast}
                heading={toastProps.heading}
                message={toastProps.message}
                variant={toastProps.variant}
            />
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
