import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Container, Spinner } from "react-bootstrap";
import ResourceCard from "@/components/ResourceCard";
import { useEffect, useState, useRef } from "react";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import useResource from "@/hooks/useResources";
import DeleteModal from "@/components/DeleteModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ResourceIcon from "@/components/icons/ResourcesIcon";
import { MyToast } from "@/components/MyToast";
import useSearchForm from "@/hooks/searchForm";
import { getUrlQuery, isMobileDevice } from "@/helpers";
import InfiniteScroll from "react-infinite-scroll-component";
import DataTableComponent from "@/components/DataTableComponent";
import { SearchNormal1 } from "iconsax-react";
import ChatModal from "@/pages/chat-app/ChatModal";

export default function Resources() {
    const {
        tableColumns,
        getResources,
        isLoading,
        resources,
        showDeleteModal,
        setShowDeleteModal,
        isDeleting,
        handleDeleteResource,
        triggerDeleteModal,
        addToFavorites,
        handleCopy,
        listOrGrid,
        getResource,
        pageReady,
        setPageReady,
        searchResults,
        hasMore,
        totalRows,
        onTablePageChange,
        showCopyToast,
        setShowCopyToast,
        user,
        isSilentlyFetching, // Added this from the hook
    } = useResource();

    const { search, isSearching, setIsSearching } = useSearchForm();

    const hasDataRef = useRef(false);
    const initialFetchCompletedRef = useRef(false);

    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const [showSyncCompleted, setShowSyncCompleted] = useState<boolean>(false);
    const [showSyncError, setShowSyncError] = useState<boolean>(false);
    const [previouslySyncing, setPreviouslySyncing] = useState<boolean>(false);

    // Track if we have data
    useEffect(() => {
        if (resources.length > 0) {
            hasDataRef.current = true;
        }
    }, [resources]);

    useEffect(() => {
        if (pageReady) {
            initialFetchCompletedRef.current = true;
        }
    }, [pageReady]);

    useEffect(() => {
        if (getUrlQuery("query")) {
            const query = getUrlQuery("query") as string;
            setLocalSearchTerm(query);
            initialFetchCompletedRef.current = true;
        }
    }, []);

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

    useEffect(() => {
        if (getUrlQuery("query")) {
            return;
        }
        if (listOrGrid.link === "grid") {
            getResources();
        }
        setTimeout(() => {
            setPageReady(true);
        }, 2000);
    }, []);

    const handleSearch = (searchTerm: string) => {
        setLocalSearchTerm(searchTerm);
        search({ query: searchTerm, categories: ["resources"] });
    };

    const handleClearSearch = () => {
        setLocalSearchTerm("");
        getResources();
    };

    const handleRetrySync = () => {
        setShowSyncError(false);
        getResources();
    };

    const hasSearchContent = searchResults && searchResults.resources.results.length > 0;
    const hasLocalSearchTerm = localSearchTerm.trim().length > 0;
    const hasResourcesContent = resources.length > 0;
    const hasAnyData = resources.length > 0;

    const shouldShowLoading =
        (isLoading && !hasDataRef.current) || (hasDataRef.current && !hasAnyData && !hasLocalSearchTerm);

    const shouldShowContent = !shouldShowLoading && (hasResourcesContent || hasSearchContent);
    const shouldShowEmptyState =
        !shouldShowLoading &&
        !isSearching &&
        !hasLocalSearchTerm &&
        initialFetchCompletedRef.current &&
        !hasResourcesContent &&
        !hasSearchContent &&
        !searchResults &&
        !hasAnyData;

    const shouldShowSearchEmptyState =
        !isLoading &&
        !isSearching &&
        hasLocalSearchTerm &&
        !hasResourcesContent &&
        (!searchResults || !searchResults.resources.results.length);

    const dataToDisplay = searchResults ? searchResults.resources.results : resources;
    const isShowingSearchResults = Boolean(searchResults?.resources?.results);

    const hasMoreData =
        !isShowingSearchResults &&
        !hasLocalSearchTerm &&
        hasMore &&
        !isLoading &&
        !isSearching &&
        !isSilentlyFetching &&
        dataToDisplay.length < totalRows &&
        dataToDisplay.length > 0;

    return (
        <DashboardLayout pageTitle="Links" breadCrumbs={[{ name: "Links", url: "/links" }]}>
            <div className="">
                {(searchResults || hasAnyData || hasLocalSearchTerm) && (
                    <Header
                        buttonText="New Link"
                        buttonUrl="/links/add"
                        searchPlaceholder="Search link"
                        listOrGridKey="link"
                        showListOrGrid={true}
                        onSearch={handleSearch}
                        isSearching={isSearching}
                        onClearSearch={handleClearSearch}
                        showSearchForm={hasAnyData || searchResults != null || hasLocalSearchTerm}
                    />
                )}

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

                {(searchResults?.resources?.results?.length || (hasLocalSearchTerm && hasResourcesContent)) && (
                    <Container fluid className={`mt-4`}>
                        <p className="m-0">Links ({searchResults?.resources?.results?.length || resources.length})</p>
                    </Container>
                )}

                {shouldShowLoading && (
                    <div className="text-center my-5 py-5">
                        <Spinner />
                    </div>
                )}

                {shouldShowContent && (listOrGrid.link === "grid" || isMobileDevice()) ? (
                    <Container
                        fluid
                        className={
                            (searchResults && !searchResults?.resources?.results?.length) ||
                            (hasLocalSearchTerm && !hasResourcesContent)
                                ? ""
                                : "pb-4 overflow-y-auto"
                        }
                    >
                        <InfiniteScroll
                            dataLength={dataToDisplay.length}
                            next={() => {
                                if (isShowingSearchResults || hasLocalSearchTerm || !hasMoreData) {
                                    return;
                                }
                                getResources();
                            }}
                            hasMore={hasMoreData} // Use the calculated hasMoreData
                            loader={
                                <div className="text-center my-5 py-5">
                                    <Spinner size="sm" className="me-2" />
                                    Loading more...
                                </div>
                            }
                            scrollThreshold={0.8}
                            endMessage={<div className="text-center p-3">{/* end of page reached */}</div>}
                        >
                            <Row
                                className={`g-4 justify-content-start ${
                                    (searchResults && searchResults?.resources?.results.length) ||
                                    (hasLocalSearchTerm && hasResourcesContent)
                                        ? "mt-0"
                                        : "mt-3"
                                }`}
                            >
                                {dataToDisplay.map((resource: any, index: number) => (
                                    <Col
                                        sm={12}
                                        md={4}
                                        lg={4}
                                        xl={3}
                                        xxl={3}
                                        key={resource.id || index}
                                        className="d-flex justify-content-center"
                                    >
                                        <ResourceCard
                                            resource={resource}
                                            onDelete={() => triggerDeleteModal(resource)}
                                            onAddToFavorites={() => {
                                                const payload = {
                                                    objectType: "resource",
                                                    objectId: resource.id,
                                                    createdBy: user?.id,
                                                    company: user?.companyId,
                                                };
                                                addToFavorites(payload);
                                            }}
                                            onCopy={() => handleCopy}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </InfiniteScroll>
                    </Container>
                ) : null}

                {shouldShowContent && listOrGrid.link === "list" && !isMobileDevice() ? (
                    <Row
                        className={
                            searchResults?.resources?.results?.length || (hasLocalSearchTerm && hasResourcesContent)
                                ? "mt-4"
                                : ""
                        }
                    >
                        <Col>
                            <Card
                                className={`overflow-hidden rounded-0 mt-32m border-0 ${
                                    isLoading || isSearching ? "border-0" : ""
                                }`}
                            >
                                <DataTableComponent
                                    columns={tableColumns(user)}
                                    data={searchResults?.resources?.results || resources}
                                    paginationTotalRows={
                                        searchResults?.resources?.results.length ??
                                        (hasLocalSearchTerm ? resources.length : totalRows)
                                    }
                                    onChangePage={onTablePageChange}
                                    progressPending={isLoading}
                                    paginationRowsPerPageOptions={
                                        searchResults || hasLocalSearchTerm
                                            ? [searchResults?.resources?.results.length || resources.length]
                                            : null
                                    }
                                    paginationPerPage={
                                        (searchResults?.resources?.results.length ||
                                            (hasLocalSearchTerm ? resources.length : null)) ??
                                        null
                                    }
                                    onRowClicked={row => {
                                        if (row.url) {
                                            window.open(row.url, "_blank");
                                        }
                                    }}
                                />
                            </Card>
                        </Col>
                    </Row>
                ) : null}

                <DeleteModal
                    showModal={showDeleteModal}
                    setShowModal={value => setShowDeleteModal(value)}
                    dataToDeleteName={"Link"}
                    isDeleting={isDeleting}
                    onYesDelete={handleDeleteResource}
                    message="Are you sure you want to delete link?"
                />
            </div>

            {shouldShowSearchEmptyState && (
                <EmptyState
                    icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                    headerText={`No Results Found`}
                    descriptionText={`"${
                        localSearchTerm || getUrlQuery("query")
                    }" did not match any data. Please try again.`}
                />
            )}

            {shouldShowEmptyState && (
                <EmptyState
                    icon={<ResourceIcon />}
                    headerText="No Links"
                    descriptionText="Links added can be managed here"
                    buttonText="New Link"
                    buttonUrl="/links/add"
                    isLoading={false}
                />
            )}
        </DashboardLayout>
    );
}
