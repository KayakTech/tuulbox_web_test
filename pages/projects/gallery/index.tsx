import ContactDocument from "@/components/ContactDocument";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteModal from "@/components/DeleteModal";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import PageLoader from "@/components/PageLoader";
import ProjectGalleryListItem from "@/components/ProjectGalleryListItem";
import { PROJECT_DOCUMENT_MENU } from "@/helpers/constants";
import useProject from "@/hooks/project";
import { ProjectDocumentType } from "@/repositories/project-repository";
import { RootState } from "@/store";
import { ArrowRight2, GalleryAdd } from "iconsax-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useSelector } from "react-redux";

export default function ProjectGallery() {
    const { dataDisplayLayout } = useSelector((state: RootState) => state.dataDisplayLayout);
    const {
        isLoading,
        getAllProjectDocuments,
        allProjectDocuments,
        showDeleteProjectModal,
        setShowDeleteProjectModal,
        showDeleteDocumentModal,
        setShowDeleteDocumentModal,
        isDeleting,
        onDeleteProjectDocument,
        documentToDelete,
        triggerDeleteDocumentModal,
    } = useProject({});
    const router = useRouter();

    useEffect(() => {
        getAllProjectDocuments({ category: "gallery" });
    }, []);

    useEffect(() => {
        getAllProjectDocuments({ category: "gallery" });
    }, [dataDisplayLayout]);

    return (
        <DashboardLayout
            breadCrumbs={[{ name: "Projects", url: "/projects" }, { name: "Gallery" }]}
            pageTitle="Projects"
        >
            {isLoading ? (
                <PageLoader />
            ) : allProjectDocuments?.length ? (
                <>
                    <Header
                        buttonText="New Photo"
                        buttonUrl={`/projects/`}
                        searchPlaceholder="Search File"
                        showListOrGrid
                    />
                    <Container fluid className="py-4">
                        {allProjectDocuments.map((document, index) => (
                            <div key={index} className="mb-5">
                                <div className="d-flex justify-content-between mb-4">
                                    <p className="fs-20 m-0">
                                        <span className="text-muted tb-body-large-regular">
                                            Found in{" "}
                                            <span className="text-gray-800 tb-title-body-medium">{document.name}</span>
                                        </span>
                                    </p>
                                    <Link
                                        href={`/projects/${document.id}?activeMenu=gallery`}
                                        className="text-decoration-none text-gray-900 tb-body-default-medium"
                                    >
                                        See all <ArrowRight2 size={12} />
                                    </Link>
                                </div>
                                {dataDisplayLayout === "grid" ? (
                                    <Row className="g-4">
                                        {document?.files?.slice(0, 4).map((doc: ProjectDocumentType, i: number) => (
                                            <Col md={3} key={`a-${i}`}>
                                                <ContactDocument
                                                    fileType="project-document"
                                                    file={doc.file}
                                                    onUpdate={() =>
                                                        router.push(
                                                            `/projects/${document.id}?activeMenu=gallery&action=edit&fileId=${doc.id}`,
                                                        )
                                                    }
                                                    onDelete={document => triggerDeleteDocumentModal(doc)}
                                                    isGallery={true}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                ) : (
                                    <ul className="list-unstyled gap-5 d-flex flex-column ">
                                        {document?.files?.slice(0, 2).map((doc: ProjectDocumentType, x: number) => (
                                            <li key={`b-${x}`}>
                                                <ProjectGalleryListItem
                                                    photo={doc}
                                                    addToFavorites={() => {}}
                                                    onDelete={() => triggerDeleteDocumentModal(doc)}
                                                    handleUpdate={() =>
                                                        router.push(
                                                            `/projects/${document.id}?activeMenu=gallery&action=edit&fileId=${doc.id}`,
                                                        )
                                                    }
                                                    activeMenu={PROJECT_DOCUMENT_MENU[11]}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                        <DeleteModal
                            showModal={showDeleteDocumentModal}
                            setShowModal={(value: boolean) => setShowDeleteDocumentModal(value)}
                            dataToDeleteName={"photo"}
                            isDeleting={isDeleting}
                            onYesDelete={() =>
                                onDeleteProjectDocument(documentToDelete, "gallery", documentToDelete?.project)
                            }
                        />
                    </Container>
                </>
            ) : (
                <EmptyState
                    icon={<GalleryAdd size={56} color="#B0B0B0" />}
                    headerText={`No Photos`}
                    descriptionText={`Photos added to project can be managed here`}
                    buttonText="New Photo"
                    buttonUrl="/projects"
                />
            )}
        </DashboardLayout>
    );
}
