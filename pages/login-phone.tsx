import Image from "next/image";
import Logo from "../components/Logo";
import { Button, Form, Spinner, InputGroup } from "react-bootstrap";
import { useEffect, useReducer, useRef } from "react";
import { isNumber, isValidMobileNumber } from "@/helpers";
import { SOCIAL_LOGINS } from "@/helpers/constants";
import { useRouter } from "next/router";
import Head from "next/head";
import DI from "@/di-container";
import useMobileAuthentication from "@/hooks/mobileAuthentication";
import IntlTelInput from "react-intl-tel-input";
import "react-intl-tel-input/dist/main.css";

type LoginState = {
    isLoading: boolean;
    showOtpForm: boolean;
    formValidated: boolean;
    errorMessage: string;
    otpInputValues: string[];
    countryCode: string;
    phoneNumber: string;
    countryCalingCode: string;
    showOtpCTAs: boolean;
};
const PHONE_NUMBER_ERROR_MESSAGE = "Enter a valid mobile number starting with a + and at least 10 digits long.";
const OTP_CODE_RROR_MESSAGE = "Invalid OTP code.";

export default function Login() {
    const { sendVerificationCode, confirmVerificationCode } = useMobileAuthentication(DI.firebaseAuth);
    const router = useRouter();
    const otpInputRefs = useRef<HTMLInputElement[]>([]);
    const mobileNumberRef = useRef<HTMLInputElement>(null);
    const [state, dispatch] = useReducer(
        (state: LoginState, newState: Partial<LoginState>) => ({ ...state, ...newState }),
        {
            isLoading: false,
            showOtpForm: false,
            formValidated: false,
            errorMessage: "",
            countryCode: "",
            otpInputValues: ["", "", "", "", "", ""],
            phoneNumber: "",
            countryCalingCode: "",
            showOtpCTAs: false,
        },
    );

    function submitButtonText() {
        if (state.isLoading && state.showOtpForm) {
            return "Verifying";
        }
        if (state.isLoading && !state.showOtpForm) {
            return "Loading";
        }
        return state.showOtpForm ? "Verify" : "Login";
    }

    const handleOtpChange = (index: number, otpValue: string) => {
        if (isNumber(otpValue)) {
            const newOtpValues = [...state.otpInputValues];
            newOtpValues[index] = otpValue;
            dispatch({ otpInputValues: newOtpValues });
            if (otpValue && index < state.otpInputValues.length - 1) {
                otpInputRefs.current[index + 1].focus();
            }
        }
    };

    const handleBackspace = (index: number) => {
        const newOtpValues = [...state.otpInputValues];
        const previousValue = newOtpValues[index];
        newOtpValues[index] = "";

        dispatch({ otpInputValues: newOtpValues });

        if (index > 0 && previousValue === "") {
            otpInputRefs.current[index - 1].focus();
        }
    };

    const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedValue = event.clipboardData.getData("text/plain");
        if (isNumber(pastedValue)) {
            const digits = pastedValue.split("");

            if (digits.length === 6) {
                dispatch({ otpInputValues: digits });
                otpInputRefs.current[5].focus();
            }
        }
    };

    const handleOnSelectFlag = (callingCode: string) => {
        dispatch({ countryCalingCode: callingCode });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        dispatch({ errorMessage: "", formValidated: false, isLoading: true });

        if (!state.showOtpForm) {
            if (!state.phoneNumber.length || !isValidMobileNumber(state.phoneNumber)) {
                dispatch({ errorMessage: PHONE_NUMBER_ERROR_MESSAGE, formValidated: true, isLoading: false });
                return;
            }
            sendOtpCode();
        }

        if (state.showOtpForm) {
            const emptyOtp = state.otpInputValues.filter(otpInput => otpInput === "");
            if (emptyOtp.length) {
                dispatch({ errorMessage: OTP_CODE_RROR_MESSAGE, formValidated: true, isLoading: false });
                return;
            }
            verifyOtpCode();
        }
    };

    function sendOtpCode() {
        sendVerificationCode(state.phoneNumber || "")
            .then(() => {
                dispatch({
                    errorMessage: "",
                    formValidated: false,
                    isLoading: false,
                    showOtpForm: true,
                });
            })
            .catch(error => {
                if (error.code === "auth/invalid-phone-number") {
                    dispatch({ errorMessage: PHONE_NUMBER_ERROR_MESSAGE, formValidated: true, isLoading: false });
                }
                if (error.code === "auth/too-many-requests") {
                    dispatch({
                        errorMessage: "Too many requests. Try again in a few minutes",
                        formValidated: true,
                        isLoading: false,
                    });
                }
            });
        return;
    }

    async function verifyOtpCode() {
        try {
            const user = await confirmVerificationCode(state.otpInputValues.join(""));
            if (!user) {
                dispatch({
                    errorMessage:
                        "Unable to verify you at the moment. Kindly try again. If problem persists, contact support",
                    formValidated: false,
                });
                return;
            }
            await DI.authService.getAuthToken(user);

            dispatch({ errorMessage: "", formValidated: false });
            window.location.href = `/business`;
        } catch (error: any) {
            if (error.code === "auth/invalid-verification-code") {
                dispatch({ errorMessage: OTP_CODE_RROR_MESSAGE, formValidated: true });
            }

            if (error.code === "auth/code-expired") {
                dispatch({ errorMessage: "This otp code has expired.", formValidated: true });
            }
        } finally {
            dispatch({ isLoading: false });
        }
    }

    function disableSubmit() {
        if (state.showOtpForm) {
            const emptyOtpInput = state.otpInputValues.filter(value => value === "");
            if (emptyOtpInput.length) return true;
        }

        if (!state.showOtpForm) {
            if (state.isLoading) return true;
            if (!isValidMobileNumber(state.phoneNumber)) return true;
        }

        return false;
    }

    function handlePhoneNumberChange(country: any, phoneNumber: string) {
        const cleanedInput = phoneNumber.replace(/[^0-9\+]/g, "");
        if (cleanedInput.length > 14) return;
        dispatch({ errorMessage: "", phoneNumber: cleanedInput });
    }

    async function getCountryCode() {
        try {
            const res = await DI.authService.getCountryCode();
            dispatch({
                countryCode: res.country_code.toLowerCase(),
                countryCalingCode: res.country_calling_code,
                phoneNumber: res.country_calling_code,
            });
        } catch (error) {}
    }

    useEffect(() => {
        getCountryCode();
    }, []);
    useEffect(() => {
        if (state.showOtpForm) dispatch({ showOtpCTAs: false });
        if (state.showOtpForm) setTimeout(() => dispatch({ showOtpCTAs: true }), 60000);
    }, [state.showOtpForm]);

    return (
        <>
            <Head>
                <title>Login - tuulbox</title>
            </Head>
            <div id="recaptcha-container"></div>
            <div className="row auth-container g-0">
                <div className="col-lg-8 left d-none d-lg-block"></div>
                <div className="col-lg-4 right mx-auto d-flex">
                    <div className="p-3 d-flex flex-column h-100 content my-auto">
                        <Logo />
                        <div className="card border-0 my-auto">
                            <h5 className="fw-bold">
                                {state.showOtpForm ? "Security verification" : "Login/Create Account"}
                            </h5>

                            <small className="text-muted m-0">
                                {state.showOtpForm
                                    ? `Enter the verification code sent to ${state.phoneNumber}`
                                    : "Continue with"}
                            </small>

                            {!state.showOtpForm && (
                                <>
                                    <div className="d-flex gap-4 my-4">
                                        {SOCIAL_LOGINS.map(social_login => (
                                            <Button
                                                variant="default"
                                                className="btn btn-social"
                                                key={social_login.name}
                                            >
                                                <Image
                                                    src={social_login.imagePath}
                                                    alt={social_login.name}
                                                    width={28}
                                                    height={28}
                                                />
                                            </Button>
                                        ))}
                                    </div>
                                    <div className="d-flex">
                                        <p className="me-2">Or</p>
                                        <hr className="w-100" />
                                    </div>
                                </>
                            )}

                            <Form noValidate validated={state.formValidated} onSubmit={handleSubmit}>
                                {state.showOtpForm && (
                                    <>
                                        <InputGroup className="my-4">
                                            {state.otpInputValues.map((otpValue: string, index: number) => (
                                                <Form.Control
                                                    key={index}
                                                    id={`otp${index + 1}`}
                                                    type="text"
                                                    pattern="\d{1}"
                                                    className={`otp-input border-radius ${
                                                        index != state.otpInputValues.length - 1 && "me-2"
                                                    }`}
                                                    name={`otp${index + 1}`}
                                                    autoFocus={index + 1 === 1 ? true : false}
                                                    required
                                                    maxLength={1}
                                                    minLength={1}
                                                    ref={(event: HTMLInputElement) =>
                                                        (otpInputRefs.current[index] = event)
                                                    }
                                                    value={state.otpInputValues[index]}
                                                    onChange={e => handleOtpChange(index, e.target.value)}
                                                    onKeyDown={e => e.key === "Backspace" && handleBackspace(index)}
                                                    onPaste={handleOtpPaste}
                                                />
                                            ))}
                                        </InputGroup>
                                    </>
                                )}

                                {!state.showOtpForm && (
                                    <Form.Group controlId="validationCustom03" className="mb-5 mt-4">
                                        <IntlTelInput
                                            containerClassName="intl-tel-input w-100"
                                            inputClassName="form-control"
                                            defaultCountry={state.countryCode}
                                            geoIpLookup={getCountryCode}
                                            preferredCountries={[state.countryCode]}
                                            value={state.phoneNumber}
                                            onPhoneNumberChange={handlePhoneNumberChange}
                                            fieldId="phoneNumber"
                                            onSelectFlag={callingCode => handleOnSelectFlag(callingCode)}
                                        />
                                        <small className="text-muted">{PHONE_NUMBER_ERROR_MESSAGE}</small>
                                    </Form.Group>
                                )}
                                <div className="d-grid mb-2">
                                    <p className="text-danger mb-2">{state.formValidated && state.errorMessage}</p>
                                    <Button variant="primary" type="submit" disabled={disableSubmit()}>
                                        {state.isLoading && (
                                            <Spinner animation="border" variant="light" size="sm" className="me-2" />
                                        )}
                                        {submitButtonText()}
                                    </Button>
                                </div>
                                {state.showOtpForm && state.showOtpCTAs && (
                                    <small className="text-muted">
                                        Did not recieve otp?{" "}
                                        <a href="javascript:void(0)" onClick={() => handleSubmit}>
                                            Resend
                                        </a>
                                        or
                                        <a
                                            href="javascript:void(0)"
                                            onClick={() =>
                                                dispatch({ showOtpForm: false, otpInputValues: ["", "", "", "", ""] })
                                            }
                                        >
                                            Change number
                                        </a>
                                    </small>
                                )}
                            </Form>
                        </div>
                        <div className="d-flex text-muted justify-content-center">
                            <span>
                                <a className="text-decoration-none text-muted" href="">
                                    Privacy
                                </a>
                                <span className="mx-3 text-grey">|</span>
                                <a className="text-muted text-decoration-none" href="">
                                    Terms
                                </a>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
