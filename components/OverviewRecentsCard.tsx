import { RecentActivity } from "@/repositories/recent-repository";
import {
    Bookmark,
    Calendar,
    CardPos,
    ClipboardTick,
    DocumentCopy,
    DocumentText,
    Edit2,
    ExportSquare,
    FolderAdd,
    Gallery,
    MenuBoard,
    Note,
    People,
    Personalcard,
    Refresh,
    Shield,
    ShieldTick,
    Stickynote,
    Triangle,
} from "iconsax-react";
import { projectDocumentPathName } from "@/helpers";
import BadgeTag from "./BadgeTag";
import { Dropdown } from "react-bootstrap";
import { MoreHorizontal } from "react-feather";
import { ProjectDocumentCategories } from "@/repositories/project-repository";
import { useRouter } from "next/router";
import useStorage from "@/hooks/storage";
import useFavorites from "@/hooks/favorites";
import ProjectCard from "./ProjectCard";
import ContactDocument from "./ContactDocument";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useProject from "@/hooks/project";
import ContactCard from "./ContactCard";
import LicenseCardSmall from "./LicenseCardSmall";
import InsuranceCardSmall from "./InsuranceCardSmall";
import ResourceCard from "./ResourceCard";
import EventCard from "./EventCard";

type OverviewFileCardProps = {
    recent: RecentActivity;
};

export default function OverviewRecentsCard(props: OverviewFileCardProps) {
    const { recent } = props;

    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.account);
    const { viewDocumentFile } = useFavorites();
    const projectHook = useProject({});

    function getRecentObjectUrl(recent: RecentActivity) {
        if (
            recent?.originalObject?.file &&
            typeof recent?.originalObject?.file === "object" &&
            !Array.isArray(recent?.originalObject?.file)
        ) {
            viewDocumentFile(recent.originalObject.file);
            return;
        }

        if (recent.category.toLocaleLowerCase() === "resources") {
            router.push(`/links/edit/${recent.originalObject.id}`);
            return;
        }

        if (recent.category.toLocaleLowerCase() === "contacts") {
            router.push(`/contacts/edit/${recent.originalObject.id}`);
            return;
        }

        if (recent.category.toLocaleLowerCase() === "subcontributors") {
            router.push(`/contacts/edit/${recent.originalObject.contact.id}`);
            return;
        }

        if (recent.category.toLocaleLowerCase() === "insurances") {
            router.push(`/business/insurance/edit/${recent.originalObject.id}`);
            return;
        }

        if (recent.category.toLocaleLowerCase() === "calendar_events") {
            router.push(`/calendar/events/edit/${recent.originalObject.id}`);
            return;
        }

        if (recent.category.toLocaleLowerCase() === "projects") {
            router.push(`/projects/${recent.originalObject.id}`);
            return;
        }

        if (recent.category.toLocaleLowerCase() === "storages") {
            viewDocumentFile(recent.originalObject);
            return;
        }

        if (recent.category.toLocaleLowerCase() === "licenses") {
            router.push(`/business/license/edit/${recent.originalObject.id}`);
            return;
        }
    }

    return (
        <>
            {/* Project */}
            {recent.category === "projects" && <ProjectCard project={recent.originalObject} />}
            {/* Links */}
            {["resources"].includes(recent.category) && <ResourceCard resource={recent.originalObject} isViewOnly />}
            {/* Insurance */}
            {["insurances"].includes(recent.category) && (
                <InsuranceCardSmall
                    insurance={recent.originalObject}
                    isViewOnly
                    viewDocumentFile={file => viewDocumentFile(recent.originalObject.file)}
                    onUpdate={() => router.push(`/business/insurance/edit/${recent.originalObject.id}`)}
                />
            )}
            {/* License */}
            {["licenses"].includes(recent.category) && (
                <LicenseCardSmall
                    license={recent.originalObject}
                    isViewOnly
                    viewDocumentFile={file => viewDocumentFile(recent.originalObject.file)}
                    onUpdate={() => router.push(`/business/license/edit/${recent.originalObject.id}`)}
                />
            )}
            {/* Contacts */}
            {["contacts", "subcontractors"].includes(recent.category) && (
                <ContactCard
                    contact={recent.category === "contacts" ? recent.originalObject : recent.originalObject.contact}
                    isViewOnly
                />
            )}
            {/* Calendar */}
            {["calendar_events"].includes(recent.category) && (
                <EventCard
                    event={recent.originalObject}
                    isViewOnly
                    onUpdate={() => router.push(`/calendar/events/edit/${recent.originalObject.id}`)}
                />
            )}
            {/* Storage */}
            {recent.category === "storages" && (
                <ContactDocument
                    file={recent.originalObject}
                    fileType="storage"
                    user={user}
                    onItemClick={file => viewDocumentFile(recent.originalObject)}
                    isViewOnly
                />
            )}
            {/* Project Document */}
            {[
                "plan_and_elevations",
                "permits",
                "estimates",
                "contracts",
                "change_orders",
                "payment_schedules",
                "performance_schedules",
                "specifications",
                "communications",
                "galleries",
            ].includes(recent.category) && (
                <ContactDocument
                    file={recent.category === "galleries" ? recent.originalObject.file : recent.originalObject}
                    fileType={recent.category === "galleries" ? "gallery" : "project-document"}
                    onItemClick={file => {
                        if (recent.category === "galleries" && recent.originalObject.file) {
                            recent.originalObject.file.id = recent.originalObject.id;
                        }
                        recent.originalObject.file && projectHook.viewDocumentFile(recent.originalObject);
                    }}
                    onUpdate={() =>
                        router.push(
                            `/projects/${recent.originalObject.project}?activeMenu=${projectDocumentPathName(
                                recent.category,
                            )}&action=edit&fileId=${recent.originalObject.file.id}`,
                        )
                    }
                    isGallery={recent.category === "galleries"}
                    isViewOnly
                />
            )}
        </>
    );
}
