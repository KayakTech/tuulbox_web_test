import { Card, Dropdown } from "react-bootstrap";
import { MoreHorizontal } from "react-feather";
import { Contact } from "@/repositories/contact-repositories";
import { Edit2, Message, Star1, Trash } from "iconsax-react";
import useContact from "@/hooks/contact";

type ContactCardProps = {
    contact: Contact;
    onDelete?: () => void;
    onUpdate?: () => void;
    onAddToFavorites?: () => void;
    isViewOnly?: boolean;
};

export default function ContactCard(props: ContactCardProps) {
    const { contact, onDelete, onAddToFavorites, isViewOnly } = props;

    const { composeGmail } = useContact({});

    return (
        <Card className="pointer h-100m w-100m contact-cardm">
            <div className="pt-20 px-12 pb-0" onClick={() => (window.location.href = `/contacts/${contact.id}`)}>
                <div className="d-flex flex-column align-items-center contact-card">
                    <div className="icon-box tb-title-medium text-gray-800">
                        {contact?.firstName?.charAt(0) ?? ""}
                        {contact?.lastName?.charAt(0) ?? ""}
                    </div>
                </div>
            </div>
            <div className=" px-0 pt-12 pe-0  pb-20">
                <div className="d-flex px-12 pt-3 flex-column align-items-centerm">
                    <div className="h-46 d-flex flex-column gap-1 align-items-center">
                        <p className="truncate-1 m-0 tb-body-default-medium text-gray-700">
                            {contact?.firstName} {contact?.lastName}
                        </p>
                        {(contact?.email || contact?.phoneNumber) && (
                            <p className=" m-0 text-muted d-flex tb-body-small-regular">
                                {contact?.phoneNumber && (
                                    <a
                                        href={`tel:${contact.phoneNumber}`}
                                        className="text-decoration-none m-0 text-muted"
                                    >
                                        {contact.phoneNumber}
                                    </a>
                                )}
                                {contact.email && contact.phoneNumber && ` , `}
                                {contact?.email && (
                                    <a
                                        title={contact.email.toLowerCase()}
                                        href={`mailto:${contact.email}`}
                                        className="text-decoration-none ms-1 truncate-1 text-muted"
                                    >
                                        {contact.email.toLowerCase()}
                                    </a>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="d-flex gap-3">
                <div className="ms-auto position-absolute top-0 end-0 mt-2 me-2">
                    <Dropdown className="w-100 text-end">
                        <Dropdown.Toggle className="btn w-44 bg-gray-50 d-flex align-items-center border-radius-40 border-0">
                            <MoreHorizontal size={24} color="#454545" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align={`end`}>
                            <Dropdown.Item
                                href={""}
                                onClick={() => {
                                    composeGmail(contact.email ?? "");
                                }}
                            >
                                <Message size={16} /> <span className="tb-body-default-regular">Send Email</span>
                            </Dropdown.Item>
                            <Dropdown.Item href={`contacts/edit/${contact?.id}`}>
                                <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                            </Dropdown.Item>

                            {!isViewOnly && (
                                <>
                                    <Dropdown.Item onClick={onAddToFavorites}>
                                        <Star1 size={16} />{" "}
                                        <span className="tb-body-default-regular">Add to Favorites</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={onDelete} className="text-danger">
                                        <Trash size={16} className="" color="#E70000" />{" "}
                                        <span className="tb-body-default-regular text-danger">Delete</span>
                                    </Dropdown.Item>
                                </>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </Card>
    );
}
