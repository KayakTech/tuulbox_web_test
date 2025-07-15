import DI from "@/di-container";
import { useEffect, useReducer, useState, useCallback, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { SettingsPreference } from "@/services/settings-service";
import { ExportSquare, Trash } from "iconsax-react";
import useEmailPasswordAuthentication from "./emailPasswordAuthentication";
import { getTimeZone } from "@/helpers";
import useCalendar from "./calendar";
import { TimeZone } from "@/repositories/calendar-repository";
import { Settings } from "@/repositories/settings-reposiroty";
import useAutoLogout from "./auto-logout";
import { settingsActions } from "@/store/settings-reducer";
import { useToast } from "@/context/ToastContext";

const TOGGLE_SETTINGS = [
    {
        title: "Everything",
        description: "Turn on notifications for all",
        slug: "everything",
    },
    {
        title: "Emails",
        description: "Turn on notifications for emails only",
        slug: "emails",
    },
    {
        title: "License reminders",
        description: "Turn on notifications for licenses reminders only",
        slug: "license",
    },
    {
        title: "Insurance reminders",
        description: "Turn on notifications for insurances reminders only",
        slug: "insurance",
    },
    {
        title: "Document reminders",
        description: "Turn on notifications for document reminders only",
        slug: "document",
    },
    {
        title: "Document expirations",
        description: "Turn on notifications for document expirations only",
        slug: "document",
    },
];

const useSettings = () => {
    const { emails, license, insurance, document, settings, timeZones } = useSelector(
        (state: RootState) => state.settings,
    );
    const { user } = useSelector((state: RootState) => state.account);
    const { resetPassword } = useEmailPasswordAuthentication(DI.firebaseAuth);
    const { getTimezones } = useCalendar({});
    const { getAutoLogoutDuration, setAutoLogoutDuration } = useAutoLogout();
    const dispatch = useDispatch();
    const { showToast } = useToast();

    const hasLoadedSettings = useRef(false);
    const hasLoadedPreferences = useRef(false);
    const isLoadingSettings = useRef(false);
    const isLoadingPreferences = useRef(false);

    const [hasToggled, setHasToggled] = useState<number>(0);
    const [showResetPasswordModal, setShowResetPasswordModal] = useState<boolean>(false);
    const [showTimeZoneModal, setShowTimeZoneModal] = useState<boolean>(false);
    const [showAutoLogoutModal, setShowAutoLogoutModal] = useState<boolean>(false);
    const [userEmail, setUserEmail] = useState<string | undefined>(user?.email);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [hasSentResetLink, setHasSentResetLink] = useState<boolean>(false);
    const [defaultTimeZone, setDefaultTimeZone] = useState<TimeZone>();
    const [userTimeZone, setUserTimeZone] = useState<string>("");
    const [generalSettings, setGeneralSettings] = useState<any>();
    const [autoLogoutDuration, setAutoLogoutDurationState] = useState<number>(120);

    const [preferences, setPreferences] = useReducer(
        (state: Partial<SettingsPreference>, newState: Partial<SettingsPreference>) => ({ ...state, ...newState }),
        {
            emails: emails || false,
            license: license || false,
            document: document || false,
            insurance: insurance || false,
        },
    );

    const getPreferences = useCallback(async () => {
        if (hasLoadedPreferences.current || isLoadingPreferences.current) {
            return;
        }

        isLoadingPreferences.current = true;
        try {
            const res = await DI.settingsService.getPreferences();
            hasLoadedPreferences.current = true;
            if (res?.data) {
                setPreferences(res.data);
            }
        } catch (error) {
            console.error("Failed to get preferences:", error);
        } finally {
            isLoadingPreferences.current = false;
        }
    }, []);

    const getGeneralSettings = useCallback(async () => {
        if (hasLoadedSettings.current || isLoadingSettings.current) {
            return;
        }

        isLoadingSettings.current = true;
        try {
            const res = await DI.settingsService.getGeneralSettings();
            hasLoadedSettings.current = true;
            setGeneralSettings(res.data);
            setUserTimeZone(res.data.timezone);
            // update Redux store with the latest settings
            dispatch(settingsActions.updateSettings(res.data));
            setAutoLogoutDurationState(res.data.autoLogoutTimeout || 120);
        } catch (error) {
            console.error("Failed to get general settings:", error);
        } finally {
            isLoadingSettings.current = false;
        }
    }, [dispatch]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await Promise.all([getTimezones(), getPreferences(), getGeneralSettings()]);
                const currentDuration = getAutoLogoutDuration();
                setAutoLogoutDurationState(currentDuration);
            } catch (error) {
                console.error("Failed to load initial data:", error);
            }
        };

        loadInitialData();
    }, []);

    const handleSavePreferences = useCallback(async () => {
        try {
            await DI.settingsService.updatePreferences(preferences);
        } catch (error) {
            console.error("Failed to save preferences:", error);
        }
    }, [preferences]);

    useEffect(() => {
        if (hasToggled > 0) {
            handleSavePreferences();
        }

        const everything = window.document.getElementById("everything");
        if (everything instanceof HTMLInputElement) {
            everything.checked = allChecked();
        }
    }, [hasToggled, handleSavePreferences]);

    function handleToggleSetting(e: React.ChangeEvent<HTMLInputElement>, settingType: any) {
        const emails = window.document.getElementById("emails");
        const license = window.document.getElementById("license");
        const insurance = window.document.getElementById("insurance");
        const document = window.document.getElementById("document");
        const everything = window.document.getElementById("everything");

        if (settingType.slug === "everything") {
            setPreferences({
                emails: e.target.checked,
                license: e.target.checked,
                insurance: e.target.checked,
                document: e.target.checked,
            });

            if (emails instanceof HTMLInputElement) emails.checked = e.target.checked;
            if (license instanceof HTMLInputElement) license.checked = e.target.checked;
            if (insurance instanceof HTMLInputElement) insurance.checked = e.target.checked;
            if (document instanceof HTMLInputElement) document.checked = e.target.checked;
        }

        if (settingType.slug != "everything") {
            setPreferences({ [settingType.slug]: e.target.checked });
        }

        setHasToggled(prev => prev + 1);
    }

    const updateGeneralSettings = useCallback(
        async (payload: Partial<Settings>) => {
            setErrorMessage("");
            setIsSubmitting(true);
            try {
                const res = await DI.settingsService.updateGeneralSettings(payload);
                setUserTimeZone(res.data.timezone);
                setShowTimeZoneModal(false);
                dispatch(settingsActions.updateSettings(res.data));
            } catch (error) {
                console.error("Failed to update general settings:", error);
                setErrorMessage("Failed to update settings. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        },
        [dispatch],
    );

    function extractPreference(setting: any) {
        if (setting.slug === "emails") {
            return preferences.emails;
        }
        if (setting.slug === "insurance") {
            return preferences.insurance;
        }
        if (setting.slug === "license") {
            return preferences.license;
        }
        if (setting.slug === "document") {
            return preferences.document;
        }
        return false;
    }

    function allChecked() {
        return preferences.emails && preferences.insurance && preferences.license && preferences.document
            ? true
            : false;
    }

    // Handle auto logout duration save
    const handleAutoLogoutSave = useCallback(
        async (duration: number) => {
            setIsSubmitting(true);
            try {
                await setAutoLogoutDuration(duration);
                showToast({
                    heading: "Success",
                    message: "Auto logout duration updated successfully.",
                    variant: "success",
                });
                setAutoLogoutDurationState(duration);

                setShowAutoLogoutModal(false);
            } catch (error) {
                showToast({
                    heading: "Error",
                    message: "Failed to update auto logout duration.",
                    variant: "danger",
                });
                setErrorMessage("Failed to save auto logout settings. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        },
        [setAutoLogoutDuration],
    );

    // Format auto logout duration for display
    const getAutoLogoutDisplayText = useCallback((duration: number): string => {
        if (duration === -1) {
            return "Never";
        }
        return `${duration} Mins`;
    }, []);

    useEffect(() => {
        if (!userTimeZone && timeZones) {
            const timeZone = getTimeZone();
            const findTimeZone = timeZones.find(tz => [timeZone].includes(tz.value));

            if (timeZone && findTimeZone) {
                setDefaultTimeZone(findTimeZone);
                setUserTimeZone(findTimeZone.value);
            } else {
                setDefaultTimeZone({ value: timeZone, label: timeZone });
            }
        }
    }, [timeZones, userTimeZone]);

    const OTHER_SETTINGS = useMemo(
        () => [
            {
                title: "Change Password",
                description: "Confirm your email and reset your password",
                url: "",
                buttonText: "Reset",
                onClick: () => {
                    setShowResetPasswordModal(true);
                },
            },
            {
                title: "Time Zone",
                description: settings ? userTimeZone : defaultTimeZone,
                url: "",
                buttonText: "Update",
                onClick: () => {
                    setShowTimeZoneModal(true);
                },
            },
            {
                title: "Auto Logout",
                description: `Auto logout session is set to ${getAutoLogoutDisplayText(
                    autoLogoutDuration,
                )}. You can always adjust the timing to suit your preference`,
                url: "",
                buttonText: "Update",
                onClick: () => {
                    setShowAutoLogoutModal(true);
                },
            },
            {
                title: "Feedback and support",
                description:
                    "Allow us assist you in any area of concerns you may have. Click on the link to visit our website and get help.",
                url: "/support",
                buttonText: "Open Link",
                icon: ExportSquare,
            },
            {
                title: "Privacy Policy",
                description: "Read through our privacy policy now",
                url: "/privacy-policy",
                buttonText: "Open Link",
                icon: ExportSquare,
            },
            {
                title: "Request account deletion",
                description: "You will lose all your data by clicking this action",
                buttonText: "Reset",
                icon: Trash,
            },
        ],
        [settings, userTimeZone, defaultTimeZone, autoLogoutDuration, getAutoLogoutDisplayText],
    );

    const handleResetPasswordSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setIsSubmitting(true);
            setErrorMessage("");

            try {
                await resetPassword(`${user?.email}`);
                setHasSentResetLink(true);
            } catch (error: any) {
                setErrorMessage("Email not found!");
            } finally {
                setIsSubmitting(false);
            }
        },
        [resetPassword, user?.email],
    );

    const backToLogin = useCallback(() => {
        setShowResetPasswordModal(false);
        DI.authService.logout();
    }, []);

    const handleTimeZoneSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const payload = {
                timezone: userTimeZone,
            };
            await updateGeneralSettings(payload);
        },
        [userTimeZone, updateGeneralSettings],
    );

    return {
        TOGGLE_SETTINGS,
        handleToggleSetting,
        extractPreference,
        preferences,
        allChecked,
        OTHER_SETTINGS,
        showResetPasswordModal,
        setShowResetPasswordModal,
        user,
        userEmail,
        setUserEmail,
        handleResetPasswordSubmit,
        hasSentResetLink,
        isSubmitting,
        backToLogin,
        errorMessage,
        settings,
        defaultTimeZone,
        showTimeZoneModal,
        setShowTimeZoneModal,
        timeZones,
        userTimeZone,
        setUserTimeZone,
        handleTimeZoneSubmit,
        updateGeneralSettings,
        generalSettings,
        showAutoLogoutModal,
        setShowAutoLogoutModal,
        autoLogoutDuration,
        handleAutoLogoutSave,
    };
};

export default useSettings;
