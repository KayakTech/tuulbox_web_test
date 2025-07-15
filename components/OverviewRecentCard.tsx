import { RecentActivity } from "@/repositories/recent-repository";
import { projectDocumentPathName } from "@/helpers";

import { useRouter } from "next/router";
import useFavorites from "@/hooks/favorites";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useProject from "@/hooks/project";
import ContactMiniCard from "./ContactMiniCard";
import ResourceMiniCard from "./ResourceMiniCard";
import ProjectCardSmall from "./ProjectCardSmall";
import LicenseMiniCard from "./LicenseMiniCard";
import InsuranceMiniCard from "./InsuranceMiniCard";
import ContactDocumentMiniCard from "./ContactDocumentMiniCard";
import EventMiniCard from "./EventMiniCard";

type OverviewFileCardProps = {
    recent: RecentActivity;
    onAddToFavorites?: (value: Record<string, string>) => void;
    onRemoveFromRecent?: () => void;
    onRemoveFromFavorites?: () => void;
};

export default function OverviewRecentCard(props: OverviewFileCardProps) {
    const { recent, onAddToFavorites, onRemoveFromRecent, onRemoveFromFavorites } = props;

    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.account);
    const { viewDocumentFile } = useFavorites();
    const projectHook = useProject({});

    return (
        <>
            {/* Project */}
            {recent.category === "projects" && (
                <ProjectCardSmall
                    project={recent.originalObject}
                    onAddToFavorites={onAddToFavorites}
                    onRemoveFromRecent={onRemoveFromRecent}
                    onRemoveFromFavorites={onRemoveFromFavorites}
                />
            )}
            {/* Links */}
            {["resources"].includes(recent.category) && (
                <ResourceMiniCard
                    resource={recent.originalObject}
                    onAddToFavorites={onAddToFavorites}
                    isViewOnly
                    onRemoveFromRecent={onRemoveFromRecent}
                />
            )}
            {/* Insurance */}
            {["insurances"].includes(recent.category) && (
                <InsuranceMiniCard
                    insurance={recent.originalObject}
                    isViewOnly
                    viewDocumentFile={file => viewDocumentFile(recent.originalObject.file)}
                    onUpdate={() => router.push(`/business/insurance/edit/${recent.originalObject.id}`)}
                    onAddToFavorites={onAddToFavorites}
                    onRemoveFromFavorites={onRemoveFromFavorites}
                    onRemoveFromRecent={onRemoveFromRecent}
                />
            )}
            {/* License */}
            {["licenses"].includes(recent.category) && (
                <LicenseMiniCard
                    license={recent.originalObject}
                    isViewOnly
                    viewDocumentFile={file => viewDocumentFile(recent.originalObject.file)}
                    onUpdate={() => router.push(`/business/license/edit/${recent.originalObject.id}`)}
                    onAddToFavorites={onAddToFavorites}
                    onRemoveFromRecent={onRemoveFromRecent}
                />
            )}
            {/* Contacts */}
            {["contacts", "subcontractors"].includes(recent.category) && (
                <ContactMiniCard
                    contact={recent.category === "contacts" ? recent.originalObject : recent.originalObject.contact}
                    onAddToFavorites={onAddToFavorites}
                    onRemoveFromRecent={onRemoveFromRecent}
                    onRemoveFromFavorites={onRemoveFromFavorites}
                    isViewOnly
                />
            )}
            {/* Calendar */}
            {["calendar_events"].includes(recent.category) && (
                <EventMiniCard
                    event={recent.originalObject}
                    isViewOnly
                    onUpdate={() => router.push(`/calendar/events/edit/${recent.originalObject.id}`)}
                />
            )}
            {/* Storage */}
            {recent.category === "storages" && (
                <ContactDocumentMiniCard
                    file={recent.originalObject}
                    fileType="storage"
                    user={user}
                    onItemClick={file => viewDocumentFile(recent.originalObject)}
                    addToFavorites={onAddToFavorites}
                    isViewOnly
                    onRemoveFromRecent={onRemoveFromRecent}
                    onRemoveFromFavorites={onRemoveFromFavorites}
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
                <ContactDocumentMiniCard
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
                    addToFavorites={onAddToFavorites}
                    onRemoveFromRecent={onRemoveFromRecent}
                />
            )}
        </>
    );
}
