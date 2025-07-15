import { Card, Dropdown } from "react-bootstrap";
import { MoreHorizontal, Edit2 } from "react-feather";
import Image from "next/image";
import { InsuranceData } from "@/repositories/business-repository";
import { formatPhoneNumber, formatDatetime, snakeCaseToSentenceCase } from "@/helpers";
import PdfIcon from "./icons/PdfIcon";
import Link from "next/link";
import { ArchiveAdd, ArchiveMinus, ExportSquare, Trash } from "iconsax-react";

type InsuranceCardProps = {
    insurance: Partial<InsuranceData>;
    onUpdate: () => void;
    onDelete: () => void;
    viewDocumentFile: (file: any) => void;
    onArchive: () => void;
};

export default function InsuranceCard(props: InsuranceCardProps) {
    const { insurance, onUpdate, onDelete, viewDocumentFile, onArchive } = props;
    return (
        <div className="container mt-4">
            <Card className="p-3s border-radius-12 w-100 ">
                <div className="d-flex flex-column w-100">
                    {/* CARRIER */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">Carrier</small>
                        <div className="d-flex flex-column gap-2">
                            <span className="text-muted tb-body-default-medium">{insurance?.carrier ?? "-"}</span>
                            <span className="text-muted tb-body-default-medium">
                                {insurance.customInsuranceType || insurance.insuranceType
                                    ? snakeCaseToSentenceCase(insurance.customInsuranceType || insurance.insuranceType)
                                    : "-"}
                            </span>
                        </div>
                    </div>

                    {/* AGENT */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">Agent</small>
                        <span className="text-muted tb-body-default-medium">{insurance.agent ?? "-"}</span>
                    </div>

                    {/* BROKER */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">Broker</small>
                        <span className="text-muted tb-body-default-medium">{insurance.broker ?? "-"}</span>
                    </div>

                    {/* CONTACT */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">Contact</small>
                        <div className="d-flex flex-column gap-2">
                            <span className="text-muted tb-body-default-medium">
                                {insurance.contact ? (
                                    <a href={`tel:${insurance.contact}`} className="text-blue-900 text-decoration-none">
                                        {insurance.contact}
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </span>
                            <span className="text-muted tb-body-default-medium">
                                {insurance.email ? (
                                    <a
                                        title={insurance.email}
                                        href={`mailto:${insurance.email}`}
                                        className="text-decoration-none text-blue-900"
                                    >
                                        {insurance.email}
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </span>
                            <span className="text-muted tb-body-default-medium">
                                Extension: {insurance.extension ?? "-"}
                            </span>
                        </div>
                    </div>

                    {/* POLICY */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">POLICY</small>
                        <div>
                            {insurance?.file ? (
                                <div className="d-flex flex-nowrap flex-row">
                                    {insurance.file?.thumbnail ? (
                                        <Image
                                            src={insurance.file.thumbnail}
                                            width={24}
                                            height={24}
                                            alt="file"
                                            className="flex-shrink-0"
                                        />
                                    ) : (
                                        <PdfIcon width={24} height={24} />
                                    )}

                                    <Link
                                        href={"#!"}
                                        onClick={() => viewDocumentFile(insurance.file)}
                                        className="ms-2 text-muted"
                                    >
                                        {insurance?.file?.originalFileName}
                                    </Link>
                                </div>
                            ) : (
                                "-"
                            )}
                            <span className="text-muted tb-body-default-medium">{insurance.policyNumber ?? "-"}</span>
                        </div>
                    </div>

                    {/* PERIOD */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">Period</small>
                        <span className="text-muted tb-body-default-medium">
                            {insurance.validFrom && insurance.validTo
                                ? `${formatDatetime(insurance.validFrom)} to ${formatDatetime(insurance.validTo)}`
                                : "-"}
                        </span>
                    </div>

                    {/* REMINDER */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">REMINDER</small>
                        <span className="text-muted tb-body-default-medium">{formatDatetime(insurance.reminder)}</span>
                    </div>

                    {/* ACTION */}
                    <div className="d-flex justify-content-between align-items-center py-3 gap-3 px-3">
                        <small className="text-muted tb-body-title-caps">ACTION</small>
                        <Dropdown>
                            <Dropdown.Toggle as="button" variant="secondary" size="sm" className="btn ">
                                <MoreHorizontal size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item href={`/business/insurance/${insurance.id}`}>
                                    <ExportSquare size={16} className="me-2" /> View Details
                                </Dropdown.Item>
                                <Dropdown.Item onClick={onUpdate}>
                                    <Edit2 size={16} className="me-2" /> Update
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
                                <Dropdown.Item onClick={onDelete}>
                                    <Trash size={16} className=" me-2 text-danger" />
                                    <span className="text-danger">Delete</span>{" "}
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </Card>
        </div>
    );
}
