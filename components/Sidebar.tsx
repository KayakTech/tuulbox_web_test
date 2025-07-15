import { Navbar, Accordion, Button } from "react-bootstrap";
import { DASHBOARD_SIDEBAR_LINKS, DashboardLinks } from "@/helpers/constants";
import Link from "next/link";
import { useRouter } from "next/router";
import LogoWhite from "./LogoWhite";
import { useEffect, useState } from "react";
import {
    Briefcase,
    Buildings2,
    Calendar,
    Clock,
    DocumentCopy,
    DocumentText,
    Element3,
    FolderAdd,
    People,
    Personalcard,
    Refresh,
    Refresh2,
    Setting2,
    ShieldTick,
    Star1,
    ArrowDown2,
    ArrowUp2,
    Link21,
    Link2,
    Link1,
    ArchiveBox,
    Gallery,
    Add,
    ArrowRight,
    CloseCircle,
} from "iconsax-react";
import BlueHeaderLeftImage from "./icons/BlueHeaderLeftImage";
import { currentPage, hyphenToNormalString, isMobileDevice } from "@/helpers";
import useSettings from "@/hooks/settings";
import _ from "lodash";
import { Project } from "@/repositories/project-repository";

export default function Sidebar() {
    const router = useRouter();
    const sublinkPathName = location.pathname.split("/")[2];
    const sublinkInnerPathName = location.pathname.split("/")[3] || null;

    const { generalSettings } = useSettings();
    const [dashBoardSidebarLinks, setDashbardSidebarLinks] = useState<DashboardLinks[]>(DASHBOARD_SIDEBAR_LINKS);

    const [openAccordion, setOpenAccordion] = useState<{ [key: number]: boolean }>({});

    const toggleAccordion = (index: number) => {
        setOpenAccordion(prev => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    function getProjectLinks() {
        if (generalSettings?.projects?.length) {
            let links = _.cloneDeep(dashBoardSidebarLinks);

            const index = links.findIndex(item => item.name.toLocaleLowerCase() === "projects");

            let subLinks: any[] = [];

            generalSettings.projects.slice(0, 10).map((project: Project) => {
                subLinks.push({
                    name: project.name,
                    url: `/projects/${project.id}`,
                });
            });

            subLinks.push({
                name: "See All",
                url: `/projects`,
                type: "seeAll",
            });

            links[index].sublinks = subLinks;

            setDashbardSidebarLinks(links);
        }
    }

    useEffect(() => {}, [generalSettings]);

    return (
        <>
            <Navbar
                bg="default"
                className="top-nav-height fixed-topm border-bottom-accent-blue-800 d-flex justify-content-between align-items-center fixed-top bg-accent-blue-900"
            >
                <Navbar.Brand href="/" className="ms-4">
                    <LogoWhite />
                </Navbar.Brand>
                {isMobileDevice() && <p className="text-white me-3"></p>}
            </Navbar>
            <ul className={`list-unstyled ${isMobileDevice() ? "pt-3 pe-3" : "pt-40"}`}>
                {dashBoardSidebarLinks.map((link: DashboardLinks, index: number) =>
                    link.sublinks ? (
                        <li key={link.name} className={`dashboard_link_item d-flex align-items-center m-0`}>
                            <Accordion
                                defaultActiveKey={`${
                                    link.name.toLocaleLowerCase() === router.pathname.split("/")[1] && index
                                }`}
                                className="w-100"
                                flush
                                onClick={() => toggleAccordion(index)}
                            >
                                <Accordion.Item eventKey={index.toString()} key={`${link.name}-${index}`} className="">
                                    <Accordion.Header>
                                        <div className="ps-12">
                                            <link.icon color="gray" size={16} />
                                        </div>
                                        <Link
                                            href={``}
                                            className="ms-2 link_name tb-title-body-medium text-decoration-none"
                                            style={{ fontSize: "0.875rem" }}
                                        >
                                            {link.name}
                                        </Link>
                                        <span className="ms-auto">
                                            {openAccordion[index] ? (
                                                <ArrowUp2 color="gray" size={16} />
                                            ) : (
                                                <ArrowDown2 color="gray" size={16} />
                                            )}
                                        </span>
                                    </Accordion.Header>
                                    <Accordion.Body className="p-0 m-0 mt-1">
                                        <ul className="list-unstyled sub-links  d-flex flex-column gap-2 ">
                                            {link.cta && (
                                                <Link
                                                    href={`${link.cta.url}`}
                                                    className="text-decoration-none d-flex bg-whitem "
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="d-flex h-32 w-100 text-primary  btn-bgm btn-sm border-0 shadow-none tb-body-small-medium justify-content-center text-decoration-none py-0 align-items-center rounded-1"
                                                    >
                                                        <span className="text-primary fs-6 me-2">+</span>
                                                        {link.cta.name}
                                                    </Button>
                                                </Link>
                                            )}

                                            {link.sublinks.map((sublink: any, subIndex: number) =>
                                                sublink.type === "line" ? (
                                                    <hr
                                                        key={`line-${subIndex}`}
                                                        className="border-bottom-accent-blue-800 opacity-100 my-1"
                                                    />
                                                ) : sublink?.type?.toLowerCase() === "seeall" ? (
                                                    <Link
                                                        href={sublink.url}
                                                        key={`seeall-${sublink.name || subIndex}`}
                                                        className="project-nav-items text-white d-flex align-items-center justify-content-between px-2 h-32 py-6m text-decoration-none"
                                                    >
                                                        <span className="tb-body-small-medium">{sublink.name}</span>
                                                        <ArrowRight size={16} />
                                                    </Link>
                                                ) : (
                                                    <li
                                                        key={`sublink-${sublink.id || sublink.name || subIndex}`}
                                                        className={`sublink-item d-flex align-items-center px-2 h-32 ${
                                                            [
                                                                sublinkPathName,
                                                                hyphenToNormalString(
                                                                    sublinkInnerPathName || "",
                                                                ).toLowerCase(),
                                                            ].includes(`${sublink?.name?.toLocaleLowerCase()}`) ||
                                                            (currentPage() === "projects" &&
                                                                location.pathname.split("/")[2] ===
                                                                    sublink.url.split("/")[2])
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                    >
                                                        <Link
                                                            href={sublink?.url ?? "javascript:void(0)"}
                                                            className="text-decoration-none d-flex dashboard_link  px-2 gap-2 w-100 align-items-center"
                                                        >
                                                            {sublink.icon && <sublink.icon color="#B0B0B0" size={16} />}
                                                            <span className="link_name sub_link text-truncate tb-body-small-medium">
                                                                <span className="tb-body-small-medium">
                                                                    {sublink.name}
                                                                </span>
                                                            </span>
                                                        </Link>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </li>
                    ) : (
                        <li
                            className={`dashboard_link_item d-flex align-items-center m-0  px-12 ${
                                link.url?.split("/")[1] === router.pathname.split("/")[1] && "active"
                            }`}
                            key={index}
                        >
                            <Link
                                href={`${link.url}`}
                                className="text-decoration-none px-12 d-flex dashboard_link solo w-100 align-items-center"
                            >
                                {link.name.toLowerCase() === "expirations" && <Clock color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "home" && <Element3 color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "calendar" && <Calendar color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "projects" && <DocumentText color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "business" && <Briefcase color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "contacts" && <People color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "expiration" && <Clock color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "links" && <Link1 color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "storage" && <FolderAdd color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "settings" && <Setting2 color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "favorites" && <Star1 color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "recent" && <Refresh color="#B0B0B0" size={16} />}
                                {link.name.toLowerCase() === "photos" && <Gallery color="#B0B0B0" size={16} />}
                                <span className="ms-2 link_name tb-body-default-medium">{link.name}</span>
                            </Link>
                        </li>
                    ),
                )}
            </ul>
        </>
    );
}
