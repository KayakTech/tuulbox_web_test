import { Button, Form, InputGroup } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import DI from "@/di-container";
import "react-intl-tel-input/dist/main.css";
import useEmailPasswordAuthentication from "@/hooks/emailPasswordAuthentication";
import Link from "next/link";
import ButtonLoader from "@/components/ButtonLoader";
import { AuthType } from "@/components/AuthComponent";
import AuthComponent from "@/components/AuthComponent";
import { Eye, EyeSlash } from "iconsax-react";
import FormAlert from "@/components/FormAlert";
import { isValidEmail } from "@/helpers";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { authActions } from "@/store/auth-reducer";

export default function Login() {
    const router = useRouter();
    const dispatch = useDispatch();
    const {
        signInUserWithEmailAndPassword,
        redirectToTheApp,
        state,
        dispatch: authDispatch,
    } = useEmailPasswordAuthentication(DI.firebaseAuth);

    const emailInCookie = useRef<string | "">("");
    const [emailVerificationNeeded, setEmailVerificationNeeded] = useState(false);
    const [formIsValid, setFormIsValid] = useState(false);
    const [emailFromUrl, setEmailFromUrl] = useState<string | null>(null);

    useEffect(() => {
        emailInCookie.current = getCookie("email")?.toString() ?? "";

        // Check if the user was redirected from signup success
        const { verified, email } = router.query;

        // Check if email parameter in URL
        if (email && typeof email === "string") {
            setEmailFromUrl(email);
        }

        if (verified === "true" && emailInCookie.current) {
            setEmailVerificationNeeded(true);
        }
    }, [router.query]);

    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const [passwordIcon, setPasswordIcon] = useState<string>("eye-slash");
    const isInitialMount = useRef(true);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        authDispatch({ errorMessage: "", formValidated: false, isLoading: true });
        loginUser();
    };

    async function loginUser() {
        try {
            const user = await signInUserWithEmailAndPassword(
                email.current?.value ?? "",
                password.current?.value ?? "",
            );
            if (!user) {
                authDispatch({
                    errorMessage:
                        "Unable to verify you at the moment. Kindly try again. If problem persists, contact support",
                    formValidated: false,
                });
                return;
            }

            try {
                await redirectToTheApp(user);

                // im authentication state in Redux after successful login
                dispatch(authActions.login(user.uid));
            } catch (redirectError: any) {
                const errorData = redirectError.response?.data;
                const isInactive =
                    errorData?.data?.detail === "User account is inactive." ||
                    errorData?.detail === "User account is inactive." ||
                    (redirectError.message && redirectError.message.includes("User account is inactive"));

                if (isInactive) {
                    authDispatch({
                        errorMessage:
                            "Your account needs email verification. Please check your inbox and verify your email before logging in.",
                        formValidated: true,
                        isLoading: false,
                    });

                    // Redirect to verify-account page
                    setTimeout(() => {
                        router.push({
                            pathname: "/verify-account",
                            query: { email: email.current?.value || "" },
                        });
                    }, 2000);
                } else {
                    authDispatch({
                        errorMessage:
                            errorData?.data?.detail ||
                            errorData?.detail ||
                            redirectError.message ||
                            "An error occurred. Please try again.",
                        formValidated: true,
                        isLoading: false,
                    });
                }
            }
        } catch (error: any) {
            const ERRORS = ["auth/wrong-password", "auth/user-not-found"];

            if (ERRORS.includes(error.code)) {
                authDispatch({ errorMessage: "Invalid Credentials", formValidated: true });
            } else {
                authDispatch({
                    errorMessage: error.message || "An error occurred during login. Please try again.",
                    formValidated: true,
                });
            }

            authDispatch({ isLoading: false });
        }
    }

    function togglePassword() {
        if (passwordIcon === "eye") {
            setPasswordIcon("eye-slash");
            return;
        }
        setPasswordIcon("eye");
    }

    const handleFieldsChange = () => {
        if (!isInitialMount.current && !email.current?.value && !password.current?.value) {
            authDispatch({ errorMessage: "" });
        }

        const isEmailValid = email.current?.value && isValidEmail(email.current.value);
        const isPasswordValid = password.current?.value && password.current.value.length > 0;
        setFormIsValid(!!isEmailValid && !!isPasswordValid);

        isInitialMount.current = false;
    };

    return (
        <>
            <Head>
                <title>Login - tuulbox</title>
            </Head>

            <AuthComponent
                authType={AuthType.login}
                description={"Welcome back!"}
                subDescription={"Log in to your account to continue"}
                onLoginSuccesful={redirectToTheApp}
                showOptionalLink
                showSocialLogins={false} // hide for now
                form={
                    <Form validated={state.formValidated} onSubmit={handleSubmit}>
                        <FormAlert
                            show={state.errorMessage.length > 0}
                            message={state.errorMessage}
                            onClose={() => authDispatch({ errorMessage: "" })}
                            variant="danger"
                            dismissible
                        />

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label className="tb-body-small-medium text-gray-900">Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                ref={email}
                                required
                                onChange={handleFieldsChange}
                                defaultValue={emailFromUrl || emailInCookie.current}
                            />
                            {email.current?.value && !isValidEmail(email.current.value) && (
                                <small className="text-danger">Please enter a valid email</small>
                            )}
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="tb-body-small-medium text-gray-900">Password</Form.Label>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    type={`${passwordIcon === "eye" ? "text" : "password"}`}
                                    placeholder="Password"
                                    ref={password}
                                    onChange={handleFieldsChange}
                                    required
                                />
                                <InputGroup.Text id="basic-addon1">
                                    <span onClick={togglePassword} className="pointer">
                                        {passwordIcon === "eye" ? (
                                            <Eye size={24} color="#888888" />
                                        ) : (
                                            <EyeSlash size={24} color="#888888" />
                                        )}
                                    </span>
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Link href="/forgot-password" className="offset tb-body-small-medium text-primary">
                            Forgot password
                        </Link>

                        <div className="d-grid mb-2 mt-5">
                            <Button
                                variant="primary"
                                type="submit"
                                className="tb-body-default-medium"
                                disabled={!formIsValid || state.isLoading}
                            >
                                {state.isLoading ? <ButtonLoader buttonText="Loading..." /> : "Log in"}
                            </Button>
                        </div>
                    </Form>
                }
            />
        </>
    );
}
