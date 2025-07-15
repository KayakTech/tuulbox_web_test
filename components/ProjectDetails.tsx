import DeleteModal from "@/components/DeleteModal";
import { useEffect, useMemo } from "react";
import { Row, Col, Card, Container } from "react-bootstrap";
import PageLoader from "@/components/PageLoader";
import ProjectDocumentSection from "@/components/ProjectDocumentSection";
import useProject from "@/hooks/project";
import ProjectNotFound from "./ProjectNotFound";
import ShareProjectModal from "./ShareProjectModal";
import ProjectShareSuccessModal from "./ProjectShareSuccessModal";
import React from "react";
import { isMobileDevice, isTabletDevice } from "@/helpers";
import ProjectSubMenuMobile from "./ProjectSubMenuMobile";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useProjectDetail from "@/hooks/useProjectDetail";

type ProjectDetailsProps = {
    id: string;
    onSetProjectName?: (projectName: string) => void;
};

export default function ProjectDetails(props: ProjectDetailsProps) {
    const { id, onSetProjectName } = props;

    const { activeProjects, archivedProjects } = useSelector((state: RootState) => state.projects);

    const projectFromStore = useMemo(() => {
        const allProjects = [...activeProjects.data, ...archivedProjects.data];
        return allProjects.find(project => project.id === id);
    }, [activeProjects.data, archivedProjects.data, id]);

    const { projectDetail: detailedProject, isLoading: isLoadingDetails, error: detailError } = useProjectDetail(id);

    const {
        showDeleteProjectModal,
        setShowDeleteProjectModal,
        isDeleting,
        projectId,
        setProjectId,
        project,
        deleteProject,
        getProject,
        isLoading,
        showShareProjectModal,
        setShowShareProjectModal,
        handleProjectShareOrInvite,
        isSubmitting,
        showProjectShareSuccessModal,
        setShowProjectShareSuccessModal,
        permissionId,
        selectedContacts,
        setSelectedContacts,
        triggerShareProjectModal,
        selectedModules,
        setSelectedModules,
        getShareSent,
        getInvitationsSent,
        invitationsSent,
        isSharing,
        setIsSharing,
        triggerRevokeModal,
        setShowRevokeModal,
        showRevokeModal,
        revokeAccess,
        invitedUsers,
        isUpdating,
        setIsUpdating,
        errorMessage,
        setErrorMessage,
        sharedLink,
        router,
        triggerDeleteModal,
        triggerArchiveModal,
        showArchiveProjectModal,
        setShowArchiveProjectModal,
        archiveProject,
        dataToDelete,
        addToFavorites,
    } = useProject({});

    const shouldShowLoading = isLoading && !projectFromStore;

    // render project data from store as fallback while detailed project loads
    const displayProject = project?.id ? project : projectFromStore;

    useEffect(() => {
        setProjectId(id);

        // Always fetch detailed project data, but silently if we have store data
        let initialFunctions = [getProject(id)];

        if (displayProject && !displayProject.isShared) {
            initialFunctions.unshift(...[getShareSent(id), getInvitationsSent(id)]);
        } else if (!displayProject) {
        }

        Promise.all(initialFunctions);
    }, [id]);

    useEffect(() => {
        if (displayProject && !displayProject.isShared && (!invitationsSent || invitationsSent.length === 0)) {
            Promise.all([getShareSent(id), getInvitationsSent(id)]);
        }
    }, [displayProject?.isShared]);

    useEffect(() => {
        if (displayProject?.name) {
            onSetProjectName && onSetProjectName(displayProject.name);
        }
    }, [displayProject?.name]);

    return (
        <>
            <div>
                {shouldShowLoading ? (
                    <div className="d-flex justify-content-center align-items-center vh-100">
                        <PageLoader />
                    </div>
                ) : displayProject?.id ? (
                    <div
                        className={`${displayProject.isShared ? "min-vh-80" : "min-vh-95"} ${
                            isMobileDevice() || isTabletDevice() ? "bg-gray-50" : ""
                        }  d-flex flex-column`}
                    >
                        <div className={"flex-grow-1 d-flex flex-column"}>
                            {isMobileDevice() || isTabletDevice() ? (
                                <Container fluid className="">
                                    <ProjectSubMenuMobile
                                        projectId={projectId}
                                        project={displayProject}
                                        isShared={displayProject.isShared}
                                    />
                                </Container>
                            ) : (
                                <ProjectDocumentSection
                                    projectId={projectId}
                                    project={displayProject}
                                    isShared={displayProject.isShared}
                                    detailedProject={detailedProject}
                                    isLoadingDetails={isLoadingDetails}
                                    inviteUser={() =>
                                        triggerShareProjectModal({ project: displayProject, isSharing: false })
                                    }
                                    invitationsSent={invitationsSent}
                                    invitedUsers={invitedUsers}
                                    onArchiveProject={triggerArchiveModal}
                                    onAddProjectToFavorites={addToFavorites}
                                    onDeleteProject={triggerDeleteModal}
                                    onUpdateInvitedUsers={(user: any) => {
                                        setSelectedContacts([user.email]);
                                        setIsSharing(false);

                                        const filter = user.invitedModules.filter((module: any) => {
                                            if (module.accessLevel != "no_access") {
                                                return module.documentCategory;
                                            }
                                            return;
                                        });

                                        setSelectedModules(
                                            filter.map((module: any) => {
                                                return module.documentCategory;
                                            }),
                                        );

                                        triggerShareProjectModal({
                                            project: displayProject,
                                            isSharing: false,
                                            user: user,
                                            updating: true,
                                        });
                                    }}
                                    onRevokeInvite={(data: any) => {
                                        setIsSharing(false);
                                        triggerRevokeModal(data.inviteId);
                                    }}
                                />
                            )}
                        </div>

                        {/* Delete Project Modal */}
                        <DeleteModal
                            showModal={showDeleteProjectModal}
                            setShowModal={(value: boolean) => setShowDeleteProjectModal(value)}
                            dataToDeleteName={"Project"}
                            isDeleting={isDeleting}
                            onYesDelete={deleteProject}
                            message="Are you sure you want to delete project?"
                        />
                        {/* Revoke modal */}
                        <DeleteModal
                            showModal={showRevokeModal}
                            setShowModal={(value: boolean) => setShowRevokeModal(value)}
                            action="Revoke"
                            dataToDeleteName={"user access"}
                            isDeleting={isDeleting}
                            onYesDelete={revokeAccess}
                            message="Are you sure you want to revoke user access?"
                            rightButtonText="Yes, Revoke"
                            rightButtonProcessingText="Revoking..."
                        />
                        <ShareProjectModal
                            showModal={showShareProjectModal}
                            setShowModal={setShowShareProjectModal}
                            project={displayProject}
                            selectedModules={selectedModules}
                            setSelectedModules={setSelectedModules}
                            onSubmit={handleProjectShareOrInvite}
                            isSubmitting={isSubmitting}
                            selectedContacts={selectedContacts}
                            setSelectedContacts={setSelectedContacts}
                            isUpdating={isUpdating}
                            errorMessage={errorMessage}
                            setErrorMessage={setErrorMessage}
                            onClearSelectedItems={() => {
                                setIsUpdating(false);
                                setSelectedContacts([]);
                                setSelectedModules([]);
                            }}
                            isShared={displayProject.isShared}
                        />
                        <ProjectShareSuccessModal
                            showModal={showProjectShareSuccessModal}
                            setShowModal={value => {
                                setShowProjectShareSuccessModal(value);
                            }}
                            onClearSelectedItems={() => {
                                setSelectedContacts([]);
                                setSelectedModules([]);
                            }}
                            permissionId={permissionId}
                            selectedContacts={selectedContacts}
                            isShared={isSharing}
                            project={displayProject}
                            isUpdating={isUpdating}
                            sharedLink={sharedLink}
                        />

                        {/* Archive */}
                        <DeleteModal
                            showModal={showArchiveProjectModal}
                            setShowModal={(value: boolean) => setShowArchiveProjectModal(value)}
                            action={`${displayProject.status === "active" ? "Archive" : "Unarchive"}`}
                            dataToDeleteName={"Project"}
                            isDeleting={isSubmitting}
                            onYesDelete={() => archiveProject(dataToDelete)}
                            message={`Are you sure you want to ${
                                displayProject.status === "active" ? "archive" : "unarchive"
                            } project?`}
                            rightButtonText={`${displayProject.status === "active" ? "Yes, Archive" : "Unarchive"}`}
                            rightButtonProcessingText={`${
                                displayProject.status === "active" ? "Archiving..." : "Unarchiving..."
                            }`}
                        />
                    </div>
                ) : (
                    <ProjectNotFound />
                )}
            </div>
        </>
    );
}
