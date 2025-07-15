import React, { useEffect, useState } from "react";
import { Accordion, Card, useAccordionButton } from "react-bootstrap";
import { ArrowRight2 } from "iconsax-react";
import { PROJECT_DOCUMENT_MENU } from "@/helpers/constants";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import { getActiveProjectMenu, getProjectDocumentMenu, getUrlQuery } from "@/helpers";
import { Project } from "@/repositories/project-repository";
import useProject from "@/hooks/project";
import PageLoader from "./PageLoader";
import ProjectDocument from "./ProjectDocument";

type ProjectSubMenuMobileProps = {
    projectId: string;
    project: Project;
    isShared?: boolean;
};

export default function ProjectSubMenuMobile(props: ProjectSubMenuMobileProps) {
    const { project, isShared, projectId } = props;
    const { updateUrlQueryParam } = useProject({});

    const [activeKey, setActiveKey] = useState("0");
    const [activeMenu, setActiveMenu] = useState<ProjectDocumentMenuItem | null>(
        getActiveProjectMenu({ isShared: props.isShared, project: props.project }),
    );

    function CustomToggle({ children, eventKey }: { children: React.ReactNode; eventKey: string }) {
        const decoratedOnClick = useAccordionButton(eventKey);
        return (
            <div onClick={decoratedOnClick} className="d-flex align-items-center justify-content-between">
                {children}
            </div>
        );
    }

    function onHeaderClick(params: { menu: ProjectDocumentMenuItem; index: number }) {
        const { index, menu } = params;
        setActiveKey(`${index}`);
        updateUrlQueryParam({ key: "activeMenu", value: menu.pathName, isShared: isShared });
        setActiveMenu(menu);
    }

    function updateActiveKey() {
        const activeMenu = getUrlQuery("activeMenu");
        if (activeMenu) {
            const menuItems = getProjectDocumentMenu({ isShared: isShared, project: project });
            const index = menuItems.findIndex(obj => obj.pathName === activeMenu);

            if (index >= 0) {
                const menu = menuItems[index];
                setActiveMenu(menu);
                setActiveKey(`${index}`);
            }
        }
    }

    useEffect(() => {
        updateActiveKey();
    }, []);

    const menuItems = getProjectDocumentMenu({ isShared: isShared, project: project });

    return (
        <div className=" w-100">
            <div className="border w-100 my-3 border-radius-12 border-gray-100">
                <Accordion defaultActiveKey={activeKey} activeKey={activeKey} className="bg-white card border-0">
                    {menuItems.map((menu: ProjectDocumentMenuItem, index: number) => (
                        <Card key={index} className="border-0 bg-transparent">
                            <Card.Header
                                className="bg-transparent border-0 pointer"
                                onClick={() => onHeaderClick({ menu, index: index })}
                            >
                                <CustomToggle eventKey={index.toString()}>
                                    <span className="d-flex gap-2 text-gray-500 align-items-center">
                                        {menu.icon && <menu.icon size={16} className="me-2" />}
                                        {menu.name}
                                    </span>
                                    <ArrowRight2 size={16} />
                                </CustomToggle>
                            </Card.Header>
                            <Accordion.Collapse eventKey={index.toString()}>
                                <>
                                    {activeMenu?.pathName === menu.pathName ? (
                                        !activeMenu ? (
                                            <PageLoader showLoading={false} />
                                        ) : (
                                            <>
                                                <ProjectDocument
                                                    projectId={projectId}
                                                    project={project}
                                                    activeMenu={activeMenu}
                                                    isShared={isShared}
                                                    invitationsSent={undefined}
                                                    invitedUsers={[]}
                                                    onUpdateInvitedUsers={() => {}}
                                                    onRevokeInvite={() => {}}
                                                    onArchiveProject={() => {}}
                                                    onDeleteProject={() => {}}
                                                    onAddProjectToFavorites={() => {}}
                                                    hasDetailedData={{}}
                                                />
                                            </>
                                        )
                                    ) : null}
                                </>
                            </Accordion.Collapse>
                        </Card>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
