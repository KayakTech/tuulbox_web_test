import DashboardLayout from "@/components/DashboardLayout";
import DeleteModal from "@/components/DeleteModal";
import { useEffect, useReducer, useState } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Iconly } from "react-iconly";
import Link from "next/link";
import PageLoader from "@/components/PageLoader";
import DI from "@/di-container";
import { useRouter } from "next/router";
import { Project } from "@/repositories/project-repository";
import ProjectDocumentSection from "@/components/ProjectDocumentSection";
import Image from "next/image";
import ProfileItem from "@/components/ProfileItem";
import { Contact } from "@/repositories/contact-repositories";

export default function ProjectView() {
    const router = useRouter();
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [projectId, setProjectId] = useState<string>("");
    const [project, dispatch] = useReducer((state: any, newState: Partial<Project>) => ({ ...state, ...newState }), {
        id: "",
        name: "",
        owner: "",
        addressLine1: "",
        contact: "",
        email: "",
    });

    function deleteProject() {
        setIsDeleting(true);
        try {
            const res = DI.projectService.deleteProject(project.id);
            router.push("/projects");
        } catch (error) {
            setIsDeleting(false);
        }
    }

    async function getProject(projectId: string) {
        setIsLoading(true);
        try {
            const res = await DI.projectService.getProject(projectId);
            dispatch({
                id: res.id,
                name: res.name,
                owner: res.owner,
                addressLine1: res.addressLine1,
                contact: res.contact,
                email: res.email,
            });
            setIsLoading(false);
        } catch (error) {
            router.push("/projects");
        }
    }

    useEffect(() => {
        const id = window.location.pathname.split("/")[3];
        setProjectId(id);
        getProject(id);
    }, []);

    return (
        <DashboardLayout
            pageTitle="Add Project"
            breadCrumbs={[{ name: "Projects", url: "/projects" }, { name: "Project Details" }]}
        >
            {isLoading ? (
                <PageLoader />
            ) : (
                <>
                    <Row className="g-3">
                        <Col lg={3} className="d-none d-md-block">
                            <Card className="project-card border-0">
                                <Card.Body className="d-flex align-items-center bg-grey justify-content-center h-100">
                                    <Iconly set="light" name="Work" primaryColor="black" size={64} />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={9} className="d-flex flex-column justify-content-between pt-0 pt-md-4">
                            <h4 className="mb-0">{project.name}</h4>
                            <Row className="mt-4 mt-md-0">
                                <Col lg={8}>
                                    <Row className="g-3">
                                        <Col lg={6}>
                                            <ProfileItem
                                                imageUrl="/images/svg/icons/user-grey.svg"
                                                text1="Owner"
                                                text2={project.owner}
                                            />
                                        </Col>
                                        <Col lg={6}>
                                            <ProfileItem
                                                imageUrl="/images/svg/icons/envelope.svg"
                                                text1="Email"
                                                text2={project.email.toLowerCase()}
                                            />
                                        </Col>
                                        <Col lg={6}>
                                            <ProfileItem
                                                imageUrl="/images/svg/icons/telephone.svg"
                                                text1="Contact"
                                                text2={project.contact}
                                            />
                                        </Col>
                                        <Col lg={6}>
                                            <ProfileItem
                                                imageUrl="/images/svg/icons/location-marker.svg"
                                                text1="Address"
                                                text2={project.addressLine1}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            <div className="d-flex">
                                <Button
                                    variant="outline-secondary"
                                    className="float-md-end mt-4 mt-md-0 me-3 px-4 d-flex align-items-center"
                                    onClick={() => setShowDeleteProjectModal(true)}
                                >
                                    <Iconly name="Delete" set="light" size={20} primaryColor="" />{" "}
                                    <span className="ms-2">Delete</span>
                                </Button>

                                <Link href={`/projects/edit/${project.id}`}>
                                    <Button
                                        variant="outline-secondary"
                                        className="float-md-end mt-4 mt-md-0 px-4 d-flex align-items-center"
                                    >
                                        <Iconly set="light" name="Edit" /> <span className="ms-2">Update</span>
                                    </Button>
                                </Link>
                            </div>
                        </Col>
                    </Row>

                    <DeleteModal
                        showModal={showDeleteProjectModal}
                        setShowModal={(value: boolean) => setShowDeleteProjectModal(value)}
                        dataToDeleteName={"Project"}
                        isDeleting={isDeleting}
                        onYesDelete={deleteProject}
                        message="Are you sure you want to proceed? Please note that this action will cause you to lose all data associated with this project."
                    />

                    <ProjectDocumentSection
                        projectId={projectId}
                        project={project}
                        invitationsSent={undefined}
                        invitedUsers={[]}
                        onUpdateInvitedUsers={() => {}}
                        onRevokeInvite={() => {}}
                        onArchiveProject={() => {}}
                        onAddProjectToFavorites={() => {}}
                        onDeleteProject={() => {}}
                    />
                </>
            )}
        </DashboardLayout>
    );
}
