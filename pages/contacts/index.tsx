import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { useEffect, useState } from "react";
import { Card, Col, Container, Row, Spinner } from "react-bootstrap";
import useContact from "@/hooks/useContact";
import DeleteModal from "@/components/DeleteModal";
import Header from "@/components/Header";
import { Contact } from "@/repositories/contact-repositories";
import ContactCard from "@/components/ContactCard";
import ContactBook from "@/components/icons/ContactBook";
import InfiniteScroll from "react-infinite-scroll-component";
import DataTableComponent from "@/components/DataTableComponent";
import useSearchForm from "@/hooks/searchForm";
import { getUrlQuery, isMobileDevice } from "@/helpers";
import { SearchNormal1 } from "iconsax-react";
import router from "next/router";

export default function Contacts() {
    const {
        contactsTable,
        getContacts,
        contacts,
        isLoading,
        isDeleting,
        handleDelete,
        contactToDelete,
        deleteContact,
        showDeleteModal,
        setShowDeleteModal,
        hasMore,
        onTablePageChange,
        listOrGrid,
        totalRows,
        setPageReady,
        searchResults,
        onAddtoFavorites,
        loadMoreContacts,
        isSilentlyFetching,
    } = useContact({});

    const { search, isSearching } = useSearchForm();

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

    useEffect(() => {
        getContacts();
    }, []);

    useEffect(() => {
        if (getUrlQuery("query")) {
            return;
        }

        if (listOrGrid.project === "grid") {
            getContacts();
        }

        setTimeout(() => {
            setPageReady(true);
        }, 1000);
    }, [listOrGrid.project]);

    const handleRetrySync = () => {
        setShowSyncError(false);
        getContacts();
    };

    const displayContacts = searchResults?.contacts?.results || contacts;
    const hasSearchResults = (searchResults?.contacts?.results?.length ?? 0) > 0;
    const hasContacts = contacts.length > 0;
    const showContent = hasContacts || hasSearchResults || isLoading || isSearching;

    const isShowingSearchResults = Boolean(searchResults?.contacts?.results);

    const shouldShowInitialLoader = isLoading && displayContacts.length === 0;

    // logic to check if there's more data to load for infinite scroll
    const hasMoreData =
        !isShowingSearchResults &&
        hasMore &&
        !isLoading &&
        !isSearching &&
        !isSilentlyFetching &&
        displayContacts.length < totalRows &&
        displayContacts.length > 0;

    const handleLoadMore = () => {
        if (
            isLoading ||
            !hasMore ||
            isShowingSearchResults ||
            isSearching ||
            isSilentlyFetching ||
            displayContacts.length >= totalRows
        ) {
            return;
        }
        loadMoreContacts();
    };

    return (
        <DashboardLayout breadCrumbs={[{ name: "Contacts" }]} pageTitle="Contacts">
            {showContent ? (
                <Header
                    buttonText="New Contact"
                    buttonUrl="/contacts/add"
                    showListOrGrid={true}
                    listOrGridKey="contact"
                    searchPlaceholder="Search Contacts"
                    onSearch={(searchTerm: string) => search({ query: searchTerm, categories: ["contacts"] })}
                    isSearching={isSearching}
                    onClearSearch={getContacts}
                    showSearchForm={showContent}
                />
            ) : null}

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

            {hasSearchResults ? (
                <Container fluid className="mt-4">
                    <p className="m-0">
                        Contacts ({searchResults?.contacts.results.length})
                        {isSilentlyFetching && (
                            <span className="ms-2 text-muted small">
                                <Spinner size="sm" animation="border" className="me-1" />
                                Updating...
                            </span>
                        )}
                    </p>
                </Container>
            ) : null}

            {listOrGrid.contact === "grid" || isMobileDevice() ? (
                <Container fluid className={searchResults && !hasSearchResults ? "" : "pb-4"}>
                    {/* Show initial loading spinner only when no cached data */}
                    {shouldShowInitialLoader ? (
                        <div className="d-flex align-items-center justify-content-center p-5">
                            <div className="text-center">
                                <Spinner className="mb-3" />
                                <p className="text-muted">Loading contacts...</p>
                            </div>
                        </div>
                    ) : (
                        <InfiniteScroll
                            dataLength={displayContacts.length}
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
                            <Row className={`g-4 ${searchResults && hasSearchResults ? "mt-0" : "mt-3"}`}>
                                {displayContacts.map((contact: Contact, index: number) => (
                                    <Col md={3} key={`${contact.id}-${index}`}>
                                        <ContactCard
                                            onAddToFavorites={() => onAddtoFavorites(contact)}
                                            contact={contact}
                                            onDelete={() => deleteContact(contact.id)}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </InfiniteScroll>
                    )}
                </Container>
            ) : (hasContacts && !searchResults) || (searchResults && hasSearchResults) || shouldShowInitialLoader ? (
                <Row className={hasSearchResults ? "mt-4" : ""}>
                    <Col>
                        <Card
                            className={`overflow-hidden mt-32 border-0 rounded-0 ${
                                shouldShowInitialLoader || isSearching ? "border-0" : ""
                            }`}
                        >
                            {isSilentlyFetching && !shouldShowInitialLoader && (
                                <div className="position-absolute top-0 end-0 m-2 z-index-10">
                                    <Spinner size="sm" animation="border" className="text-primary" />
                                </div>
                            )}

                            <DataTableComponent
                                columns={contactsTable({})}
                                data={displayContacts}
                                paginationTotalRows={searchResults?.contacts?.results.length ?? totalRows}
                                onChangePage={onTablePageChange}
                                progressPending={shouldShowInitialLoader}
                                paginationRowsPerPageOptions={
                                    searchResults ? [searchResults.contacts.results.length] : null
                                }
                                paginationPerPage={searchResults?.contacts?.results.length ?? null}
                                onRowClicked={(contact: Contact) => router.push(`/contacts/${contact.id}`)}
                            />
                        </Card>
                    </Col>
                </Row>
            ) : null}

            {/* Delete Modal */}
            <DeleteModal
                showModal={showDeleteModal}
                setShowModal={setShowDeleteModal}
                dataToDeleteName="Contact"
                isDeleting={isDeleting}
                onYesDelete={() => handleDelete(contactToDelete)}
                message="Are you sure you want to delete this contact?"
            />

            {searchResults && !hasSearchResults && !shouldShowInitialLoader && !isSearching && (
                <EmptyState
                    icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                    headerText="No Results Found"
                    descriptionText={`"${getUrlQuery("query")}" did not match any contacts. Please try again.`}
                />
            )}

            {!searchResults && !hasContacts && !shouldShowInitialLoader && (
                <EmptyState
                    icon={<ContactBook />}
                    headerText="No Contacts"
                    descriptionText="Contacts added can be managed here"
                    buttonText="New Contact"
                    buttonUrl="/contacts/add"
                />
            )}
        </DashboardLayout>
    );
}
