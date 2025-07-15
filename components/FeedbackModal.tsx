import { ReactElement } from "react";
import { Button, Modal } from "react-bootstrap";
import Link from "next/link";

type FeedbackModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    primaryButtonText: string;
    primaryButtonUrl?: string;
    secondaryButtonText?: string;
    onSecondaryButtonClick?: () => void;
    onPrimaryButtonClick?: () => void;
    icon?: ReactElement;
    feedbackMessage: string;
    feedbacktitle?: string;
    backdrop?: "static" | boolean | undefined;
};

export default function FeedbackModal(props: FeedbackModalProps) {
    const {
        showModal,
        setShowModal,
        primaryButtonText,
        primaryButtonUrl,
        secondaryButtonText,
        onSecondaryButtonClick,
        onPrimaryButtonClick,
        icon,
        feedbackMessage,
        feedbacktitle,
        backdrop = "static",
    } = props;

    return (
        <>
            <Modal centered size="sm" show={showModal} onHide={() => setShowModal(false)} backdrop={backdrop}>
                <Modal.Body className="p-4">
                    <div className="text-center">
                        {icon && <span className="d-flex justify-content-center">{icon}</span>}
                        {feedbacktitle && <h4 className="mt-4">{feedbacktitle}</h4>}

                        <h6 className="my-4">{feedbackMessage}</h6>
                    </div>
                    <div className="d-grid gap-2">
                        {primaryButtonText && primaryButtonUrl && (
                            <Link href={primaryButtonUrl || "javascript:void(0)"} className="w-100">
                                <Button className="w-100 text-white tb-title-body-medium" variant="primary">
                                    {primaryButtonText}
                                </Button>
                            </Link>
                        )}
                        {primaryButtonText && onPrimaryButtonClick && (
                            <Button
                                className="w-100 text-white tb-title-body-medium"
                                variant="primary"
                                onClick={onPrimaryButtonClick}
                            >
                                {primaryButtonText}
                            </Button>
                        )}
                        {secondaryButtonText && (
                            <Button
                                variant="outline-secondary"
                                className="tb-title-body-medium"
                                onClick={onSecondaryButtonClick}
                            >
                                {secondaryButtonText}
                            </Button>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}
