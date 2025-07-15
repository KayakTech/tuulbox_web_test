import DashboardLayout from "@/components/DashboardLayout";
import ResourceCard from "@/components/ResourceCard";
import { Row, Col, Card, Button, Container, Spinner } from "react-bootstrap";
import CompanyOptionCard, { CompanyOptionCardState } from "@/components/CompanyOptionCard";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Image from "next/image";
import { NewBusinessId, Officer } from "@/repositories/business-repository";
import Link from "next/link";
import Header from "@/components/Header";
import useOfficers from "@/hooks/useOfficers";
import DataTableComponent from "@/components/DataTableComponent";
import DeleteModal from "@/components/DeleteModal";
import { ensureHttps, getUrlQuery, isMobileDevice, isTabletDevice } from "@/helpers";
import EmptyState from "@/components/EmptyState";
import { SearchNormal1 } from "iconsax-react";
import UserAndBag from "@/components/icons/UserAndBag";
import InfiniteScroll from "react-infinite-scroll-component";
import OfficerCard from "@/components/OfficerCard";
import OfficerCardSmall from "@/components/OfficerCardSmall";
import { useEffect } from "react";

export default function Company() {
    const { company } = useSelector((state: RootState) => state.business);
    const officersHook = useOfficers();

    const {
        officers,
        isLoading,
        isInitialLoading,
        isSilentlyFetching,
        totalRows,
        hasMore,
        fetchOfficers,
        loadMoreOfficers,
        showDeleteModal,
        setShowDeleteModal,
        isDeleting,
        deleteOfficer,
        tableColumns,
        pageReady,
        setPageReady,
        searchResults,
        onTablePageChange,
        router,
        setOfficerToDelete,
        init,
        search,
        isSearching,
        listOrGrid,
        triggerDelete,
        hasStoreData,
        shouldShowEmptyState,
    } = officersHook;

    useEffect(() => {
        init();
    }, []);

    const COMPANY_OPTIONS: CompanyOptionCardState[] = [
        {
            imageUrl: "/images/svg/icons/building-grey.svg",
            url: "/business/company/update",
            title: "Company details",
            description: "View and manage anything about your company",
        },
        {
            imageUrl: "/images/svg/icons/user-group-grey.svg",
            url: "/business/company/officers",
            title: "Officers",
            description: "View and manage officers in your company",
        },
    ];

    const handleSearch = (searchTerm: string) => {
        search({ query: searchTerm, categories: ["officers"] });
    };

    const handleClearSearch = () => {
        fetchOfficers({ resetData: true });
    };

    const showSearchForm =
        officers.length > 0 ||
        (searchResults != null && searchResults?.officers?.results?.length > 0) ||
        isLoading ||
        isSearching;

    const currentOfficers = searchResults ? searchResults.officers.results : officers;
    const currentOfficersCount = searchResults ? searchResults.officers.results.length : officers.length;

    const handleOfficerUpdate = (officer: Partial<Officer>) => {
        router.push(`/business/company/officers/edit/${officer.id}`);
    };

    const handleOfficerDelete = (officer: Partial<Officer>) => {
        setOfficerToDelete(officer);
        setShowDeleteModal(true);
    };

    const handleOfficerView = (officer: Partial<Officer>) => {
        router.push(`/business/company/officers/${officer.id}`);
    };

    return (
        <DashboardLayout
            pageTitle="Company"
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "Company", url: "/business/company" },
            ]}
        >
            <div className="container-fluid my-5">
                <Card className="overflow-hidden">
                    <Card.Header className="p-16">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="d-flex gap-2">
                                {company?.logo && (
                                    <Image
                                        src={company?.logo ?? ""}
                                        alt=""
                                        width={44}
                                        height={44}
                                        className="border-radius-4 border border-gray-100 object-fit-cover"
                                    />
                                )}
                                <span>
                                    <p className="tb-body-default-medium m-0">{company?.name}</p>
                                    {company?.website && (
                                        <small className="tb-body-small-regular m-0">
                                            <Link
                                                className="text-decoration-none text-blue-900"
                                                href={`${ensureHttps(company?.website)}`}
                                                target="_blank"
                                            >
                                                {company?.website}
                                            </Link>
                                        </small>
                                    )}
                                </span>
                            </span>
                            <span>
                                <Link href={`/business/company/update`}>
                                    <Button variant="secondary" size="sm" className="p-2 btn tb-body-default-medium">
                                        Update
                                    </Button>
                                </Link>
                            </span>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-16">
                        <div className="d-flex flex-column gap-4">
                            <Row className="g-0">
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Address 1</p>
                                    {company?.addressLine1 ? (
                                        <p className="tb-body-default-medium m-0">{company?.addressLine1}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Address 2</p>
                                    {company?.addressLine2 ? (
                                        <p className="tb-body-default-medium m-0">{company?.addressLine2}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Zipcode</p>
                                    {company?.zipCode ? (
                                        <p className="tb-body-default-medium m-0">{company?.zipCode}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                            </Row>
                            <Row className="g-0">
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">City</p>
                                    {company?.city ? (
                                        <p className="tb-body-default-medium m-0">{company?.city}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">State</p>
                                    {company?.state ? (
                                        <p className="tb-body-default-medium m-0">{company?.state}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Country</p>
                                    {company?.country ? (
                                        <p className="tb-body-default-medium m-0">{company?.country}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                            </Row>
                        </div>
                    </Card.Body>
                    <Card.Footer className="mx-0 px-3">
                        <Row className="g-0">
                            <Col md={4}>
                                <p className="tb-body-small-medium text-gray-400 m-0">Tax ID</p>
                                {company?.taxId ? <p className="tb-body-default-medium m-0">{company?.taxId}</p> : "-"}
                            </Col>
                            {company?.businessIds?.length && (
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">ID Type and Number</p>
                                    {company.businessIds.length
                                        ? company?.businessIds?.map((businessId: NewBusinessId, index: number) => (
                                              <ul className="list-unstyled m-0" key={index}>
                                                  <li className="tb-body-default-medium">
                                                      <span key={index}>{businessId.typeId}</span>
                                                      {", "}
                                                      <span>{businessId.numberId}</span>
                                                  </li>
                                              </ul>
                                          ))
                                        : "-"}
                                </Col>
                            )}
                        </Row>
                    </Card.Footer>
                </Card>

                {(hasStoreData || isLoading || searchResults || isSearching) && (
                    <Card className="overflow-hidden mt-4">
                        <Card.Header className="p-16">
                            <p className="tb-body-default-medium m-0">Officers</p>
                        </Card.Header>
                        <Card.Body className="p-16">
                            <Header
                                buttonText="New Officer"
                                buttonUrl="/business/company/officers/add"
                                showListOrGrid={true}
                                searchPlaceholder="Search officer"
                                listOrGridKey="officer"
                                onSearch={handleSearch}
                                isSearching={isSearching}
                                onClearSearch={handleClearSearch}
                                showSearchForm={showSearchForm}
                                hideContainerClass
                                showBottomBorder={false}
                                noHieght
                            />

                            {searchResults?.officers?.results?.length ? (
                                <div className={`mt-5 mb-4`}>
                                    <p className="m-0">Officers ({searchResults?.officers?.results.length})</p>
                                </div>
                            ) : null}
                        </Card.Body>
                        <Card.Body className="p-0 mt-0 border border-gray-100 border-top border-start-0 border-end-0">
                            {isMobileDevice() || isTabletDevice() || listOrGrid.officer === "grid" ? (
                                <Container fluid className="ps-3">
                                    <InfiniteScroll
                                        dataLength={currentOfficersCount}
                                        next={loadMoreOfficers}
                                        hasMore={searchResults ? isSearching : hasMore}
                                        loader={
                                            <div className="text-center my-5 py-5">
                                                <Spinner />
                                            </div>
                                        }
                                    >
                                        {currentOfficers.length ? (
                                            <Row className={`g-4 my-2 p-0`}>
                                                {currentOfficers.map((officer: Partial<Officer>, index: number) => (
                                                    <Col sm={12} md={3} key={index}>
                                                        {isMobileDevice() || isTabletDevice() ? (
                                                            <OfficerCard
                                                                officer={officer}
                                                                onUpdate={() => handleOfficerUpdate(officer)}
                                                                onDelete={() => handleOfficerDelete(officer)}
                                                            />
                                                        ) : (
                                                            <OfficerCardSmall
                                                                officer={officer}
                                                                onUpdate={() => handleOfficerUpdate(officer)}
                                                                onDelete={() => handleOfficerDelete(officer)}
                                                            />
                                                        )}
                                                    </Col>
                                                ))}
                                            </Row>
                                        ) : null}
                                    </InfiniteScroll>
                                </Container>
                            ) : (
                                (currentOfficers.length || isLoading) && (
                                    <Row className={searchResults?.officers?.results?.length ? "mt-4" : ""}>
                                        <Col className="">
                                            <Card
                                                className={`overflow-hidden rounded-0 border-0 ${
                                                    isLoading || isSearching ? "border-0" : ""
                                                }`}
                                            >
                                                <div className="mt-4">
                                                    <DataTableComponent
                                                        columns={tableColumns()}
                                                        data={currentOfficers}
                                                        paginationTotalRows={
                                                            searchResults?.officers?.results.length ?? totalRows
                                                        }
                                                        onChangePage={onTablePageChange}
                                                        progressPending={isLoading}
                                                        paginationRowsPerPageOptions={
                                                            searchResults
                                                                ? [searchResults?.officers?.results.length]
                                                                : [15]
                                                        }
                                                        paginationPerPage={
                                                            searchResults?.officers?.results.length ?? null
                                                        }
                                                        onRowClicked={handleOfficerView}
                                                    />
                                                </div>
                                            </Card>
                                        </Col>
                                    </Row>
                                )
                            )}
                        </Card.Body>
                    </Card>
                )}

                <DeleteModal
                    showModal={showDeleteModal}
                    setShowModal={setShowDeleteModal}
                    dataToDeleteName={"Officer"}
                    isDeleting={isDeleting}
                    onYesDelete={() => deleteOfficer()}
                />

                {getUrlQuery("query") && !searchResults?.officers?.results?.length && !isLoading && !isSearching && (
                    <EmptyState
                        icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                        headerText={`No Results Found`}
                        descriptionText={`"${getUrlQuery("query")}" did not match any data. Please try again.`}
                    />
                )}

                {!getUrlQuery("query") && shouldShowEmptyState && pageReady && (
                    <EmptyState
                        icon={<UserAndBag width={80} height={80} />}
                        headerText="No Officers"
                        descriptionText="Officers added can be managed here"
                        buttonText="New Officer"
                        buttonUrl="/business/company/officers/add"
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
