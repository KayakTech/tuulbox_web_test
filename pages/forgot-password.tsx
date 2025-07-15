import ButtonLoader from "@/components/ButtonLoader";
import Logo from "@/components/Logo";
import { useState } from "react";
import { Card, Col, Row, Form, Button } from "react-bootstrap";
import Link from "next/link";
import Image from "next/image";
import useEmailPasswordAuthentication from "@/hooks/emailPasswordAuthentication";
import DI from "@/di-container";
import Head from "next/head";
import AuthComponent, { AuthType } from "@/components/AuthComponent";
import AuthSuccessState from "@/components/AuthSuccessState";
import FormErrorMessage from "@/components/FormErrorMessage";
import { apiErrorMessage } from "@/helpers";
import { ArrowLeft } from "iconsax-react";

const PAGE = {
    title: "Forgot Password",
    description: "Please enter your registered email address",
};

export default function ForgotPassword() {
    const { resetPassword } = useEmailPasswordAuthentication(DI.firebaseAuth);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [hasSentResetLink, setHasSentResetLink] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [pageHeading, setPageHeading] = useState<string>(PAGE.title);
    const [pageDescription, setPageDescription] = useState<string>(PAGE.description);
    const [showOptionalLink, setShowOptionalLink] = useState<boolean>(true);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        try {
            const response = await resetPassword(email);
            setIsLoading(false);
            setHasSentResetLink(true);
            setPageHeading("");
            setPageDescription("");
            setShowOptionalLink(false);
        } catch (error: any) {
            setErrorMessage("Email not found!");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <Head>
                <title>Forgot password - tuulbox</title>
            </Head>

            <AuthComponent
                authType={AuthType.forgotPassword}
                description={pageHeading}
                subDescription={pageDescription}
                onLoginSuccesful={() => {}}
                showOptionalLink={showOptionalLink}
                form={
                    !hasSentResetLink ? (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="tb-body-small-medium text-gray-900">Email</Form.Label>
                                <Form.Control
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="jon@mail.com"
                                    required
                                />
                            </Form.Group>
                            <div className="d-grid">
                                {errorMessage ? <FormErrorMessage message={errorMessage} /> : null}

                                <Button variant="primary" type="submit" className="tb-body-default-medium">
                                    {isLoading ? (
                                        <ButtonLoader buttonText="Sending Reset Link..." />
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </Button>
                            </div>
                        </Form>
                    ) : (
                        <AuthSuccessState
                            title={"Reset link sent successfully"}
                            description="We've sent a password reset link to your email. Follow the instructions to reset your password and access your account. If you don't see the email in your inbox, please check your spam or junk folder."
                            buttonText="Go Back To Login"
                            buttonLink="/login"
                            buttonIcon={<ArrowLeft size={20} className="me-2" />}
                        />
                    )
                }
            />
        </>
    );
}
