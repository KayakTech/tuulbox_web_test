import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Container, Spinner } from "react-bootstrap";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import DeleteModal from "@/components/DeleteModal";
import UserAndBag from "@/components/icons/UserAndBag";
import { SearchNormal1 } from "iconsax-react";
import useOfficers from "@/hooks/useOfficers";
import DataTableComponent from "@/components/DataTableComponent";
import { getUrlQuery, isMobileDevice, isTabletDevice } from "@/helpers";
import { Officer } from "@/repositories/business-repository";
import OfficerCard from "@/components/OfficerCard";
import InfiniteScroll from "react-infinite-scroll-component";
import PageLoader from "@/components/PageLoader";
import OfficerCardSmall from "@/components/OfficerCardSmall";

export default function Officers() {
    const [isPageInitialized, setIsPageInitialized] = useState(false);

    const {
        officers,
        isLoading,
        isInitialLoading,
        isSilentlyFetching,
        totalRows,
        hasMore,
        fetchOfficers,
        loadMoreOfficers,
        page,
        tablePage,
        setPage,
        setTablePage,
        showDeleteModal,
        setShowDeleteModal,
        deleteOfficer,
        triggerDelete,
        isDeleting,
        searchResults,
        search,
        isSearching,
        listOrGrid,
        router,
        officerToDelete,
        setOfficerToDelete,
        pageReady,
        setPageReady,
        onTablePageChange,
        tableColumns,
        init,
    } = useOfficers();

    useEffect(() => {
        if (!isPageInitialized) {
            init();
            setIsPageInitialized(true);
        }
    }, [isPageInitialized]);

    const handleSearch = (searchTerm: string) => {
        if (searchTerm.trim()) {
            search({ query: searchTerm, categories: ["officers"] });
        }
    };

    const handleClearSearch = () => {
        fetchOfficers({ resetData: true });
    };

    const handleLoadMore = () => {
        if (!searchResults && hasMore && !isSilentlyFetching) {
            loadMoreOfficers();
        }
    };

    const handleDeleteClick = (officer: Partial<Officer>) => {
        setOfficerToDelete(officer);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        await deleteOfficer();
    };

    const handleUpdateClick = (officer: Partial<Officer>) => {
        router.push(`/business/company/officers/edit/${officer.id}`);
    };

    const displayData = searchResults?.officers?.results || officers;
    const displayCount = searchResults?.officers?.results?.length || totalRows;

    const shouldShowContent = pageReady || displayData.length > 0;

    const shouldShowSearchForm =
        officers.length > 0 || searchResults?.officers?.results?.length > 0 || isInitialLoading || isSearching;

    const infiniteScrollHasMore = searchResults ? false : hasMore;
    const infiniteScrollIsLoading = searchResults ? isSearching : isSilentlyFetching;

    const isMobileOrTabletOrGrid = isMobileDevice() || isTabletDevice() || listOrGrid.officer === "grid";

    const shouldShowTable = !isMobileOrTabletOrGrid && shouldShowContent;

    const shouldShowGrid = isMobileOrTabletOrGrid && shouldShowContent;

    return (
        <DashboardLayout
            pageTitle="Officers"
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "Company", url: "/business/company" },
                { name: "Officers" },
            ]}
        >
            <>
                <Header
                    buttonText="New Officer"
                    buttonUrl="/business/company/officers/add"
                    showListOrGrid={true}
                    searchPlaceholder="Search officers"
                    listOrGridKey="officer"
                    onSearch={handleSearch}
                    isSearching={isSearching}
                    onClearSearch={handleClearSearch}
                    showSearchForm={shouldShowSearchForm}
                />

                {searchResults?.officers?.results?.length > 0 && (
                    <Container fluid className="mt-4">
                        <p className="m-0">Officers ({searchResults.officers.results.length})</p>
                    </Container>
                )}

                {isInitialLoading && displayData.length === 0 && (
                    <div className="text-center my-5 py-5">
                        <Spinner animation="border" role="status" />
                    </div>
                )}

                {shouldShowGrid && displayData.length > 0 && (
                    <Container fluid>
                        <InfiniteScroll
                            dataLength={displayData.length}
                            next={handleLoadMore}
                            hasMore={infiniteScrollHasMore}
                            loader={infiniteScrollIsLoading && <div className="text-center my-3">syncing ...</div>}
                        >
                            <Row className="g-4 my-4">
                                {displayData.map((officer: Partial<Officer>, index: number) => (
                                    <Col sm={12} md={3} key={officer.id || index}>
                                        {isMobileDevice() || isTabletDevice() ? (
                                            <OfficerCard
                                                officer={officer}
                                                onUpdate={() => handleUpdateClick(officer)}
                                                onDelete={() => handleDeleteClick(officer)}
                                            />
                                        ) : (
                                            <OfficerCardSmall
                                                officer={officer}
                                                onUpdate={() => handleUpdateClick(officer)}
                                                onDelete={() => handleDeleteClick(officer)}
                                            />
                                        )}
                                    </Col>
                                ))}
                            </Row>
                        </InfiniteScroll>
                    </Container>
                )}

                {shouldShowTable && displayData.length > 0 && (
                    <Row className={searchResults?.officers?.results?.length ? "mt-4" : ""}>
                        <Col>
                            <Card className="overflow-hidden rounded-0">
                                <DataTableComponent
                                    columns={tableColumns()}
                                    data={displayData}
                                    paginationTotalRows={displayCount}
                                    onChangePage={onTablePageChange}
                                    progressPending={isInitialLoading}
                                    paginationRowsPerPageOptions={
                                        searchResults ? [searchResults.officers.results.length] : undefined
                                    }
                                    paginationPerPage={
                                        searchResults ? searchResults.officers.results.length : undefined
                                    }
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

                {isSilentlyFetching && displayData.length > 0 && (
                    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
                        <div className="bg-light rounded p-2 shadow-sm d-flex align-items-center">
                            <Spinner size="sm" className="me-2" />
                            <span className="small text-muted">Updating...</span>
                        </div>
                    </div>
                )}

                <DeleteModal
                    showModal={showDeleteModal}
                    setShowModal={setShowDeleteModal}
                    dataToDeleteName="Officer"
                    isDeleting={isDeleting}
                    onYesDelete={handleDeleteConfirm}
                />

                {getUrlQuery("query") &&
                    searchResults &&
                    searchResults.officers.results.length === 0 &&
                    !isSearching && (
                        <EmptyState
                            icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                            headerText="No Results Found"
                            descriptionText={`"${getUrlQuery("query")}" did not match any officers. Please try again.`}
                        />
                    )}

                {!getUrlQuery("query") && !searchResults && officers.length === 0 && !isInitialLoading && pageReady && (
                    <EmptyState
                        icon={<UserAndBag width={80} height={80} />}
                        headerText="No Officers"
                        descriptionText="Officers added can be managed here"
                        buttonText="New Officer"
                        buttonUrl="/business/company/officers/add"
                    />
                )}

                {isSearching && (
                    <div className="text-center my-5 py-5">
                        <Spinner animation="border" role="status" />
                        <p className="mt-3 text-muted">Searching officers...</p>
                    </div>
                )}
            </>
        </DashboardLayout>
    );
}
