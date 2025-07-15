import { Dropdown } from "react-bootstrap";
import { Edit2, MoreHorizontal } from "react-feather";
import { Star1, StarSlash } from "iconsax-react";
import BadgeTag from "./BadgeTag";
import { Favorite } from "@/repositories/favorites-repository";
import { formatDatetime } from "@/helpers";
import { Tag } from "@/repositories/resource-repository";

type FavoriteOverviewCardFullProps = {
    favorite: Favorite;
    onRemoveFromFavorite: () => void;
};

export default function FavoriteOverviewCardFull(props: FavoriteOverviewCardFullProps) {
    const { favorite, onRemoveFromFavorite } = props;

    function updateUrl() {
        if (["resource"].includes(`${favorite.type}`)) {
            return `/links/edit/${favorite.actualObject?.id}`;
        }
        if (["project"].includes(`${favorite.type}`)) {
            return `/projects/edit/${favorite.actualObject?.id}`;
        }
        if (["storage"].includes(`${favorite.type}`)) {
            return `/storage/edit/${favorite.actualObject?.id}`;
        }
        return "javascript:void(0)";
    }

    return (
        <div className="d-flex align-items-center mb-3">
            <Star1 variant="Outline" size={80} color="#B0B0B0" />
            <div className="ms-2">
                <p className="m-0 truncate-1 text-gray-700 tb-body-default-medium">
                    {favorite?.actualObject?.description ||
                        favorite?.actualObject?.name ||
                        favorite?.actualObject?.originalFileName}
                </p>
                <p className="text-muted tb-body-small-regular truncate-1 my-1" title={``}>
                    Updated: {formatDatetime(favorite?.actualObject?.updatedAt)}
                </p>
                <div className="d-flex flex-wrap gap-3">
                    {favorite?.actualObject?.tags?.length > 0 && (
                        <div className="d-flex flex-wrap gap-3">
                            {favorite?.actualObject?.tags?.map((tag: Tag, index: number) => (
                                <BadgeTag key={tag.id} tag={tag?.name} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="d-flex flex-row flex-nowrap ms-auto align-end">
                <Dropdown className="w-100 text-end">
                    <Dropdown.Toggle variant="default" className="">
                        <MoreHorizontal size={24} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu align={`end`}>
                        <Dropdown.Item href={updateUrl()}>
                            <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={onRemoveFromFavorite} className="text-danger" target="_blank">
                            <StarSlash size={16} />{" "}
                            <span className="tb-body-default-regular">Remove from Favorites</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
}
