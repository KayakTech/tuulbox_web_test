import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Container, Spinner, Alert } from "react-bootstrap";
import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import DeleteModal from "@/components/DeleteModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useStorage from "@/hooks/useStorage";
import Folder from "@/components/icons/Folder";
import ContactDocument from "@/components/ContactDocument";
import useSearchForm from "@/hooks/searchForm";
import { getUrlQuery, isMobileDevice } from "@/helpers";
import DataTableComponent from "@/components/DataTableComponent";
import InfiniteScroll from "react-infinite-scroll-component";
import { StorageFile } from "@/repositories/storage-repository";
import { SearchNormal1 } from "iconsax-react";
import { MyToast } from "@/components/MyToast";
import useFavorites from "@/hooks/favorites";
import OfflineStateComponent from "@/components/OfflineStateComponent";

export default function Storage() {
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { user } = useSelector((state: RootState) => state.account);

    const hasDataRef = useRef(false);
    const initialFetchCompletedRef = useRef(false);

    const [localSearchTerm, setLocalSearchTerm] = useState("");
    const [showSyncCompleted, setShowSyncCompleted] = useState<boolean>(false);
    const [showSyncError, setShowSyncError] = useState<boolean>(false);
    const [previouslySyncing, setPreviouslySyncing] = useState<boolean>(false);

    const {
        tableColumns,
        files,
        isLoading,
        onTriggerDelete,
        showModal,
        setShowModal,
        isDeleting,
        onDelete,
        viewDocumentFile,
        totalRows,
        onTablePageChange,
        hasMore,
        loadMoreFiles,
        clearSearch,
        addToFavorites,
        pageReady,
        allFiles,
        isSilentlyFetching,
    } = useStorage({
        listOrGrid: listOrGrid,
        type: "files",
        searchTerm: localSearchTerm,
    });

    const { removeFavoriteById } = useFavorites();
    const { search, isSearching } = useSearchForm();
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        if (allFiles.length > 0) {
            hasDataRef.current = true;
        }
    }, [allFiles]);

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
        const handleOffline = () => {
            setIsOffline(true);
            initialFetchCompletedRef.current = true;
        };

        const handleOnline = () => {
            setIsOffline(false);
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        if (!navigator.onLine) {
            handleOffline();
        }

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
        };
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

    const handleSearch = (searchTerm: string) => {
        setLocalSearchTerm(searchTerm);
        search({ query: searchTerm, categories: ["storages"] });
    };

    const handleClearSearch = () => {
        setLocalSearchTerm("");
        clearSearch();
    };

    const handleRetrySync = () => {
        setShowSyncError(false);
    };

    if (isOffline) {
        return (
            <DashboardLayout
                breadCrumbs={[{ name: "Storage", url: "/storage" }]}
                pageTitle="Storage"
                onSearch={handleSearch}
            >
                <OfflineStateComponent />
            </DashboardLayout>
        );
    }

    const hasSearchContent = searchResults && searchResults.storages.results.length > 0;
    const hasLocalSearchTerm = localSearchTerm.trim().length > 0;
    const hasFilesContent = files.length > 0;
    const hasAnyData = allFiles.length > 0;

    const shouldShowLoading =
        (isLoading && !hasDataRef.current) || (hasDataRef.current && !hasAnyData && !hasLocalSearchTerm);

    const shouldShowContent = !shouldShowLoading && (hasFilesContent || hasSearchContent);
    const shouldShowEmptyState =
        !shouldShowLoading &&
        !isSearching &&
        !hasLocalSearchTerm &&
        initialFetchCompletedRef.current &&
        !hasFilesContent &&
        !hasSearchContent &&
        !searchResults &&
        !hasAnyData;

    const shouldShowSearchEmptyState =
        !isLoading &&
        !isSearching &&
        hasLocalSearchTerm &&
        !hasFilesContent &&
        (!searchResults || !searchResults.storages.results.length);

    const handleLoadMore = () => {
        if (searchResults || hasLocalSearchTerm) {
            return;
        }
        loadMoreFiles();
    };

    const dataToDisplay = searchResults ? searchResults.storages.results : files;
    const dataCount = searchResults ? searchResults.storages.results.length : totalRows;
    const isShowingSearchResults = Boolean(searchResults?.storages?.results);

    // logic to calculate if there's more data to load
    const hasMoreData =
        !isShowingSearchResults &&
        !hasLocalSearchTerm &&
        hasMore &&
        !isLoading &&
        !isSearching &&
        !isSilentlyFetching &&
        dataToDisplay.length < totalRows &&
        dataToDisplay.length > 0;

    const handleFavoriteAction = async (payload: any, isRemove = false, favoriteId?: string) => {
        try {
            if (isRemove && favoriteId) {
                await removeFavoriteById(favoriteId);
            } else {
                await addToFavorites(payload);
            }
        } catch (error) {
            console.error("Error handling favorite action:", error);
        }
    };

    return (
        <DashboardLayout
            breadCrumbs={[{ name: "Storage", url: "/storage" }]}
            pageTitle="Storage"
            onSearch={handleSearch}
        >
            <div className="">
                {(searchResults || hasAnyData || hasLocalSearchTerm) && (
                    <Header
                        buttonText="New File"
                        buttonUrl="/storage/add"
                        searchPlaceholder="Search file"
                        listOrGridKey="storage"
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

                {(searchResults?.storages?.results?.length || (hasLocalSearchTerm && hasFilesContent)) && (
                    <Container fluid className={`mt-4`}>
                        <p className="m-0">Storage ({searchResults?.storages?.results?.length || files.length})</p>
                    </Container>
                )}

                {shouldShowLoading && (
                    <div className="text-center my-5 py-5">
                        <Spinner />
                    </div>
                )}

                {shouldShowContent && (listOrGrid.storage === "grid" || isMobileDevice()) ? (
                    <Container
                        fluid
                        className={
                            (searchResults && !searchResults?.storages?.results?.length) ||
                            (hasLocalSearchTerm && !hasFilesContent)
                                ? ""
                                : "pb-4 overflow-y-auto"
                        }
                    >
                        <InfiniteScroll
                            dataLength={dataToDisplay.length}
                            next={handleLoadMore}
                            hasMore={hasMoreData}
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
                                className={` ${
                                    (searchResults && searchResults?.storages?.results.length) ||
                                    (hasLocalSearchTerm && hasFilesContent)
                                        ? "mt-0"
                                        : "mt-3"
                                } g-4`}
                            >
                                {dataToDisplay.map((file: StorageFile, index) => (
                                    <Col
                                        sm={12}
                                        md={4}
                                        lg={4}
                                        xl={4}
                                        xxl={3}
                                        key={file.id || index}
                                        className="d-flex justify-content-center"
                                    >
                                        <ContactDocument
                                            file={file}
                                            onDelete={file => onTriggerDelete(file)}
                                            fileType="storage"
                                            user={user}
                                            onItemClick={(document: any) => {
                                                viewDocumentFile(file);
                                            }}
                                            addToFavorites={payload => handleFavoriteAction(payload)}
                                            onRemoveFromFavorites={() =>
                                                handleFavoriteAction(null, true, file?.favoriteId)
                                            }
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </InfiniteScroll>
                    </Container>
                ) : null}

                {shouldShowContent && listOrGrid.storage === "list" && !isMobileDevice() ? (
                    <Row
                        className={
                            searchResults?.storages?.results?.length || (hasLocalSearchTerm && hasFilesContent)
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
                                    data={searchResults?.storages?.results || files}
                                    paginationTotalRows={
                                        searchResults?.storages?.results.length ??
                                        (hasLocalSearchTerm ? files.length : totalRows)
                                    }
                                    onChangePage={onTablePageChange}
                                    progressPending={isLoading}
                                    paginationRowsPerPageOptions={
                                        searchResults || hasLocalSearchTerm
                                            ? [searchResults?.storages?.results.length || files.length]
                                            : null
                                    }
                                    paginationPerPage={
                                        (searchResults?.storages?.results.length ||
                                            (hasLocalSearchTerm ? files.length : null)) ??
                                        null
                                    }
                                    onRowClicked={(row: StorageFile) => {
                                        viewDocumentFile(row);
                                    }}
                                />
                            </Card>
                        </Col>
                    </Row>
                ) : null}

                <DeleteModal
                    showModal={showModal}
                    setShowModal={(value: boolean) => setShowModal(value)}
                    dataToDeleteName={"Resource"}
                    message="Are you sure you want to delete file?"
                    isDeleting={isDeleting}
                    onYesDelete={onDelete}
                    rightButtonText="Delete"
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
                    icon={<Folder />}
                    headerText="No files"
                    descriptionText="Files added can be managed here"
                    buttonText="New File"
                    buttonUrl="/storage/add"
                    isLoading={false}
                />
            )}
        </DashboardLayout>
    );
}
