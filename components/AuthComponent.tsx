import { Button } from "react-bootstrap";
import Logo from "./Logo";
import { ReactNode } from "react";
import Link from "next/link";
import useEmailPasswordAuthentication from "@/hooks/emailPasswordAuthentication";
import DI from "@/di-container";
import SocialLogins from "./SocialLogins";

type AuthComponentState = {
    authType: AuthType;
    description?: string;
    form?: ReactNode;
    subDescription?: string;
    showOptionalLink?: boolean;
    onLoginSuccesful: (user: any) => void;
    showSocialLogins?: boolean;
};

export enum AuthType {
    login = "login",
    signup = "signup",
    account = "account",
    forgotPassword = "forgot-password",
    resetPassword = "reset-password",
}

export default function AuthComponent(props: AuthComponentState) {
    const {
        authType,
        description,
        subDescription,
        form,
        showOptionalLink,
        onLoginSuccesful,
        showSocialLogins = false, //  hide social logins
    } = props;

    const { signInWithGoogle, signInWithFacebook, signInWithApple } = useEmailPasswordAuthentication(DI.firebaseAuth);

    function isLoginAuth() {
        return [AuthType.login, AuthType.forgotPassword, AuthType.resetPassword].includes(authType);
    }

    function loginWithSocial(social: string) {
        if (social.toLocaleLowerCase() === "google") loginWithGoogle();
        if (social.toLocaleLowerCase() === "facebook") loginWithFacebook();
        if (social.toLocaleLowerCase() === "apple") loginWithApple();
    }

    async function loginWithGoogle() {
        try {
            const user = await signInWithGoogle();
            onLoginSuccesful(user);
        } catch (error) {}
    }

    async function loginWithFacebook() {
        try {
            const user = await signInWithFacebook();
            onLoginSuccesful(user);
        } catch (error) {}
    }

    async function loginWithApple() {
        try {
            const user = await signInWithApple();
            onLoginSuccesful(user);
        } catch (error) {}
    }

    return (
        <>
            <div id="recaptcha-container"></div>
            <main className="row auth-container g-0">
                <div
                    className="col-lg-8 flex-column p-4 right mx-auto d-flex auth-mobile"
                    style={{ padding: "2.5rem" }}
                >
                    <div className="mx-auto mx-md-0 logo">
                        <Link href={"/"}>
                            <Logo />
                        </Link>
                    </div>
                    <div className="d-flex flex-column h-100 content m-auto">
                        <section className="border-0 my-auto m-top">
                            <h5 className={`text-center text-gray-900 tb-title-medium`}>{description}</h5>
                            {subDescription && (
                                <p className="text-center tb-body-default-regular text-muted mb-4">{subDescription}</p>
                            )}

                            {/* only show social logins if directly enabled and not on account, forgot or reset pages */}
                            {showSocialLogins &&
                                ![AuthType.account, AuthType.forgotPassword, AuthType.resetPassword].includes(
                                    authType,
                                ) && <SocialLogins onLoginWithSocial={loginWithSocial} />}

                            {form}

                            {showOptionalLink && (
                                <p className="text-center mb-0 mt-3 text-gray-600 tb-body-default-regular">
                                    {isLoginAuth() ? "Don't have an account? " : "Already have an account? "}
                                    {(() => {
                                        const urlParams = new URLSearchParams(window.location.search);
                                        const inviteId = urlParams.get("inviteId");
                                        const baseUrl = isLoginAuth() ? "/register" : "/login";
                                        const href = inviteId ? `${baseUrl}?inviteId=${inviteId}` : baseUrl;
                                        return (
                                            <Link href={href} className="offset text-primary tb-body-small-medium">
                                                {isLoginAuth() ? "Sign up" : "Login"}
                                            </Link>
                                        );
                                    })()}
                                </p>
                            )}
                        </section>
                    </div>
                    {authType != AuthType.account && (
                        <section className="d-flex text-muted justify-content-center privacy-mt">
                            <span>
                                <Link
                                    href="/privacy-policy"
                                    className="text-decoration-none tb-body-small-medium text-muted"
                                >
                                    Privacy
                                </Link>
                                <span className="mx-3 text-grey">|</span>
                                <Link
                                    href="/terms-and-conditions"
                                    className="text-muted tb-body-small-medium text-decoration-none"
                                >
                                    Terms
                                </Link>
                            </span>
                        </section>
                    )}
                </div>
                <div className="col-lg-4 left d-none d-lg-block"></div>
            </main>
        </>
    );
}
