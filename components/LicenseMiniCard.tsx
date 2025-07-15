import { snakeCaseToSentenceCase } from "@/helpers";
import { LicenseData } from "@/repositories/business-repository";
import { Card, Dropdown, Row } from "react-bootstrap";
import { MoreHorizontal, Trash } from "react-feather";
import PdfIcon from "./icons/PdfIcon";
import { ArchiveAdd, ArchiveMinus, Edit2, ExportSquare, StarSlash } from "iconsax-react";

type LicenseCardSmallProps = {
    license: Partial<LicenseData>;
    onUpdate?: () => void;
    onDelete?: () => void;
    onArchive?: () => void;
    viewDocumentFile?: (file: any) => void;
    isViewOnly?: boolean;
    onAddToFavorites?: (value: Record<string, string>) => void;
    onRemoveFromRecent?: () => void;
};

export default function LicenseMiniCard(props: LicenseCardSmallProps) {
    const { license, onUpdate, onDelete, onArchive, onRemoveFromRecent, isViewOnly } = props;
    return (
        <Card className="d-flex gap-12 flex-row align-items-center w-100 p-12 border border-gray-100 rounded-3 shadow-sm">
            <div
                className="d-flex gap-12 align-items-center w-100 h-46"
                onClick={() => (window.location.href = `/business/license/${license.id}`)}
            >
                <div>
                    {license?.file?.thumbnail ? (
                        <div className="overflow-hidden pointer object-fit-cover rounded-3 h-40 w-40 flex-shrink-0">
                            <Card.Img
                                className="image round-topm flex-shrink-0 object-fit-cover border-radius-bottom-0 h-40 w-40"
                                src={license?.file.thumbnail ?? ""}
                            />
                        </div>
                    ) : (
                        <Card.Header className="bg-gray-50 object-fit-cover flex-shrink-0 d-flex p-0 justify-content-center align-items-center rounded-3 border-0 h-40 w-40 position-relative">
                            <PdfIcon width={40} height={40} />
                        </Card.Header>
                    )}
                </div>
                <div className="d-flex flex-column">
                    <span className="text-gray-700 tb-body-default-medium text-truncate text-capitalize">
                        {license?.name}
                    </span>
                    {license?.licenseType && (
                        <span className="text-gray-700 tb-body-small-regular">
                            {snakeCaseToSentenceCase(license?.licenseType)}
                        </span>
                    )}
                </div>
            </div>
            <div className="">
                <div className="d-flex gap-3 ">
                    <Dropdown className="w-100 text-end" drop="start">
                        <Dropdown.Toggle className="d-flex align-items-center justify-content-center border-0  bg-gray-50 h-24 w-24 p-0">
                            <MoreHorizontal size={16} color="#454545" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align={`end`} className="document-dropdownm " data-bs-popper="static">
                            <>
                                <Dropdown.Item onClick={onUpdate}>
                                    <Edit2 className="" size={16} />{" "}
                                    <span className="tb-body-default-regular">{"Update"}</span>
                                </Dropdown.Item>
                                <>
                                    <Dropdown.Item onClick={onArchive}>
                                        {license.status === "active" ? (
                                            <ArchiveAdd size={16} color="#888888" />
                                        ) : (
                                            <ArchiveMinus size={16} color="#888888" />
                                        )}
                                        <span className="tb-body-default-regular">
                                            {license.status === "active" ? "Archive" : "Unarchive"}
                                        </span>
                                    </Dropdown.Item>
                                </>

                                {onRemoveFromRecent && (
                                    <Dropdown.Item
                                        onClick={() => {
                                            onRemoveFromRecent?.();
                                        }}
                                    >
                                        <StarSlash size={16} color="#888888" />{" "}
                                        <span className="tb-body-default-regular">Remove from Recent</span>
                                    </Dropdown.Item>
                                )}
                                {!isViewOnly && (
                                    <Dropdown.Item className="text-danger" onClick={onDelete}>
                                        <Trash className="" size={16} color="#E70000" />
                                        <span className="tb-body-default-regular text-danger">Delete</span>
                                    </Dropdown.Item>
                                )}
                            </>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </Card>
    );
}
