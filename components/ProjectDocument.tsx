import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import { useEffect, useState } from "react";
import ProjectDocumentForm from "./ProjectDocumentForm";
import ProjectDocumentListing from "./ProjectDocumentListing";
import { Project, ProjectDocumentType } from "@/repositories/project-repository";
import Communications from "./Communications";
import SubContractors from "./SubContractors";
import ProjectGalleryForm from "./ProjectGalleryForm";
import useProject from "@/hooks/project";
import { getUrlQuery } from "@/helpers";
import ProjectDetailsSection from "./ProjectDetailsSection";
import { Contact } from "@/repositories/contact-repositories";

type ProjectDocumentProps = {
    activeMenu: ProjectDocumentMenuItem;
    projectId: string;
    project: Project;
    isShared?: boolean;
    sharedDocuments?: ProjectDocumentType[];
    inviteUser?: () => void;
    invitationsSent: any;
    invitedUsers: Contact[];
    onUpdateInvitedUsers: (contact: Contact) => void;
    onRevokeInvite: (contact: Contact) => void;
    onArchiveProject: (project: Project) => void;
    onDeleteProject: (projectId: string) => void;
    onAddProjectToFavorites: (project: Project) => void;
    hasDetailedData: any;
};

export default function ProjectDocument(props: ProjectDocumentProps) {
    const {
        activeMenu,
        projectId,
        project,
        isShared,
        inviteUser,
        invitationsSent,
        invitedUsers,
        onUpdateInvitedUsers,
        onRevokeInvite,
        onArchiveProject,
        onAddProjectToFavorites,
        onDeleteProject,
    } = props;
    const [action, setAction] = useState<string>("list");
    const [fileToUpdate, setFileToUpdate] = useState<ProjectDocumentType>();
    const { router, projectDocuments, getProjectDocument, isCreatorOfProject } = useProject({
        action,
    });

    useEffect(() => {
        const routeAction = router.query.action;
        const fileId = router.query.fileId;
        const shouldUpdateAction = routeAction && typeof routeAction === "string" && !fileId;

        if (shouldUpdateAction) {
            setAction(routeAction);
        }
    }, [router, projectDocuments]);

    function handleAddDocument() {
        router.push(`/projects/${projectId}?action=add&activeMenu=${activeMenu.pathName}`);
    }
    function handleAddChat() {
        router.push(`/projects/${projectId}?action=list&activeMenu=${activeMenu.pathName}`);
    }
    function handleUpdateDocument(document?: ProjectDocumentType) {
        //@ts-ignore
        getProjectDocument({ projectId: projectId, documentId: document?.id });
        router.push(`/projects/${projectId}?action=edit&activeMenu=${activeMenu.pathName}&id=${document?.id}`);
    }

    function onFormCancel() {
        router.push(`/projects/${projectId}?action=list&activeMenu=${activeMenu.pathName}`);
        setAction("list");
    }

    const renderContent = () => {
        if (["project-details", ""].includes(activeMenu.pathName)) {
            return (
                <ProjectDetailsSection
                    project={project}
                    isProjectOwner={isCreatorOfProject(project)}
                    activeMenu={activeMenu}
                    inviteUser={() => inviteUser && inviteUser()}
                    invitationsSent={invitationsSent}
                    invitedUsers={invitedUsers}
                    onUpdateInvitedUsers={onUpdateInvitedUsers}
                    onRevokeInvite={onRevokeInvite}
                    onArchiveProject={onArchiveProject}
                    onAddProjectToFavorites={onAddProjectToFavorites}
                    onDeleteProject={onDeleteProject}
                />
            );
        }

        if (["communications", "sub-contractors", "emails", "chat"].includes(activeMenu.pathName)) {
            const isCommunicationsSection = ["communications", "emails", "chat"].includes(
                activeMenu.pathName.toLowerCase(),
            );
            return isCommunicationsSection ? (
                <Communications activeMenu={activeMenu} projectId={projectId} project={project} />
            ) : (
                <SubContractors activeMenu={activeMenu} project={project} projectId={projectId} />
            );
        }

        return (
            <>
                {(["add", "edit"].includes(action) ||
                    (getUrlQuery("action") && (getUrlQuery("action") === "edit" || getUrlQuery("action") === "add"))) &&
                    activeMenu.pathName === "gallery" && (
                        <ProjectGalleryForm
                            fileToUpdate={fileToUpdate}
                            onCancel={onFormCancel}
                            activeMenu={activeMenu}
                            action={action}
                            projectId={projectId}
                            showList={onFormCancel}
                        />
                    )}

                {(["add", "edit"].includes(action) ||
                    (getUrlQuery("action") && (getUrlQuery("action") === "edit" || getUrlQuery("action") === "add"))) &&
                    activeMenu.pathName != "gallery" && (
                        <ProjectDocumentForm
                            fileToUpdate={fileToUpdate}
                            onCancel={onFormCancel}
                            activeMenu={activeMenu}
                            action={action}
                            projectId={projectId}
                            showList={onFormCancel}
                        />
                    )}

                {(action === "list" || getUrlQuery("action") === "list") && (
                    <ProjectDocumentListing
                        activeMenu={activeMenu}
                        projectId={projectId}
                        onAddDocument={handleAddDocument}
                        onUpdateDocument={document => handleUpdateDocument(document)}
                        onShowAddButton={value => {}}
                        isShared={isShared}
                        sharedDocuments={project?.documents}
                        project={project}
                        onStartChat={handleAddChat}
                    />
                )}
            </>
        );
    };

    return <div className="pb-5">{renderContent()}</div>;
}
