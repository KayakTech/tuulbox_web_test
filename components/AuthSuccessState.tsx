import Link from "next/link";
import { Button } from "react-bootstrap";
import Image from "next/image";

type AuthSuccessProps = {
    title: string;
    description: string;
    buttonText?: string;
    buttonLink?: string;
    buttonIcon?: any;
    onPrimaryButtonClick?: () => void;
};

export default function AuthSuccessState(props: AuthSuccessProps) {
    const { title, description, buttonText, buttonLink, buttonIcon, onPrimaryButtonClick } = props;
    return (
        <>
            <div>
                <div className="d-flex">
                    <Image
                        src="/images/svg/account-complete.svg"
                        className="mx-auto mb-4"
                        width={64}
                        height={64}
                        alt="Account complete"
                    />
                </div>
                {title && <h5 className="tb-title-section-medium text-center">{title}</h5>}
                {description && (
                    <p className="text-center text-muted text-wrap mb-4 tb-body-default-regular">{description}</p>
                )}
            </div>
            {(buttonLink || onPrimaryButtonClick) && (
                <div className="d-flex">
                    <Link
                        href={buttonLink || "javascript:void(0)"}
                        className="mx-auto mt-3"
                        onClick={onPrimaryButtonClick}
                    >
                        <Button variant="primary" className="tb-body-default-medium d-flex align-items-center">
                            {buttonIcon ?? ""}
                            {buttonText}
                        </Button>
                    </Link>
                </div>
            )}
        </>
    );
}
