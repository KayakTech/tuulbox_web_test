import PageLoader from "@/components/PageLoader";
import useContact from "@/hooks/useContact";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import DeleteModal from "@/components/DeleteModal";
import useSubcontractors from "@/hooks/subContractors";
import { isMobileDevice, isTabletDevice } from "@/helpers";
import ContactDetailsCard from "@/components/ContactDetailsCard";
import ContactDetailsCard2 from "@/components/ContactDetailsCard2";
import { Contact } from "@/repositories/contact-repositories";

type ContactDetailsComponentProps = {
    sContractorId?: string;
    contact?: Contact;
};

export default function ContactDetailsComponent({ sContractorId, contact }: ContactDetailsComponentProps) {
    const router = useRouter();
    const { showModal, setShowModal, handleDelete, contactToDelete, onAddtoFavorites, deleteContact } = useContact({});

    const {
        subContractor,
        isLoading,
        showDeleteModal,
        isDeleting,
        getSubcontractor,
        setSubcontractorId,
        setContactDocumentAction,
        setShowDeleteModal,
        deleteSubcontractorEstimate,
        setIsLoading,
    } = useSubcontractors({});

    useEffect(() => {
        if (sContractorId) {
            setSubcontractorId(sContractorId);
            getSubcontractor({ subcontractorId: sContractorId });
        } else {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const act = router.query.action;
        !act && sContractorId && getSubcontractor({ subcontractorId: sContractorId });
        setContactDocumentAction(`${act ?? ""}`);
    }, [router]);

    return (
        <>
            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="d-flex flex-column mb-5">
                    {isMobileDevice() || isTabletDevice() ? (
                        <ContactDetailsCard
                            subcontractor={subContractor}
                            onUpdate={() =>
                                router.push(
                                    `/contacts/edit/${contact?.id}?redirect=${location.pathname + location.search}`,
                                )
                            }
                            onDelete={() => deleteContact(contact?.id)}
                            onAddToFavorites={() => contact && onAddtoFavorites(contact)}
                        />
                    ) : (
                        <Container fluid className="mt-5">
                            <ContactDetailsCard2
                                contact={contact}
                                subContractor={subContractor}
                                onUpdate={() => {
                                    getSubcontractor({ subcontractorId: sContractorId! });
                                }}
                            />
                        </Container>
                    )}

                    <DeleteModal
                        showModal={showModal}
                        setShowModal={(value: boolean) => setShowModal(value)}
                        dataToDeleteName={"contact"}
                        message="Are you sure you want to delete contact? This action cannot be undone"
                        isDeleting={isDeleting}
                        onYesDelete={() => handleDelete(contactToDelete)}
                    />

                    <DeleteModal
                        showModal={showDeleteModal}
                        setShowModal={(value: boolean) => setShowDeleteModal(value)}
                        dataToDeleteName={"document"}
                        message="Are you sure you want to delete document? This action cannot be undone"
                        isDeleting={isDeleting}
                        onYesDelete={deleteSubcontractorEstimate}
                    />
                </div>
            )}
        </>
    );
}
