import { formatPhoneNumber, formatPhoneNumberWithSpace } from "@/helpers";
import { Contact } from "@/repositories/contact-repositories";
import { ArrowRight, Edit2, Trash, UserAdd } from "iconsax-react";
import { Button, Dropdown } from "react-bootstrap";
import { MoreVertical } from "react-feather";
import EmptyStateInnerPage from "./EmptyStateInnerPage";

type ProjectCollaboratorsProps = {
    invitedUsers: Contact[];
    seeAllCollaborators: boolean;
    onUpdateInvitedUsers: (contact: Contact) => void;
    onRevokeInvite: (contact: Contact) => void;
    onViewAllCollaborators?: () => void;
    inviteUser?: () => void;
};
export default function ProjectCollaboratorsCard(props: ProjectCollaboratorsProps) {
    const {
        invitedUsers,
        seeAllCollaborators,
        onRevokeInvite,
        onUpdateInvitedUsers,
        onViewAllCollaborators,
        inviteUser,
    } = props;
    return (
        <div
            className={`border-gray-100 d-flex flex-column gap-4 border-radius-12 ${
                seeAllCollaborators ? "border px-1" : "border"
            }`}
        >
            <div
                className={`d-flex justify-content-between px-3 align-items-center py-12 border-bottom border-gray-100 ${
                    seeAllCollaborators ? "" : ""
                }`}
            >
                <h5 className="tb-body-default-medium m-0 text-gray-800">Collaborators</h5>

                {invitedUsers.length > 0 && (
                    <div className="">
                        <Button
                            variant="outline-secondary"
                            className="d-flex tb-body-default-medium gap-1 align-items-center"
                            onClick={inviteUser}
                        >
                            <UserAdd size="16" /> Invite User(s)
                        </Button>
                    </div>
                )}
            </div>
            <div className={`py-12 d-flex flex-column gap-3 w-100 ${seeAllCollaborators ? "px-3" : ""}`}>
                {invitedUsers.length ? (
                    <>
                        <div
                            className={`d-flex flex-column gap-3 border-bottom border-gray-100  ${
                                seeAllCollaborators ? "border-bottom-0" : "px-3 pb-4 border-0"
                            }`}
                        >
                            {(seeAllCollaborators ? invitedUsers : invitedUsers?.slice(0, 4)).map(
                                (contact: Contact, index: number) => (
                                    <div className="row g-4" key={contact?.id}>
                                        <div className="col-md-4">
                                            <div className="d-flex flex-column gap-1">
                                                <h5 className="tb-body-small-medium m-0 text-gray-400">Name</h5>
                                                <div className="d-flex gap-2">
                                                    {contact.firstName && contact.lastName?.length ? (
                                                        <p className="text-wrap m-0 tb-body-default-medium text-gray-800">
                                                            {contact?.firstName} {contact?.lastName}
                                                        </p>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="d-flex flex-column gap-1">
                                                <h5 className="tb-body-small-medium m-0 text-gray-400">Phone</h5>
                                                {contact.phoneNumber ? (
                                                    <a
                                                        href={`tel:${contact.phoneNumber}`}
                                                        className="text-wrap tb-body-default-medium text-blue-800"
                                                    >
                                                        {contact.phoneNumber}
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="d-flex flex-column gap-1">
                                                <h5 className="tb-body-small-medium m-0 text-gray-400">Status</h5>
                                                {contact.status ? (
                                                    <a
                                                        href={`tel:${contact.status}`}
                                                        className="text-wrap tb-body-default-medium text-decoration-none text-blue-800"
                                                    >
                                                        {contact.status.charAt(0).toUpperCase() +
                                                            contact.status.slice(1)}
                                                    </a>
                                                ) : (
                                                    "-"
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className=" d-flex justify-content-between align-items-center">
                                                <div className="d-flex flex-column gap-1">
                                                    <h5 className="tb-body-small-medium m-0 text-gray-400">Email</h5>
                                                    {contact.email ? (
                                                        <a
                                                            title={contact.email}
                                                            href={`mailto:${contact?.email}`}
                                                            className="text-wrap truncate-1 text-decoration-none tb-body-default-medium text-blue-800"
                                                        >
                                                            {contact.email}
                                                        </a>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </div>
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="" className="p-0" id="dropdown-basic">
                                                        <MoreVertical size={24} />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="resource-card dropdown-menu" align="end">
                                                        <Dropdown.Item
                                                            className=""
                                                            onClick={() => onUpdateInvitedUsers(contact)}
                                                        >
                                                            <Edit2 size="16" color="#888888" />
                                                            <span className="tb-body-default-regular">Update</span>
                                                        </Dropdown.Item>

                                                        <Dropdown.Item
                                                            className="text-danger"
                                                            onClick={() => onRevokeInvite(contact)}
                                                        >
                                                            <Trash size={16} className="text-danger" />
                                                            <span className="tb-body-default-regular text-danger">
                                                                Revoke Access
                                                            </span>
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>

                        {!seeAllCollaborators && (
                            <div
                                className="border-topm border-gray-100 d-flex align-items-center justify-content-center gap-1 pt-3 pointer"
                                onClick={onViewAllCollaborators}
                            >
                                <span className="tb-body-small-medium text-primary">See All Collaborators</span>
                                <ArrowRight size="16" color="#102340" />
                            </div>
                        )}
                    </>
                ) : (
                    <EmptyStateInnerPage
                        // icon={<Folder />}
                        headerText="No collaborators"
                        descriptionText="Collaborators added can be managed here"
                        buttonText="Invite User(s)"
                        className="my-5"
                        fixedHieght={false}
                        onButtonClick={inviteUser}
                    />
                )}
            </div>
        </div>
    );
}
