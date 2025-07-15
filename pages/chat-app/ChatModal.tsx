import { InfoCircle, Link1, User, UserAdd } from "iconsax-react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import _ from "lodash";
import useContact from "@/hooks/contact";
import CircleGrey from "@/components/CircleGrey";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import { Contact } from "@/repositories/contact-repositories";
import { useEffect } from "react";

type ChatModalProps = {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
};

export default function ShareProjectModal({ showModal, setShowModal }: ChatModalProps) {
    const {
        contactsTable,
        getContacts,
        contacts,
        isLoading,
        isDeleting,
        handleDelete,
        contactToDelete,
        deleteContact,
        showDeleteModal,
        setShowDeleteModal,
        hasMore,
        onTablePageChange,
        perPage,
        listOrGrid,
        totalRows,
        setIsLoading,
        pageReady,
        setPageReady,
        searchResults,
        onAddtoFavorites,
        showToast,
    } = useContact({});

    useEffect(() => {
        getContacts();
    }, []);

    function openChat() {
        setShowModal(false);
    }

    return (
        <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" className="chat-modal">
            <Modal.Header closeButton className="px-20 py-4  border-bottom border-gray-100 border-2">
                <div className="modal-user-header w-56 h-56 object-fit-cover me-4 flex-shrink-0 bg-accent-blue-900 border-radius-12 d-flex align-items-center justify-content-center">
                    <UserAdd color="white" size={40} />
                </div>
                <Modal.Title className="">
                    <h1 className="tb-title-subsection-medium m-0 pb-1 ">Select contact</h1>
                    <p className="tb-body-large-regular m-0">Select a Tuulbox contact to start a conversation</p>
                </Modal.Title>
            </Modal.Header>
            <div className="d-flex flex-column gap-4 px-20m">
                <Modal.Body className="bg-white mt-2m d-flex px-20 flex-column gap-4">
                    <SearchBar searchPlaceholder="Search" />

                    <div className="d-flex flex-column justify-content-between">
                        <div className="d-flex flex-column gap-4 overflow-scroll pb-24" style={{ height: "688px" }}>
                            {contacts.map((contact: Contact, index: number) => (
                                <div
                                    key={index}
                                    onClick={openChat}
                                    className="px-3 py-12 d-flex align-items-center pointer border-radius-12 border border-gray-100"
                                    style={{ height: "72px" }}
                                >
                                    <div
                                        className="text-muted font-size-root d-flex align-items-center my-1m pointer"
                                        onClick={() => {}}
                                    >
                                        <CircleGrey>
                                            <Image
                                                src={`/images/svg/icons/contact.svg`}
                                                width={16}
                                                height={16}
                                                alt=""
                                            />
                                        </CircleGrey>
                                        <div className="truncate-1">
                                            <span className={`tb-body-default-medium text-gray-600`}>
                                                {contact?.firstName} {contact?.lastName}
                                            </span>
                                            <p className="truncate-1 mt-1 m-0 small sub-max-with text-muted tb-body-small-regular">
                                                {contact?.email?.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="border-top-0 d-flex p-0 mt-0 border">
                    <div className="d-flex gap-2 px-20 w-100 justify-content-between border-0">
                        <p>Previous</p>
                        <p>1</p>
                        <p>Next</p>
                    </div>
                </Modal.Footer>
            </div>
        </Modal>
    );
}
