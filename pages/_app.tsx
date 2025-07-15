import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-phone-input-2/lib/style.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import "react-image-lightbox/style.css";
import "./chat-app/styles/chat-app.css";
import "@/public/styles/global.scss";
import type { AppProps } from "next/app";
import { PersistGate } from "redux-persist/integration/react";
import { Provider, useSelector, useDispatch } from "react-redux";
import { persistor, store, RootState, clearInsurancesFromLocalStorage } from "@/store";
import { useEffect } from "react";
import { useRouter } from "next/router";
import DI from "@/di-container";
import { logEvent } from "firebase/analytics";
import Head from "next/head";
import Script from "next/script";
import { ToastProvider } from "../context/ToastContext";
import { clearProjectStore } from "@/store/project-reducer";
import { clearRecentStore } from "@/store/recent-reducer";
import { clearFavoriteStore } from "@/store/favorite-reducer";
import { clearStorageStore } from "@/store/storage-reducer";
import { clearProjectDocumentStore } from "@/store/project-document-reducer";
import { clearLicenseStore } from "@/store/license-reducer";
import { clearInsuranceStore } from "@/store/insurance-reducer";
import { clearContactStore } from "@/store/contact-reducer";
import { clearOfficerStore } from "@/store/officers-reducer";
import { clearResources } from "@/store/links-reducer";
import { authActions } from "@/store/auth-reducer";
import {
    clearProjectsFromLocalStorage,
    clearRecentsFromLocalStorage,
    clearFavoritesFromLocalStorage,
    clearProjectDocumentsFromLocalStorage,
    clearStorageFromLocalStorage,
    clearLicensesFromLocalStorage,
    clearContactsFromLocalStorage,
    clearOfficersFromLocalStorage,
    clearLinksFromLocalStorage,
} from "@/store";

const GA_TRACKING_ID = "AW-1070104689";
const DEFAULT_AUTO_LOGOUT_DURATION = 120;

function AutoLogoutProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const { settings } = useSelector((state: RootState) => state.settings);
    const dispatch = useDispatch();
    const router = useRouter();

    let timeout: NodeJS.Timeout | null = null;

    // get auto logout duration from backend settings
    const getAutoLogoutDuration = (): number => {
        return settings?.autoLogoutTimeout ?? DEFAULT_AUTO_LOGOUT_DURATION;
    };

    const performLogout = async () => {
        try {
            // Clear project data from the Redux store
            dispatch(clearProjectStore());
            dispatch(clearRecentStore());
            dispatch(clearFavoriteStore());
            dispatch(clearProjectDocumentStore());
            dispatch(clearStorageStore());
            dispatch(clearLicenseStore());
            dispatch(clearInsuranceStore());
            dispatch(clearContactStore());
            dispatch(clearOfficerStore());
            dispatch(clearResources());

            // Clear localStorage data
            clearProjectsFromLocalStorage();
            clearRecentsFromLocalStorage();
            clearFavoritesFromLocalStorage();
            clearProjectDocumentsFromLocalStorage();
            clearStorageFromLocalStorage();
            clearLicensesFromLocalStorage();
            clearInsurancesFromLocalStorage();
            clearContactsFromLocalStorage();
            clearOfficersFromLocalStorage();
            clearLinksFromLocalStorage();

            // Clear auth state
            dispatch(authActions.logout());

            // Perform the actual logout service call
            await DI.authService.logout();

            // Redirect to login page
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Auto logout failed:", error);
        }
    };

    const restartAutoReset = () => {
        const duration = getAutoLogoutDuration();

        // clear the existing timeout
        if (timeout) {
            console.log("Clearing existing timeout");
            clearTimeout(timeout);
        }

        // If duration is -1, it means "Never", so don't set a timer
        if (duration === -1) {
            console.log("Auto logout disabled (Never)");
            return;
        }

        // set new timeout (convert minutes to milliseconds)
        timeout = setTimeout(() => {
            console.log("Auto logout timer expired - logging out");
            performLogout();
        }, duration * 60 * 1000);
    };

    const onUserActivity = () => {
        if (!isAuthenticated) {
            return;
        }
        restartAutoReset();
    };

    useEffect(() => {
        // nnly run if user is authenticated
        if (!isAuthenticated) {
            // clear timeout if user is not authenticated
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            return;
        }

        // timeout init
        restartAutoReset();

        // user events
        const activityEvents = [
            "mousemove",
            "mousedown",
            "keypress",
            "scroll",
            "touchstart",
            "click",
            "keydown",
            "keyup",
            "touchmove",
            "touchend",
            "wheel",
        ];

        // added event listeners
        activityEvents.forEach(event => {
            window.addEventListener(event, onUserActivity);
        });

        // Cleanup function
        return () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            // remove event listeners
            activityEvents.forEach(event => {
                window.removeEventListener(event, onUserActivity);
            });
        };
    }, [isAuthenticated, settings?.autoLogoutTimeout, router.pathname]);

    return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    useEffect(() => {
        // @ts-ignore
        window.dataLayer = window.dataLayer || [];

        function gtag(...args: any[]) {
            // @ts-ignore
            window.dataLayer.push(args);
        }

        gtag("js", new Date());
        gtag("config", GA_TRACKING_ID);
    }, []);

    useEffect(() => {
        const logPageView = (url: string) => {
            if (DI.analytics) {
                logEvent(DI.analytics, "page_view", { page_path: url });
            }
        };

        logPageView(window.location.pathname);

        router.events.on("routeChangeComplete", logPageView);

        return () => {
            router.events.off("routeChangeComplete", logPageView);
        };
    }, [router.events]);

    return (
        <ToastProvider>
            <>
                <Script strategy="afterInteractive" src="https://kt-chatbox.pages.dev/assets/kgt-chatbox.js"></Script>
                <Script
                    strategy="afterInteractive"
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                />
                <Script
                    id="gtag-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
                    }}
                />
                <Head>
                    <title>Manage Construction Projects, Tasks, Contacts & Files on the Go - tuulbox</title>
                    <meta
                        name="description"
                        content="Manage Construction Projects, Tasks, Contacts & Files on the Go"
                    />
                    <meta property="og:image" content="/images/logo.svg" />
                    <meta
                        property="og:title"
                        content="Manage Construction Projects, Tasks, Contacts & Files on the Go - tuulbox"
                    />
                    <meta
                        property="og:description"
                        content={"Manage Construction Projects, Tasks, Contacts & Files on the Go"}
                    />
                    <meta property="og:image" content={"/images/logo.svg"} />
                    <meta property="og:type" content="website" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta
                        name="twitter:title"
                        content={"Manage Construction Projects, Tasks, Contacts & Files on the Go - tuulbox"}
                    />
                    <meta
                        name="twitter:description"
                        content={"Manage Construction Projects, Tasks, Contacts & Files on the Go"}
                    />
                    <meta name="twitter:image" content={"/images/logo.svg"} />
                </Head>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <AutoLogoutProvider>
                            <Component {...pageProps} />
                        </AutoLogoutProvider>
                    </PersistGate>
                </Provider>
            </>
        </ToastProvider>
    );
}
