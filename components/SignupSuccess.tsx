import { Button } from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/router";
import { setCookie } from "cookies-next";

type SignupSuccessProps = {
    email: string;
};

export default function SignupSuccess({ email }: SignupSuccessProps) {
    const router = useRouter();

    const handleGoToLogin = () => {
        // Store email in cookie for auto-population (20mins)
        setCookie("email", email, { maxAge: 1200 });

        // Added parameter to show verification message
        router.push("/login?verified=true");
    };

    return (
        <div className="d-flex flex-column align-items-center justify-content-center text-center">
            <div className="mb-4">
                <Image src="/images/svg/successImage.svg" width={80} height={80} alt="Email verification" />
            </div>
            <h4 className="mb-3">Account created successfully</h4>
            <div className="text-muted mb-4">
                <p className="mb-0" style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    We&apos;ve sent a verification link to <strong>{email}</strong>.
                </p>
                <p className="mb-0" style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    Please check your inbox and click the link to verify your account
                </p>
                <p className="mb-0" style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    before logging in. If you don&apos;t see the email in your inbox, please
                </p>
                <p className="mb-0" style={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}>
                    check your spam or junk folder.
                </p>
            </div>
            <Button className="px-4" onClick={handleGoToLogin}>
                Go to login
            </Button>
        </div>
    );
}
