import { Modal, Button } from "react-bootstrap";
import ButtonLoader from "./ButtonLoader";
import Image from "next/image";

type DeleteModalState = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    dataToDeleteName: string | undefined;
    isDeleting?: boolean;
    onYesDelete: () => void;
    message?: string;
    action?: string;
    rightButtonText?: string;
    rightButtonProcessingText?: string;
};

const DEFAULT_MESSAGE = "This action cannot be undone";

export default function DeleteModal(props: DeleteModalState) {
    const {
        showModal,
        setShowModal,
        dataToDeleteName,
        isDeleting,
        onYesDelete,
        message,
        action = "Delete",
        rightButtonText,
        rightButtonProcessingText = "Processing...",
    } = props;

    const buttonText = rightButtonText || `Yes, ${action}`;

    return (
        <Modal centered show={showModal} onHide={() => setShowModal(false)} className="delete-modal">
            <Modal.Body className="text-center">
                <div className="text-center d-flex gap-4  flex-column">
                    <div className="delete-icon-box d-flex mx-auto">
                        <Image
                            className="m-auto"
                            src={`/images/svg/icons/warning-triangle.svg`}
                            width={24}
                            height={24}
                            alt=""
                        />
                    </div>
                    <div className="d-flex flex-column gap-12">
                        <h4 className="text-capitalize tb-title-subsection-medium m-0 text-gray-800">
                            {action} {dataToDeleteName}
                        </h4>
                        <div className="">
                            <p className="m-0 text-muted tb-body-default-regular">
                                {message} {DEFAULT_MESSAGE}
                            </p>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="pt-4 pb-20 d-flex justify-content-center">
                <Button
                    className="me-2 w-140 h-44 tb-title-body-medium border-radius-12"
                    variant="secondary "
                    disabled={isDeleting}
                    onClick={() => setShowModal(false)}
                >
                    Cancel
                </Button>
                <Button
                    variant="danger"
                    className="ms-2 w-140 bg-dangerm border-0 border-radius-12 tb-title-body-medium d-flex align-items-center justify-content-center"
                    disabled={isDeleting}
                    onClick={onYesDelete}
                >
                    {isDeleting ? <ButtonLoader buttonText={rightButtonProcessingText} /> : buttonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
