import { Button, Form, InputGroup } from "react-bootstrap";
import { useEffect, useReducer, useRef, useState } from "react";
import Head from "next/head";
import DI from "@/di-container";
import "react-intl-tel-input/dist/main.css";
import useEmailPasswordAuthentication from "@/hooks/emailPasswordAuthentication";
import { AuthType } from "@/components/AuthComponent";
import AuthComponent from "@/components/AuthComponent";
import ButtonLoader from "@/components/ButtonLoader";
import Image from "next/image";
import { hasSpecialCharacter, isStrongPassword, isValidEmail, isValidPhoneNumber, isValidPhoneInput } from "@/helpers";
import FormAlert from "@/components/FormAlert";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import SignupSuccess from "@/components/SignupSuccess";
import useAccount from "@/hooks/account";

type LoginState = {
    isLoading: boolean;
    formValidated: boolean;
    errorMessage: string;
    passwordIsStrong: boolean;
    passwordsAreSame: boolean;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    signupSuccess: boolean;
};

const PASSWORD_STRENGTH_MESSAGE =
    "Password must be at least 8 characters and include uppercase letters, lowercase letters, numbers, and special characters";

export default function Register() {
    const router = useRouter();
    const { redirectToTheApp } = useEmailPasswordAuthentication(DI.firebaseAuth);

    const { registerNewUser } = useAccount();

    const emailInCookie = useRef<string | "">("");
    useEffect(() => {
        emailInCookie.current = getCookie("email")?.toString() ?? "";
        setEmail(emailInCookie.current);
    }, []);

    const [email, setEmail] = useState<string>("");
    const [password, setPassWord] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");

    const [passwordIcon, setPasswordIcon] = useState<string>("eye");
    const [password1Icon, setPassword1Icon] = useState<string>("eye");

    const [state, setState] = useReducer(
        (state: LoginState, newState: Partial<LoginState>) => ({ ...state, ...newState }),
        {
            isLoading: false,
            formValidated: false,
            errorMessage: "",
            passwordIsStrong: false,
            passwordsAreSame: false,
            email: "",
            firstName: "",
            lastName: "",
            phone: "",
            signupSuccess: false,
        },
    );

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!(isStrongPassword(password) && hasSpecialCharacter(password))) {
            return;
        }
        setState({ errorMessage: "", formValidated: false, isLoading: true });
        registerUser();
    };

    async function registerUser() {
        try {
            const isFormValid = validateForm();
            if (!isFormValid) {
                setState({ isLoading: false });
                return;
            }

            if (!isValidPhoneNumber(phone)) {
                setState({
                    errorMessage: "Please enter a valid phone number (minimum 10 digits, no letters)",
                    formValidated: false,
                    isLoading: false,
                });
                return;
            }

            const backendSubmitSuccess = await registerNewUser({
                firstName,
                lastName,
                email,
                phoneNumber: phone,
                password,
            });

            if (!backendSubmitSuccess) {
                setState({
                    errorMessage: "Failed to create account. Please try again.",
                    formValidated: false,
                    isLoading: false,
                });
                return;
            }

            setState({
                signupSuccess: true,
                isLoading: false,
            });
        } catch (error: any) {
            let errorMessage = "An error occurred during signup";

            // get backend error msg
            if (error?.response?.data?.data) {
                const errorData = error.response.data.data;

                // Check for email error msg
                if (errorData.email && Array.isArray(errorData.email) && errorData.email.length > 0) {
                    errorMessage = errorData.email[0];
                }
                // Check for other errors msgs
                else if (typeof errorData === "object") {
                    const firstErrorField = Object.keys(errorData)[0];
                    if (
                        firstErrorField &&
                        Array.isArray(errorData[firstErrorField]) &&
                        errorData[firstErrorField].length > 0
                    ) {
                        errorMessage = errorData[firstErrorField][0];
                    }
                }
            } else if (error?.message) {
                errorMessage = error.message;
            }

            setState({
                errorMessage: errorMessage,
                formValidated: true,
                isLoading: false,
            });
        }
    }

    function validateForm() {
        let errorMessage = "";
        if (!firstName) {
            errorMessage = "First name is required";
        } else if (!email) {
            errorMessage = "Email is required";
        } else if (!phone) {
            errorMessage = "Phone number is required";
        } else if (!password) {
            errorMessage = "Password is required";
        } else if (confirmPassword != password) {
            errorMessage = "Password is not matched";
        }

        setState({ errorMessage });

        return !errorMessage.length;
    }

    function togglePassword() {
        if (passwordIcon === "eye") {
            setPasswordIcon("eye-slash");
            return;
        }
        setPasswordIcon("eye");
    }

    function togglePassword1() {
        if (password1Icon === "eye") {
            setPassword1Icon("eye-slash");
            return;
        }
        setPassword1Icon("eye");
    }

    if (state.signupSuccess) {
        return (
            <>
                <Head>
                    <title>Account Created - tuulbox</title>
                </Head>

                <AuthComponent
                    authType={AuthType.signup}
                    description={""}
                    subDescription=""
                    onLoginSuccesful={redirectToTheApp}
                    showOptionalLink={false}
                    showSocialLogins={false}
                    form={<SignupSuccess email={email} />}
                />
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Register - tuulbox</title>
            </Head>

            <AuthComponent
                authType={AuthType.signup}
                description={"Create Your Account"}
                subDescription="Please provide your personal information to create your account"
                onLoginSuccesful={redirectToTheApp}
                showOptionalLink
                showSocialLogins={false} // currently hide socials
                form={
                    <Form validated={state.formValidated} onSubmit={handleSubmit} className="form">
                        <FormAlert
                            show={state.errorMessage.length > 0}
                            message={state.errorMessage}
                            onClose={() => setState({ errorMessage: "" })}
                            variant="danger"
                            dismissible
                        />

                        <div className="d-flex gap-3 mb-3">
                            <Form.Group controlId="formFirstName" className="flex-grow-1">
                                <Form.Label className="tb-body-small-medium text-gray-900">
                                    First Name <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={firstName}
                                    onChange={e => setFirstName(e.target.value)}
                                    placeholder="First Name"
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formLastName" className="flex-grow-1">
                                <Form.Label className="tb-body-small-medium text-gray-900">Last Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    placeholder="Last Name"
                                />
                            </Form.Group>
                        </div>

                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label className="tb-body-small-medium text-gray-900">
                                Email <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="Email"
                                required
                                className={`${email && !isValidEmail(email) ? "border-danger" : ""}`}
                                defaultValue={emailInCookie.current}
                            />
                            {email && !isValidEmail(email) && (
                                <small className="text-danger">Please enter a valid email</small>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPhone">
                            <Form.Label className="tb-body-small-medium text-gray-900">
                                Phone <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                onKeyPress={e => {
                                    if (!isValidPhoneInput(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                placeholder="Phone"
                                required
                                className={`${phone && !isValidPhoneNumber(phone) ? "border-danger" : ""}`}
                            />
                            {phone && !isValidPhoneNumber(phone) && (
                                <small className="text-danger">
                                    Please enter a valid phone number (minimum 10 digits, no letters)
                                </small>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="tb-body-small-medium text-gray-900">
                                Password <span className="text-danger">*</span>
                            </Form.Label>
                            <InputGroup className="">
                                <Form.Control
                                    type={`${passwordIcon === "eye" ? "password" : "text"}`}
                                    placeholder="Enter password"
                                    onChange={e => setPassWord(e.target.value)}
                                    value={password}
                                    required
                                    className={`${
                                        password && (!isStrongPassword(password) || !hasSpecialCharacter(password))
                                            ? "border-danger"
                                            : ""
                                    }`}
                                />
                                <InputGroup.Text id="basic-addon1">
                                    <Image
                                        src={`/images/svg/icons/${passwordIcon}.svg`}
                                        width={24}
                                        height={24}
                                        alt="View password"
                                        className="pointer"
                                        onClick={togglePassword}
                                    />
                                </InputGroup.Text>
                            </InputGroup>
                            {password && (!isStrongPassword(password) || !hasSpecialCharacter(password)) && (
                                <small className="text-danger">{PASSWORD_STRENGTH_MESSAGE}</small>
                            )}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="tb-body-small-medium text-gray-900">
                                Confirm Password <span className="text-danger">*</span>
                            </Form.Label>

                            <InputGroup>
                                <Form.Control
                                    type={`${password1Icon === "eye" ? "password" : "text"}`}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    required
                                    className={`${
                                        confirmPassword && confirmPassword != password ? "border-danger" : ""
                                    }`}
                                />
                                <InputGroup.Text id="basic-addon1">
                                    <Image
                                        src={`/images/svg/icons/${password1Icon}.svg`}
                                        width={24}
                                        height={24}
                                        alt="View password"
                                        className="pointer"
                                        onClick={togglePassword1}
                                    />
                                </InputGroup.Text>
                            </InputGroup>
                            {confirmPassword && confirmPassword != password && (
                                <small className="text-danger">Passwords need to be the same</small>
                            )}
                        </Form.Group>

                        <div className="d-grid mb-2 mt-5">
                            <Button
                                variant="primary"
                                type="submit"
                                className="tb-body-default-medium"
                                disabled={
                                    !firstName ||
                                    !email ||
                                    !phone ||
                                    !isValidEmail(email) ||
                                    !isStrongPassword(password) ||
                                    !hasSpecialCharacter(password) ||
                                    password !== confirmPassword ||
                                    (phone && !isValidPhoneNumber(phone)) ||
                                    state.isLoading
                                }
                            >
                                {state.isLoading ? <ButtonLoader buttonText="Signing up..." /> : "Sign up"}
                            </Button>
                        </div>
                    </Form>
                }
            />
        </>
    );
}
