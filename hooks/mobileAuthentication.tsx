import { useState } from "react";
import { Auth, signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult, PhoneAuthProvider } from "firebase/auth";

const useMobileAuthentication = (firebaseAuth: Auth) => {
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

    const sendVerificationCode = async (phoneNumber: string) => {
        const verifier = new RecaptchaVerifier(
            "recaptcha-container",
            {
                size: "invisible",
                callback: (_response: any) => {
                    // This callback is called when reCAPTCHA is solved.
                    // You can use it to trigger the verification code send.
                },
            },
            firebaseAuth,
        );
        setRecaptchaVerifier(verifier);
        const confirmationResult = await signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
        setConfirmationResult(confirmationResult);
    };

    const confirmVerificationCode = async (code: string) => {
        const userCredential = await confirmationResult?.confirm(code);
        return userCredential?.user;
    };

    return { sendVerificationCode, confirmVerificationCode, recaptchaVerifier, confirmationResult };
};

export default useMobileAuthentication;
