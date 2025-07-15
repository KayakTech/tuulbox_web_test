import { Button, Card, Col, Dropdown, Row } from "react-bootstrap";
import { MoreHorizontal, Trash } from "react-feather";
import Image from "next/image";
import { InsuranceData } from "@/repositories/business-repository";
import { prop } from "cheerio/lib/api/attributes";
import { snakeCaseToSentenceCase } from "@/helpers";
import PdfIcon from "./icons/PdfIcon";
import Link from "next/link";
import { StorageFile } from "@/repositories/storage-repository";
import { ArchiveAdd, ArchiveMinus, Edit2, StarSlash } from "iconsax-react";

type InsuranceCardSmallProps = {
    insurance: Partial<InsuranceData>;
    onUpdate?: () => void;
    onArchive?: () => void;
    onDelete?: () => void;
    viewDocumentFile?: (file: any) => void;
    onAddToFavorites?: (value: Record<string, string>) => void;
    onRemoveFromFavorites?: () => void;
    onRemoveFromRecent?: () => void;
    isViewOnly?: boolean;
};

export default function InsuranceMiniCard(props: InsuranceCardSmallProps) {
    const { insurance, onUpdate, onDelete, onArchive, onRemoveFromRecent, isViewOnly } = props;
    return (
        <Card className="d-flex gap-12 flex-row align-items-center w-100 p-12 border border-gray-100 rounded-3 shadow-sm">
            <div
                className="d-flex gap-12 align-items-center w-100 h-46"
                onClick={() => (window.location.href = `/business/insurance/${insurance.id}`)}
            >
                <div>
                    {insurance?.file?.thumbnail ? (
                        <div className="overflow-hidden pointer object-fit-cover rounded-3 flex-shrink-0 h-40 w-40">
                            <Card.Img
                                className="image round-topm flex-shrink-0 object-fit-cover border-radius-bottom-0 h-40 w-40"
                                src={insurance?.file.thumbnail ?? ""}
                            />
                        </div>
                    ) : (
                        <Card.Header className="bg-gray-50 object-fit-cover flex-shrink-0 d-flex p-0 justify-content-center align-items-center rounded-3 border-0 h-40 w-40 position-relative">
                            <PdfIcon width={24} height={24} />
                        </Card.Header>
                    )}
                </div>
                <div className="d-flex flex-column gap-1">
                    <span className="text-gray-700 tb-body-default-medium text-truncate text-capitalize">
                        {insurance?.carrier}
                    </span>
                    {insurance?.insuranceType && (
                        <span className="text-gray-700 tb-body-small-regular">
                            {snakeCaseToSentenceCase(insurance?.insuranceType)}
                        </span>
                    )}
                </div>
            </div>
            <div>
                <div className="d-flex gap-3 ">
                    <div className="">
                        <Dropdown className="w-100 text-end" drop="start">
                            <Dropdown.Toggle className="d-flex align-items-center bg-gray-50 justify-content-center border-0 h-24 w-24 p-0">
                                <MoreHorizontal size={16} color="#454545" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`} className="document-dropdown " data-bs-popper="static">
                                <>
                                    <Dropdown.Item onClick={onUpdate}>
                                        <Edit2 className="" size={16} />{" "}
                                        <span className="tb-body-default-regular">{"Update"}</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={onArchive}>
                                        {insurance.status === "active" ? (
                                            <ArchiveAdd size={16} color="#888888" />
                                        ) : (
                                            <ArchiveMinus size={16} color="#888888" />
                                        )}
                                        <span className="tb-body-default-regular">
                                            {insurance.status === "active" ? "Archive" : "Unarchive"}
                                        </span>
                                    </Dropdown.Item>

                                    {!isViewOnly && (
                                        <Dropdown.Item className="text-danger" onClick={onDelete}>
                                            <Trash className="" size={16} color="#E70000" />
                                            <span className="tb-body-default-regular text-danger">Delete</span>
                                        </Dropdown.Item>
                                    )}

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
                                </>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </Card>
    );
}
