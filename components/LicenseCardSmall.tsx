import { currentPage, snakeCaseToSentenceCase } from "@/helpers";
import { LicenseData } from "@/repositories/business-repository";
import { Button, Card, Col, Dropdown, Row } from "react-bootstrap";
import { MoreHorizontal } from "react-feather";
import PdfIcon from "./icons/PdfIcon";
import { ArchiveAdd, ArchiveMinus, Edit2, ExportSquare, Personalcard, Trash } from "iconsax-react";
import project from "@/hooks/project";
import Link from "next/dist/client/link";

type LicenseCardSmallProps = {
    license: Partial<LicenseData>;
    onUpdate?: () => void;
    onDelete?: () => void;
    onArchive?: () => void;
    viewDocumentFile?: (file: any) => void;
    isViewOnly?: boolean;
};

export default function LicenseCardSmall(props: LicenseCardSmallProps) {
    const { license, onUpdate, onDelete, onArchive, viewDocumentFile, isViewOnly } = props;
    return (
        <Card className="h-100m w-100 cursor-pointer">
            <div onClick={() => (window.location.href = `/business/license/${license.id}`)}>
                {license?.file?.thumbnail ? (
                    <div className="bg-gray-50m pt-12 pb-0 pe-12 ps-12 border-readius-12">
                        <Card.Img
                            variant="top"
                            src={license?.file.thumbnail}
                            className="object-fit-cover border-radius-12 h-128 flex-shrink-0 border-0 border-gray-100 "
                        />
                    </div>
                ) : (
                    <Card.Header className="bg-gray-50m border-0 h-128 object-fit-cover flex-shrink-0 pt-12 pb-0 pe-12 ps-12 round-top position-relative">
                        <div className="d-flex bg-gray-50 border-radius-12 justify-content-center flex-shrink-0 object-fit-cover align-items-center h-100">
                            <Personalcard width={32} height={32} color="#888888" />
                        </div>
                    </Card.Header>
                )}
            </div>
            <Card.Body className="px-3 pb-0 pt-3 pb-3 d-flex justify-content-between align-items-center">
                <div className="d-flex flex-column justify-content-center gap-1m ">
                    <span className="text-gray-700 tb-body-default-medium truncate-1 text-capitalize">
                        {license?.name}
                    </span>
                    {license?.licenseType && (
                        <span className="text-gray-700 tb-body-small-regular">
                            {snakeCaseToSentenceCase(license?.licenseType)}
                        </span>
                    )}
                </div>
                <div className="">
                    <Dropdown className="w-100 text-end" drop="start">
                        <Dropdown.Toggle
                            variant="default"
                            className="btn d-flex align-items-center bg-gray-50 h-44 w-44 border-radius-40"
                        >
                            <MoreHorizontal size={24} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align={`end`} className="document-dropdown " data-bs-popper="static">
                            <>
                                <Dropdown.Item onClick={onUpdate}>
                                    <Edit2 className="" size={16} />{" "}
                                    <span className="tb-body-default-regular">{"Update"}</span>
                                </Dropdown.Item>

                                {currentPage(2) === "license" && (
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
                                )}
                                {!isViewOnly && (
                                    <Dropdown.Item className="text-danger" onClick={onDelete}>
                                        <Trash className="me-2m text-danger" size={16} />
                                        <span className="tb-body-default-regular text-danger">Delete</span>
                                    </Dropdown.Item>
                                )}
                            </>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </Card.Body>
        </Card>
    );
}
