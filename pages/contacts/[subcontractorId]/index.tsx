import ContactDetailsComponent from "@/components/ContactDetailsComponent";
import DashboardLayout from "@/components/DashboardLayout";
import PageLoader from "@/components/PageLoader";
import useContact from "@/hooks/useContact";
import { useEffect, useState } from "react";

export default function ContactDetails() {
    const [subcontractorId, setSubcontractorId] = useState<string>("");
    const { getContact, isLoading, contact } = useContact({});

    useEffect(() => {
        const id = location.pathname.split("/")[2];
        setSubcontractorId(id);
        getContact(id);
    }, []);

    return (
        <DashboardLayout
            breadCrumbs={[{ name: "Contacts", url: "/contacts" }, { name: "View details" }]}
            pageTitle="View document details"
        >
            {isLoading ? (
                <PageLoader />
            ) : (
                contact && (
                    <>
                        <ContactDetailsComponent
                            sContractorId={contact?.subcontractorId ?? undefined}
                            contact={contact}
                        />
                    </>
                )
            )}
        </DashboardLayout>
    );
}
