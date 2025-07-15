import EmptyStateInnerPage from "./EmptyStateInnerPage";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import { useEffect, useReducer, useRef, useState } from "react";
import { Card, Col, Container, Dropdown, Row, Spinner } from "react-bootstrap";
import { Project, ProjectDocumentType } from "@/repositories/project-repository";
import { Gallery, Lock, MessageCircle, Messages2 } from "iconsax-react";
import { Edit2, GalleryAdd, ReceiveSquare, SearchNormal1, Star1, StarSlash, Trash } from "iconsax-react";
import Header from "./Header";
import { MoreHorizontal, Plus } from "react-feather";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import InfiniteScroll from "react-infinite-scroll-component";
import { formatDatetime, isMobileDevice, isTabletDevice } from "@/helpers";
import DI from "@/di-container";
import { ApiGetResponse } from "@/types";
import PrivateLock from "./PrivateLock";
import PdfIcon from "./icons/PdfIcon";
import BadgeTag from "./BadgeTag";
import { Tag } from "@/repositories/resource-repository";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";
import EngineerAndLaptop from "./icons/EngineerAndLaptop";
import useProjectDocuments from "@/hooks/useProjectDocument";
import { useDispatch } from "react-redux";
import { updateProjectDocument, deleteProjectDocument } from "@/store/project-document-reducer";

type ProjectDocumentListingState = {
    activeMenu: ProjectDocumentMenuItem;
    projectId: string;
    isShared?: boolean;
    sharedDocuments?: ProjectDocumentType[];
    onAddDocument: () => void;
    onStartChat: () => void;
    onUpdateDocument: (document: ProjectDocumentType) => void;
    onShowAddButton: (value: boolean) => void;
    project: Project;
};

export default function ProjectDocumentListing(props: ProjectDocumentListingState) {
    const { activeMenu, onAddDocument, onUpdateDocument, onStartChat, projectId, isShared, project } = props;
    const { user } = useSelector((state: RootState) => state.account);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { showToast } = useToast();
    const reduxDispatch = useDispatch();

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedDocument, setSelectedDocument] = useState<ProjectDocumentType | null>(null);
    const [isSelectedDocumentLoading, setIsSelectedDocumentLoading] = useState<boolean>(false);

    const {
        documents: projectDocuments,
        isLoading: isLoadingDocuments,
        isInitialLoading,
        isSilentlyFetching,
        hasMore: hasMoreDocuments,
        loadMoreDocuments,
        fetchProjectDocuments,
    } = useProjectDocuments(projectId, activeMenu.category, searchTerm);

    function downloadFile(projectDocument: ProjectDocumentType) {
        const link = document.createElement("a");
        link.href = projectDocument.file?.downloadUrl ?? "";
        link.download = projectDocument.file?.originalFileName ?? "";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function viewDocumentFile(projectDocument: ProjectDocumentType) {
        window.open(projectDocument.file?.file, "_blank");
    }

    async function deleteDocument(projectDocument: ProjectDocumentType) {
        try {
            setIsSelectedDocumentLoading(true);
            await DI.projectService.deleteProjectDocument(project.id ?? "", projectDocument.id);
            showToast({
                heading: "Success",
                message: `${projectDocument.name} has been deleted.`,
                variant: "success",
            });

            reduxDispatch(
                deleteProjectDocument({
                    category: activeMenu.category,
                    //@ts-ignore
                    documentId: projectDocument.id,
                }),
            );
        } catch (error) {
            showToast({
                heading: "Error",
                message: "Failed to delete document.",
                variant: "danger",
            });
        } finally {
            setSelectedDocument(null);
            setIsSelectedDocumentLoading(false);
        }
    }

    async function toggleFavorite(projectDocument: ProjectDocumentType) {
        if (!projectDocument.file?.id) {
            showToast({
                heading: "Error",
                message: "The document has no file, so it cannot be added to favorites.",
                variant: "danger",
            });
            return;
        }
        try {
            setIsSelectedDocumentLoading(true);

            const isCreatingFavorite = !projectDocument.file?.inFavorite;

            if (isCreatingFavorite) {
                await DI.favoritesService.addToFavorites({
                    objectId: projectDocument.file?.id,
                    createdBy: user?.id,
                    company: project.createdBy?.companyId,
                    objectType: "storage",
                });
            } else {
                await DI.favoritesService.deleteFavorite(projectDocument.file?.favoriteId!);
            }

            // get the updated document from backend and update Redux store
            const updatedProjectDocument = await DI.projectService.getProjectDocument(project.id!, projectDocument.id);
            reduxDispatch(
                updateProjectDocument({
                    category: activeMenu.category,
                    document: updatedProjectDocument,
                }),
            );

            showToast({
                heading: "Success",
                message: `${isCreatingFavorite ? "Added to favorites" : "Removed from favorites"}`,
                variant: "success",
            });
        } catch {
            showToast({
                heading: "Error",
                message: "Failed to add to favorites.",
                variant: "danger",
            });
        } finally {
            setIsSelectedDocumentLoading(false);
        }
    }

    // Handle search adding debouncing
    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const handleSearch = (searchValue: string) => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // set a new timeout for debounced search
        searchTimeoutRef.current = setTimeout(() => {
            setSearchTerm(searchValue);
        }, 300); // 300ms for debounce
    };

    const handleClearSearch = () => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        setSearchTerm("");
    };

    // cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // reset selected document when category changes
    useEffect(() => {
        setSelectedDocument(null);
        setIsSelectedDocumentLoading(false);
    }, [activeMenu.category]);

    if (isInitialLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100">
                <Spinner />
            </div>
        );
    }

    // empty state with search
    if (searchTerm && !projectDocuments.length) {
        return (
            <Container className="border-gray-100 py-4 padding-0 " fluid>
                <Header
                    buttonText={!(isShared || project.isInvited) ? `Add ${activeMenu.singularName}` : undefined}
                    onButtonClick={onAddDocument}
                    listOrGridKey="projectDocument"
                    searchPlaceholder="Search documents"
                    onSearch={handleSearch}
                    onClearSearch={handleClearSearch}
                />
                <EmptyStateInnerPage
                    icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                    headerText={`No Results Found`}
                    descriptionText={`"${searchTerm}" did not match any data. Please try again.`}
                />
            </Container>
        );
    }

    // empty state without search
    if (!projectDocuments.length && !searchTerm) {
        return (
            <EmptyStateInnerPage
                icon={
                    activeMenu.singularName.toLowerCase() === "chats" ? (
                        // Use your preferred chat icon here
                        <Messages2 size="32" color="#888888" variant="Outline" />
                    ) : activeMenu.singularName.toLowerCase() === "photos" ? (
                        <GalleryAdd size={60} color="#888888" />
                    ) : [
                          "Contract",
                          "Change Order",
                          "Estimate",
                          "Permits",
                          "Plans & Elevation",
                          "Specification",
                          "Additional Document",
                      ].includes(activeMenu.singularName) ? (
                        <EngineerAndLaptop />
                    ) : (
                        <EngineerAndLaptop />
                    )
                }
                buttonIcon={<Plus size={24} />}
                headerText={activeMenu.singularName.toLowerCase() === "chats" ? "No Chats" : "No Document Uploaded"}
                descriptionText={
                    activeMenu.singularName.toLowerCase() === "chats"
                        ? "Chats added will be managed here"
                        : "Documents added can be managed here"
                }
                buttonText={
                    !(isShared || project.isInvited)
                        ? activeMenu.singularName.toLowerCase() === "chats"
                            ? "New Chat"
                            : ` ${activeMenu.singularName}`
                        : undefined
                }
                onButtonClick={() => {
                    if (activeMenu.singularName.toLowerCase() === "chats") {
                        onStartChat();
                    } else {
                        onAddDocument();
                    }
                }}
                className="my-auto"
            />
        );
    }

    return (
        <>
            <Container className="border-gray-100 py-4 vh-100" fluid>
                <Header
                    className="px-0"
                    buttonText={!(isShared || project.isInvited) ? `Add ${activeMenu.singularName}` : undefined}
                    onButtonClick={onAddDocument}
                    listOrGridKey="projectDocument"
                    searchPlaceholder="Search documents"
                    onSearch={handleSearch}
                    onClearSearch={handleClearSearch}
                />
                <InfiniteScroll
                    dataLength={projectDocuments.length}
                    next={loadMoreDocuments}
                    height={0.9 * window.screen.height}
                    hasMore={hasMoreDocuments}
                    loader={
                        <div className="d-flex align-items-center justify-content-center vh-100">
                            <Spinner />
                        </div>
                    }
                >
                    {listOrGrid.projectDocument === "grid" || isMobileDevice() || isTabletDevice() ? (
                        <Row className="g-4 mt-1 mb-4">
                            {projectDocuments.map((doc: ProjectDocumentType, index: number) => (
                                <Col
                                    md={3}
                                    sm={4}
                                    xl={4}
                                    xxl={4}
                                    key={`${index}`}
                                    className="gap-5 d-flex justify-content-center position-relative"
                                    onClick={() => {
                                        setSelectedDocument(doc);
                                    }}
                                >
                                    {selectedDocument?.id === doc.id && isSelectedDocumentLoading && (
                                        <div className="position-absolute d-flex align-items-center justify-content-center w-100 h-100 card-loader">
                                            <Spinner />
                                        </div>
                                    )}
                                    <ProjectDocumentCard
                                        activeMenu={activeMenu}
                                        project={project}
                                        projectDocument={doc}
                                        onUpdate={onUpdateDocument}
                                        onViewImage={viewDocumentFile}
                                        onAddtoFavorites={toggleFavorite}
                                        onRemoveFromFavorites={toggleFavorite}
                                        onDownload={downloadFile}
                                        onDelete={deleteDocument}
                                    />
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <ul className="list-unstyled d-flex flex-column">
                            {projectDocuments.map((doc: ProjectDocumentType, x: number) => (
                                <li
                                    key={doc.id}
                                    className="position-relative"
                                    onClick={() => {
                                        setSelectedDocument(doc);
                                    }}
                                >
                                    {selectedDocument?.id === doc.id && isSelectedDocumentLoading && (
                                        <div className="position-absolute d-flex align-items-center justify-content-center w-100 h-100 card-loader">
                                            <Spinner />
                                        </div>
                                    )}
                                    <ProjectDocumentListTile
                                        activeMenu={activeMenu}
                                        project={project}
                                        projectDocument={doc}
                                        onUpdate={onUpdateDocument}
                                        onViewImage={viewDocumentFile}
                                        onAddtoFavorites={toggleFavorite}
                                        onRemoveFromFavorites={toggleFavorite}
                                        onDownload={downloadFile}
                                        onDelete={deleteDocument}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </InfiniteScroll>
            </Container>
        </>
    );
}

type ProjectDocumentActionDropdownProps = {
    project: Project;
    projectDocument: ProjectDocumentType;
    onDelete: (projectDocument: ProjectDocumentType) => void;
    onRemoveFromFavorites: (projectDocument: ProjectDocumentType) => void;
    onAddtoFavorites: (projectDocument: ProjectDocumentType) => void;
    onUpdate: (projectDocument: ProjectDocumentType) => void;
    onDownload: (projectDocument: ProjectDocumentType) => void;
    onViewImage: (projectDocument: ProjectDocumentType) => void;
};

export function ProjectDocumentActionDropdown(props: ProjectDocumentActionDropdownProps) {
    const { project, projectDocument, onDelete, onRemoveFromFavorites, onAddtoFavorites, onUpdate, onDownload } = props;

    const { user } = useSelector((state: RootState) => state.account);
    const isViewOnly = user?.id !== project.createdBy?.id;

    return (
        <>
            <Dropdown className="w-100 text-end" drop="down">
                <Dropdown.Toggle className="btn border-0 w-44 d-flex align-items-center justify-content-center bg-gray-50 border-radius-40">
                    <MoreHorizontal size={24} color="#454545" />
                </Dropdown.Toggle>
                <Dropdown.Menu align={`end`} className="document-dropdown " data-bs-popper="static">
                    <>
                        {!isViewOnly && (
                            <Dropdown.Item onClick={() => onUpdate(projectDocument)}>
                                <Edit2 className="" size={16} /> <span className="tb-body-default-regular">Update</span>
                            </Dropdown.Item>
                        )}

                        <Dropdown.Item
                            onClick={() => {
                                onDownload(projectDocument);
                            }}
                        >
                            <ReceiveSquare className="" size={16} />{" "}
                            <span className="tb-body-default-regular">Download</span>
                        </Dropdown.Item>

                        {!isViewOnly && (
                            <>
                                {!projectDocument.file?.inFavorite && (
                                    <Dropdown.Item onClick={() => onAddtoFavorites(projectDocument)}>
                                        <Star1 size={16} />{" "}
                                        <span className="tb-body-default-regular">Add to Favorites</span>
                                    </Dropdown.Item>
                                )}

                                {projectDocument.file?.inFavorite && (
                                    <Dropdown.Item
                                        onClick={() => {
                                            onRemoveFromFavorites(projectDocument);
                                        }}
                                    >
                                        <StarSlash size={16} />{" "}
                                        <span className="tb-body-default-regular">Remove from Favorites</span>
                                    </Dropdown.Item>
                                )}

                                <Dropdown.Item className="text-danger" onClick={() => onDelete(projectDocument)}>
                                    <Trash className="" size={16} color="#E70000" />
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </>
                        )}
                    </>
                </Dropdown.Menu>
            </Dropdown>
        </>
    );
}

type ProjectDocumentCardProps = {
    projectDocument: ProjectDocumentType;
    activeMenu: ProjectDocumentMenuItem;
} & ProjectDocumentActionDropdownProps;

export function ProjectDocumentCard(props: ProjectDocumentCardProps) {
    const { projectDocument, activeMenu } = props;
    const isPrivate = props.projectDocument?.visibility === "private";

    function getTitle() {
        return projectDocument?.name || projectDocument?.file?.originalFileName;
    }

    console.log(activeMenu);

    return (
        <Card className="w-100 h-100 cursor-pointer">
            <section className="p-12">
                {isPrivate && (
                    <div className="position-absolute card-loader d-flex justify-content-end w-100 pe-4">
                        <PrivateLock />
                    </div>
                )}
                {projectDocument.file?.thumbnail ? (
                    <div
                        onClick={() => props.onViewImage(projectDocument)}
                        className="overflow-hidden pb-0 h-128 object-fit-cover flex-shrink-0 position-relative"
                    >
                        <div className="h-100 overflow-hidden object-fit-cover border flex-shrink-0 border-0">
                            <Card.Img
                                variant="top"
                                src={projectDocument.file?.thumbnail ?? ""}
                                className="object-fit-cover border-radius-12 h-100 flex-shrink-0 border-gray-100 bg-gray-50"
                            />
                        </div>
                    </div>
                ) : (
                    <Card.Header
                        onClick={() => props.onViewImage(projectDocument)}
                        className="bg-gray-50 h-128 object-fit-cover flex-shrink-0 pt-12 pb-0 pe-12 ps-12 border-radius-12 position-relative"
                    >
                        <div className="d-flex justify-content-center flex-shrink-0 object-fit-cover align-items-center h-100">
                            {activeMenu.name.toLowerCase() === "photos" ? (
                                <Gallery size="32" color="#B0B0B0" variant="Outline" />
                            ) : (
                                <PdfIcon width={36} height={41} />
                            )}
                        </div>
                    </Card.Header>
                )}
            </section>

            <section className="pe-0 pt-0 ps-0 pb-12 d-flex align-items-center justify-content-between ">
                <div className=" px-12 pt-3 d-flex justify-content-between w-100 align-items-center">
                    <div className="h-46 align-items-center w-100 d-flex justify-content-between gap-3">
                        <span className="text-gray-700 tb-body-default-medium truncate-1" title={getTitle()}>
                            {getTitle()}
                        </span>

                        <div>
                            <ProjectDocumentActionDropdown {...props} />
                        </div>
                    </div>
                </div>
            </section>
        </Card>
    );
}

export function ProjectDocumentListTile(props: ProjectDocumentCardProps) {
    const { projectDocument } = props;
    const isPrivate = props.projectDocument?.visibility === "private";

    return (
        <div className="row mt-4">
            <div className="col-10">
                <div className="row">
                    <div className="col-md-7 d-flex align-items-center position-relative ">
                        <div
                            className={`h-48 w-48 border-radius-6 overflow-hidden flex-shrink-0 object-fit-cover border border-gray-100 pointer bg-gray-50 d-flex justify-content-center align-items-center object-fit-cover `}
                            onClick={() => props.onViewImage(projectDocument)}
                        >
                            {projectDocument?.file?.thumbnail && (
                                <img
                                    src={projectDocument.file?.thumbnail ?? "#"}
                                    alt=""
                                    className="border-radius-6 h-48 w-48 flex-shrink-0 object-fit-cover"
                                />
                            )}
                        </div>

                        <div className="ms-3 d-flex">
                            <div>
                                <p className="m-0 truncate-1 text-gray-600 tb-body-default-medium">
                                    {projectDocument.name}
                                </p>
                                {!!projectDocument?.file?.tags?.length && (
                                    <div className="mt-2 d-flex flex-wrap gap-2 my-2">
                                        {projectDocument?.file?.tags?.map((tag: Tag, index: number) => (
                                            <BadgeTag tag={tag.name} key={index + tag.id} />
                                        ))}
                                    </div>
                                )}
                                <p className="text-gray-600 truncate-1 my-1 tb-body-small-regular" title={``}>
                                    Uploaded: {formatDatetime(projectDocument.createdAt)}
                                </p>
                                {isPrivate && (
                                    <p className="d-flex align-items-center gap-1">
                                        <small className="text-gray-300"> Private</small>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="col-md-5 d-flex align-items-center justify-content-end">
                        {isPrivate && (
                            <div className="position-absolute" style={{ top: "50%", left: "15px", zIndex: "1" }}>
                                <Lock size={16} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-2">
                <div className="d-flex flex-row flex-nowrap ms-auto justify-content-end align-items-center">
                    <div>
                        <ProjectDocumentActionDropdown {...props} />
                    </div>
                </div>
            </div>
        </div>
    );
}
