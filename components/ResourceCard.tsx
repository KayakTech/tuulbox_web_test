import { Button, Row, Col, Card, Modal, Dropdown, Overlay, Tooltip } from "react-bootstrap";
import { Copy } from "react-feather";
import { Iconly } from "react-iconly";
import Link from "next/link";
import { copyText } from "@/helpers";
import { useEffect, useState } from "react";
import { AlertTriangle, MoreHorizontal, ExternalLink, Trash2 } from "react-feather";
import DI from "@/di-container";
import ButtonLoader from "./ButtonLoader";
import DeleteModal from "./DeleteModal";
import useResource from "@/hooks/useResources";
import { Resource } from "@/repositories/resource-repository";
import { DocumentCopy, Edit2, ExportSquare, Star1, Trash } from "iconsax-react";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";

export const url = "";

interface ResourceCardState {
    resource: Resource;
    onDelete?: () => void;
    onAddToFavorites?: () => void;
    onCopy?: () => void;
    isViewOnly?: boolean;
}

export default function ResourceCard({ resource, onDelete, onAddToFavorites, onCopy, isViewOnly }: ResourceCardState) {
    const { metaPreview, handleCopy, copyButtonText, getResource, getResourcePreview } = useResource();
    function handleClick() {
        window.open(resource.url, "_blank", "noopener,noreferrer");
    }
    return (
        <Card className=" h-100m d-flex gap-12 w-100">
            <Card.Header
                onClick={handleClick}
                className="h-128 object-fit-cover border-0 round-top flex-shrink-0  pt-12 pe-12 ps-12 pb-0  position-relative"
            >
                <div className="">
                    <Card.Img
                        variant="top"
                        src={resource?.thumbnail ?? DEFAULT_RESOURCE_PREVIEW}
                        // style={{ height: "126px" }}
                        className="object-fit-cover border-0 border-radius-12 h-128 flex-shrink-0 p-0 bg-gray-50"
                    />
                </div>
            </Card.Header>
            <Card.Body className=" pb-12 pt-0 ps-0 pe-0">
                <div className="d-flex justify-content-between align-items-center pt-3 ps-12 pe-12">
                    <div className="">
                        <h6
                            className="text-gray-700 mb-1m m-0 tb-body-default-medium truncate-1 p-0"
                            title={resource.description}
                        >
                            {resource.description}
                        </h6>
                    </div>
                    <div className="gap-3 d-flex">
                        <Dropdown className="text-end" drop="start">
                            <Dropdown.Toggle
                                className="btn-squarem bg-gray-50 d-flex w-44 h-44 border-0 border-radius-40 align-items-center"
                                id="dropdown-basic"
                            >
                                <MoreHorizontal size={16} color="#454545" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="resource-card dropdown-menu" align={`end`}>
                                <Dropdown.Item href={`/links/edit/${resource.id}`}>
                                    <Edit2 size="16" color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>

                                {!isViewOnly && (
                                    <>
                                        <Dropdown.Item
                                            onClick={() => {
                                                handleCopy(resource.url);
                                                onCopy && onCopy();
                                            }}
                                        >
                                            <DocumentCopy size={16} className="" /> {copyButtonText}
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={onAddToFavorites}>
                                            <Star1 size="16" color="#888888" />{" "}
                                            <span className="tb-body-default-regular">Add to Favorites</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item className="text-danger" onClick={onDelete}>
                                            <Trash size={16} className="me-2m text-danger" />
                                            <span className="tb-body-default-regular text-danger">Delete</span>
                                        </Dropdown.Item>
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}
