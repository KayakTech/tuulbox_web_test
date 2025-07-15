import { Edit2, Gallery, Link1, Lock, Lock1, ReceiveSquare, Star1, Trash } from "iconsax-react";
import { downloadFile, formatDatetime } from "@/helpers";
import { Dropdown, Form } from "react-bootstrap";
import { MoreHorizontal } from "react-feather";
import { ProjectDocumentType } from "@/repositories/project-repository";
import Image from "next/image";
import useFavorites from "@/hooks/favorites";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Iconly } from "react-iconly";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import PrivateLock from "./PrivateLock";
import { Tag } from "@/repositories/resource-repository";
import BadgeTag from "./BadgeTag";
import { ShareIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

type OverviewFileCardProps = {
    photo: ProjectDocumentType;
    handleUpdate: () => void;
    addToFavorites?: (payload: any) => void;
    onDelete: () => void;
    onViewImage?: (document: ProjectDocumentType) => void;
    activeMenu?: ProjectDocumentMenuItem;
    isShared?: boolean;
    hideActions?: boolean;
    isPrivate?: boolean;
    isSelecting?: boolean;
    onSelect?: () => void;
    selectAll?: boolean;
    // isSelected?: boolean;
    selectedFiles?: any[];
};

export default function ProjectGalleryListItem(props: OverviewFileCardProps) {
    const { user } = useSelector((state: RootState) => state.account);
    const checkboxRef = useRef<HTMLInputElement>(null);

    const {
        photo,
        handleUpdate,
        onDelete,
        onViewImage,
        activeMenu,
        isShared,
        hideActions,
        isPrivate,
        addToFavorites,
        isSelecting,
        onSelect,
        selectAll,
        // isSelected,
        selectedFiles,
    } = props;

    function onAddtoFavorites() {
        const payload = {
            objectId: photo?.file?.id,
            createdBy: user?.id,
            company: user?.companyId,
            objectType: "storage",
        } as any;

        addToFavorites && addToFavorites(payload);
    }

    function fileUrl() {
        return photo.file?.file || "javascript:void(0)";
    }

    return (
        <div className="row">
            <div className="col-10">
                <div className="row">
                    <div className="col-md-7 d-flex align-items-center">
                        <div
                            className={`h-48 w-48 border-radius-6 flex-shrink-0 object-fit-cover border border-gray-100 pointer${
                                activeMenu?.name?.toLowerCase() != "gallery" ? "bg-gray-50" : ""
                            } d-flex justify-content-center align-items-center object-fit-cover`}
                            onClick={() => (onViewImage ? onViewImage(photo) : null)}
                        >
                            {isPrivate && (
                                <div className="position-absolute">
                                    <Lock size={12} color="#B0B0B0" />
                                </div>
                            )}
                            {photo?.file?.thumbnail && activeMenu?.name?.toLowerCase() === "gallery" ? (
                                <Image
                                    src={photo.file?.thumbnail ?? "#"}
                                    height={48}
                                    width={48}
                                    alt=""
                                    className="border-radius-6 flex-shrink-0 object-fit-cover"
                                />
                            ) : activeMenu ? (
                                <activeMenu.icon
                                    color="#B0B0B0"
                                    size={activeMenu.name.toLowerCase() === "gallery" ? 48 : 48}
                                />
                            ) : null}
                        </div>

                        <div className="ms-3 d-flex">
                            <div>
                                <p className="m-0 truncate-1 text-gray-600 tb-body-default-medium">{photo.name}</p>
                                {photo?.file?.tags && photo?.file?.tags?.length > 0 && (
                                    <div className="mt-2 d-flex flex-wrap gap-2 my-2">
                                        {photo?.file?.tags?.map((tag: Tag, index: number) => (
                                            <BadgeTag tag={tag.name} key={index + tag.id} />
                                        ))}
                                    </div>
                                )}
                                <p className="text-gray-600 truncate-1 my-1 tb-body-small-regular" title={``}>
                                    Uploaded: {formatDatetime(photo.createdAt)}
                                </p>
                                {isPrivate && (
                                    <p className="d-flex align-items-center gap-1">
                                        <small className="text-gray-300"> Private</small>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-2">
                <div className="d-flex flex-row flex-nowrap ms-auto justify-content-end">
                    {isSelecting || selectAll ? (
                        <Form.Check
                            ref={checkboxRef}
                            id={photo.id}
                            type="checkbox"
                            className="d-flex gap-12 align-items-center text-gray-600 tb-body-default-medium pointer"
                            onChange={e => {
                                onSelect && onSelect();
                            }}
                            checked={selectedFiles?.includes(photo.file)}
                        />
                    ) : (
                        <Dropdown className="w-100 text-end">
                            <Dropdown.Toggle as={"button"} variant="default" className="btn btn-default">
                                <MoreHorizontal size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                {isShared || hideActions ? (
                                    <>
                                        <Dropdown.Item href={fileUrl()} target={"_blank"}>
                                            <Edit2 className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">View File</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => (onViewImage ? onViewImage(photo) : null)}>
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
                                            <ShareIcon width={16} color="#888888" />
                                            <span className="tb-body-default-regular">Share</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={() => (onViewImage ? onViewImage(photo) : null)}
                                            target="_blank"
                                        >
                                            <ReceiveSquare className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">Download</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={onAddtoFavorites}>
                                            <Star1 className="" size={16} />
                                            <span className="tb-body-default-regular">Add to Favorites</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item className="text-danger" onClick={onDelete}>
                                            <Trash className="" size={16} color="#E70000" />
                                            <span className="tb-body-default-regular text-danger">Delete</span>
                                        </Dropdown.Item>
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    )}
                </div>
            </div>
        </div>
    );
}
