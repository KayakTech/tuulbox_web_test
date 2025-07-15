import { Card, Dropdown, Form } from "react-bootstrap";
import PdfIcon from "./icons/PdfIcon";
import { MoreHorizontal } from "react-feather";
import { Archive, ArchiveSlash, ReceiveSquare, Star1, StarSlash, Trash } from "iconsax-react";
import { ProjectDocumentType } from "@/repositories/project-repository";

import { useRouter } from "next/router";
import { Edit2 } from "iconsax-react";

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
    onArchive?: (document?: any) => void;
    onUnarchive?: (document?: any) => void;
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
    isSelecting?: boolean;
    onSelect?: () => void;
    onRemoveFromRecent?: () => void;
    selectedFiles?: any[];
    showDownloadOption?: boolean;
    onRemoveFromFavorites?: () => void;
};

export default function ContactDocument(props: ContactDocumentProps) {
    const { user } = useSelector((state: RootState) => state.account);
    const router = useRouter();
    const {
        file,
        onDelete,
        onUpdate,
        document,
        fileType,
        isExpiring,
        isGallery,
        onItemClick,
        isShared,
        hideActions,
        isPrivate,
        addToFavorites,
        onArchive,
        onUnarchive,
        isSelecting,
        onSelect,
        selectedFiles,
        onRemoveFromRecent,
        onRemoveFromFavorites,
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
        if (["estimate"].includes(fileType.toLowerCase())) return file?.originalFileName;
        if (["project-document"].includes(fileType.toLowerCase())) return document?.name ?? file?.name;
        if (["storage"].includes(fileType.toLowerCase())) return file?.originalFileName;
        return "";
    }

    function onAddtoFavorites() {
        let payload = {
            objectId: file?.id,
            createdBy: user?.id,
            company: user?.companyId,
        } as any;

        let objectType = "";
        if (["storage"].includes(fileType.toLowerCase())) {
            objectType = "storage";
        }
        if (["project-document", "contact-document"].includes(fileType.toLowerCase())) {
            objectType = "storage";
        }
        payload = {
            ...payload,
            objectType,
        };

        addToFavorites?.(payload);
    }

    function handleViewFileClick() {
        onItemClick && onItemClick(file);
    }

    function createFavoriteDropdown() {
        return (
            <>
                {!file?.inFavorite && (
                    <Dropdown.Item onClick={onAddtoFavorites}>
                        <Star1 className="" size={16} />{" "}
                        <span className="tb-body-default-regular">Add to Favorites</span>
                    </Dropdown.Item>
                )}

                {file?.inFavorite && (
                    <Dropdown.Item
                        onClick={() => {
                            onRemoveFromFavorites?.();
                        }}
                    >
                        <StarSlash size={16} color="#888888" />{" "}
                        <span className="tb-body-default-regular">Remove from Favorites</span>
                    </Dropdown.Item>
                )}
            </>
        );
    }

    return (
        <>
            {isGallery ? (
                <Card className="w-100 pt-12 pb-12 gap-12 border-radius-12 ps-12 pe-12 h-100 d-flex align-items-center flex-row cursor-pointer">
                    <div className=" w-75 gap-12 d-flex align-items-center">
                        <div className="">
                            <div className="h-40 w-40 border-radius-12 object-fit-cover flex-shrink-0 bg-gray-50">
                                <Image
                                    src={file?.thumbnail ?? DEFAULT_PHOTO_PREVIEW}
                                    alt="project gallery"
                                    className="object-fit-cover border-radius-12m rounded-3 borderm h-40 w-40 flex-shrink-0 border-bottomm border-gray-100m bg-gray-50"
                                    onClick={() => onItemClick && onItemClick(file)}
                                    width={40}
                                    height={40}
                                />
                            </div>

                            {isPrivate && (
                                <div className="position-absolute" style={{ top: "15px", left: "15px" }}>
                                    <PrivateLock />
                                </div>
                            )}
                        </div>

                        <div className="text-gray-700 tb-body-default-medium truncate-1">{file?.originalFileName}</div>
                    </div>

                    <div className="d-flex justify-content-end position-absolute right-0">
                        {isSelecting ? (
                            <Form.Check
                                id={`checkbox-${file.id}`}
                                type="checkbox"
                                // label="Select All"
                                className="d-flex gap-12 align-items-center text-gray-600 tb-body-default-medium pointer m-3"
                                onChange={e => {
                                    onSelect && onSelect();
                                    // setSelectAll(e.target.checked);
                                }}
                                checked={selectedFiles?.includes(file)}
                                name={file.id}
                            />
                        ) : (
                            <Dropdown className="w-100 me-3 text-end " onClick={e => e.stopPropagation()}>
                                <Dropdown.Toggle
                                    variant="default"
                                    className="h-24 w-24 p-0 border-0 d-flex align-items-center justify-content-center bg-gray-50 border-radius-40"
                                >
                                    <MoreHorizontal size={16} color="#454545" />
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

                                            <>
                                                {createFavoriteDropdown()}

                                                {onRemoveFromRecent && (
                                                    <Dropdown.Item
                                                        onClick={() => {
                                                            onRemoveFromRecent?.();
                                                        }}
                                                    >
                                                        <StarSlash size={16} color="#888888" />{" "}
                                                        <span className="tb-body-default-regular">
                                                            Remove from Recent
                                                        </span>
                                                    </Dropdown.Item>
                                                )}
                                            </>
                                        </>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </div>
                </Card>
            ) : (
                <Card className="w-100 pt-12 pb-12 gap-12 border-radius-12 ps-12 pe-12 h-100 d-flex align-items-center flex-row cursor-pointer">
                    <div className="p-3m w-100 h-46 d-flex align-items-center gap-12" onClick={handleViewFileClick}>
                        <div className="">
                            {isPrivate && (
                                <div className="position-absolute" style={{ top: "15px", right: "15px" }}>
                                    <PrivateLock />
                                </div>
                            )}
                            {file?.thumbnail ? (
                                <div className="h-40 w-40 border-radius-12 object-fit-cover flex-shrink-0 bg-gray-50">
                                    <Card.Img
                                        variant="top"
                                        src={file?.thumbnail ?? ""}
                                        className="object-fit-cover border-radius-12m rounded-3 borderm h-40 w-40 flex-shrink-0 border-bottomm border-gray-100m bg-gray-50"
                                    />
                                </div>
                            ) : (
                                <Card.Header className="bg-gray-50m border-0 w-40 h-40 object-fit-cover flex-shrink-0 p-0 border-radius-12 position-relative">
                                    <div className="d-flex bg-gray-50 justify-content-center flex-shrink-0 object-fit-cover align-items-center w-40 h-40">
                                        <PdfIcon width={40} height={40} />
                                    </div>
                                </Card.Header>
                            )}
                        </div>
                        <div className="d-flex flex-column gap-3">
                            <span className="text-gray-700 tb-body-default-medium truncate-1">{row1()}</span>
                        </div>
                    </div>
                    <div className="">
                        <Dropdown className="w-100 text-end " drop="end">
                            <Dropdown.Toggle
                                id="dropdown-basic"
                                className="h-24 w-24 p-0 border-0 d-flex align-items-center justify-content-center bg-gray-50 border-radius-40"
                            >
                                <MoreHorizontal size={16} color="#454545" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`} className="document-dropdownm " data-bs-popper="static">
                                {isShared || hideActions ? (
                                    <>
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

                                        <>
                                            {onArchive && (
                                                <Dropdown.Item onClick={() => onArchive && onArchive()}>
                                                    <Archive className="" size={16} />{" "}
                                                    <span className="tb-body-default-regular">Archive</span>
                                                </Dropdown.Item>
                                            )}
                                            {onUnarchive && (
                                                <Dropdown.Item onClick={() => onUnarchive && onUnarchive()}>
                                                    <ArchiveSlash className="" size={16} />{" "}
                                                    <span className="tb-body-default-regular">Unarchive</span>
                                                </Dropdown.Item>
                                            )}

                                            {createFavoriteDropdown()}
                                        </>
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Card>
            )}
        </>
    );
}
