import { formatDatetime } from "@/helpers";
import { LicenseData } from "@/repositories/business-repository";
import { ArchiveAdd, ArchiveMinus, ExportSquare, Trash } from "iconsax-react";
import { Card, Dropdown } from "react-bootstrap";
import { MoreHorizontal, Edit2 } from "react-feather";

type LicenseCardProps = {
    license: Partial<LicenseData>;
    onUpdate: () => void;
    onDelete: () => void;
    onArchive?: () => void;
};

export default function LicenseCard(props: LicenseCardProps) {
    const { license, onUpdate, onDelete, onArchive } = props;
    return (
        <div className="container mt-4">
            <Card className="border-radius-12 w-100 ">
                <div className="d-flex flex-column w-100">
                    {/* LICENSE */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">LICENSE</small>
                        <span className="text-muted tb-body-default-medium">{license.name ?? "-"}</span>
                    </div>

                    {/* TYPE */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">TYPE</small>
                        <span className="text-muted tb-body-default-medium">{license?.licenseType ?? "-"}</span>
                    </div>

                    {/* NUMBER */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">NUMBER</small>
                        <span className="text-muted tb-body-default-medium">{license?.licenseNumber ?? "-"}</span>
                    </div>

                    {/* PERIOD */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">PERIOD</small>
                        <span className="text-muted tb-body-default-medium">
                            {license.validFrom && license.validTo
                                ? `${formatDatetime(license.validFrom)} to ${formatDatetime(license.validTo)}`
                                : "-"}
                        </span>
                    </div>

                    {/* REMINDER */}
                    <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                        <small className="text-muted tb-body-title-caps">REMINDER</small>
                        <span className="text-muted tb-body-default-medium">
                            {license.reminder ? formatDatetime(license.reminder) : "-"}
                        </span>
                    </div>

                    {/* ACTION */}
                    <div className="d-flex justify-content-between align-items-center py-3 gap-3 px-3">
                        <small className="text-muted tb-body-title-caps">ACTION</small>
                        <Dropdown>
                            <Dropdown.Toggle
                                as="button"
                                variant="secondary"
                                size="sm"
                                className="btn btn-square border-0"
                            >
                                <MoreHorizontal size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item href={`/business/license/${license.id}`}>
                                    <ExportSquare size={16} className="me-2" /> View Details
                                </Dropdown.Item>
                                <Dropdown.Item onClick={onUpdate}>
                                    <Edit2 size={16} className="me-2" /> Edit
                                </Dropdown.Item>

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

                                <Dropdown.Item onClick={onDelete}>
                                    <Trash size={16} className="me-2 text-danger" />{" "}
                                    <span className="text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
            </Card>
        </div>
    );
}
