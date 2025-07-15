import CustomMenuItem from "./CustomMenuItem";
import ProjectDocument from "./ProjectDocument";
import { useEffect, useState } from "react";
import { Project, ProjectDocumentCategories } from "@/repositories/project-repository";
import { PROJECT_DOCUMENT_MENU } from "@/helpers/constants";
import PageLoader from "./PageLoader";
import { useRouter } from "next/router";
import { getActiveProjectMenu } from "@/helpers";
import { SearchKey } from "@/repositories/search-repository";
import { Contact } from "@/repositories/contact-repositories";
import { Spinner } from "react-bootstrap";

export type ProjectDocumentMenuItem = {
    pathName: string;
    name: string;
    shortName: string;
    singularName: string;
    category: ProjectDocumentCategories;
    lastPath?: string;
    icon?: any;
    searchKey: SearchKey;
    searchCategory: string;
};

export default function ProjectDocumentSection(props: {
    projectId: string;
    project: Project;
    detailedProject?: any;
    isLoadingDetails?: boolean;
    isShared?: boolean;
    inviteUser?: () => void;
    invitationsSent: any;
    invitedUsers: Contact[];
    onUpdateInvitedUsers: (contact: Contact) => void;
    onRevokeInvite: (contact: Contact) => void;
    onArchiveProject: (project: Project) => void;
    onAddProjectToFavorites: (project: any) => void;
    onDeleteProject: (projectId: string) => void;
}) {
    const route = useRouter();
    const [activeMenu, setActiveMenu] = useState<ProjectDocumentMenuItem | null>(
        getActiveProjectMenu({ isShared: props.isShared, project: props.project }),
    );

    // Use detailed project if available, fallback to basic project
    const project = props.detailedProject || props.project;
    const hasDetailedData = !!props.detailedProject;

    useEffect(() => {
        const routeActiveMenu = route.query.activeMenu;
        const menuObj = PROJECT_DOCUMENT_MENU.find(menu => menu.pathName === routeActiveMenu);
        menuObj ? setActiveMenu(menuObj) : setActiveMenu(PROJECT_DOCUMENT_MENU[0]);
    }, [route]);

    function onActiveMenuChange(selectedMenu: ProjectDocumentMenuItem) {
        route.push(`/projects/${props.projectId}?activeMenu=${selectedMenu.pathName}`);
    }

    function hasAccessToMenuItem(menu: ProjectDocumentMenuItem) {
        if (!hasDetailedData || !project.documentCategoryAccesses) {
            return true; // Show menu items optimistically
        }

        return project.documentCategoryAccesses.find(
            //@ts-ignore
            access => access.documentCategory === menu.category && access.accessLevel !== "no_access",
        );
    }

    const shouldShowLoader = !hasDetailedData && props.isLoadingDetails;

    const TOP_MENU_ITEMS = PROJECT_DOCUMENT_MENU.slice(0, 1);
    const MIDDLE_MENU_ITEMS = PROJECT_DOCUMENT_MENU.slice(TOP_MENU_ITEMS.length, TOP_MENU_ITEMS.length + 2);
    const BOTTOM_MENU_ITEMS = PROJECT_DOCUMENT_MENU.slice(
        MIDDLE_MENU_ITEMS.length + TOP_MENU_ITEMS.length,
        PROJECT_DOCUMENT_MENU.length,
    );

    return (
        <>
            <div className="d-flex flex-wrap flex-md-nowrap project-document-section flex-grow-1 position-relative">
                <div className="d-none d-md-block p-24 border-end-gray-100 flex-shrink-0 min-w-272 h-100vh-88 overflowY-scroll position-fixed">
                    <div className="px-32m py-24m">
                        {!project.isShared && (
                            <>
                                <ul className="list-unstyled w-100 m-0">
                                    <li className="d-flex flex-column gap-3">
                                        {TOP_MENU_ITEMS.map((menu: ProjectDocumentMenuItem, index: number) => (
                                            <CustomMenuItem
                                                className={`${
                                                    activeMenu?.pathName === menu.pathName && "active"
                                                } text-capitalize hover`}
                                                menuName={menu.name}
                                                key={index}
                                                onClick={() => {
                                                    onActiveMenuChange(menu);
                                                }}
                                                menu={menu}
                                            />
                                        ))}
                                    </li>
                                </ul>

                                <div className="border-bottom-gray-100 my-4"></div>
                            </>
                        )}

                        <>
                            <ul className="list-unstyled w-100 m-0">
                                <li className="d-flex flex-column gap-3">
                                    {MIDDLE_MENU_ITEMS.map((menu: ProjectDocumentMenuItem, index: number) => (
                                        <CustomMenuItem
                                            className={`${
                                                activeMenu?.pathName === menu.pathName && "active"
                                            } text-capitalize hover`}
                                            menuName={menu.name}
                                            key={index}
                                            onClick={() => {
                                                onActiveMenuChange(menu);
                                            }}
                                            menu={menu}
                                        />
                                    ))}
                                </li>
                            </ul>

                            <div className="border-bottom-gray-100 my-4"></div>
                        </>
                        <>
                            <ul className="list-unstyled w-100 m-0">
                                <li className="d-flex flex-column gap-3">
                                    {BOTTOM_MENU_ITEMS.map((menu: ProjectDocumentMenuItem, index: number) => {
                                        return (
                                            hasAccessToMenuItem(menu) && (
                                                <CustomMenuItem
                                                    className={`${
                                                        activeMenu?.pathName === menu.pathName ? "active" : ""
                                                    } text-capitalize hover`}
                                                    menuName={menu.name}
                                                    key={index}
                                                    onClick={() => {
                                                        onActiveMenuChange(menu);
                                                    }}
                                                    menu={menu}
                                                />
                                            )
                                        );
                                    })}
                                </li>
                            </ul>
                        </>
                    </div>
                </div>

                <div className="flex-fill d-flex flex-column ms-275">
                    {!activeMenu ? (
                        <div className="d-flex border justify-content-center align-items-center border vh-100">
                            <PageLoader showLoading={false} />
                        </div>
                    ) : (
                        <ProjectDocument
                            projectId={props.projectId}
                            project={project}
                            activeMenu={activeMenu}
                            isShared={props.isShared}
                            inviteUser={() => props.inviteUser && props.inviteUser()}
                            invitationsSent={props.invitationsSent}
                            invitedUsers={props.invitedUsers}
                            onUpdateInvitedUsers={props.onUpdateInvitedUsers}
                            onRevokeInvite={props.onRevokeInvite}
                            onArchiveProject={props.onArchiveProject}
                            onAddProjectToFavorites={props.onAddProjectToFavorites}
                            onDeleteProject={props.onDeleteProject}
                            hasDetailedData={hasDetailedData}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
