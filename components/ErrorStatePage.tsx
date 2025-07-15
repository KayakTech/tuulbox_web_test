import Link from "next/link";
import { Button } from "react-bootstrap";
import Image from "next/image";

type AuthSuccessProps = {
    title: string;
    description: string;
    buttonText?: string;
    buttonLink?: string;
    buttonIcon?: any;
    secondaryText?: string;
    secondaryButtonLink?: string;
    onSecondaryButtonClick?: () => void;
    onPrimaryButtonClick?: () => void;
};

export default function ErrorStatePage(props: AuthSuccessProps) {
    const {
        title,
        description,
        buttonText,
        buttonLink,
        buttonIcon,
        secondaryText,
        secondaryButtonLink,
        onPrimaryButtonClick,
        onSecondaryButtonClick,
    } = props;
    return (
        <>
            <div className="h-64 w-64 bg-red-100 rounded-circle d-flex align-content-center mx-auto mb-4">
                <Image
                    className="m-auto"
                    src={`/images/svg/icons/warning-triangle.svg`}
                    width={32}
                    height={32}
                    alt=""
                />
            </div>
            {title && <h5 className="tb-title-section-medium text-center">{title}</h5>}
            {description && <p className="text-center text-muted mb-5">{description}</p>}
            {(buttonLink || onPrimaryButtonClick) && (
                <div className="d-flex gap-4 justify-content-center">
                    {secondaryText && (
                        <Link href={secondaryButtonLink ?? "javascript:void(0)"}>
                            <Button
                                variant="outline-primary"
                                className="px-5"
                                onClick={onSecondaryButtonClick ?? undefined}
                            >
                                {secondaryText}
                            </Button>
                        </Link>
                    )}
                    <Link href={buttonLink ?? "javascript:void(0)"} className="">
                        <Button
                            variant="primary"
                            className="px-5"
                            onClick={onPrimaryButtonClick ? onPrimaryButtonClick : undefined}
                        >
                            {buttonIcon ?? ""}
                            {buttonText}
                        </Button>
                    </Link>
                </div>
            )}
        </>
    );
}
