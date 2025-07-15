import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Container, Dropdown } from "react-bootstrap";
import { useEffect } from "react";
import EmptyState from "@/components/EmptyState";
import PageLoader from "@/components/PageLoader";
import Header from "@/components/Header";
import DeleteModal from "@/components/DeleteModal";
import { ArrowDown2, Refresh, SearchNormal1 } from "iconsax-react";
import useRecents from "@/hooks/recents";
import { RecentActivity, RecentActivityDestructuredObject } from "@/repositories/recent-repository";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { convertCamelCaseToSentenceCase, getUrlQuery } from "@/helpers";
import OverviewRecentsCard from "@/components/OverviewRecentsCard";

export default function Recents() {
    const {
        isLoading,
        getRecentActivities,
        recentActivities,
        showDeleteModal,
        setShowDeleteModal,
        deleteRecentActivity,
        isDeleting,
        onSort,
        sorting,
        search,
        isSearching,
        setIsLoading,
        pageReady,
        setRecentActivities,
        processSearchResults,
        hasActiveSearch,
        clearSearch,
    } = useRecents();
    const { searchResults } = useSelector((state: RootState) => state.searchResults);

    useEffect(() => {
        if (getUrlQuery("query")) {
            setIsLoading(true);
            search({ query: `${getUrlQuery("query")}`, categories: ["recents"] });
            return;
        }
        getRecentActivities();
    }, []);

    useEffect(() => {
        if (getUrlQuery("query") && pageReady.current) {
            if (searchResults?.recents?.results?.length) {
                processSearchResults(searchResults.recents.results);
            } else {
                setRecentActivities(undefined);
            }
            setIsLoading(false);
            return;
        }

        if (pageReady.current && !getUrlQuery("query") && !hasActiveSearch) {
            getRecentActivities();
        }
    }, [searchResults?.recents?.results, pageReady.current, hasActiveSearch]);

    useEffect(() => {
        const currentQuery = getUrlQuery("query");
        if (!currentQuery && hasActiveSearch && !isSearching) {
            clearSearch();
        }
    }, [hasActiveSearch, isSearching]);

    function dayHasData(activity: any) {
        let count = 0;
        if (activity) {
            Object.keys(activity).forEach(key => {
                if (typeof activity[key] === "object") {
                    count = count + activity[key].results?.length;
                }
            });
        }
        return count > 0;
    }

    function hasRecentActivity(activities: any) {
        let count = 0;
        if (activities) {
            Object.keys(activities).forEach(key => {
                count = count + activities[key]?.length;
            });
        }

        return count > 0;
    }

    return (
        <DashboardLayout
            pageTitle="Recent"
            breadCrumbs={[{ name: "Recent", url: "/recents" }]}
            onSearch={(searchTerm: string) => search({ query: searchTerm, categories: ["recents"] })}
        >
            {(getUrlQuery("query") || (hasRecentActivity(recentActivities) && !getUrlQuery("query"))) && (
                <Header
                    searchPlaceholder="Search Recent"
                    showListOrGrid={false}
                    listOrGridKey="recents"
                    onSearch={(searchTerm: string) => search({ query: searchTerm, categories: ["recents"] })}
                    isSearching={isSearching}
                    onClearSearch={() => {
                        clearSearch();
                        getRecentActivities();
                    }}
                />
            )}

            {getUrlQuery("query") && searchResults?.recents?.results?.length && !isSearching && !isLoading ? (
                <Container fluid className={`mt-4`}>
                    <p className="m-0">Recents ({searchResults?.recents?.results.length})</p>
                </Container>
            ) : null}

            {isLoading || isSearching ? (
                <PageLoader />
            ) : recentActivities && hasRecentActivity(recentActivities) ? (
                <>
                    {!getUrlQuery("query") && (
                        <nav className="border-bottom mb-0 border-gray-100 py-3">
                            <Container fluid className="w-100">
                                <div className="d-flex justify-content-between">
                                    <span className="d-flex align-items-center ms-auto">
                                        <span className="me-2 tb-title-body-medium text-gray-600">Sort By</span>
                                        <Dropdown className="text-end border-primary border-radius-8 border">
                                            <Dropdown.Toggle
                                                variant="outline-primary"
                                                as={"button"}
                                                className="btn d-flex align-items-center justify-content-between gap-2 py-1 tb-body-default-regular"
                                                style={{ width: "180px" }}
                                            >
                                                {sorting} <ArrowDown2 size={12} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu align={`end`} className="px-8">
                                                <Dropdown.Item onClick={() => onSort("Newest")}>
                                                    <span className="tb-body-default-regular">Newest</span>
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => onSort("Oldest")}>
                                                    <span className="tb-body-default-regular">Oldest</span>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </span>
                                </div>
                            </Container>
                        </nav>
                    )}

                    <Container fluid className="my-4">
                        {Object.entries(recentActivities).map(([key, activity]) => (
                            <div key={key} className="mb-5">
                                {Array.isArray(activity) && activity.length > 0 && (
                                    <>
                                        <div className="d-flex justify-content-between mb-4">
                                            <p className="">
                                                Last opened{" "}
                                                <span className="fw-bolder text-capitalize">
                                                    {convertCamelCaseToSentenceCase(key)}
                                                </span>
                                            </p>
                                        </div>
                                        <Row className="g-3">
                                            {activity.map((recent: RecentActivity, index: number) =>
                                                recent?.originalObject && !Array.isArray(recent.originalObject) ? (
                                                    <Col xs={12} sm={12} md={3} xl={3} key={index}>
                                                        <OverviewRecentsCard recent={recent} />
                                                    </Col>
                                                ) : null,
                                            )}
                                        </Row>
                                    </>
                                )}
                            </div>
                        ))}
                    </Container>

                    <DeleteModal
                        showModal={showDeleteModal}
                        setShowModal={value => setShowDeleteModal(value)}
                        dataToDeleteName={"Recent Activity"}
                        isDeleting={isDeleting}
                        onYesDelete={deleteRecentActivity}
                        message="Are you sure you want to delete recent activity? This action cannot be undone"
                    />
                </>
            ) : getUrlQuery("query") ? (
                <EmptyState
                    icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                    headerText={`No Results Found`}
                    descriptionText={`"${getUrlQuery("query")}" did not match any data. Please try again.`}
                />
            ) : (
                <EmptyState
                    icon={<Refresh size={80} color="#B0B0B0" variant="Outline" />}
                    headerText="No Recents"
                    descriptionText="Easily access recent files and links from here"
                />
            )}
        </DashboardLayout>
    );
}
