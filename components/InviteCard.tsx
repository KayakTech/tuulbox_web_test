import { convertCamelCaseToSentenceCase, copyText, isMobileDevice } from "@/helpers";
import React from "react";
import { Dropdown } from "react-bootstrap";
import { MoreHorizontal, Edit2, Copy, Trash } from "react-feather";
import Image from "next/image";
import { first } from "cheerio/lib/api/traversing";
import { Contact } from "@/repositories/contact-repositories";
type Status = "Pending" | "Accepted";

type InviteCardProps = {
    invite: any;
    onUpdate?: () => void;
    onRevoke?: () => void;
};

export function InviteCard(props: InviteCardProps) {
    const { invite, onUpdate, onRevoke } = props;

    function inviteStatus() {
        return invite?.status === "pending"
            ? "Pending invitation to:"
            : invite?.status === "rejected"
            ? "Rejected invite to:"
            : "Invited to:";
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

    return (
        <div className={`border card border-radius-12 p-20 gap-12 h-168 ${isMobileDevice() ? "w-100" : "w-348"}`}>
            <div className="d-flex flex-column gap-12 w-100">
                <div className="d-flex justify-content-between gap-12 w-100">
                    <div className="d-flex gap-12 ">
                        {/* Profile image */}
                        <div className="rounded-circle bg-gray-100 d-flex align-items-center justify-content-center  h-48 w-48 object-fit-cover flex-shrink-0 text-uppercase">
                            {invite?.profilePicture ? (
                                <Image
                                    src={invite?.profilePicture}
                                    alt={`${invite?.firstName}'s profile`}
                                    className="rounded-circle h-48 w-48 d-flex align-items-center justify-content-center border border-gray-300"
                                />
                            ) : invite?.firstName ? (
                                invite?.firstName[0]
                            ) : (
                                invite?.email && invite?.email[0].toLowerCase()
                            )}
                        </div>

                        {/* details */}
                        <div className="d-flex flex-column gap-1">
                            <div className="d-flex align-items-center gap-2  ">
                                <p className="tb-title-body-medium m-0  text-gray-700">
                                    {invite?.firstName ?? ""} {invite?.lastName ?? ""}
                                </p>

                                {/* Invite status */}
                                <div
                                    className={`text-center px-2 py-1 border-radius-40 tb-body-small-medium d-flex align-items-center justify-content-center h-24 w-72 text-capitalize ${
                                        invite?.status === "accepted"
                                            ? "bg-green-50 text-green-600"
                                            : invite?.status === "pending"
                                            ? "bg-yellow-50 text-yellow-650"
                                            : "bg-red-50 text-red-600"
                                    }`}
                                >
                                    {invite?.status}
                                </div>
                            </div>
                            {invite?.email && (
                                <small className="text-muted tb-body-default-regular truncate-1">{invite?.email}</small>
                            )}
                        </div>
                    </div>

                    <div className="">
                        <span className="d-flex gap-2 ">
                            <Dropdown className="d-flex align-items-start m-0" drop="down">
                                <Dropdown.Toggle
                                    size="sm"
                                    variant="default"
                                    className="btn-square ms-auto d-flex p-0 "
                                    id="dropdown-basic"
                                >
                                    <MoreHorizontal size={24} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align={`end`}>
                                    <Dropdown.Item onClick={onUpdate}>
                                        <Edit2 size={16} color="#888888" />
                                        <span className="tb-body-default-regular">Update</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={onRevoke} className="text-danger">
                                        <Trash size={16} color="#E70000" />
                                        <span className="tb-body-default-regular text-danger">Revoke</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </span>
                    </div>
                </div>

                <div className="d-flexj text-truncate text-wrap h-100 tb-body-default-medium text-muted">
                    <span className="d-flex text-truncate text-wrap">
                        <p
                            className="m-0 truncate-3 text-wrap h-auto"
                            title={formatAccessLevels(invite?.documentCategoryAccesses)}
                        >
                            {inviteStatus()} {formatAccessLevels(invite?.documentCategoryAccesses)}
                        </p>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default InviteCard;
