import { Google, Link2 } from "iconsax-react";
import Image from "next/image";
import DeleteModal from "./DeleteModal";
import useEmails from "@/hooks/emails";
import { Button, Col, Container, Row } from "react-bootstrap";
import { isMobileDevice, isTabletDevice } from "@/helpers";

type YouAreSignedInAsState = {
    className?: string;
    email: string;
    onDisconnect?: () => void;
    hideAction?: boolean;
};
export default function YouAreSignedInAs(props: YouAreSignedInAsState) {
    const { className, email, onDisconnect, hideAction = false } = props;
    const {
        showDeleteModal,
        setShowDeleteModal,
        triggerDisconnectEmailModal,
        disconnectGoogleIntegration,
        isDeleting,
        setIsDeleting,
    } = useEmails({});

    function disconnect() {
        if (!onDisconnect) {
            triggerDisconnectEmailModal();
            return;
        }
        onDisconnect();
    }

    return (
        <>
            <Container fluid className="bg-gray-50 emails-padding w-100 ">
                <Row className="g-3m justify-content-between py-16 email-padding d-flex mt-5m align-items-center">
                    <Col className="d-flex gap-12 align-items-center">
                        <span
                            className="bg-white rounded-circle d-flex align-items-center"
                            style={{ width: "48px", height: "48px" }}
                        >
                            <Image
                                className="m-auto"
                                src={`/images/svg/icons/google.svg`}
                                alt=""
                                width={24}
                                height={24}
                            />
                        </span>
                        <span className="">
                            <p className=" m-0 tb-title-body-medium text-gray-800">
                                Connected account <br />{" "}
                                <small title={email} className="text-gray-500 text-truncate tb-body-small-regular">
                                    {email}
                                </small>
                            </p>
                        </span>
                    </Col>

                    {!hideAction && (
                        <Button
                            variant="default"
                            className={`bg-gray-100 d-flex justify-content-center align-items-center w-120 p-0 text-gray-500 border-gray-100 rounded-5 text-decoration-none pointer ${
                                isMobileDevice() || isTabletDevice() ? "w-100" : ""
                            }`}
                            onClick={disconnect}
                        >
                            Disconnect
                        </Button>
                    )}
                </Row>
            </Container>

            <DeleteModal
                showModal={showDeleteModal}
                setShowModal={(value: boolean) => setShowDeleteModal(value)}
                dataToDeleteName={"email"}
                action="Disconnect"
                message="Are you sure you want to disconnect your email integration?"
                rightButtonText="Yes, disconnect"
                rightButtonProcessingText="Disconnecting..."
                isDeleting={isDeleting}
                onYesDelete={() => {
                    disconnectGoogleIntegration();
                }}
            />
        </>
    );
}
