import { Officer } from "@/repositories/business-repository";
import { Card, Dropdown } from "react-bootstrap";
import { MoreHorizontal, Edit2, Trash } from "react-feather";

type OfficerCardProps = {
    officer: Partial<Officer>;
    onUpdate: () => void;
    onDelete: () => void;
};

export default function OfficerCard(props: OfficerCardProps) {
    const { officer, onUpdate, onDelete } = props;
    return (
        <Card className="p-3s border-radius-12 ">
            <div className="d-flex flex-column">
                {/* LICENSE */}
                <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                    <small className="text-muted tb-body-title-caps">Officer</small>
                    <span className="text-muted tb-body-default-medium">{`${officer?.firstname ?? ""} ${
                        officer?.lastname ?? ""
                    }`}</span>
                </div>

                {/* TYPE */}
                <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                    <small className="text-muted tb-body-title-caps">Job Title</small>
                    <span className="text-muted tb-body-default-medium">{officer?.title ?? "-"}</span>
                </div>

                {/* NUMBER */}
                <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                    <small className="text-muted tb-body-title-caps">MObile</small>
                    <div className="d-flex flex-column">
                        <span className="text-muted tb-body-default-medium">
                            {officer?.mobileNumber ? (
                                <a href={`tel:${officer?.mobileNumber}`} className="text-blue-900 text-decoration-none">
                                    {officer?.mobileNumber}
                                </a>
                            ) : (
                                "-"
                            )}
                        </span>
                        <span className="text-muted tb-body-default-medium">{officer?.zipCode ?? "-"}</span>
                    </div>
                </div>

                {/* PERIOD */}
                <div className="d-flex flex-column py-3 gap-3 px-3 border-bottom border-gray-100">
                    <small className="text-muted tb-body-title-caps">Email</small>
                    <span className="text-muted tb-body-default-medium">
                        {officer.email ? (
                            <a
                                title={officer?.email}
                                href={`mailto:${officer?.email}`}
                                className="text-blue-900 text-decoration-none"
                            >
                                {officer?.email}
                            </a>
                        ) : (
                            "-"
                        )}
                    </span>
                </div>

                {/* ACTION */}
                <div className="d-flex justify-content-between align-items-center py-3 gap-3 px-3">
                    <small className="text-muted tb-body-title-caps">ACTION</small>
                    <Dropdown>
                        <Dropdown.Toggle as="button" variant="secondary" className="btn btn-square border-0">
                            <MoreHorizontal size={24} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={onUpdate}>
                                <Edit2 size={16} className="me-2" /> Update
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
    );
}
