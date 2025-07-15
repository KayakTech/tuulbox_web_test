import { User } from "iconsax-react";
import { Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Contact } from "@/repositories/contact-repositories";

type ProjectModuleListItemProps = {
    contact: Contact;
    selectAll: boolean;
    selectedContacts: string[];
    onSelected: (contact: Contact) => void;
};

export default function ProjectContactListItem({
    contact,
    selectAll,
    selectedContacts,
    onSelected,
}: ProjectModuleListItemProps) {
    const { dataDisplayLayout } = useSelector((state: RootState) => state.dataDisplayLayout);

    function handleSelected() {
        onSelected(contact);
    }

    return (
        <div
            className="border border-gray-50 border-radius-12 p-16 d-flex align-items-center pointer"
            onClick={handleSelected}
        >
            <div className="d-flex flex-grow-1 align-items-center gap-3">
                <div className="w-40 h-40 bg-gray-50 border-gray-100 rounded-circle d-flex justify-content-center align-items-center">
                    <User
                        size={16}
                        color={
                            contact?.email && selectedContacts.includes(contact?.email)
                                ? "rgba(93, 93, 93, 1)"
                                : "#B0B0B0"
                        }
                    />
                </div>
                <div className="d-flex flex-column ">
                    {contact?.email && (
                        <p className="m-0 text-gray-600 fw-500 fs-16">{contact?.email?.toLowerCase()}</p>
                    )}
                    <div className="d-flex gap-2">
                        {contact?.firstName && <p className="m-0 text-gray-600 fw-500 fs-16">{contact?.firstName}</p>}
                        {contact?.lastName && <p className="m-0 text-gray-600 fw-500 fs-16">{contact?.lastName}</p>}
                    </div>
                </div>
            </div>
            <Form.Check
                className="module-checkbox"
                id={`checkbox-${contact.id}`}
                checked={
                    contact?.email && contact?.firstName
                        ? selectedContacts.includes(contact?.email || contact?.firstName)
                        : false
                }
                onClick={e => {
                    e.stopPropagation();
                }}
                onChange={handleSelected}
            />
        </div>
    );
}
