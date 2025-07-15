import { ReactElement } from "react";
import { Button, Modal } from "react-bootstrap";
import Link from "next/link";

type FeedbackModalInnerState = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    primaryButtonText: string;
    secondaryButtonText: string;
    onSecondaryButtonClick?: () => void;
    onPrimaryButtonClick?: () => void;
    icon?: ReactElement;
    feedbackMessage: string;
};

export default function FeedbackModalInner(props: FeedbackModalInnerState) {
    const {
        showModal,
        setShowModal,
        primaryButtonText,
        secondaryButtonText,
        onSecondaryButtonClick,
        onPrimaryButtonClick,
        icon,
        feedbackMessage,
    } = props;

    return (
        <>
            <Modal centered size="sm" show={showModal} onHide={() => setShowModal(false)} backdrop="static">
                <Modal.Body className="p-4">
                    <div className="text-center">
                        {icon && icon}
                        <h6 className="my-4">{feedbackMessage}</h6>
                    </div>
                    <div className="d-grid gap-2">
                        <Button className="w-100" variant="primary" onClick={onPrimaryButtonClick}>
                            {primaryButtonText}
                        </Button>
                        <Button variant="default" onClick={onSecondaryButtonClick}>
                            {secondaryButtonText}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}
