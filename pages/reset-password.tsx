import ButtonLoader from "@/components/ButtonLoader";
import Logo from "@/components/Logo";
import { useRef, useState } from "react";
import { Card, Col, Row, Form, Button, InputGroup } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";
import useEmailPasswordAuthentication from "@/hooks/emailPasswordAuthentication";
import DI from "@/di-container";
import Head from "next/head";
import AuthComponent, { AuthType } from "@/components/AuthComponent";
import AuthSuccessState from "@/components/AuthSuccessState";
import FormErrorMessage from "@/components/FormErrorMessage";
import { ArrowLeft } from "iconsax-react";

const PAGE = {
    title: "Reset Password",
    description: "Please enter your new password",
};

export default function ResetPassword() {
    const { resetPassword } = useEmailPasswordAuthentication(DI.firebaseAuth);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [email, setEmail] = useState<string>("");
    const [hasRestPassword, setHasResetPassword] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [pageHeading, setPageHeading] = useState<string>(PAGE.title);
    const [pageDescription, setPageDescription] = useState<string>(PAGE.description);
    const [showOptionalLink, setShowOptionalLink] = useState<boolean>(true);

    const [password1Icon, setPassword1Icon] = useState<string>("eye-slash");
    const [password2Icon, setPassword2Icon] = useState<string>("eye-slash");
    const password1 = useRef<HTMLInputElement>(null);
    const password2 = useRef<HTMLInputElement>(null);

    function togglePassword1() {
        if (password1Icon === "eye") {
            setPassword1Icon("eye-slash");
            return;
        }
        setPassword1Icon("eye");
    }

    function togglePassword2() {
        if (password2Icon === "eye") {
            setPassword2Icon("eye-slash");
            return;
        }
        setPassword2Icon("eye");
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // setIsLoading(true);
        // setErrorMessage("");

        // try {
        //     const response = await resetPassword(email);
        //     setIsLoading(false);
        //     setHasResetPassword(true);
        //     setPageHeading("");
        //     setPageDescription("");
        //     setShowOptionalLink(false);
        // } catch (error: any) {
        //     setErrorMessage("Email not found!");
        // } finally {
        //     setIsLoading(false);
        // }
    }

    return (
        <>
            <Head>
                <title>Reset password - tuulbox</title>
            </Head>

            <AuthComponent
                authType={AuthType.resetPassword}
                description={pageHeading}
                subDescription={pageDescription}
                onLoginSuccesful={() => {}}
                showOptionalLink={showOptionalLink}
                form={
                    !hasRestPassword ? (
                        <Form onSubmit={handleSubmit}>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    type={`${password1Icon === "eye" ? "text" : "password"}`}
                                    placeholder="Password"
                                    onChange={() => {}}
                                    ref={password1}
                                    required
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

                            <InputGroup className="mb-3">
                                <Form.Control
                                    type={`${password2Icon === "eye" ? "text" : "password"}`}
                                    placeholder="Confirm password"
                                    ref={password2}
                                    required
                                />
                                <InputGroup.Text id="basic-addon1">
                                    <Image
                                        src={`/images/svg/icons/${password2Icon}.svg`}
                                        width={24}
                                        height={24}
                                        alt="View password"
                                        className="pointer"
                                        onClick={togglePassword2}
                                    />
                                </InputGroup.Text>
                            </InputGroup>
                            <div className="d-grid">
                                {errorMessage ? <FormErrorMessage message={errorMessage} /> : null}

                                <Button variant="primary" type="submit">
                                    {isLoading ? <ButtonLoader buttonText="Resetting Password..." /> : "Reset Password"}
                                </Button>
                            </div>
                        </Form>
                    ) : (
                        <AuthSuccessState
                            title={"Password Reset successful"}
                            description="Your password reset was succesful!"
                        />
                    )
                }
            />
        </>
    );
}
