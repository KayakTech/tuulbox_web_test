import { RecentActivity } from "@/repositories/recent-repository";
import {
    Bookmark,
    Calendar,
    CardPos,
    ClipboardTick,
    DocumentCopy,
    DocumentText,
    Edit2,
    FolderAdd,
    Gallery,
    MenuBoard,
    Note,
    People,
    Personalcard,
    Refresh,
    ShieldTick,
    StarSlash,
    Stickynote,
    Triangle,
} from "iconsax-react";
import { convertIsoToFriendlyTime, formatDatetime } from "@/helpers";
import BadgeTag from "./BadgeTag";
import { Dropdown } from "react-bootstrap";
import { MoreHorizontal } from "react-feather";
import { Favorite } from "@/repositories/favorites-repository";
import { useRouter } from "next/router";
import useStorage from "@/hooks/storage";
import useFavorites from "@/hooks/favorites";

type OverviewFileCardProps = {
    favorite: Favorite;
    onRemoveFromFavorite: () => void;
};

export default function OverviewFavoriteCard(props: OverviewFileCardProps) {
    const router = useRouter();
    const { viewDocumentFile } = useFavorites();
    const { favorite, onRemoveFromFavorite } = props;

    function updateUrl() {
        if (
            favorite?.actualObject?.file &&
            typeof favorite?.actualObject?.file === "object" &&
            !Array.isArray(favorite?.actualObject?.file)
        ) {
            viewDocumentFile(favorite.actualObject.file);
            return;
        }

        if (["storage"].includes(`${favorite.type}`)) {
            viewDocumentFile(favorite.actualObject);
            return;
        }

        if (["resource"].includes(`${favorite.type}`)) {
            favorite.actualObject.url && window.open(favorite.actualObject.url, "_blank");
            return;
        }

        if (["project"].includes(`${favorite.type}`)) {
            router.push(`/projects/edit/${favorite.actualObject?.id}`);
            return;
        }

        if (["contact"].includes(`${favorite.type}`)) {
            router.push(`/contacts/edit/${favorite.actualObject?.id}`);
            return;
        }
    }

    return (
        <div className="row py-2 p-0">
            <div className="col-12 d-flex justify-content-between py-12">
                <div className="w-300 col-12 d-flex gap-5">
                    <div className="col-md-5 w-300 d-flex">
                        <div className="w-48 h-48 border-radius-12 d-flex justify-content-center align-items-center  bg-gray-50">
                            {favorite.type && favorite?.type.toLowerCase() === "project" && (
                                <DocumentText size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "storage" && (
                                <FolderAdd size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "resource" && (
                                <DocumentCopy size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "calendar_events" && (
                                <Calendar size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}

                            {favorite?.type && ["contact", "subcontractors"].includes(favorite.type.toLowerCase()) && (
                                <People size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}

                            {favorite.type && favorite.type.toLowerCase() === "insurances" && (
                                <ShieldTick size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}

                            {favorite.type && favorite.type.toLowerCase() === "galleries" && (
                                <Gallery size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "estimates" && (
                                <Bookmark size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "additional_documents" && (
                                <MenuBoard size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "permits" && (
                                <ClipboardTick size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "plan_and_elevations" && (
                                <Triangle size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "contracts" && (
                                <Stickynote size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "change_orders" && (
                                <Refresh size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "payment_schedules" && (
                                <CardPos size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "performance_schedules" && (
                                <Note size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                            {favorite.type && favorite.type.toLowerCase() === "licenses" && (
                                <Personalcard size={24} color="#B0B0B0" variant="Outline" className="flex-shrink-0" />
                            )}
                        </div>

                        <div className="ms-3 d-flex">
                            <div>
                                <p className="m-0 truncate-1 text-gray-600 tb-body-default-medium">
                                    {favorite?.actualObject?.name ||
                                        favorite?.actualObject?.summary ||
                                        favorite?.actualObject?.originalFileName ||
                                        favorite?.actualObject?.carrier ||
                                        favorite.actualObject.description ||
                                        `${favorite?.actualObject?.firstName} ${favorite?.actualObject?.lastName}`}
                                </p>
                                <p className="text-muted tb-body-small-regular truncate-1 my-1" title={``}>
                                    Updated: {formatDatetime(favorite.actualObject.updatedAt)}
                                </p>
                                <div className="gap-2 d-flex flex-wrap me-2 d-md-none">
                                    {favorite?.actualObject?.tags?.map((tag: string, index: number) => (
                                        //@ts-ignore

                                        <BadgeTag key={tag?.name} tag={tag?.name} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-5 d-none d-md-flex">
                        <div className=" d-flex align-items-center gap-2">
                            {favorite?.actualObject?.tags?.map((tag: string, index: number) => (
                                //@ts-ignore

                                <BadgeTag key={tag?.name} tag={tag?.name} />
                            ))}
                        </div>
                    </div>
                    <div className="w-80">
                        <div className="d-flex flex-row flex-nowrap ms-auto align-end">
                            <Dropdown className="w-100 text-end">
                                <Dropdown.Toggle variant="default" className="border-0">
                                    <MoreHorizontal size={24} color="#454545" />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align={`end`}>
                                    <Dropdown.Item onClick={() => updateUrl()}>
                                        <Edit2 size={16} /> <span className="tb-body-default-regular">View</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={onRemoveFromFavorite}
                                        className="text-danger"
                                        target="_blank"
                                    >
                                        <StarSlash size={16} />{" "}
                                        <span className="tb-body-default-regular">Remove from Favorites</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
