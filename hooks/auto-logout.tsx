import { useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import DI from "@/di-container";

const DEFAULT_AUTO_LOGOUT_DURATION = 120; // 120 minutes as default

interface UseAutoLogoutReturn {
    getAutoLogoutDuration: () => number;
    setAutoLogoutDuration: (duration: number) => Promise<void>;
}

export const useAutoLogout = (): UseAutoLogoutReturn => {
    const { settings } = useSelector((state: RootState) => state.settings);

    const getAutoLogoutDuration = useCallback((): number => {
        // Get from backend settings if available, otherwise use default
        return settings?.autoLogoutTimeout ?? DEFAULT_AUTO_LOGOUT_DURATION;
    }, [settings]);

    const setAutoLogoutDuration = useCallback(async (duration: number): Promise<void> => {
        try {
            // Update the backend with the new auto logout duration
            await DI.settingsService.updateGeneralSettings({
                autoLogoutTimeout: duration,
            });

            // Reload the page to apply the changes
            if (typeof window !== "undefined") {
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to update auto logout duration:", error);
            throw error;
        }
    }, []);

    return {
        getAutoLogoutDuration,
        setAutoLogoutDuration,
    };
};

export default useAutoLogout;
