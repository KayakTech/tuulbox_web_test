import { ArchiveBox, Edit2, Star1, Trash, UserAdd, ArrowRight, ArchiveAdd, ArchiveMinus } from "iconsax-react";
import { Button, Dropdown, Modal } from "react-bootstrap";
import { MoreVertical } from "react-feather";
import BreadCrumbs from "./BreadCrumbs";
import { Project } from "@/repositories/project-repository";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import Image from "next/image";
import { Contact } from "@/repositories/contact-repositories";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useState } from "react";
import ProjectCollaboratorsCard from "./ProjectCollaboratorsCard";
import { formatPhoneNumber, formatPhoneNumberWithSpace, isMobileDevice, isTabletDevice } from "@/helpers";

type ProjectDetailsSectionProps = {
    project: Project;
    isProjectOwner?: boolean;
    activeMenu: ProjectDocumentMenuItem;
    inviteUser?: () => void;
    invitationsSent: any;
    invitedUsers: Contact[];
    onUpdateInvitedUsers: (contact: Contact) => void;
    onRevokeInvite: (contact: Contact) => void;
    onArchiveProject: (project: Project) => void;
    onAddProjectToFavorites: (payload: any) => void;
    onDeleteProject: (projectId: string) => void;
};

export default function ProjectDetailsSection(props: ProjectDetailsSectionProps) {
    const { user } = useSelector((state: RootState) => state.account);
    const [showCollaboratorsModal, setShowCollaboratorsModal] = useState<boolean>(false);
    const [action, setAction] = useState<string>("list");

    const {
        project,
        activeMenu,
        inviteUser,
        invitedUsers,
        isProjectOwner,
        onUpdateInvitedUsers,
        onRevokeInvite,
        onArchiveProject,
        onAddProjectToFavorites,
        onDeleteProject,
    } = props;

    function breadCrumbs() {
        let crumbs = [{ name: activeMenu.name }];
        if (action === "add") {
            crumbs.push({ name: `Add ${activeMenu.singularName}` });
        }
        if (action === "edit") {
            crumbs.push({ name: `Update ${activeMenu.singularName}` });
        }
        return crumbs;
    }

    return (
        <>
            <div className="px-32  mt-32 d-flex flex-column gap-32 ">
                {/* Project Details */}
                <div className="d-flex  flex-column gap-32">
                    <div className="d-flex align-items-center justify-content-between">
                        {!isMobileDevice() && !isTabletDevice() && (
                            <div className="align-items-center w-100 d-flex border-bottom-gray-100m px-24m h-56m">
                                <BreadCrumbs
                                    className="d-flex"
                                    breadCrumbItemClassName="h6m text-gray-800 tb-title-body-medium text-capitalizem"
                                    showArrow={false}
                                    useRootFontSize={false}
                                    crumbs={breadCrumbs()}
                                />
                            </div>
                        )}
                        <div className="d-flex gap-4 align-items-center w-100 justify-content-end">
                            <Dropdown className="">
                                <Dropdown.Toggle variant="" className="p-0" id="dropdown-basic">
                                    <MoreVertical size={24} className="" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="resource-card dropdown-menu" align={`end`}>
                                    <Dropdown.Item href={`/projects/edit/${project.id}`}>
                                        <Edit2 size="16" color="#888888" />{" "}
                                        <span className="tb-body-default-regular">Update</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => {
                                            const payload = {
                                                objectType: "project",
                                                objectId: project.id,
                                                createdBy: user?.id,
                                                company: user?.companyId,
                                            };
                                            onAddProjectToFavorites(payload);
                                        }}
                                    >
                                        <Star1 size="16" color="#888888" />{" "}
                                        <span className="tb-body-default-regular">Add to Favorites</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item className="" onClick={() => onArchiveProject(project)}>
                                        {project.status === "archived" ? (
                                            <ArchiveMinus size={16} className="" />
                                        ) : (
                                            <ArchiveAdd size={16} className="" />
                                        )}
                                        <span className="tb-body-default-regular">
                                            {project.status === "archived" ? "Unarchive" : "Archive"}
                                        </span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        className="text-danger"
                                        onClick={() => onDeleteProject(`${project.id}`)}
                                    >
                                        <Trash size={16} className="text-danger" />
                                        <span className="tb-body-default-regular text-danger">Delete</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>

                    <div className="border border-gray-100 border-radius-12 py-3">
                        <div className=" px-3">
                            <div
                                className="d-grid gap-3 "
                                style={{
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                }}
                            >
                                <div className="d-flex flex-column gap-1">
                                    <h5 className="tb-body-small-medium m-0 text-gray-400">Project Name</h5>
                                    <div className="d-flex gap-2">
                                        {project?.projectLogo && (
                                            <div className="rounded-1 border border-gray-100 flex-shrink-0 w-24 h-24">
                                                <Image
                                                    src={project?.projectLogo}
                                                    loading="lazy"
                                                    alt=""
                                                    className="rounded-1 flex-shrink-0 object-fit-cover h-100"
                                                    width={24}
                                                    height={24}
                                                />
                                            </div>
                                        )}
                                        <p
                                            title={project.name}
                                            className="text-wrap tb-body-default-medium text-truncate text-gray-800"
                                        >
                                            {project.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="d-flex flex-column gap-1">
                                    <h5 className="tb-body-small-medium m-0 text-gray-400">Project Address</h5>
                                    <div className="d-flex flex-column">
                                        {project.addressLine1 && (
                                            <span className="text-wrap tb-body-default-medium text-gray-800">{`${project.addressLine1}`}</span>
                                        )}

                                        {project?.country && (
                                            <span className="text-wrap tb-body-default-medium text-gray-800 ">{`${project?.country}`}</span>
                                        )}
                                        {project?.state && (
                                            <span className="text-wrap tb-body-default-medium text-gray-800">{`${project?.state}`}</span>
                                        )}
                                        {project?.city && (
                                            <span className="text-wrap tb-body-default-medium text-gray-800">{`${project?.city}`}</span>
                                        )}
                                        {project?.zipCode && (
                                            <span className="text-wrap tb-body-default-medium text-gray-800 ">{`${project?.zipCode}`}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="py-12 d-flex flex-column gap-3 border-top border-gray-100 border-bottom-0 border-right-0 border-left-0">
                            <div className="px-3">
                                <h1 className="tb-body-default-medium text-gray-800 m-0">Primary contact</h1>
                            </div>
                            <div
                                className="d-grid px-3 gap-4"
                                style={{
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                }}
                            >
                                <div className="d-flex flex-column gap-1">
                                    <h5 className="tb-body-small-medium m-0 text-gray-400">Name</h5>
                                    <div className="d-flex gap-2">
                                        <p className="text-wrap m-0 tb-body-default-medium text-gray-800">
                                            {project.owner}
                                        </p>
                                    </div>
                                </div>

                                <div className="d-flex flex-column gap-1">
                                    <h5 className="tb-body-small-medium m-0 text-gray-400">Phone</h5>
                                    {project.contact ? (
                                        <a
                                            href={`tel:${project.contact}`}
                                            className="text-wrap m-0 tb-body-default-medium text-decoration-none text-blue-800"
                                        >
                                            {project.contact}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </div>

                                <div className="d-flex flex-column gap-1">
                                    <h5 className="tb-body-small-medium m-0 text-gray-400">Email</h5>
                                    {project.email ? (
                                        <a
                                            title={project.email}
                                            href={`mailto:${project.email}`}
                                            className="text-wrap text-decoration-none m-0 tb-body-default-medium text-blue-800"
                                        >
                                            {project.email}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="py-12 d-flex flex-column gap-3 border-top border-gray-100 ">
                            <div className="px-3">
                                <h1 className="tb-body-default-medium text-gray-800 m-0">Secondary contact</h1>
                            </div>
                            <div
                                className="d-grid px-3 gap-4"
                                style={{
                                    gridTemplateColumns: "repeat(3, 1fr)",
                                }}
                            >
                                <div className="d-flex flex-column gap-1">
                                    <h5 className="tb-body-small-medium m-0 text-gray-400">Name</h5>
                                    <div className="d-flex gap-2">
                                        {project.additionalContacts.length ? (
                                            <p className="text-wrap m-0 tb-body-default-medium text-gray-800">
                                                {project.additionalContacts[0].firstName}{" "}
                                                {project.additionalContacts[0].lastName}
                                            </p>
                                        ) : (
                                            "-"
                                        )}
                                    </div>
                                </div>

                                <div className="d-flex flex-column gap-1">
                                    <h5 className="tb-body-small-medium m-0 text-gray-400">Phone</h5>
                                    {project.additionalContacts.length ? (
                                        <a
                                            href={`tel:${project?.additionalContacts[0]?.phoneNumber}`}
                                            className="text-wrap text-decoration-none m-0 tb-body-default-medium text-blue-800"
                                        >
                                            {project?.additionalContacts[0]?.phoneNumber
                                                ? project?.additionalContacts[0]?.phoneNumber
                                                : ""}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </div>

                                <div className="d-flex flex-column gap-1">
                                    <h5 className="tb-body-small-medium m-0 text-gray-400">Email</h5>
                                    {project.additionalContacts.length ? (
                                        <a
                                            href={`mailto:${project?.additionalContacts[0]?.email}`}
                                            className="text-wrap text-decoration-none m-0 tb-body-default-medium text-blue-800"
                                        >
                                            {project?.additionalContacts[0]?.email ?? ""}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <>
                    {isProjectOwner && (
                        <ProjectCollaboratorsCard
                            invitedUsers={invitedUsers}
                            seeAllCollaborators={false}
                            onUpdateInvitedUsers={onUpdateInvitedUsers}
                            onRevokeInvite={onRevokeInvite}
                            onViewAllCollaborators={() => setShowCollaboratorsModal(true)}
                            inviteUser={inviteUser}
                        />
                    )}

                    <Modal
                        centered
                        show={showCollaboratorsModal}
                        onHide={() => setShowCollaboratorsModal(false)}
                        size="xl"
                        className="project-collaborators-modal"
                    >
                        <Modal.Body className="w-100 p-0">
                            <ProjectCollaboratorsCard
                                invitedUsers={invitedUsers}
                                seeAllCollaborators={true}
                                onUpdateInvitedUsers={(contact: Contact) => {
                                    setShowCollaboratorsModal(false);
                                    onUpdateInvitedUsers(contact);
                                }}
                                onRevokeInvite={onRevokeInvite}
                                inviteUser={() => {
                                    setShowCollaboratorsModal(false);
                                    inviteUser && inviteUser();
                                }}
                            />
                        </Modal.Body>
                    </Modal>
                </>
            </div>
        </>
    );
}
