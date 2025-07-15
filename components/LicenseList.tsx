import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { Row, Col, Card, Container, Spinner } from "react-bootstrap";
import DeleteModal from "@/components/DeleteModal";
import Certificate from "@/components/icons/Certificate";
import useLicense from "@/hooks/useLicense";
import useSearchForm from "@/hooks/searchForm";
import { getUrlQuery, isMobileDevice, isTabletDevice } from "@/helpers";
import DataTableComponent from "@/components/DataTableComponent";
import { SearchNormal1 } from "iconsax-react";
import LicensDetailsMobile from "@/components/LicenseCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { LicenseData } from "@/repositories/business-repository";
import LicenseCard from "@/components/LicenseCard";
import PageLoader from "@/components/PageLoader";
import LicenseCardSmall from "@/components/LicenseCardSmall";
import LicenseMenu from "@/components/LicenseMenu";
import LicenseDetails from "@/components/LicenseDetails";
import { MyToast } from "./MyToast";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/router";

export default function LicenseList() {
    const router = useRouter();
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { search, isSearching } = useSearchForm();

    const currentStatus = location.pathname.split("/")[3] || "active";

    const {
        licenses,
        isLoading,
        isInitialLoading,
        isSilentlyFetching,
        totalRows,
        hasMore,
        fetchLicenses,
        loadMoreLicenses,
        page,
        setPage,
        tableColumns,
        showModal,
        setShowModal,
        isDeleting,
        deleteLicense,
        setLicenseToDelete,
        viewDocumentFile,
        archiveLicense,
        unArchiveLicense,
        onTablePageChange,
    } = useLicense();

    const [showSyncCompleted, setShowSyncCompleted] = useState<boolean>(false);
    const [showSyncError, setShowSyncError] = useState<boolean>(false);
    const [previouslySyncing, setPreviouslySyncing] = useState<boolean>(false);

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

    useEffect(() => {}, [currentStatus]);

    const handleRetrySync = () => {
        setShowSyncError(false);
        fetchLicenses({ resetData: true });
    };

    const licensesToDisplay = searchResults?.licenses?.results || licenses;
    const licensesCount = searchResults?.licenses?.count || totalRows;
    const isShowingSearchResults = Boolean(searchResults?.licenses?.results);

    const shouldShowInitialLoader = isInitialLoading && licensesToDisplay.length === 0;

    // logic to check if there's more data to load for infinite scroll
    const hasMoreData =
        !isShowingSearchResults &&
        hasMore &&
        !isLoading &&
        !isSearching &&
        !isSilentlyFetching &&
        licensesToDisplay.length < totalRows &&
        licensesToDisplay.length > 0;

    const handleLoadMore = () => {
        if (
            isLoading ||
            !hasMore ||
            isShowingSearchResults ||
            isSearching ||
            isSilentlyFetching ||
            licensesToDisplay.length >= totalRows
        ) {
            return;
        }
        loadMoreLicenses();
    };

    // Show initial loading only when we have no data in the store
    if (isInitialLoading) {
        return (
            <DashboardLayout
                breadCrumbs={[
                    { name: "Business", url: "/business" },
                    { name: "License", url: "/business/license" },
                ]}
                pageTitle="License"
            >
                <PageLoader />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "License", url: "/business/license" },
            ]}
            pageTitle="License"
        >
            <div className="mb-5">
                <Header
                    showActions={listOrGrid?.license === "grid"}
                    buttonText="New License"
                    buttonUrl="/business/license/add"
                    searchPlaceholder="Search license"
                    showListOrGrid={true}
                    listOrGridKey="license"
                    onSearch={(searchTerm: string) => search({ query: searchTerm, categories: ["licenses"] })}
                    isSearching={isSearching}
                    onClearSearch={() => fetchLicenses({ resetData: true })}
                    showSearchForm={
                        licenses.length > 0 ||
                        (searchResults && searchResults?.licenses?.results?.length > 0) ||
                        isLoading ||
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

                {searchResults?.licenses?.results?.length ? (
                    <Container fluid className={`mt-4`}>
                        <p className="m-0">Licenses ({searchResults?.licenses?.results.length})</p>
                    </Container>
                ) : null}

                <div className="mt-3"></div>

                <div className="mb-4">
                    <LicenseMenu />
                </div>

                {isMobileDevice() || isTabletDevice() || listOrGrid.license === "grid" ? (
                    <Container fluid>
                        {/* Show initial loading spinner only when no cached data */}
                        {shouldShowInitialLoader ? (
                            <div className="d-flex align-items-center justify-content-center p-5">
                                <div className="text-center">
                                    <Spinner className="mb-3" />
                                    <p className="text-muted">Loading licenses...</p>
                                </div>
                            </div>
                        ) : (
                            <InfiniteScroll
                                dataLength={licensesToDisplay.length}
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
                                {licensesToDisplay.length ? (
                                    <Row className="g-4 my-4m mt-0">
                                        {licensesToDisplay.map((license: Partial<LicenseData>, index: number) => (
                                            <Col sm={12} md={3} key={index}>
                                                {isMobileDevice() || isTabletDevice() ? (
                                                    <LicenseCard
                                                        license={license}
                                                        onUpdate={() =>
                                                            router.push(`/business/license/edit/${license.id}`)
                                                        }
                                                        onDelete={() => {
                                                            setLicenseToDelete(license);
                                                            setShowModal(true);
                                                        }}
                                                        onArchive={() => {
                                                            license.status === "active"
                                                                ? archiveLicense(license)
                                                                : unArchiveLicense(license);
                                                        }}
                                                    />
                                                ) : (
                                                    <LicenseCardSmall
                                                        license={license}
                                                        onUpdate={() =>
                                                            router.push(`/business/license/edit/${license.id}`)
                                                        }
                                                        onDelete={() => {
                                                            setLicenseToDelete(license);
                                                            setShowModal(true);
                                                        }}
                                                        viewDocumentFile={() => viewDocumentFile(license.file)}
                                                        onArchive={() => {
                                                            license.status === "active"
                                                                ? archiveLicense(license)
                                                                : unArchiveLicense(license);
                                                        }}
                                                    />
                                                )}
                                            </Col>
                                        ))}
                                    </Row>
                                ) : null}
                            </InfiniteScroll>
                        )}
                    </Container>
                ) : (licenses?.length && !searchResults) ||
                  (searchResults && searchResults?.licenses?.results?.length) ||
                  shouldShowInitialLoader ? (
                    <Row className={searchResults?.licenses?.results?.length ? "mt-4" : ""}>
                        <Col xs={12} md={12} className="">
                            <Card
                                className={`overflow-hidden rounded-0 border-0 ${
                                    shouldShowInitialLoader || isSearching ? "border-0" : ""
                                }`}
                            >
                                <DataTableComponent
                                    columns={tableColumns()}
                                    data={licensesToDisplay}
                                    paginationTotalRows={searchResults?.licenses?.results.length ?? totalRows}
                                    onChangePage={onTablePageChange}
                                    progressPending={shouldShowInitialLoader}
                                    paginationRowsPerPageOptions={
                                        searchResults ? [searchResults?.licenses?.results.length] : null
                                    }
                                    paginationPerPage={searchResults?.licenses?.results.length ?? null}
                                    onRowClicked={(license: LicenseData) =>
                                        router.push(`/business/license/${license.id}`)
                                    }
                                />
                            </Card>
                        </Col>
                    </Row>
                ) : null}

                {/* Delete Modal */}
                <DeleteModal
                    showModal={showModal}
                    setShowModal={(value: boolean) => setShowModal(value)}
                    dataToDeleteName={"License"}
                    isDeleting={isDeleting}
                    onYesDelete={deleteLicense}
                    message="Are you sure you want to delete license?"
                />

                {/* No search results */}
                {getUrlQuery("query") &&
                    !searchResults?.licenses?.results?.length &&
                    !shouldShowInitialLoader &&
                    !isSearching && (
                        <EmptyState
                            icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                            headerText={`No Results Found`}
                            descriptionText={`"${getUrlQuery("query")}" did not match any data. Please try again.`}
                        />
                    )}

                {/* No results */}
                {!getUrlQuery("query") && !licenses.length && !shouldShowInitialLoader && !isInitialLoading && (
                    <EmptyState
                        icon={<Certificate width={80} height={80} />}
                        headerText="No License"
                        descriptionText={`Licenses ${
                            currentStatus === "archived" ? "archived" : "added"
                        } can be managed here`}
                        buttonText={currentStatus === "active" ? "New License" : ""}
                        buttonUrl={currentStatus === "active" ? "/business/license/add" : ""}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
