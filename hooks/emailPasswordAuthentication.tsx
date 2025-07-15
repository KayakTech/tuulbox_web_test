import {
    Auth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    sendEmailVerification,
} from "firebase/auth";
import DI from "@/di-container";
import { useReducer } from "react";
import { setUserId } from "firebase/analytics";
import { useRouter } from "next/router";
import { deleteCookie } from "cookies-next";
import { useToast } from "@/context/ToastContext";

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

type LoginState = {
    isLoading: boolean;
    formValidated: boolean;
    errorMessage: string;
};

const useEmailPasswordAuthentication = (firebaseAuth: Auth) => {
    const router = useRouter();
    const { showToast } = useToast();
    const [state, dispatch] = useReducer(
        (state: LoginState, newState: Partial<LoginState>) => ({ ...state, ...newState }),
        {
            isLoading: false,
            formValidated: false,
            errorMessage: "",
        },
    );

    const registerUserWithEmailAndPassword = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);

            try {
                await sendEmailVerification(userCredential.user);
            } catch (verificationError) {
                showToast({
                    heading: "Verification Failed",
                    message: "Verification email could not be sent.",
                    variant: "danger",
                });
                dispatch({ errorMessage: "Verification email could not be sent." });
            }

            return userCredential.user;
        } catch (error) {
            dispatch({ errorMessage: "Registration failed. Please try again." });
            throw error;
        }
    };

    const signInUserWithEmailAndPassword = async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        return userCredential.user;
    };

    const resetPassword = async (email: string) => {
        try {
            const response = await sendPasswordResetEmail(firebaseAuth, email);
        } catch (error) {
            throw Error("Failed");
        }
    };

    async function signInWithGoogle() {
        const userCredential = await signInWithPopup(auth, googleProvider);
        return userCredential.user;
    }

    async function signInWithFacebook() {
        const userCredential = await signInWithPopup(auth, facebookProvider);
        return userCredential.user;
    }

    async function signInWithApple() {
        const userCredential = await signInWithPopup(auth, appleProvider);
        return userCredential.user;
    }

    async function redirectToTheApp(user: any) {
        dispatch({ isLoading: true });
        await DI.authService.getAuthToken(user);

        const authUser = await DI.accountService.getUser();

        authUser.data.id && DI.analytics && setUserId(DI.analytics!, `${authUser.data.id}`);

        authUser.data.companyId && (await DI.businessService.getCompanyDetails(authUser.data.companyId));
        await DI.settingsService.getPreferences();

        // clear email cookie
        deleteCookie("email");

        const urlParams = new URLSearchParams(window.location.search);
        const redirect_url = urlParams.get("redirect");
        if (redirect_url) {
            router.push(`${redirect_url}`);
            return;
        }

        const inviteId = urlParams.get("inviteId");
        if (inviteId) {
            router.push(`/invite/${inviteId}`);
            return;
        }
        router.push(`/overview`);
    }

    return {
        registerUserWithEmailAndPassword,
        signInUserWithEmailAndPassword,
        resetPassword,
        signInWithGoogle,
        signInWithFacebook,
        signInWithApple,
        redirectToTheApp,
        state,
        dispatch,
    };
};

export default useEmailPasswordAuthentication;
