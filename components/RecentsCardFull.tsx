import { Button, Dropdown } from "react-bootstrap";
import BadgeTag from "./BadgeTag";
import PdfIcon from "./icons/PdfIcon";
import { MoreHorizontal } from "react-feather";
import { DocumentCopy, DocumentDownload, Edit2, ExportSquare, Star1, StarSlash, Trash } from "iconsax-react";
import { Favorite } from "@/repositories/favorites-repository";
import { Tag } from "@/repositories/storage-repository";
import Image from "next/image";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";
import { Resource } from "@/repositories/resource-repository";
import Link from "next/link";
import { RecentActivity } from "@/repositories/recent-repository";
import { Iconly } from "react-iconly";

type FavoriteCardProps = {
    activity: RecentActivity;
    onDelete: (data: any) => void;
};

export default function RecentsCardFull(props: FavoriteCardProps) {
    const { activity, onDelete } = props;

    function title() {
        return (
            <p className="m-0 truncate-1 text-gray-700" title={activity?.originalObject?.description}>
                {activity?.originalObject?.description}
            </p>
        );
    }

    function description() {
        if (["resources"].includes(activity.category)) {
            return (
                <>
                    <Link
                        className="text-blue-900 truncate-1 my-1 w-75"
                        href={activity?.originalObject?.url}
                        title={activity?.originalObject?.url}
                        target="_blank"
                    >
                        {activity?.originalObject?.url}
                    </Link>
                </>
            );
        }

        return (
            <>
                <p className="text-muted truncate-1 my-1 w-75" title={activity?.originalObject?.url}>
                    {activity?.originalObject?.url}
                </p>
            </>
        );
    }

    function tags() {
        return (
            <>
                {activity?.originalObject?.tags?.length > 0 && (
                    <div className="d-flex flex-wrap gap-3">
                        {activity?.originalObject?.tags?.map((tag: Tag, index: number) => (
                            <BadgeTag key={tag.id} tag={tag?.name} />
                        ))}
                    </div>
                )}
            </>
        );
    }

    function updateUrl() {
        if (["resources"].includes(`${activity.category}`)) {
            return `/links/edit/${activity.originalObject?.id}`;
        }
        if (["projects"].includes(`${activity.category}`)) {
            return `/projects/edit/${activity.originalObject?.id}`;
        }
        if (["storages"].includes(`${activity.category}`)) {
            return `/storage/edit/${activity.originalObject?.id}`;
        }
        return "javascript:void(0)";
    }

    return (
        <div className="d-flex align-items-center favorite-card-full">
            <>
                <Image
                    src={activity?.originalObject?.thumbnail || DEFAULT_RESOURCE_PREVIEW}
                    alt=""
                    className="border-radius-12 border border-gray-100 object-fit-cover"
                    width={80}
                    height={80}
                />
            </>
            <div className="ms-2 w-75">
                {title()}
                {description()}
                {tags()}
            </div>

            <div className="d-flex flex-row flex-nowrap ms-auto align-end">
                <div className="d-flex align-items-center flex-fill">
                    <Dropdown className="w-100 ms-auto" drop={"down"}>
                        <Dropdown.Toggle
                            size="sm"
                            variant="default"
                            className="btn-square float-end"
                            id="dropdown-basic"
                        >
                            <MoreHorizontal size={24} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align={`end`}>
                            <Dropdown.Item href={updateUrl()}>
                                <Edit2 size={16} className="" />
                                <span className="tb-body-default-regular">Update</span>
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => {
                                    onDelete(activity);
                                }}
                            >
                                <Trash size={16} color="#E70000" className="" />
                                <span className="text-danger tb-body-default-regular">Delete</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
}
