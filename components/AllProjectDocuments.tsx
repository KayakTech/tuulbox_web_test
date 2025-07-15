import ContactDocument from "@/components/ContactDocument";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteModal from "@/components/DeleteModal";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import PageLoader from "@/components/PageLoader";
import ProjectGalleryListItem from "@/components/ProjectGalleryListItem";
import { convertCamelCaseToSentenceCase, getUrlQuery, isMobileDevice } from "@/helpers";
import { DATA_TABLE_CUSTOM_STYLES, PROJECT_DOCUMENT_MENU } from "@/helpers/constants";
import useProject from "@/hooks/project";
import {
    ProjectDocumentCategories,
    ProjectDocumentCategoriesPlural,
    ProjectDocumentType,
} from "@/repositories/project-repository";
import { RootState } from "@/store";
import { ArrowRight2, SearchNormal1 } from "iconsax-react";
import Link from "next/link";
import { useEffect } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { MyToast } from "./MyToast";
import useSearchForm from "@/hooks/searchForm";
import { SearchResult } from "@/repositories/search-repository";

export default function AllProjectDocuments() {
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { search, isSearching, setIsSearching } = useSearchForm();

    const {
        isLoading,
        getAllProjectDocuments,
        allProjectDocuments,
        showDeleteDocumentModal,
        setShowDeleteDocumentModal,
        isDeleting,
        onDeleteProjectDocument,
        documentToDelete,
        triggerDeleteDocumentModal,
        projectDocumentCategory,
        router,
        viewDocumentFile,
        projectDocumentCategoryPath,
        projectDocumentTable,
        projectDocumentCategoryIcon,
        addToFavorites,
        showToast,
        processProjectDocumentsSearchResults,
        projectDocuments,
        setProjectDocuments,
    } = useProject({});

    function fetchData() {
        setProjectDocuments([]);
        getAllProjectDocuments({ category: projectDocumentCategory() });
    }

    useEffect(() => {
        const query = getUrlQuery("query");
        if (query) {
            search({ query: query, categories: [searchKey()] });
            return;
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (projectDocumentCategory() === "gallery" && !getUrlQuery("query")) {
            fetchData();
        }
    }, [listOrGrid.projectDocument]);

    useEffect(() => {
        fetchData();
    }, [router]);

    useEffect(() => {
        if (searchResults && searchResults[searchResultsKey() as keyof SearchResult]?.results?.length) {
            processProjectDocumentsSearchResults({
                results: searchResults[searchResultsKey() as keyof SearchResult]?.results,
                activeMenu: { category: projectDocumentCategory() },
            });
        }
    }, [searchResults]);

    function searchKey() {
        if (projectDocumentCategory() === ProjectDocumentCategories.planAndElevation) {
            return ProjectDocumentCategoriesPlural.planAndElevations;
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.permit) {
            return ProjectDocumentCategoriesPlural.permits;
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.estimate) {
            return ProjectDocumentCategoriesPlural.estimates;
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.contract) {
            return ProjectDocumentCategoriesPlural.contracts;
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.changeOrder) {
            return ProjectDocumentCategoriesPlural.changeOrders;
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.paymentSchedule) {
            return ProjectDocumentCategoriesPlural.paymentSchedules;
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.performanceSchedule) {
            return ProjectDocumentCategoriesPlural.performanceSchedules;
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.specification) {
            return ProjectDocumentCategoriesPlural.specifications;
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.gallery) {
            return ProjectDocumentCategoriesPlural.gallery;
        }

        return projectDocumentCategory();
    }

    function searchResultsKey() {
        if (projectDocumentCategory() === ProjectDocumentCategories.planAndElevation) {
            return "planAndElevations";
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.permit) {
            return "permits";
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.estimate) {
            return "estimates";
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.contract) {
            return "contracts";
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.changeOrder) {
            return "changeOrders";
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.paymentSchedule) {
            return "paymentSchedules";
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.performanceSchedule) {
            return "performanceSchedules";
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.specification) {
            return "specifications";
        }

        if (projectDocumentCategory() === ProjectDocumentCategories.gallery) {
            return "galleries";
        }
        return undefined;
    }

    return (
        <DashboardLayout
            breadCrumbs={[
                { name: "Projects", url: "/projects" },
                { name: convertCamelCaseToSentenceCase(projectDocumentCategory()) },
            ]}
            pageTitle="Projects"
        >
            {(getUrlQuery("query") || (allProjectDocuments.length > 0 && !getUrlQuery("query"))) && (
                <Header
                    // buttonUrl={`/projects/`}
                    searchPlaceholder="Search File"
                    showListOrGrid={allProjectDocuments.length > 0}
                    listOrGridKey="projectDocument"
                    onSearch={(searchTerm: string) => search({ query: searchTerm, categories: [searchKey()] })}
                    isSearching={isSearching}
                    onClearSearch={fetchData}
                />
            )}

            {searchResultsKey() &&
            searchResults &&
            searchResults[searchResultsKey() as keyof SearchResult]?.results?.length ? (
                <Container fluid className={`mt-4`}>
                    <p className="m-0">
                        {convertCamelCaseToSentenceCase(projectDocumentCategory())} (
                        {searchResults[searchResultsKey() as keyof SearchResult]?.results?.length})
                    </p>
                </Container>
            ) : null}

            {isLoading || isSearching ? (
                <PageLoader />
            ) : // Search Results
            getUrlQuery("query") && projectDocuments?.length ? (
                listOrGrid.projectDocument === "grid" || isMobileDevice() ? (
                    <Container fluid className="py-4">
                        <Row className="g-4">
                            {projectDocuments.map((doc: any, i: number) => (
                                <Col md={3} sm={4} xl={4} xxl={4} key={`a-${i}`} className="contactMobile-card">
                                    <ContactDocument
                                        fileType="project-document"
                                        file={doc.file}
                                        onUpdate={() =>
                                            router.push(
                                                `/projects/${
                                                    doc.project
                                                }?activeMenu=${projectDocumentCategoryPath()}&action=edit&fileId=${
                                                    doc.id
                                                }`,
                                            )
                                        }
                                        onItemClick={file => {
                                            viewDocumentFile(doc);
                                        }}
                                        onDelete={document => triggerDeleteDocumentModal(doc)}
                                        isGallery={projectDocumentCategory() === ProjectDocumentCategories.gallery}
                                        addToFavorites={addToFavorites}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Container>
                ) : (
                    <Container fluid className="py-4">
                        <ul className="list-unstyled gap-5 d-flex flex-column mt-4">
                            {projectDocuments.map((doc: any, x: number) => (
                                <li key={`b-${x}`}>
                                    <ProjectGalleryListItem
                                        photo={doc}
                                        addToFavorites={addToFavorites}
                                        onDelete={() => triggerDeleteDocumentModal(doc)}
                                        handleUpdate={() =>
                                            router.push(
                                                `/projects/${
                                                    doc.project
                                                }?activeMenu=${projectDocumentCategoryPath()}&action=edit&fileId=${
                                                    doc.id
                                                }`,
                                            )
                                        }
                                        onViewImage={imge => {
                                            viewDocumentFile(doc);
                                        }}
                                        activeMenu={PROJECT_DOCUMENT_MENU.find(
                                            projectDocument => projectDocument.category === projectDocumentCategory(),
                                        )}
                                        isPrivate={doc?.visibility === "private"}
                                    />
                                </li>
                            ))}
                        </ul>
                    </Container>
                )
            ) : // Normal results
            !getUrlQuery("query") && allProjectDocuments?.length ? (
                <>
                    {allProjectDocuments.map((document: any, index: number) => (
                        <div key={index} className="mb-5">
                            <Container fluid className="py-4">
                                <div className="d-flex justify-content-between mb-4">
                                    <p className="fs-20 m-0">
                                        <span className="text-muted tb-body-large-regular">
                                            Found in{" "}
                                            <span className="text-gray-800 tb-title-body-medium">{document.name}</span>
                                        </span>
                                    </p>
                                    <Link
                                        href={`/projects/${document.id}?activeMenu=${projectDocumentCategoryPath()}`}
                                        className="text-decoration-none d-flex align-items-center gap-2 text-gray-900 tb-body-default-medium"
                                    >
                                        See all <ArrowRight2 size={12} color="#333333" />
                                    </Link>
                                </div>
                            </Container>
                            {listOrGrid.projectDocument === "grid" || isMobileDevice() ? (
                                <Container fluid className="py-4">
                                    <Row className="g-4">
                                        {document?.files?.slice(0, 4).map((doc: ProjectDocumentType, i: number) => (
                                            <Col
                                                md={3}
                                                sm={12}
                                                lg={3}
                                                xxl={4}
                                                key={`a-${i}`}
                                                className="contactMobile-card d-flex justify-content-center w-332"
                                            >
                                                <ContactDocument
                                                    fileType="project-document"
                                                    file={doc.file}
                                                    onUpdate={() =>
                                                        router.push(
                                                            `/projects/${
                                                                document.id
                                                            }?activeMenu=${projectDocumentCategoryPath()}&action=edit&fileId=${
                                                                doc.id
                                                            }`,
                                                        )
                                                    }
                                                    onItemClick={file => {
                                                        viewDocumentFile(doc);
                                                    }}
                                                    onDelete={document => triggerDeleteDocumentModal(doc)}
                                                    isGallery={
                                                        projectDocumentCategory() === ProjectDocumentCategories.gallery
                                                    }
                                                    addToFavorites={addToFavorites}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </Container>
                            ) : projectDocumentCategory() === "gallery" || isMobileDevice() ? (
                                <Container fluid className="py-4">
                                    <ul className="list-unstyled gap-5 d-flex flex-column">
                                        {document?.files?.slice(0, 2).map((doc: ProjectDocumentType, x: number) => (
                                            <li key={`b-${x}`}>
                                                <ProjectGalleryListItem
                                                    photo={doc}
                                                    addToFavorites={addToFavorites}
                                                    onDelete={() => triggerDeleteDocumentModal(doc)}
                                                    handleUpdate={() =>
                                                        router.push(
                                                            `/projects/${
                                                                document.id
                                                            }?activeMenu=${projectDocumentCategoryPath()}&action=edit&fileId=${
                                                                doc.id
                                                            }`,
                                                        )
                                                    }
                                                    onViewImage={imge => {
                                                        viewDocumentFile(doc);
                                                    }}
                                                    activeMenu={PROJECT_DOCUMENT_MENU.find(
                                                        projectDocument =>
                                                            projectDocument.category === projectDocumentCategory(),
                                                    )}
                                                    isPrivate={doc?.visibility === "private"}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </Container>
                            ) : (
                                <Row className="">
                                    <Col>
                                        <Card className="overflow-visible rounded-0 border-top-0">
                                            <DataTable
                                                columns={projectDocumentTable()}
                                                data={document?.files?.slice(0, 2)}
                                                customStyles={DATA_TABLE_CUSTOM_STYLES}
                                                //@ts-ignore
                                                onRowClicked={doc => viewDocumentFile(doc)}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            )}
                        </div>
                    ))}
                    <DeleteModal
                        showModal={showDeleteDocumentModal}
                        setShowModal={(value: boolean) => setShowDeleteDocumentModal(value)}
                        dataToDeleteName={"photo"}
                        isDeleting={isDeleting}
                        onYesDelete={() =>
                            onDeleteProjectDocument(
                                documentToDelete,
                                projectDocumentCategory(),
                                documentToDelete?.project,
                            )
                        }
                    />
                </>
            ) : searchResults &&
              !searchResults[searchResultsKey() as keyof SearchResult]?.results?.length &&
              !isLoading &&
              !isSearching ? (
                <EmptyState
                    icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                    headerText={`No Results Found`}
                    descriptionText={`"${getUrlQuery("query")}" did not match any data. Please try again.`}
                />
            ) : (
                <EmptyState
                    icon={projectDocumentCategoryIcon(projectDocumentCategory())}
                    headerText={`No ${projectDocumentCategory() === "gallery" ? "Photos" : "Document"} uploaded here`}
                    descriptionText={`${
                        projectDocumentCategory() === "gallery" ? "Photos" : "Documents"
                    } added can be managed here`}
                />
            )}
        </DashboardLayout>
    );
}
