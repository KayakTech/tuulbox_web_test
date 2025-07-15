import ContactDocument from "@/components/ContactDocument";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteModal from "@/components/DeleteModal";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import PageLoader from "@/components/PageLoader";
import ProjectGalleryListItem from "@/components/ProjectGalleryListItem";
import { convertCamelCaseToSentenceCase, convertCamelToHyphenated } from "@/helpers";
import { DATA_TABLE_CUSTOM_STYLES, PROJECT_DOCUMENT_MENU } from "@/helpers/constants";
import useProject from "@/hooks/project";
import useSubcontractors from "@/hooks/subContractors";
import { ProjectDocumentCategories, ProjectDocumentType } from "@/repositories/project-repository";
import { ProjectSubcontractor, Subcontractor } from "@/repositories/subcontractor-repository";
import { RootState } from "@/store";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { ArrowRight2, CloudAdd, CloudNotif, CloudPlus, GalleryAdd } from "iconsax-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import DataTable from "react-data-table-component";
import Lightbox from "react-image-lightbox";
import { useSelector } from "react-redux";
import ContactCard from "./ContactCard";

export default function AllProjectSubcontractors() {
    const { dataDisplayLayout, listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const {
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
        isCreatorOfProject,
    } = useProject({});

    const { getAllProjectSubcontractors, allProjectSubcontractors, isLoading, tableColumns } = useSubcontractors({});

    useEffect(() => {
        getAllProjectSubcontractors();
    }, []);

    return (
        <DashboardLayout
            breadCrumbs={[
                { name: "Projects", url: "/projects" },
                { name: convertCamelCaseToSentenceCase(projectDocumentCategory()) },
            ]}
            pageTitle="Projects"
        >
            {isLoading ? (
                <PageLoader />
            ) : allProjectSubcontractors?.length ? (
                <>
                    <Header buttonUrl={`/projects/`} searchPlaceholder="Search File" showListOrGrid={false} />
                    {allProjectSubcontractors.map((project: ProjectSubcontractor, index: number) =>
                        project.subcontractors.length ? (
                            <div key={index} className="mb-5">
                                <Container fluid className="py-4">
                                    <div className="d-flex justify-content-between mb-4">
                                        <p className=" m-0 d-flex gap-1">
                                            <span className="text-muted tb-body-large-regular">Found in</span>
                                            <span className="tb-title-body-medium text-gray-900">
                                                {project.projectName}
                                            </span>
                                        </p>
                                        <Link
                                            href={`/projects/${
                                                project.projectId
                                            }?action=list&activeMenu=${projectDocumentCategoryPath()}`}
                                            className="text-decoration-none tb-body-default-medium d-flex gap-2 align-items-center"
                                        >
                                            See all <ArrowRight2 size={12} />
                                        </Link>
                                    </div>

                                    <Row>
                                        {project.subcontractors.slice(0, 2).map((subcontractor: Subcontractor) => (
                                            <Col md={3} key={subcontractor.id}>
                                                <ContactCard contact={subcontractor.contact} isViewOnly />
                                            </Col>
                                        ))}
                                    </Row>
                                </Container>
                            </div>
                        ) : null,
                    )}

                    <DeleteModal
                        showModal={showDeleteDocumentModal}
                        setShowModal={(value: boolean) => setShowDeleteDocumentModal(value)}
                        dataToDeleteName={"subcontractor"}
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
            ) : (
                <EmptyState
                    icon={projectDocumentCategoryIcon(projectDocumentCategory())}
                    headerText={`No Sub Contractors`}
                    descriptionText={`Sub Contractors added can be managed here`}
                />
            )}
        </DashboardLayout>
    );
}
