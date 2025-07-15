import { Card, Dropdown } from "react-bootstrap";
import { MoreHorizontal } from "react-feather";
import { Contact } from "@/repositories/contact-repositories";
import { Edit2, Message, Star1, StarSlash, User } from "iconsax-react";
import useContact from "@/hooks/useContact";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type ContactCardProps = {
    contact: Contact;
    onDelete?: () => void;
    onUpdate?: () => void;
    onAddToFavorites?: (value: any) => void;
    isViewOnly?: boolean;
    onRemoveFromRecent?: () => void;
    onRemoveFromFavorites?: () => void;
};

export default function ContactMiniCard(props: ContactCardProps) {
    const { user } = useSelector((state: RootState) => state.account);
    const { contact, onAddToFavorites, onRemoveFromRecent, onRemoveFromFavorites } = props;
    const { composeGmail } = useContact({});

    return (
        <Card className="d-flex gap-12 flex-row align-items-center justify-content-between w-100 p-12 border border-gray-100 rounded-3 shadow-sm">
            <div
                className="d-flex gap-12 h-46 w-100 align-items-center"
                onClick={() => (window.location.href = `/contacts/${contact.id}`)}
            >
                <div className="d-flex bg-gray-50 rounded-3 flex-shrink-0 object-fit-cover justify-content-center align-items-center h-40 w-40">
                    {contact?.firstName?.charAt(0) ?? ""}
                    {contact?.lastName?.charAt(0) ?? ""}
                </div>
                <div className="d-flex justify-content-between align-items-center w-100 h-46">
                    <div className="">
                        <p className="text-gray-700 tb-body-default-medium truncate-1 p-0 m-0">
                            {contact?.firstName} {contact?.lastName}
                        </p>
                        {contact?.email && (
                            <p className="mt-1m mb-0 p-0">
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="text-decoration-none text-muted tb-body-extra-small-regular"
                                >
                                    {contact.email.toLowerCase()}
                                </a>
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="d-flex gap-3 ">
                <div className="ms-auto">
                    <Dropdown className="w-100m text-end">
                        <Dropdown.Toggle className="btnm bg-gray-50 d-flex align-items-center justify-content-center h-24 w-24 p-0 border-radius-40 border-0">
                            <MoreHorizontal size={16} color="#454545" />
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

                            {!contact.inFavorite && (
                                <Dropdown.Item
                                    onClick={() => {
                                        const payload = {
                                            objectType: "contact",
                                            objectId: contact.id,
                                            createdBy: user?.id,
                                            company: user?.companyId,
                                        };
                                        onAddToFavorites?.(payload);
                                    }}
                                >
                                    <Star1 size={16} />{" "}
                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                </Dropdown.Item>
                            )}

                            {contact.inFavorite && (
                                <Dropdown.Item
                                    onClick={() => {
                                        onRemoveFromFavorites?.();
                                    }}
                                >
                                    <StarSlash size={16} />{" "}
                                    <span className="tb-body-default-regular">Remove from Favorites</span>
                                </Dropdown.Item>
                            )}

                            {onRemoveFromRecent && (
                                <Dropdown.Item
                                    onClick={() => {
                                        onRemoveFromRecent?.();
                                    }}
                                >
                                    <StarSlash size={16} color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Remove from Recent</span>
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </Card>
    );
}
