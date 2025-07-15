import { Button } from "react-bootstrap";
import Image from "next/image";
import { SOCIAL_LOGINS } from "@/helpers/constants";

interface SocialLoginsProps {
    onLoginWithSocial: (social: string) => void;
}

export default function SocialLogins({ onLoginWithSocial }: SocialLoginsProps) {
    return (
        <>
            <div className="d-flex gap-4 mb-4 justify-content-center">
                {SOCIAL_LOGINS.map(social_login => (
                    <Button
                        variant="default"
                        className="btn btn-social"
                        key={social_login.name}
                        onClick={() => onLoginWithSocial(social_login.name)}
                    >
                        <Image
                            src={social_login.imagePath}
                            alt={social_login.name}
                            width={social_login.name === "facebook" ? 21.5 : 28}
                            height={social_login.name === "facebook" ? 26.67 : 24}
                        />
                    </Button>
                ))}
            </div>

            <div className="d-flex flex-row text-center mb-4 position-relative">
                <div className="position-absolute border-bottom w-100" style={{ top: "50%", zIndex: "1" }}></div>
                <p
                    className="text-muted tb-body-default-regular text-center mx-auto mb-0 bg-white px-2"
                    style={{ zIndex: "2" }}
                >
                    Or continue with
                </p>
            </div>
        </>
    );
}
