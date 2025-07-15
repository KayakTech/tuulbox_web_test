import { Badge, Button, Card, Col, Dropdown, Row } from "react-bootstrap";
import PdfIcon from "./icons/PdfIcon";
import Link from "next/link";
import { MoreHorizontal, Share2 } from "react-feather";
import { Iconly } from "react-iconly";
import { ExportSquare, Lock, Lock1, NotificationBing, ReceiveSquare, Star1, Trash } from "iconsax-react";
import { ProjectDocumentType } from "@/repositories/project-repository";
import { Tag } from "@/repositories/resource-repository";
import { FileAttachment } from "./FileCard";
import { useRouter } from "next/router";
import { downloadFile, formatDatetime } from "@/helpers";
import { DocumentDownload, Edit2 } from "iconsax-react";
import { TaxDocument } from "@/repositories/subcontractor-repository";
import BadgeTag from "./BadgeTag";
import useFavorites from "@/hooks/favorites";
import { User } from "@/repositories/account-repository";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Image from "next/image";
import PrivateLock from "./PrivateLock";
import { DEFAULT_PHOTO_PREVIEW } from "@/helpers/constants";

type ContactDocumentProps = {
    file?: any;
    onDelete?: (document: any) => void;
    onUpdate?: (document?: any) => void;
    redirectOnUpdate?: boolean;
    document?: ProjectDocumentType;
    showTag?: boolean;
    fileType: string;
    user?: User | null;
    isExpiring?: boolean;
    isGallery?: boolean;
    onItemClick?: (document: any) => void;
    isShared?: boolean;
    hideActions?: boolean;
    isPrivate?: boolean;
    addToFavorites?: (payload: any) => void;
    isViewOnly?: boolean;
};

export default function ContactDocumentSmall(props: ContactDocumentProps) {
    const { user } = useSelector((state: RootState) => state.account);
    const router = useRouter();
    // const { addToFavorites } = useFavorites();
    const {
        file,
        onDelete,
        onUpdate,
        redirectOnUpdate = true,
        document,
        showTag = false,
        fileType,
        isExpiring,
        isGallery,
        onItemClick,
        isShared,
        hideActions,
        isPrivate,
        addToFavorites,
        isViewOnly,
    } = props;

    function handleUpdate() {
        if (isExpiring) {
            return;
        }
        if (onUpdate) {
            onUpdate(document || file);
            return;
        }
        if (fileType.toLowerCase() === "storage") {
            router.push(`/storage/edit/${file?.id}`);
            return;
        }
    }

    function row1() {
        if (fileType.toLocaleLowerCase() === "contact-document") return file?.originalFileName;
        if (["estimate"].includes(fileType.toLowerCase())) return file.originalFileName;
        if (["project-document"].includes(fileType.toLowerCase())) return document?.name ?? file?.name;
        if (["storage"].includes(fileType.toLowerCase())) return file?.originalFileName;
        return "";
    }
    function row2() {
        if (fileType.toLowerCase() === "contact-document") {
            return <small className="text-gray-700 tb-body-default-medium truncate-1">{file.fileCategory}</small>;
        }
        if (["storage", "project-document"].includes(fileType.toLowerCase()) && file?.tags?.length) {
            return (
                <div className="d-flex flex-wrap gap-3 tb-body-extra-small-regular">
                    {file.tags.map((tag: Tag, index: number) => (
                        <BadgeTag tag={tag.name} key={tag.id} />
                    ))}
                </div>
            );
        }
        return "";
    }

    function row3() {
        if (fileType.toLowerCase() === "storage" && file?.expireAt) {
            return (
                <div className="d-flex justify-content-between text-muted">
                    {file.expireAt && (
                        <span className="tb-body-small-regular">Expires: {formatDatetime(file?.expireAt)}</span>
                    )}
                    {file.reminder && (
                        <span className="tb-body-small-regular">Reminder: {formatDatetime(file?.reminder)}</span>
                    )}
                </div>
            );
        }

        if (fileType.toLocaleLowerCase() === "contact-document") {
            return (
                <span>
                    Period:
                    {`${formatDatetime(file?.createdAt)} ${
                        file?.expireAt ? " to " + formatDatetime(file?.expireAt) : ""
                    }`}
                </span>
            );
        }
        return "";
    }

    function row4() {
        if (fileType.toLowerCase() === "storage" && file?.reminder) {
            return <span className="tb-body-small-regular text-muted">Reminder: {formatDatetime(file?.reminder)}</span>;
        }

        if (fileType.toLowerCase() === "contact-document" && file?.reminder) {
            return <span className="tb-body-small-regular text-muted">Reminder: {formatDatetime(file?.reminder)}</span>;
        }
        return "";
    }

    function onAddtoFavorites() {
        let payload = {
            objectId: file.id,
            createdBy: user?.id,
            company: user?.companyId,
        } as any;

        let objectType = "";
        if (["storage"].includes(fileType.toLowerCase())) {
            objectType = "storage";
        }
        if (["project-document"].includes(fileType.toLowerCase())) {
            objectType = "storage";
        }
        payload = {
            ...payload,
            objectType,
        };

        addToFavorites && addToFavorites(payload);
    }

    function handleViewFileClick() {
        onItemClick && onItemClick(file);
    }

    return (
        <>
            {isGallery ? (
                <Card className="h-100 overflow-hidden min-h-250">
                    <Image
                        src={file?.thumbnail ?? DEFAULT_PHOTO_PREVIEW}
                        alt=""
                        className="object-fit-cover h-100 round-top flex-shrink-0 w-100"
                        onClick={() => onItemClick && onItemClick(file)}
                        width={332}
                        height={250}
                    />

                    {isPrivate && (
                        <div className="position-absolute" style={{ top: "15px", left: "15px" }}>
                            <PrivateLock />
                        </div>
                    )}

                    <div className="d-flex justify-content-end position-absolute right-0">
                        <Dropdown className="w-44 h-44 text-end m-3 bg-transparent">
                            <Dropdown.Toggle variant="default" className="btn bg-transparent border-0">
                                <MoreHorizontal size={24} color="#454545" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                {isShared || hideActions ? (
                                    <>
                                        <Dropdown.Item href={file?.file} target="_blank">
                                            <ReceiveSquare className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">Download</span>
                                        </Dropdown.Item>
                                    </>
                                ) : (
                                    <>
                                        <Dropdown.Item onClick={handleUpdate}>
                                            <Edit2 className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">Edit File Name</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => onItemClick && onItemClick(file)}>
                                            <ReceiveSquare className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">Download</span>
                                        </Dropdown.Item>

                                        {!isViewOnly && (
                                            <>
                                                <Dropdown.Item onClick={onAddtoFavorites}>
                                                    <Star1 className="" size={16} />
                                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    className="text-danger"
                                                    onClick={() => onDelete && onDelete(document || file)}
                                                >
                                                    <Trash className="" size={16} color="#E70000" />
                                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                                </Dropdown.Item>
                                            </>
                                        )}
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Card>
            ) : (
                <Card className="w-100 h-100 d-flex">
                    <div>
                        {isPrivate && (
                            <div className="position-absolute" style={{ top: "15px", right: "15px" }}>
                                <PrivateLock />
                            </div>
                        )}
                        {file?.thumbnail ? (
                            <div className="overflow-hidden pointer object-fit-cover rounded-3 flex-shrink-0">
                                <Card.Img
                                    variant="top"
                                    src={file.thumbnail ?? ""}
                                    className="object-fit-cover h-40 w-40 round-topm rounded-3 flex-shrink-0 border-bottom border-gray-100"
                                />
                            </div>
                        ) : (
                            <Card.Header className="bg-gray-50 rounded flex-shrink-0 h-40 w-40 object-fit-cover">
                                <div className="d-flex round-top flex-shrink-0 object-fit-cover justify-content-center align-items-center h-40 w-40">
                                    <PdfIcon width={40} height={40} />
                                </div>
                            </Card.Header>
                        )}
                    </div>
                    <div className="d-flex justify-content-between align-items-center border w-100 h-46">
                        <div className="d-flex flex-column gap-3">
                            <span className="text-gray-700 tb-body-default-medium text-truncate">{row1()}</span>
                        </div>
                        <div className="d-flex gap-3 ">
                            <div className="">
                                <Dropdown className="w-100 text-end" drop="start">
                                    <Dropdown.Toggle variant="secondary" className="btn btn-sm">
                                        <MoreHorizontal size={16} color="#454545" />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu align={`end`} className="document-dropdown " data-bs-popper="static">
                                        {isShared || hideActions ? (
                                            <>
                                                <Dropdown.Item onClick={handleViewFileClick}>
                                                    <Edit2 className="" size={16} />{" "}
                                                    <span className="tb-body-default-regular">View File</span>
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={handleViewFileClick}>
                                                    <ReceiveSquare className="" size={16} />{" "}
                                                    <span className="tb-body-default-regular">Download</span>
                                                </Dropdown.Item>
                                            </>
                                        ) : (
                                            <>
                                                <Dropdown.Item onClick={handleUpdate}>
                                                    <Edit2 className="" size={16} />{" "}
                                                    <span className="tb-body-default-regular">
                                                        {isExpiring ? "Renew" : "Update"}
                                                    </span>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <Lock1 className="" size={16} />{" "}
                                                    <span className="tb-body-default-regular">Mark as Private</span>
                                                    <div className="form-check form-switch">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="privateToggle"
                                                        />
                                                    </div>
                                                </Dropdown.Item>
                                                <Dropdown.Item>
                                                    <span className="">
                                                        <Share2 size="16" />
                                                    </span>
                                                    <span className="tb-body-default-regular">Share</span>
                                                </Dropdown.Item>
                                                {fileType.toLowerCase() !== "estimate" && !isExpiring && (
                                                    <Dropdown.Item onClick={handleViewFileClick} target="_blank">
                                                        <DocumentDownload className="" size={16} />{" "}
                                                        <span className="tb-body-default-regular">Download</span>
                                                    </Dropdown.Item>
                                                )}

                                                {!isViewOnly && (
                                                    <>
                                                        <Dropdown.Item onClick={onAddtoFavorites} target="_blank">
                                                            <Star1 className="" size={16} />{" "}
                                                            <span className="tb-body-default-regular">
                                                                Add to Favorites
                                                            </span>
                                                        </Dropdown.Item>

                                                        <Dropdown.Item
                                                            className="text-danger"
                                                            onClick={() => onDelete && onDelete(document || file)}
                                                        >
                                                            <Trash className="" size={16} color="#E70000" />
                                                            <span className="tb-body-default-regular text-danger">
                                                                Delete
                                                            </span>
                                                        </Dropdown.Item>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}
