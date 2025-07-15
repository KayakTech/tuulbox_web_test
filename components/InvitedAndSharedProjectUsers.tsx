import { convertCamelCaseToSentenceCase, copyText, isMobileDevice, isTabletDevice } from "@/helpers";
import { Contact } from "@/repositories/contact-repositories";
import { Project } from "@/repositories/project-repository";
import { ArrowDown2, Copy, Edit2, Link1, Link2, Trash, User, UserAdd } from "iconsax-react";
import Image from "next/image";
import { Button, Col, Container, Dropdown, Row } from "react-bootstrap";
import { MoreHorizontal } from "react-feather";
import InviteCard from "./InviteCard";
import { useState } from "react";

type InvitedAndSharedProjectUsersProps = {
    project: Project;
    shareType: string;
    inviteUser?: () => void;
    shareLink?: () => void;
    onUpdateSharedLink?: (sharedData: any) => void;
    onUpdateInvitedUsers?: (user: any) => void;
    onRevokeShare?: (id: string) => void;
    onRevokeInvite?: (id: string) => void;
    shareSent?: any;
    invitationsSent?: any;
    invitedUsers?: Contact[];
};

export default function InvitedAndSharedProjectUsers({
    project,
    shareType,
    inviteUser,
    shareLink,
    onUpdateInvitedUsers,
    onUpdateSharedLink,
    onRevokeShare,
    onRevokeInvite,
    shareSent,
    invitationsSent,
    invitedUsers,
}: InvitedAndSharedProjectUsersProps) {
    function theContacts() {
        return shareType === "share" ? shareSent : invitedUsers;
    }

    function handleInvite() {
        shareType === "share" ? shareLink && shareLink() : inviteUser && inviteUser();
    }

    function handleUpdate(value: any) {
        shareType === "share"
            ? onUpdateSharedLink && onUpdateSharedLink(value)
            : onUpdateInvitedUsers && onUpdateInvitedUsers(value);
    }

    function handleRevoke(value: any) {
        shareType === "share" ? onRevokeShare && onRevokeShare(value) : onRevokeInvite && onRevokeInvite(value);
    }

    function text1(value: any) {
        if (shareType === "share") {
            return `Sharing ${formatAccessLevels(value.documentCategoryAccesses)} with`;
        }
        return `${value.firstName} ${value.lastName}`;
    }

    function text2(value: any) {
        if (shareType === "share") {
            return value.userEmails.join(", ");
        }
        return `${value.email.toLowerCase()}`;
    }

    function text3(value: any) {
        if (shareType != "share") {
            return (
                <p className="m-0">
                    <span
                        className={`${
                            value.status === "pending"
                                ? "text-yellow-700 fst-italic tb-body-light-italics"
                                : value.status === "rejected"
                                ? "text-danger fst-italic tb-body-light-italics"
                                : ""
                        }`}
                    >{`${
                        value.status === "pending"
                            ? "Pending invitation to:"
                            : value.status === "rejected"
                            ? "Rejected invite to:"
                            : "Invited to:"
                    } `}</span>
                    {`${formatAccessLevels(value.documentCategoryAccesses)}`}
                </p>
            );
        }
        return "";
    }

    function formatAccessLevels(documentCategoryAccesses: any[]) {
        const filteredCategories = documentCategoryAccesses
            ?.filter((value: any) => value.accessLevel !== "no_access")
            .map((value: any) => convertCamelCaseToSentenceCase(value.documentCategory));

        if (filteredCategories?.length === 0) {
            return "";
        } else if (filteredCategories?.length === 1) {
            return filteredCategories[0];
        } else {
            return `${filteredCategories?.slice(0, -1).join(", ")} and ${filteredCategories?.slice(-1)}`;
        }
    }
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className={isMobileDevice() || isTabletDevice() ? "mt-3" : ""}>
                <Container fluid className="d-flex flex-column gap-20 bg-white">
                    <div className="accordion accordion-flush" id="accordionExample">
                        <div className="accordion-item">
                            <div
                                className={`accordion-header d-flex border-0 justify-content-between gap-2 align-items-center py-3 ${
                                    isOpen ? "border-bottom border-bottom-gray-100" : ""
                                }`}
                                id="headingOne"
                                onClick={() => setIsOpen(!isOpen)}
                                style={{ cursor: "pointer" }}
                            >
                                <h4 className="tb-title-subsection-medium d-flex flex-column gap-2 text-gray-900 m-0">
                                    {true ? "Sharing Project link with" : "Invited Users"}
                                    <p className="m-0 text-gray-500 tb-body-large-regular">
                                        See a list of all your invited users ({invitedUsers?.length})
                                    </p>
                                </h4>
                                <div>
                                    <ArrowDown2
                                        size={16}
                                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                                    />
                                </div>
                            </div>
                            <div id="collapseOne" className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}>
                                <div className="accordion-body d-flex flex-column gap-4 pt-4 padding px-0">
                                    <div className="d-flex justify-content-end">
                                        <Button
                                            variant="outline-primary"
                                            className="d-flex align-items-center gap-2 text-nowrap tb-title-body-medium"
                                            size="lg"
                                            onClick={handleInvite}
                                        >
                                            {shareType === "share" ? <Link1 size={24} /> : <UserAdd size={24} />}
                                            <span> {shareType === "share" ? "Share link" : "Invite User"}</span>
                                        </Button>
                                    </div>
                                    <div className="d-flex gap-4 mb-4 flex-wrap">
                                        {theContacts()?.map((value: any, index: number) => (
                                            <InviteCard
                                                key={index}
                                                invite={value}
                                                onRevoke={() => handleRevoke(value)}
                                                onUpdate={() => handleUpdate(value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Old view */}
                    {false && (
                        <div className="">
                            <Container fluid>
                                {theContacts().map((value: any, index: number) => (
                                    <div
                                        key={index}
                                        className={`d-flex justify-content-between border-gray-50 gap-3 border-solid align-items-center ${
                                            index === 0 ? "border-top-radius-12" : ""
                                        } ${index === theContacts().length - 1 ? "border-bottom-radius-12" : ""} ${
                                            index != 0 ? "border-top-0" : ""
                                        } p-16`}
                                    >
                                        <div className="d-flex flex-grow-1 gap-3 align-content-end">
                                            {shareType != "share" && (
                                                <div
                                                    className={`w-48 h-48 bg-gray-50 object-fit-cover flex-shrink-0 ${
                                                        shareType != "share" ? "border-gray-300" : "border-gray-50"
                                                    } border-solid border-2 rounded-circle d-flex justify-content-center align-items-center text-uppercase text-gray-800 object-fit-cover`}
                                                >
                                                    {value.profilePicture ? (
                                                        <Image
                                                            src={value.profilePicture}
                                                            className="rounded-circle w-48 h-48"
                                                            alt="profile picture"
                                                            width={48}
                                                            height={48}
                                                        />
                                                    ) : value?.firstName ? (
                                                        value.firstName[0]
                                                    ) : (
                                                        value.email[0].toLowerCase()
                                                    )}
                                                </div>
                                            )}
                                            <div>
                                                <p className="m-0 text-gray-600 fw-500 fs-16">{text1(value)}</p>
                                                <p className="text-muted m-0">{text2(value)}</p>
                                                {text3(value)}
                                            </div>
                                        </div>
                                        <span className="d-flex gap-2">
                                            <Dropdown
                                                className="ms-auto"
                                                drop={theContacts().length <= 2 ? "start" : "down"}
                                            >
                                                <Dropdown.Toggle
                                                    size="sm"
                                                    variant="default"
                                                    className="btn-square ms-auto"
                                                    id="dropdown-basic"
                                                >
                                                    <MoreHorizontal size={24} />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu align={`end`}>
                                                    <Dropdown.Item onClick={() => handleUpdate(value)}>
                                                        <Edit2 size={16} color="#888888" />{" "}
                                                        <span className="tb-body-default-regular">Update</span>
                                                    </Dropdown.Item>
                                                    {shareType === "share" && (
                                                        <Dropdown.Item onClick={() => copyText(value.link)}>
                                                            <Copy size={16} color="#888888" />{" "}
                                                            <span className="tb-body-default-regular">
                                                                Copy Shared Link
                                                            </span>
                                                        </Dropdown.Item>
                                                    )}
                                                    <Dropdown.Item
                                                        onClick={() => handleRevoke(value)}
                                                        className="text-danger"
                                                    >
                                                        <Trash size={16} color="#E70000" />{" "}
                                                        <span className="tb-body-default-regular text-danger">
                                                            Revoke
                                                        </span>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </span>
                                    </div>
                                ))}
                            </Container>
                        </div>
                    )}
                </Container>
            </div>
        </>
    );
}
