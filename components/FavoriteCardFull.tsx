import { Dropdown } from "react-bootstrap";
import BadgeTag from "./BadgeTag";
import PdfIcon from "./icons/PdfIcon";
import { MoreHorizontal } from "react-feather";
import { Archive, DocumentCopy, ExportSquare, People, StarSlash, Trash } from "iconsax-react";
import { Favorite } from "@/repositories/favorites-repository";
import { formatDatetime, copyText } from "@/helpers";
import { StorageFile, Tag } from "@/repositories/storage-repository";
import Image from "next/image";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";
import { useRouter } from "next/router";

type FavoriteCardProps = {
    favorite: Favorite;
    onArchive: () => void;
    onRemoveFromFavorites: () => void;
    onDelete: () => void;
    onCopy: () => void;
    viewDocumentFile: (file: StorageFile) => void;
};

export default function FavoriteCardFull(props: FavoriteCardProps) {
    const { favorite, onArchive, onRemoveFromFavorites, onDelete, onCopy, viewDocumentFile } = props;

    const router = useRouter();

    function title() {
        if (["resource"].includes(`${favorite?.type}`)) {
            return (
                <p className="m-0 truncate-1 text-gray-700" title={favorite?.actualObject?.description}>
                    {favorite?.actualObject?.description}
                </p>
            );
        }
        if (["contact"].includes(`${favorite?.type}`)) {
            return (
                <p className="m-0 truncate-1 text-gray-700">{`${favorite?.actualObject?.firstName ?? ""} ${
                    favorite?.actualObject?.lastName ?? ""
                }`}</p>
            );
        }
        return (
            <p className="m-0 truncate-1 text-gray-700">
                {favorite?.actualObject?.name || favorite?.actualObject?.originalFileName}
            </p>
        );
    }

    function description() {
        if (["resource"].includes(`${favorite.type}`)) {
            return (
                <>
                    <p className="text-muted truncate-1 my-1" title={favorite?.actualObject?.url}>
                        {favorite?.actualObject?.url}
                    </p>
                </>
            );
        }

        return (
            <>
                <p className="text-muted truncate-1 my-1" title={favorite?.actualObject?.url}>
                    Updated: {formatDatetime(favorite?.actualObject?.updatedAt)}
                </p>
            </>
        );
    }

    function tags() {
        return (
            <>
                {favorite?.actualObject?.tags?.length > 0 && (
                    <div className="d-flex flex-wrap gap-3">
                        {favorite?.actualObject?.tags?.map((tag: Tag, index: number) => (
                            <BadgeTag key={tag.id} tag={tag?.name} className="px-2 py-1" />
                        ))}
                    </div>
                )}
            </>
        );
    }

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

    function copyLink() {
        let link = "";
        if (["resource"].includes(`${favorite.type}`)) {
            link = favorite?.actualObject?.url;
        }
        if (["storage"].includes(`${favorite.type}`)) {
            link = favorite.actualObject.file;
        }
        copyText(link);
        onCopy();
    }

    return (
        <div className="d-flex align-items-center flex-shrink-0 object-fit-cover favorite-card-full ">
            {favorite.actualObject.thumbnail ? (
                <div className="border-radius-12 object-fit-cover" style={{ width: "80px", height: "80px" }}>
                    <Image
                        src={favorite.actualObject.thumbnail}
                        width={80}
                        height={80}
                        alt=""
                        className=" border-radius-12 flex-shrink-0 object-fit-cover h-100 favorite-img"
                    />
                </div>
            ) : (
                <>
                    {favorite.type === "resource" && (
                        <div className=" border-radius-12" style={{ width: "80px", height: "80px" }}>
                            <Image
                                src={favorite?.actualObject?.thumbnail || DEFAULT_RESOURCE_PREVIEW}
                                alt=""
                                className="border-radius-12 object-fit-cover flex-shrink-0 h-100 border border-gray-100 favorite-img"
                                width={80}
                                height={80}
                            />
                        </div>
                    )}
                    {["project", "storage"].includes(`${favorite.type}`) && <PdfIcon width={70} height={80} />}
                    {["contact"].includes(`${favorite.type}`) && (
                        <div
                            className="border-radius-12 border border-gray-100 d-flex"
                            style={{ width: "80px", height: "80px" }}
                        >
                            <People size={40} color="#888888" className=" m-auto" />
                        </div>
                    )}
                </>
            )}
            <div className="d-flex flex-column gap-2 ms-12">
                <span className="d-flex flex-column gap-1">
                    <p className="m-0 text-gray-600 tb-body-default-medium"> {title()}</p>
                    <p className="m-0 text-muted tb-body-small-regular">{description()}</p>
                </span>
                {tags()}
            </div>

            <div className="d-flex flex-row flex-nowrap ms-auto align-end">
                <Dropdown className="w-100 text-end">
                    <Dropdown.Toggle variant="default" className="btn border-0">
                        <MoreHorizontal size={24} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu align={`end`}>
                        <Dropdown.Item onClick={updateUrl}>
                            <ExportSquare size={16} /> <span className="tb-body-default-regular">View</span>
                        </Dropdown.Item>
                        {["project"].includes(`${favorite.type}`) && (
                            <Dropdown.Item onClick={onArchive}>
                                <Archive size="16" /> <span className="tb-body-default-regular">Archive</span>
                            </Dropdown.Item>
                        )}
                        {["storage", "resource"].includes(`${favorite.type}`) && (
                            <Dropdown.Item onClick={copyLink}>
                                <DocumentCopy size="16" /> <span className="tb-body-default-regular">Copy link</span>
                            </Dropdown.Item>
                        )}
                        <Dropdown.Item
                            onClick={onRemoveFromFavorites}
                            className="tb-body-default-regular"
                            target="_blank"
                        >
                            <StarSlash size={16} />{" "}
                            <span className="tb-body-default-regular">Remove from Favorites</span>
                        </Dropdown.Item>
                        <Dropdown.Item onClick={onDelete}>
                            <Trash size={16} className="text-danger" />{" "}
                            <span className="tb-body-default-regular text-danger">Delete</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
}
