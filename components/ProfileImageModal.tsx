import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Iconly } from "react-iconly";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef } from "react";
import useAccount from "@/hooks/account";
import { GalleryAdd } from "iconsax-react";
import { Plus } from "react-feather";
import Dropzone from "react-dropzone";
import { ACCEPTED_FILES, ACCEPTED_IMAGE_FILES } from "@/helpers/constants";
import { Form } from "react-bootstrap";
import ButtonLoader from "./ButtonLoader";

type UploadImageModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
};
function ProfileImageModal(props: UploadImageModalProps) {
    const { showModal, setShowModal } = props;
    const profileImageRef = useRef<HTMLInputElement>(null);
    const {
        onInputChange,
        state,
        dispatch,
        previewImage,
        user,
        removeSelectedImage,
        handleProfileImageChange,
        dropZoneErrorMessage,
        fileSizeExceeds10Mb,
        handleSaveUserProfile,
        isSaving,
        showProfileImageModal,
        imageUploaded,
    } = useAccount();

    useEffect(() => {
        setShowModal(false);
    }, [imageUploaded]);

    return (
        <>
            <Modal
                centered
                show={showProfileImageModal || showModal}
                onHide={() => setShowModal(false)}
                backdrop="static"
                className="p-5"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Upload Image</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSaveUserProfile}>
                    <Modal.Body>
                        <Dropzone
                            accept={ACCEPTED_IMAGE_FILES}
                            multiple={false}
                            onDrop={handleProfileImageChange}
                            disabled={false}
                        >
                            {({ getRootProps, getInputProps }) => (
                                <section
                                    className={`dropzone-container pointer border-radius-12`}
                                    title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                >
                                    <div {...getRootProps()}>
                                        <input {...getInputProps()} />
                                        <div className="text-muted text-center w-100 h-100">
                                            {previewImage || state?.profilePicture ? (
                                                <div className="d-flex align-items-center pointer">
                                                    <div className="profile-image large mx-auto mb-3 position-relative pointer">
                                                        <Image
                                                            className="rounded-circle object-fit-cover w-full h-full  "
                                                            fill
                                                            src={previewImage || state?.profilePicture || ""}
                                                            alt=""
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <GalleryAdd color="#B0B0B0" variant="Bold" size={40} />
                                            )}
                                            {
                                                <div>
                                                    Drag and drop file, or <a className="">Choose a File</a>
                                                    <br />
                                                    <small>Supported formats: .png, .jpg, .jpeg, apple format.</small>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </section>
                            )}
                        </Dropzone>
                        <p className={`mt-2 mb-0 ${fileSizeExceeds10Mb ? "text-danger" : "text-muted"}`}>
                            Maximum file size: 10mb
                        </p>
                        {dropZoneErrorMessage && <p className="text-danger">{dropZoneErrorMessage}</p>}
                    </Modal.Body>
                    <Modal.Footer className="mt-4">
                        <Button variant="outline-secondary" className="px-4" onClick={removeSelectedImage}>
                            Remove
                        </Button>
                        <Button
                            disabled={(!previewImage && state.profilePicture) || isSaving}
                            variant="primary"
                            type="submit"
                            className="px-4"
                        >
                            {isSaving ? <ButtonLoader buttonText="Uploading" /> : "Upload"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default ProfileImageModal;
