import { Card, Dropdown, Form } from "react-bootstrap";
import PdfIcon from "./icons/PdfIcon";
import { MoreHorizontal, Share2 } from "react-feather";
import { Archive, ArchiveSlash, ReceiveSquare, Star1, StarSlash, Trash } from "iconsax-react";
import { ProjectDocumentType } from "@/repositories/project-repository";
import { FileAttachment } from "./FileCard";
import { useRouter } from "next/router";
import { Edit2 } from "iconsax-react";
import { User } from "@/repositories/account-repository";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Image from "next/image";
import PrivateLock from "./PrivateLock";
import { StorageFile } from "@/repositories/storage-repository";
import { DEFAULT_PHOTO_PREVIEW } from "@/helpers/constants";

type ContactDocumentProps = {
    file?: StorageFile | null;
    onDelete?: (document: any) => void;
    onUpdate?: (document?: any) => void;
    onArchive?: (document?: any) => void;
    onUnarchive?: (document?: any) => void;
    onRemoveFromFavorites?: () => void;
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
    removeFromFavorites?: (payload: any) => void;
    isViewOnly?: boolean;
    isSelecting?: boolean;
    onSelect?: () => void;
    selectedFiles?: any[];
    showDownloadOption?: boolean;
};

export default function ContactDocument(props: ContactDocumentProps) {
    const { user } = useSelector((state: RootState) => state.account);
    const router = useRouter();
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
        onArchive,
        onUnarchive,
        isSelecting,
        onSelect,
        selectedFiles,
        removeFromFavorites,
        showDownloadOption = true,
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

    function getTitle() {
        if (fileType.toLocaleLowerCase() === "contact-document") return file?.originalFileName;
        if (["estimate"].includes(fileType.toLowerCase())) return file?.originalFileName;
        if (["project-document"].includes(fileType.toLowerCase())) return document?.name ?? file?.originalFileName;
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

        if (addToFavorites) {
            addToFavorites(payload);
        }
    }

    function onRemoveFromFavorites() {
        if (removeFromFavorites) {
            removeFromFavorites(file);
        }
    }

    function handleViewFileClick() {
        onItemClick && onItemClick(file);
    }

    return (
        <>
            {isGallery ? (
                <Card className="overflow-hidden pointer object-fit-cover h-214 border-radius-20 flex-shrink-0">
                    <div onClick={handleViewFileClick}>
                        <Image
                            src={file?.thumbnail ?? DEFAULT_PHOTO_PREVIEW}
                            alt="project gallery"
                            className="object-fit-cover border-radius-20 round-top flex-shrink-0"
                            onClick={() => onItemClick && onItemClick(file)}
                            width={267}
                            height={200}
                        />

                        {isPrivate && (
                            <div className="position-absolute" style={{ top: "15px", left: "15px" }}>
                                <PrivateLock />
                            </div>
                        )}
                    </div>
                    <div className="d-flex justify-content-end position-absolute right-0">
                        {isSelecting ? (
                            <Form.Check
                                id={`checkbox-${file?.id}`}
                                type="checkbox"
                                // label="Select All"
                                className="d-flex gap-12 align-items-center text-gray-600 tb-body-default-medium pointer m-3"
                                onChange={e => {
                                    onSelect && onSelect();
                                    // setSelectAll(e.target.checked);
                                }}
                                checked={selectedFiles?.includes(file)}
                                name={file?.id}
                            />
                        ) : (
                            <Dropdown className="w-44 h-44 text-end m-3 bg-transparent">
                                <Dropdown.Toggle variant="default" className="btn bg-transparent border-0">
                                    <MoreHorizontal size={24} color="#454545" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align={`end`}>
                                    {isShared || hideActions ? (
                                        <>
                                            <Dropdown.Item href={file?.downloadUrl} target="_blank">
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
                                            <Dropdown.Item href={file?.downloadUrl}>
                                                <ReceiveSquare className="" size={16} />{" "}
                                                <span className="tb-body-default-regular">Download</span>
                                            </Dropdown.Item>

                                            {!isViewOnly && (
                                                <>
                                                    {addToFavorites && (
                                                        <Dropdown.Item onClick={onAddtoFavorites}>
                                                            <Star1 className="" size={16} />
                                                            <span className="tb-body-default-regular">
                                                                Add to Favorites
                                                            </span>
                                                        </Dropdown.Item>
                                                    )}
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
                        )}
                    </div>
                </Card>
            ) : (
                <Card className="w-100 h-100 cursor-pointer">
                    <div onClick={handleViewFileClick} className="p-12">
                        {isPrivate && (
                            <div className="position-absolute" style={{ top: "15px", right: "15px" }}>
                                <PrivateLock />
                            </div>
                        )}
                        {file?.thumbnail ? (
                            <div
                                onClick={handleViewFileClick}
                                className="bg-gray-50m overflow-hidden pt-12m px-12m pb-0 h-128 object-fit-cover flex-shrink-0 round-topm position-relative"
                            >
                                <div className="h-100 overflow-hidden object-fit-cover border flex-shrink-0 border-0">
                                    <Card.Img
                                        variant="top"
                                        src={file?.thumbnail}
                                        className="object-fit-cover border-radius-12 h-100 flex-shrink-0 border-bottomm border-gray-100 bg-gray-50"
                                    />
                                </div>
                            </div>
                        ) : (
                            <Card.Header
                                onClick={handleViewFileClick}
                                className="bg-gray-50 h-128 object-fit-cover flex-shrink-0 pt-12 pb-0 pe-12 ps-12 border-radius-12 position-relative"
                            >
                                <div className="d-flex bg-gray-50m justify-content-center flex-shrink-0 object-fit-cover align-items-center h-100">
                                    <PdfIcon width={36} height={41} />
                                </div>
                            </Card.Header>
                        )}
                    </div>

                    <div className="pe-0 pt-0 ps-0 pb-12 d-flex align-items-center justify-content-between ">
                        <div className=" px-12 pt-3 d-flex justify-content-between w-100 align-items-center">
                            <div className="h-46 align-items-center w-100 d-flex justify-content-between gap-3">
                                <div className="d-flex flex-column gap-3 truncate-1" title={getTitle()}>
                                    <span className="text-gray-700 tb-body-default-medium truncate-1">
                                        {getTitle()}
                                    </span>
                                </div>

                                <div>
                                    <Dropdown className="w-100 text-end " drop="start">
                                        <Dropdown.Toggle className="btn border-0 w-44 d-flex align-items-center justify-content-center bg-gray-50 border-radius-40">
                                            <MoreHorizontal size={24} color="#454545" />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu
                                            align={`end`}
                                            className="document-dropdown "
                                            data-bs-popper="static"
                                        >
                                            <>
                                                <Dropdown.Item onClick={handleUpdate}>
                                                    <Edit2 className="" size={16} />{" "}
                                                    <span className="tb-body-default-regular">
                                                        {isExpiring ? "Renew" : "Update"}
                                                    </span>
                                                </Dropdown.Item>
                                                <Dropdown.Item href={file?.downloadUrl}>
                                                    <ReceiveSquare className="" size={16} />{" "}
                                                    <span className="tb-body-default-regular">Download</span>
                                                </Dropdown.Item>

                                                {!isViewOnly && (
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
                                                                <span className="tb-body-default-regular">
                                                                    Unarchive
                                                                </span>
                                                            </Dropdown.Item>
                                                        )}

                                                        {!file?.inFavorite && (
                                                            <Dropdown.Item onClick={onAddtoFavorites}>
                                                                <Star1 size={16} />{" "}
                                                                <span className="tb-body-default-regular">
                                                                    Add to Favorites
                                                                </span>
                                                            </Dropdown.Item>
                                                        )}

                                                        {file?.inFavorite && (
                                                            <Dropdown.Item
                                                                onClick={() => {
                                                                    onRemoveFromFavorites?.();
                                                                }}
                                                            >
                                                                <StarSlash size={16} />{" "}
                                                                <span className="tb-body-default-regular">
                                                                    Remove from Favorites
                                                                </span>
                                                            </Dropdown.Item>
                                                        )}

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
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </>
    );
}
