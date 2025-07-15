import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { Project } from "@/repositories/project-repository";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import EngineerAndLaptop from "@/components/icons/EngineerAndLaptop";
import DeleteModal from "@/components/DeleteModal";
import { getUrlQuery, isMobileDevice } from "@/helpers";
import InfiniteScroll from "react-infinite-scroll-component";
import { SearchNormal1 } from "iconsax-react";
import DataTableComponent from "@/components/DataTableComponent";
import ProjectNav from "./ProjectNav";
import DI from "@/di-container";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/router";
import { DocumentText, Edit2, ArchiveAdd, ArchiveMinus, Star1, Trash } from "iconsax-react";
import { Dropdown, Badge } from "react-bootstrap";
import { MoreVertical } from "react-feather";
import Image from "next/image";
import useFavorites from "@/hooks/useFavorites";
import useProjects from "@/hooks/useProjects";
import useSearchForm from "@/hooks/searchForm";

type ProjectsProps = {
    status: string;
};

export default function ProjectsComponent({ status }: ProjectsProps) {
    const router = useRouter();
    const { dataDisplayLayout, listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { user } = useSelector((state: RootState) => state.account);
    const { search, isSearching, setIsSearching } = useSearchForm();
    const { showToast } = useToast();
    const { addToFavorites } = useFavorites();

    const {
        projects,
        isLoading,
        isInitialLoading,
        isSilentlyFetching,
        totalRows,
        hasMore,
        fetchProjects,
        loadMoreProjects,
        page,
        setPage,
    } = useProjects(status);

    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState<boolean>(false);
    const [showArchiveProjectModal, setShowArchiveProjectModal] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [projectToDelete, setProjectToDelete] = useState<string>();
    const [dataToDelete, setDataToDelete] = useState<any>();

    const [showSyncCompleted, setShowSyncCompleted] = useState<boolean>(false);
    const [showSyncError, setShowSyncError] = useState<boolean>(false);
    const [previouslySyncing, setPreviouslySyncing] = useState<boolean>(false);

    const { searchResults } = useSelector((state: RootState) => state.searchResults);

    useEffect(() => {
        if (previouslySyncing && !isSilentlyFetching) {
            setShowSyncCompleted(true);
            const timer = setTimeout(() => {
                setShowSyncCompleted(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
        setPreviouslySyncing(isSilentlyFetching);
    }, [isSilentlyFetching, previouslySyncing]);

    const handleRowClicked = (row: any) => {
        router.push(`/projects/${row.id}`);
    };

    const triggerDeleteModal = (projectId?: string) => {
        setProjectToDelete(projectId);
        setShowDeleteProjectModal(true);
    };

    const triggerArchiveModal = (project: Partial<Project>) => {
        const payload = {
            ...project,
            status: project.status === "active" ? "archived" : "active",
        };
        delete payload?.projectLogo;

        setDataToDelete(payload);
        setShowArchiveProjectModal(true);
    };

    const deleteProject = async () => {
        setIsDeleting(true);
        try {
            await DI.projectService.deleteProject(projectToDelete);
            showToast({ heading: "Success", message: "Project deleted successfully", variant: "success" });
            fetchProjects({ resetData: true });
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to delete project", variant: "danger" });
        } finally {
            setIsDeleting(false);
            setShowDeleteProjectModal(false);
        }
    };

    const archiveProject = async (payload: any) => {
        setIsSubmitting(true);
        try {
            await DI.projectService.updateProject(payload);
            showToast({
                heading: "Success",
                message: `Project ${payload.status === "active" ? "unarchived" : "archived"}.`,
                variant: "success",
            });
            fetchProjects({ resetData: true });
        } catch (error) {
            showToast({ heading: "Error", message: "Operation failed", variant: "danger" });
        } finally {
            setShowArchiveProjectModal(false);
            setIsSubmitting(false);
        }
    };

    const handleLoadMore = () => {
        if (
            isLoading ||
            !hasMore ||
            isShowingSearchResults ||
            isSearching ||
            isSilentlyFetching ||
            projectsToDisplay.length >= totalRows
        ) {
            return;
        }

        const nextPage = page + 1;
        setPage(nextPage);
        loadMoreProjects();
    };

    const onTablePageChange = (page: number) => {
        setPage(page);
    };

    const handleRetrySync = () => {
        setShowSyncError(false);
        fetchProjects({ resetData: true });
    };

    const tableColumns = () => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Project Name</span>,
                cell: (row: Project) => (
                    <span className="text-muted text-wrap text-capitalize d-flex align-items-center flex-shrink-0 rowclick">
                        {row.projectLogo ? (
                            <div className="border-radius-12 border-gray-100 flex-shrink-0 d-flex pch-56 pcw-56 pcobject-fit-cover">
                                <Image
                                    src={`${row.projectLogo}`}
                                    height={56}
                                    width={56}
                                    alt=""
                                    className="border-radius-12 border border-gray-100 object-fit-cover flex-shrink-0"
                                />
                            </div>
                        ) : (
                            <div className="w-56 h-56 border-radius-12 d-flex justify-content-center align-items-center bg-gray-50">
                                <DocumentText color="#B0B0B0" size={30} />
                            </div>
                        )}

                        <span className="ms-3 bg-gray-10 text-wrap w-260">
                            <span className="tb-body-default-medium text-wrap ">{`${row?.name}`}</span> <br />
                            {row.isInvited && (
                                <Badge className="badgem bg-gray-100 px-1 py-1m radius-4m w-100m mt-2">
                                    <small className="badge-font text-black text-capitalize"> COLLABORATOR</small>
                                </Badge>
                            )}
                        </span>
                    </span>
                ),
                grow: isMobileDevice() ? 4 : 4,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Primary Contact</span>,
                cell: (row: Project, index: number) => (
                    <div className="d-flex flex-column">
                        {row.owner && <span className="text-muted rowclick">{`${row.owner}`}</span>}
                        {row.email && (
                            <a
                                title={`${row.email.toLowerCase()}`}
                                href={`mailto:${row.email}`}
                                className="text-blue-900 text-decoration-none truncate-1"
                            >
                                {`${row.email.toLowerCase()}`}
                            </a>
                        )}
                    </div>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Secondary Contact</span>,
                cell: (row: Project, index: number) =>
                    row?.additionalContacts?.length ? (
                        <div className="d-flex flex-column">
                            {row.additionalContacts[0].firstName && (
                                <span className="text-muted rowclick">{`${row?.additionalContacts[0].firstName}`}</span>
                            )}
                            {row.additionalContacts[0].email && (
                                <a
                                    href={`mailto:${row.additionalContacts[0].email}`}
                                    className="text-blue-900 text-decoration-none "
                                >
                                    {`${row.additionalContacts[0].email.toLowerCase()}`}
                                </a>
                            )}
                        </div>
                    ) : (
                        <></>
                    ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Action</span>,
                cell: (row: Project, index: number) => (
                    <div className="d-flex justify-content-center">
                        <Dropdown>
                            <Dropdown.Toggle as="div" className="cursor-pointer" id={`dropdown-project-${row.id}`}>
                                <MoreVertical size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-end">
                                <Dropdown.Item href={`/projects/edit/${row.id}`}>
                                    <Edit2 size={16} color="#888888" className="me-2" />
                                    <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => triggerArchiveModal(row)}>
                                    {row.status === "active" ? (
                                        <ArchiveAdd size={16} color="#888888" className="me-2" />
                                    ) : (
                                        <ArchiveMinus size={16} color="#888888" className="me-2" />
                                    )}
                                    <span className="tb-body-default-regular">
                                        {row.status === "active" ? "Archive" : "Unarchive"}
                                    </span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => {
                                        const payload = {
                                            objectType: "project",
                                            objectId: row.id,
                                            createdBy: user?.id,
                                            company: user?.companyId,
                                        };
                                        addToFavorites(payload);
                                    }}
                                >
                                    <Star1 size={16} color="#888888" className="me-2" />
                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => triggerDeleteModal(row.id)} className="text-danger">
                                    <Trash size={16} color="#E70000" className="me-2" />
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
                button: true,
                width: "100px",
            },
        ];
    };

    useEffect(() => {
        if (getUrlQuery("query")) {
            return;
        }

        fetchProjects({ resetData: true });
    }, [status, listOrGrid.project]);

    const crumbs = [
        { name: "Projects", url: "/projects" },
        { name: `${status === "active" ? "Active" : "Archived"} Projects` },
    ];

    // Determine if we're showing search results or cached projects
    const projectsToDisplay = searchResults?.projects?.results || projects;
    const projectsCount = searchResults?.projects?.count || totalRows;
    const isShowingSearchResults = Boolean(searchResults?.projects?.results);

    const shouldShowInitialLoader = isInitialLoading && projectsToDisplay.length === 0;
    const hasDataToShow = projectsToDisplay.length > 0 || isShowingSearchResults;
    const hasMoreData =
        !isShowingSearchResults &&
        hasMore &&
        !isLoading &&
        !isSearching &&
        !isSilentlyFetching &&
        projectsToDisplay.length < totalRows &&
        projectsToDisplay.length > 0;

    return (
        <DashboardLayout breadCrumbs={crumbs} pageTitle="Projects">
            <>
                <Header
                    buttonText={status === "archived" ? "" : "New Project"}
                    buttonUrl={status === "archived" ? "" : "/projects/add"}
                    showListOrGrid={true}
                    searchPlaceholder="Search projects"
                    listOrGridKey="project"
                    onSearch={(searchTerm: string) => search({ query: searchTerm, categories: ["projects"] })}
                    isSearching={isSearching}
                    onClearSearch={() => fetchProjects({ resetData: true })}
                    showSearchForm={
                        hasDataToShow ||
                        (searchResults && searchResults?.storages?.results?.length > 0) ||
                        isLoading ||
                        shouldShowInitialLoader ||
                        isSearching
                    }
                />

                {/* Sticky Sync Status Banner */}
                {(isSilentlyFetching || showSyncCompleted || showSyncError) && (
                    <div
                        className={`w-100 border-bottom sync-banner ${
                            isSilentlyFetching
                                ? "sync-banner-progress"
                                : showSyncCompleted
                                ? "sync-banner-completed"
                                : "sync-banner-error"
                        }`}
                    >
                        <Container fluid className="py-2">
                            {isSilentlyFetching && (
                                <div className="d-flex align-items-center">
                                    <Spinner size="sm" className="me-2 spinner-primary" />
                                    <small className="text-primary mb-0">Sync in progress...</small>
                                </div>
                            )}

                            {showSyncCompleted && (
                                <div className="d-flex align-items-center">
                                    <div className="sync-check-icon me-2">✓</div>
                                    <small className="text-success mb-0">Syncing complete</small>
                                </div>
                            )}

                            {showSyncError && (
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <div className="sync-error-icon me-2">!</div>
                                        <small className="text-danger mb-0">
                                            Syncing failed. Retry now or try again later
                                        </small>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-primary retry-sync-btn"
                                        onClick={handleRetrySync}
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}
                        </Container>
                    </div>
                )}

                {searchResults?.projects?.results?.length ? (
                    <Container fluid className={`mt-4`}>
                        <p className="m-0">Project ({searchResults?.projects?.results.length})</p>
                    </Container>
                ) : null}

                {listOrGrid.project === "grid" || isMobileDevice() ? (
                    <Container
                        fluid
                        className={searchResults && !searchResults?.projects?.results?.length ? "" : "pb-4"}
                    >
                        {/* Show initial loading spinner only when no cached data */}
                        {shouldShowInitialLoader ? (
                            <div className="d-flex align-items-center justify-content-center p-5">
                                <div className="text-center">
                                    <Spinner className="mb-3" />
                                    <p className="text-muted">Loading projects...</p>
                                </div>
                            </div>
                        ) : (
                            <InfiniteScroll
                                dataLength={projectsToDisplay.length}
                                next={handleLoadMore}
                                hasMore={hasMoreData}
                                loader={
                                    <div className="d-flex align-items-center justify-content-center p-4">
                                        <Spinner size="sm" className="me-2" />
                                        Loading more...
                                    </div>
                                }
                                scrollThreshold={0.8}
                                endMessage={<div className="text-center p-3">{/* end of page reached */}</div>}
                            >
                                <Row
                                    className={` ${
                                        searchResults && searchResults?.projects?.results.length ? "mt-0" : "mt-0"
                                    } g-4`}
                                >
                                    {projectsToDisplay.map((project: Project, index: number) => (
                                        <Col key={index} md={4} lg={3} sm={4}>
                                            <ProjectCard
                                                project={project}
                                                onDelete={() => triggerDeleteModal(project.id)}
                                                onArchive={() => triggerArchiveModal(project)}
                                                onAddToFavorites={addToFavorites}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </InfiniteScroll>
                        )}
                    </Container>
                ) : hasDataToShow || shouldShowInitialLoader ? (
                    <Row className={searchResults?.projects?.results?.length ? "mt-4" : ""}>
                        <Col className="mt-4">
                            <Card
                                className={`overflow-hidden border-0 rounded-0 ${
                                    shouldShowInitialLoader || isSearching ? "border-0" : ""
                                }`}
                            >
                                <DataTableComponent
                                    columns={tableColumns()}
                                    data={projectsToDisplay}
                                    paginationTotalRows={projectsCount}
                                    onChangePage={onTablePageChange}
                                    progressPending={shouldShowInitialLoader}
                                    paginationRowsPerPageOptions={[50]}
                                    paginationPerPage={50}
                                    onRowClicked={handleRowClicked}
                                    pointerOnHover
                                    pagination={!isShowingSearchResults}
                                    //@ts-ignore
                                    paginationServer
                                    paginationDefaultPage={page}
                                />
                            </Card>
                        </Col>
                    </Row>
                ) : null}

                <DeleteModal
                    showModal={showDeleteProjectModal}
                    setShowModal={(value: boolean) => setShowDeleteProjectModal(value)}
                    dataToDeleteName={"Project"}
                    isDeleting={isDeleting}
                    onYesDelete={deleteProject}
                    message="Are you sure you want to delete project?"
                    rightButtonText="Yes, Delete"
                    rightButtonProcessingText="Deleting..."
                />

                <DeleteModal
                    showModal={showArchiveProjectModal}
                    setShowModal={(value: boolean) => setShowArchiveProjectModal(value)}
                    action={`${status === "active" ? "Archive" : "Unarchive"}`}
                    dataToDeleteName={"Project"}
                    isDeleting={isSubmitting}
                    onYesDelete={() => archiveProject(dataToDelete)}
                    rightButtonText={`${status === "active" ? "Yes, Archive" : "Yes, Unarchive"}`}
                    rightButtonProcessingText={`${status === "active" ? "" : ""}`}
                />
            </>

            {searchResults && !searchResults.projects.results.length && !shouldShowInitialLoader && !isSearching && (
                <EmptyState
                    icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                    headerText={`No Results Found`}
                    descriptionText={`"${getUrlQuery("query")}" did not match any data. Please try again.`}
                />
            )}

            {!searchResults && !projectsToDisplay.length && !shouldShowInitialLoader && (
                <EmptyState
                    icon={<EngineerAndLaptop />}
                    headerText={`No ${status === "active" ? "Projects" : "Archived Projects"} `}
                    descriptionText={` ${
                        status === "active" ? "Projects" : "Archived Projects"
                    } added can be managed here`}
                    buttonText={status === "archived" ? "" : "New Project"}
                    buttonUrl={status === "archived" ? "" : "/projects/add"}
                />
            )}
        </DashboardLayout>
    );
}
