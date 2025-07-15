import DashboardLayout from "@/components/DashboardLayout";
import DeleteModal from "@/components/DeleteModal";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import PageLoader from "@/components/PageLoader";
import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import InsuranceIcon from "@/components/icons/Insurance";
import useInsurance from "@/hooks/useInsurance";
import { getUrlQuery, isMobileDevice, isTabletDevice } from "@/helpers";
import DataTableComponent from "@/components/DataTableComponent";
import { SearchNormal1 } from "iconsax-react";
import InfiniteScroll from "react-infinite-scroll-component";
import { InsuranceData } from "@/repositories/business-repository";
import InsuranceCard from "@/components/InsuranceCard";
import InsuranceCardSmall from "@/components/InsuranceCardSmall";
import InsuranceMenu from "./InsuranceMenu";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/router";
import useSearchForm from "@/hooks/searchForm";

export default function InsuranceList() {
    const router = useRouter();
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { search, isSearching } = useSearchForm();

    const currentStatus = location.pathname.split("/")[3] || "active";

    const {
        insurances,
        isLoading,
        isInitialLoading,
        isSilentlyFetching,
        totalRows,
        hasMore,
        fetchInsurances,
        loadMoreInsurances,
        tableColumns,
        showModal,
        setShowModal,
        isDeleting,
        deleteInsurance,
        setInsuranceToDelete,
        viewDocumentFile,
        archiveInsurance,
        unArchiveInsurance,
        onTablePageChange,
    } = useInsurance();

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
        fetchInsurances({ resetData: true });
    };

    const insurancesToDisplay = searchResults?.insurances?.results || insurances;
    const insurancesCount = searchResults?.insurances?.count || totalRows;
    const isShowingSearchResults = Boolean(searchResults?.insurances?.results);

    const shouldShowInitialLoader = isInitialLoading && insurancesToDisplay.length === 0;

    // logic to check if there's more data to load for infinite scroll
    const hasMoreData =
        !isShowingSearchResults &&
        hasMore &&
        !isLoading &&
        !isSearching &&
        !isSilentlyFetching &&
        insurancesToDisplay.length < totalRows &&
        insurancesToDisplay.length > 0;

    const handleLoadMore = () => {
        if (
            isLoading ||
            !hasMore ||
            isShowingSearchResults ||
            isSearching ||
            isSilentlyFetching ||
            insurancesToDisplay.length >= totalRows
        ) {
            return;
        }
        loadMoreInsurances();
    };

    // Show initial loading only when we have no data in the store
    if (isInitialLoading) {
        return (
            <DashboardLayout
                breadCrumbs={[
                    { name: "Business", url: "/business" },
                    { name: "Insurance", url: "/business/insurance" },
                ]}
                pageTitle="Insurance"
            >
                <PageLoader />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "Insurance", url: "/business/insurance" },
            ]}
            pageTitle="Insurance"
        >
            <div className="mb-5">
                <Header
                    showActions={listOrGrid?.insurance === "grid"}
                    buttonText="New Insurance"
                    buttonUrl="/business/insurance/add"
                    searchPlaceholder="Search insurance"
                    showListOrGrid={true}
                    listOrGridKey="insurance"
                    onSearch={(searchTerm: string) => search({ query: searchTerm, categories: ["insurances"] })}
                    isSearching={isSearching}
                    onClearSearch={() => fetchInsurances({ resetData: true })}
                    showSearchForm={
                        insurances.length > 0 ||
                        (searchResults && searchResults?.insurances?.results?.length > 0) ||
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

                {searchResults?.insurances?.results?.length ? (
                    <Container fluid className={`mt-4`}>
                        <p className="m-0">Insurances ({searchResults?.insurances?.results.length})</p>
                    </Container>
                ) : null}

                <div className="mt-3"></div>

                <div className="mb-4">
                    <InsuranceMenu />
                </div>

                {isMobileDevice() || isTabletDevice() || listOrGrid.insurance === "grid" ? (
                    <Container fluid>
                        {/* Show initial loading spinner only when no cached data */}
                        {shouldShowInitialLoader ? (
                            <div className="d-flex align-items-center justify-content-center p-5">
                                <div className="text-center">
                                    <Spinner className="mb-3" />
                                    <p className="text-muted">Loading insurances...</p>
                                </div>
                            </div>
                        ) : (
                            <InfiniteScroll
                                dataLength={insurancesToDisplay.length}
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
                                {insurancesToDisplay.length ? (
                                    <Row className="g-4 my-4m mt-0">
                                        {insurancesToDisplay.map((insurance: Partial<InsuranceData>, index: number) => (
                                            <Col sm={12} md={3} key={index}>
                                                {isMobileDevice() || isTabletDevice() ? (
                                                    <InsuranceCard
                                                        insurance={insurance}
                                                        onUpdate={() =>
                                                            router.push(`/business/insurance/edit/${insurance.id}`)
                                                        }
                                                        onDelete={() => {
                                                            setInsuranceToDelete(insurance);
                                                            setShowModal(true);
                                                        }}
                                                        viewDocumentFile={viewDocumentFile}
                                                        onArchive={() => {
                                                            insurance.status === "active"
                                                                ? archiveInsurance(insurance)
                                                                : unArchiveInsurance(insurance);
                                                        }}
                                                    />
                                                ) : (
                                                    <InsuranceCardSmall
                                                        insurance={insurance}
                                                        onUpdate={() =>
                                                            router.push(`/business/insurance/edit/${insurance.id}`)
                                                        }
                                                        onDelete={() => {
                                                            setInsuranceToDelete(insurance);
                                                            setShowModal(true);
                                                        }}
                                                        viewDocumentFile={() => viewDocumentFile(insurance.file)}
                                                        onArchive={() => {
                                                            insurance.status === "active"
                                                                ? archiveInsurance(insurance)
                                                                : unArchiveInsurance(insurance);
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
                ) : (insurances?.length && !searchResults) ||
                  (searchResults && searchResults?.insurances?.results?.length) ||
                  shouldShowInitialLoader ? (
                    <Row className={searchResults?.insurances?.results?.length ? "mt-4" : ""}>
                        <Col xs={12} md={12} className="">
                            <Card
                                className={`overflow-hidden rounded-0 border-0 ${
                                    shouldShowInitialLoader || isSearching ? "border-0" : ""
                                }`}
                            >
                                <DataTableComponent
                                    columns={tableColumns()}
                                    data={insurancesToDisplay}
                                    paginationTotalRows={searchResults?.insurances?.results.length ?? totalRows}
                                    onChangePage={onTablePageChange}
                                    progressPending={shouldShowInitialLoader}
                                    paginationRowsPerPageOptions={
                                        searchResults ? [searchResults?.insurances?.results.length] : null
                                    }
                                    paginationPerPage={searchResults?.insurances?.results.length ?? null}
                                    onRowClicked={(insurance: InsuranceData) =>
                                        router.push(`/business/insurance/${insurance.id}`)
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
                    dataToDeleteName={"Insurance"}
                    isDeleting={isDeleting}
                    onYesDelete={deleteInsurance}
                    message="Are you sure you want to delete insurance?"
                />

                {/* No search results */}
                {getUrlQuery("query") &&
                    !searchResults?.insurances?.results?.length &&
                    !shouldShowInitialLoader &&
                    !isSearching && (
                        <EmptyState
                            icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                            headerText={`No Results Found`}
                            descriptionText={`"${getUrlQuery("query")}" did not match any data. Please try again.`}
                        />
                    )}

                {/* No results */}
                {!getUrlQuery("query") && !insurances.length && !shouldShowInitialLoader && !isInitialLoading && (
                    <EmptyState
                        icon={<InsuranceIcon width={80} height={80} />}
                        headerText="No Insurance"
                        descriptionText={`Insurance ${
                            currentStatus === "archived" ? "archived" : "added"
                        } can be managed here`}
                        buttonText={currentStatus === "active" ? "New Insurance" : ""}
                        buttonUrl={currentStatus === "active" ? "/business/insurance/add" : ""}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
