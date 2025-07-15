import { Card, CardImg, Dropdown } from "react-bootstrap";
import PdfIcon from "./icons/PdfIcon";
import { Archive, DocumentCopy, People, StarSlash, Trash } from "iconsax-react";
import { MoreHorizontal } from "react-feather";
import { Favorite } from "@/repositories/favorites-repository";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";
import { useRouter } from "next/router";
import { copyText } from "@/helpers";
import { StorageFile } from "@/repositories/storage-repository";
import { Contact } from "@/repositories/contact-repositories";

type FavoriteCardProps = {
    favorite: Favorite;
    onArchive?: () => void;
    onRemoveFromFavorites?: () => void;
    onDelete?: () => void;
    onCopy?: () => void;
    viewDocumentFile?: (file: StorageFile) => {};
    isViewOnly?: boolean;
};

export default function FavoriteCard(props: FavoriteCardProps) {
    const { favorite, onArchive, onRemoveFromFavorites, onCopy, viewDocumentFile, isViewOnly } = props;

    const router = useRouter();

    function title() {
        if (["resource"].includes(`${favorite.type}`)) {
            return (
                <p className="mb-1 truncate-2" title={favorite?.actualObject?.description}>
                    {favorite?.actualObject?.description}
                </p>
            );
        }

        if (["contact"].includes(`${favorite.type}`)) {
            return (
                <div className="d-flex align-items-center flex-column gap-1 justify-content-center w-100">
                    <p className="body-default-medium truncate-2 m-0">
                        {`${favorite?.actualObject?.firstName ?? ""} ${favorite?.actualObject?.lastName ?? ""}`}
                    </p>

                    {(favorite?.actualObject?.email || favorite?.actualObject?.phoneNumber) && (
                        <p className=" m-0 text-muted d-flex tb-body-small-regular">
                            {favorite?.actualObject?.phoneNumber && (
                                <a
                                    href={`tel:${favorite?.actualObject?.phoneNumber}`}
                                    className="text-decoration-none m-0 text-muted"
                                >
                                    {favorite?.actualObject?.phoneNumber}
                                </a>
                            )}
                            {favorite?.actualObject?.email && favorite?.actualObject?.phoneNumber && ` , `}
                            {favorite?.actualObject?.email && (
                                <a
                                    title={favorite?.actualObject?.email.toLowerCase()}
                                    href={`mailto:${favorite?.actualObject?.email}`}
                                    className="text-decoration-none ms-1 truncate-1 text-muted"
                                >
                                    {favorite?.actualObject?.email.toLowerCase()}
                                </a>
                            )}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <p className="text-gray-700 mb-1 truncate-1">
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

    function buttonText() {
        if (["resource"].includes(`${favorite.type}`)) {
            return "Open link";
        }
        if (["project", "contact"].includes(`${favorite.type}`)) {
            return "View Details";
        }

        return "View file";
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
        <Card className="w-100 h-100">
            <div onClick={favoriteUrl}>
                {favorite?.actualObject?.thumbnail || favorite?.actualObject?.projectLogo ? (
                    <div className="pt-12 pe-12 ps-12">
                        <CardImg
                            variant="top"
                            src={favorite?.actualObject?.thumbnail ?? favorite?.actualObject?.projectLogo}
                            className="object-fit-cover border-radius-12 h-128 flex-shrink-0 border-bottomm border-gray-100 bg-gray-50"
                        />
                    </div>
                ) : (
                    <Card.Header
                        className={`h-128 object-fit-cover border-0 round-top flex-shrink-0  pt-12 pe-12 ps-12 pb-0  position-relative ${
                            favorite.type === "resource" && "p-0"
                        }`}
                    >
                        {favorite.type === "resource" && (
                            <div className="pt-12m pe-12m ps-12m">
                                <CardImg
                                    variant="top"
                                    src={favorite?.actualObject?.thumbnail ?? DEFAULT_RESOURCE_PREVIEW}
                                    className="object-fit-cover border-radius-12 h-128 flex-shrink-0 border-bottomm border-gray-100 bg-gray-50"
                                />
                            </div>
                        )}

                        {["storage"].includes(`${favorite.type}`) && (
                            <div className="d-flex justify-content-center bg-gray-50 flex-shrink-0 border-radius-12  object-fit-cover align-items-center h-100">
                                <PdfIcon width={32} height={32} />
                            </div>
                        )}

                        {["contact"].includes(`${favorite.type}`) && (
                            <section className="d-flex flex-column align-items-center contact-card">
                                <div className="icon-box tb-title-medium text-gray-800">
                                    {favorite?.actualObject?.firstName?.charAt(0) ?? ""}
                                    {favorite?.actualObject?.lastName?.charAt(0) ?? ""}
                                </div>
                            </section>
                        )}
                    </Card.Header>
                )}
            </div>
            <Card.Body className="d-flex justify-content-between align-items-center">
                <div
                    className={`d-flex flex-column gap-2 ${
                        favorite.type === "contact" ? "w-100 justify-content-center" : ""
                    }`}
                >
                    <p className="m-0 text-gray-700 tb-body-default-medium">{title()}</p>
                </div>
                <div className="d-flex gap-3">
                    <div
                        className={`${favorite.type === "contact" ? "position-absolute top-0 right-0 me-2 mt-2" : ""}`}
                    >
                        <Dropdown className="w-100 text-end">
                            <Dropdown.Toggle className="btn w-44 border-radius-40 border-0 bg-gray-50">
                                <MoreHorizontal size={24} color="#454545" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                {!isViewOnly && (
                                    <>
                                        {["project"].includes(`${favorite.type}`) && (
                                            <Dropdown.Item onClick={onArchive}>
                                                <Archive size={16} />{" "}
                                                <span className="tb-body-default-regular">Archive</span>
                                            </Dropdown.Item>
                                        )}
                                        {["storage", "resource"].includes(`${favorite.type}`) && (
                                            <Dropdown.Item onClick={copyLink}>
                                                <DocumentCopy size={16} />{" "}
                                                <span className="tb-body-default-regular">Copy link</span>
                                            </Dropdown.Item>
                                        )}
                                        <Dropdown.Item
                                            onClick={onRemoveFromFavorites}
                                            className="tb-body-default-regular"
                                        >
                                            <StarSlash size={16} />{" "}
                                            <span className="tb-body-default-regular">Remove from Favorites</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={props.onDelete} className="text-danger">
                                            <Trash size={16} className="text-danger" />{" "}
                                            <span className="tb-body-default-regular text-danger">Delete</span>
                                        </Dropdown.Item>
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}
