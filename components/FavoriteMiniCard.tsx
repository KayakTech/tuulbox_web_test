import { Card, Dropdown } from "react-bootstrap";
import PdfIcon from "./icons/PdfIcon";
import { Archive, DocumentCopy, Edit2, StarSlash, User } from "iconsax-react";
import { MoreHorizontal } from "react-feather";
import { Favorite } from "@/repositories/favorites-repository";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";
import { useRouter } from "next/router";
import { copyText } from "@/helpers";
import { StorageFile } from "@/repositories/storage-repository";
import useFavorites from "@/hooks/favorites";

type FavoriteCardProps = {
    favorite: Favorite;
    onArchive?: () => void;
    onDelete?: () => void;
    onCopy?: () => void;
    viewDocumentFile?: (file: StorageFile) => {};
    isViewOnly?: boolean;
    onRemoveFromFavorites?: () => void;
};

export default function FavoriteCard(props: FavoriteCardProps) {
    const { favorite, onArchive, onCopy, viewDocumentFile, isViewOnly, onRemoveFromFavorites } = props;

    const router = useRouter();

    function title() {
        if (["resource"].includes(`${favorite.type}`)) {
            return (
                <p
                    className="m-0 text-gray-700 tb-body-default-medium truncate-2"
                    title={favorite?.actualObject?.description}
                >
                    {favorite?.actualObject?.description}
                </p>
            );
        }

        if (["contact"].includes(`${favorite.type}`)) {
            return (
                <p className="m-0 text-gray-700 tb-body-default-medium truncate-2">{`${
                    favorite?.actualObject?.firstName ?? ""
                } ${favorite?.actualObject?.lastName ?? ""}`}</p>
            );
        }

        return (
            <p className="text-gray-700 tb-body-default-medium m-0 truncate-1">
                {favorite?.actualObject?.name || favorite?.actualObject?.originalFileName}
            </p>
        );
    }

    function description() {
        if (["resource"].includes(`${favorite.type}`)) {
            return (
                <>
                    <small className="text-muted truncate-1 mb-0" title={favorite.actualObject.url}>
                        {favorite.actualObject.url}
                    </small>
                </>
            );
        }
    }

    function favoriteUrl() {
        if (
            favorite?.actualObject?.file &&
            typeof favorite?.actualObject?.file === "object" &&
            !Array.isArray(favorite?.actualObject?.file)
        ) {
            viewDocumentFile && viewDocumentFile(favorite.actualObject.file);
            return;
        }

        if (["storage"].includes(`${favorite.type}`)) {
            viewDocumentFile && viewDocumentFile(favorite.actualObject);
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
            link = favorite.actualObject.url;
        }
        if (["storage"].includes(`${favorite.type}`)) {
            link = favorite.actualObject.file;
        }
        copyText(link);
        onCopy && onCopy();
    }

    return (
        <Card className="d-flex gap-12 flex-row align-items-center w-100 p-12 border border-gray-100 position-relative rounded-3 shadow-sm">
            <div className="d-flex justify-content-betweenn gap-12 align-items-center w-100 h-46" onClick={favoriteUrl}>
                <div>
                    {favorite?.actualObject?.thumbnail || favorite?.actualObject?.projectLogo ? (
                        <Card.Header className="overflow-hidden border-0 pointer h-40 w-40 p-0 object-fit-cover rounded-3 flex-shrink-0">
                            <Card.Img
                                variant="top"
                                src={favorite?.actualObject?.thumbnail ?? favorite?.actualObject?.projectLogo}
                                className="object-fit-cover h-40 w-40 p-0 image rounded-3 border-0 flex-shrink-0 border-bottom-0 border-gray-100"
                            />
                        </Card.Header>
                    ) : (
                        <Card.Header
                            className={`bg-gray-50 rounded d-flex align-items-center p-0 justify-content-center flex-shrink-0 h-40 w-40 object-fit-cover ${
                                favorite.type === "resource" && "p-0"
                            }`}
                        >
                            {favorite.type === "resource" && (
                                <Card.Img
                                    className="image rounded-3 flex-shrink-0 object-fit-cover border-radius-bottom-0 h-40"
                                    src={favorite?.actualObject?.thumbnail ?? DEFAULT_RESOURCE_PREVIEW}
                                />
                            )}

                            {["storage"].includes(`${favorite.type}`) && <PdfIcon width={40} height={40} />}

                            {["contact"].includes(`${favorite.type}`) && <User color="#4F4F4F" className=" w-6 h-6" />}
                        </Card.Header>
                    )}
                </div>
                <div className="">
                    <span className="">
                        {title()}

                        <small className="text-gray-400 p-0 m-0 tb-body-small-regular truncate-1">
                            {description()}
                        </small>
                    </span>
                </div>
            </div>
            <div className="d-flex gap-3">
                <div>
                    <Dropdown className="w-100 text-end" drop="start">
                        <Dropdown.Toggle className="d-flex align-items-center justify-content-center border-0  bg-gray-50 h-24 w-24 p-0">
                            <MoreHorizontal size={16} color="#454545" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align={`end`} className="dropdown-menu">
                            {!isViewOnly && (
                                <>
                                    {["project"].includes(`${favorite.type}`) && (
                                        <Dropdown.Item onClick={onArchive}>
                                            <Archive size={16} />{" "}
                                            <span className="tb-body-default-regular">Archive</span>
                                        </Dropdown.Item>
                                    )}
                                    {["resource"].includes(`${favorite.type}`) && (
                                        <Dropdown.Item onClick={copyLink}>
                                            <DocumentCopy size={16} />{" "}
                                            <span className="tb-body-default-regular">Copy link</span>
                                        </Dropdown.Item>
                                    )}
                                    {["contact-document"].includes(`${favorite.type}`) && (
                                        <Dropdown.Item>
                                            <Edit2 size={16} color="#888888" />{" "}
                                            <span className="tb-body-default-regular">Download</span>
                                        </Dropdown.Item>
                                    )}

                                    <Dropdown.Item>
                                        <Edit2 size={16} color="#888888" />{" "}
                                        <span className="tb-body-default-regular">Update</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => {
                                            onRemoveFromFavorites?.();
                                        }}
                                        className="tb-body-default-regular"
                                    >
                                        <StarSlash size={16} />{" "}
                                        <span className="tb-body-default-regular">Remove from Favorites</span>
                                    </Dropdown.Item>
                                </>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </Card>
    );
}
