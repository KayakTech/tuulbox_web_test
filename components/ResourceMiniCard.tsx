import { Button, Row, Col, Card, Modal, Dropdown, Overlay, Tooltip } from "react-bootstrap";
import { AlertTriangle, MoreHorizontal, ExternalLink, Trash2 } from "react-feather";
import useResource from "@/hooks/useResources";
import { Resource } from "@/repositories/resource-repository";
import { DocumentCopy, Edit2, ExportSquare, Star1, StarSlash } from "iconsax-react";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

export const url = "";

interface ResourceCardState {
    resource: Resource;
    onDelete?: () => void;
    onAddToFavorites?: (value: Record<string, string>) => void;
    onCopy?: () => void;
    isViewOnly?: boolean;
    onRemoveFromRecent?: () => void;
}

export default function ResourceMiniCard({
    resource,
    onAddToFavorites,
    onCopy,
    onRemoveFromRecent,
}: ResourceCardState) {
    const { metaPreview, handleCopy, copyButtonText, getResource } = useResource();

    const { user } = useSelector((state: RootState) => state.account);
    function handleClick() {
        window.open(resource.url, "_blank", "noopener,noreferrer");
    }

    return (
        <Card className="d-flex gap-12 flex-row align-items-center w-100 p-12 border border-gray-100 rounded-3 shadow-sm">
            <div className="d-flex w-100 align-items-center">
                <div className="d-flex gap-12 align-items-center w-100 h-46" onClick={handleClick}>
                    <Card.Header className="p-0 border-0 w-40 h-40 bg-gray-50 rounded-3 flex-shrink-0 object-fit-cover bg-transparent">
                        <div className="overflow-hidden pointer object-fit-cover rounded-3 flex-shrink-0">
                            <Card.Img
                                className="imagem round-topm flex-shrink-0 object-fit-cover border-radius-bottom-0 h-40 w-40"
                                src={resource?.thumbnail ?? DEFAULT_RESOURCE_PREVIEW}
                            />
                        </div>
                    </Card.Header>
                    <div className="">
                        <h6
                            className="text-gray-700 m-0 tb-body-default-medium truncate-1"
                            title={resource.description}
                        >
                            {resource.description}
                        </h6>
                        <small className="text-gray-400 m-0 tb-body-small-regular truncate-1" title={resource.url}>
                            {resource.url}
                        </small>
                    </div>
                </div>
                <div className="gap-3 d-flex">
                    <Dropdown className=" w-100 text-end position-upm" drop="down">
                        <Dropdown.Toggle
                            className="d-flex align-items-center justify-content-center border-0  bg-gray-50 h-24 w-24 p-0"
                            id="dropdown-basic"
                        >
                            <MoreHorizontal size={16} color="#454545" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align={`end`}>
                            <Dropdown.Item href={`/links/edit/${resource.id}`}>
                                <Edit2 size="16" color="#888888" />{" "}
                                <span className="tb-body-default-regular">Update</span>
                            </Dropdown.Item>

                            <>
                                <Dropdown.Item
                                    onClick={() => {
                                        handleCopy(resource.url);
                                        onCopy && onCopy();
                                    }}
                                >
                                    <DocumentCopy size={20} className="" /> {copyButtonText}
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => {
                                        onAddToFavorites?.({
                                            objectType: "resource",
                                            objectId: resource.id,
                                            createdBy: `${user?.id}`,
                                            company: `${user?.companyId}`,
                                        });
                                    }}
                                >
                                    <Star1 size="16" color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                </Dropdown.Item>

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
                            </>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </Card>
    );
}
