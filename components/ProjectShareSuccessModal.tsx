import { copyText } from "@/helpers";
import { Project } from "@/repositories/project-repository";
import { Copy } from "iconsax-react";
import Image from "next/image";
import { useState } from "react";
import { Alert, Button, Form, InputGroup, Modal } from "react-bootstrap";

type ProjectShareSuccessModalProps = {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    permissionId: string;
    selectedContacts: string[];
    isShared?: boolean;
    project: Project;
    onClearSelectedItems: () => void;
    isUpdating?: boolean;
    sharedLink: string;
};

export default function ProjectShareSuccessModal({
    showModal,
    setShowModal,
    permissionId,
    selectedContacts,
    isShared,
    project,
    onClearSelectedItems,
    isUpdating,
    sharedLink,
}: ProjectShareSuccessModalProps) {
    const [copyString, setCopyString] = useState<string>("Copy");

    function getSharedLink() {
        return `${location.host}/?permissionId=${permissionId}`;
    }

    return (
        <Modal
            backdrop="static"
            centered
            show={showModal}
            onHide={() => {
                onClearSelectedItems();
                setShowModal(false);
            }}
            size="sm"
        >
            <Modal.Body className="text-center">
                <Image src="/images/svg/success.svg" className="mx-auto mb-2" width={80} height={80} alt="Success" />
                <h4 className="fs-20 fw-500 text-capitalize">
                    {isShared
                        ? `${isUpdating ? "Link Updated" : "Link Shared"}`
                        : `${isUpdating ? "Invite Updated" : "Invite Sent"}`}{" "}
                    Successfully
                </h4>
                <p className="text-muted fs-14 fw-400 my-4">
                    {isShared ? (
                        <span>
                            An email with a link has been sent to {selectedContacts[0]} and{" "}
                            {selectedContacts.length - 1} others.
                        </span>
                    ) : (
                        <>
                            <span>
                                You have successfully {isUpdating ? "updated the" : "sent an"} invite to{" "}
                                {selectedContacts[0]}
                            </span>
                            {selectedContacts.length > 1 && (
                                <span>
                                    {" "}
                                    and {""}
                                    {selectedContacts.length - 1} others to join project {project?.name}
                                </span>
                            )}
                        </>
                    )}
                </p>
                {isShared && (
                    <InputGroup>
                        <Form.Control className="text-truncate" value={sharedLink} readOnly />
                        <InputGroup.Text className="p-0">
                            <Button
                                className="bg-gray-100 border-gray-100 h-85-percent me-1 border-radius-4"
                                onClick={() => {
                                    copyText(sharedLink);
                                    setCopyString("Copied");
                                }}
                            >
                                <span className="me-2 text-gray-400">{copyString}</span>{" "}
                                <Copy size={20} color="#888888" />
                            </Button>
                        </InputGroup.Text>
                    </InputGroup>
                )}

                <div className="d-grid mt-5 mb-2">
                    <Button onClick={() => location.reload()}>Done</Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}
