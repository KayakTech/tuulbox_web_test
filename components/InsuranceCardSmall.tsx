import { Button, Card, Col, Dropdown, Row } from "react-bootstrap";
import { MoreHorizontal } from "react-feather";
import { InsuranceData } from "@/repositories/business-repository";
import { formatPhoneNumber, snakeCaseToSentenceCase } from "@/helpers";
import PdfIcon from "./icons/PdfIcon";
import Link from "next/link";
import {
    Archive,
    ArchiveAdd,
    ArchiveBook,
    ArchiveMinus,
    Edit2,
    ExportSquare,
    ReceiveSquare,
    ShieldTick,
    Trash,
} from "iconsax-react";

type InsuranceCardSmallProps = {
    insurance: Partial<InsuranceData>;
    onUpdate?: () => void;
    onDelete?: () => void;
    viewDocumentFile?: (file: any) => void;
    isViewOnly?: boolean;
    onArchive?: () => void;
};

export default function InsuranceCardSmall(props: InsuranceCardSmallProps) {
    const { insurance, onUpdate, onDelete, viewDocumentFile, isViewOnly, onArchive } = props;
    return (
        <Card className="h-100m">
            <div onClick={() => (window.location.href = `/business/insurance/${insurance.id}`)}>
                {insurance?.file?.thumbnail ? (
                    <div className="bg-gray-50m pt-12 pb-0 pe-12 ps-12 border-readius-12 object-fit-cover flex-shrink-0">
                        <div className="h-128 border-radius-12 object-fit-cover flex-shrink-0">
                            <Card.Img
                                variant="top"
                                src={insurance?.file.thumbnail}
                                className="object-fit-cover border-radius-12 h-128 flex-shrink-0 border-bottomm border-gray-100 bg-gray-50"
                            />
                        </div>
                    </div>
                ) : (
                    <Card.Header className="h-128 object-fit-cover border-0 border-radius-12 bg-transparent flex-shrink-0  pt-12 pb-0 pe-12 ps-12  overflow-hidden position-relative">
                        <div className="d-flex justify-content-center bg-gray-50 flex-shrink-0 border-radius-12  object-fit-cover align-items-center h-100">
                            <ShieldTick width={32} height={32} color="#888888" />
                        </div>
                    </Card.Header>
                )}
            </div>
            <div className="px-0 pt-0 pb-12 d-flex align-items-center justify-content-between">
                <div className="px-12 pt-3 w-100">
                    <div className="d-flex justify-content-between align-items-center h-46">
                        <div className="d-flex flex-column gap-1">
                            <span className="text-gray-700 tb-body-default-medium text-truncate text-capitalizem">
                                {insurance?.carrier}
                            </span>
                            {insurance?.insuranceType && (
                                <span className="text-gray-700 m-0 tb-body-small-regular">
                                    {snakeCaseToSentenceCase(insurance?.insuranceType)}
                                </span>
                            )}
                        </div>
                        <div className="d-flex gap-3 ">
                            <div className="">
                                <Dropdown className="w-100 text-end" drop="start">
                                    <Dropdown.Toggle className="d-flex align-items-center justify-content-center border-0 border-radius-40  bg-gray-50 h-40 w-40 p-0">
                                        <MoreHorizontal size={24} color="#454545" />
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
                                        </>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
