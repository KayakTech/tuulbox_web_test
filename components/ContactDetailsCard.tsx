import { info } from "console";
import { Card, Row, Col, Dropdown } from "react-bootstrap";
import Image from "next/image";
import { MoreHorizontal, Edit2, Trash } from "react-feather";
import { Star1, User } from "iconsax-react";
import { Subcontractor } from "@/repositories/subcontractor-repository";
import { formatPhoneNumber, formatPhoneNumberWithSpace } from "@/helpers";

type ContactDetailsCardProps = {
    subcontractor?: Subcontractor;
    onUpdate: () => void;
    onDelete: () => void;
    onAddToFavorites: () => void;
};

export default function ContactDetailsCard(props: ContactDetailsCardProps) {
    const { subcontractor, onUpdate, onDelete, onAddToFavorites } = props;
    return (
        <div className="container mt-3">
            <Card className=" border-radius-12 p-0">
                <Row className="py-3 px-3">
                    <Col xs={12} className="border-gray-100 border-bottom ">
                        <h6 className="text-gray-800 tb-title-body-medium text-capitalize">Full Name</h6>
                        <div className="d-flex align-items-center gap-2 py-3 ">
                            <div className="bg-gray-50 rounded-circle w-40 h-40 object-fit-cover flex-shrink-0 d-flex align-items-center justify-content-center">
                                {subcontractor?.contact?.profilePicture ? (
                                    <Image
                                        src={subcontractor.contact.profilePicture}
                                        className="rounded-circle object-fit-cover flex-shrink-0 "
                                        alt="profile picture"
                                    />
                                ) : (
                                    <User size={16} color="#B0B0B0" />
                                )}
                            </div>
                            <span className="ms-2">
                                {subcontractor?.contact?.firstName ?? ""} {subcontractor?.contact?.lastName ?? ""}
                            </span>
                        </div>
                    </Col>
                </Row>

                <Row className=" px-3">
                    <Col xs={12} className="border-gray-100 border-bottom">
                        <h6 className="text-gray-800 tb-title-body-medium text-capitalize">Contact</h6>
                        <div className="d-flex flex-column gap-1 py-3">
                            <p className="text-primary m-0">
                                {subcontractor?.contact?.email ? (
                                    <a
                                        title={subcontractor?.contact?.email.toLowerCase()}
                                        href={`mailto:${subcontractor?.contact?.email}`}
                                        className="text-blue-900 text-decoration-none"
                                    >
                                        {subcontractor?.contact?.email.toLowerCase()}
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </p>
                            {subcontractor?.contact?.phoneNumber && (
                                <p className="text-primary m-0">
                                    <a
                                        href={`tel:${subcontractor?.contact?.phoneNumber}`}
                                        className="text-blue-900 text-decoration-none"
                                    >
                                        {subcontractor?.contact?.phoneNumber}
                                    </a>
                                </p>
                            )}

                            {subcontractor?.contact?.company && (
                                <p className="m-0">{subcontractor?.contact?.company}</p>
                            )}
                            <p className="m-0">Extension: {subcontractor?.contact?.extension ?? "-"}</p>
                        </div>
                    </Col>
                </Row>

                <Row className="py-3 gap-3 px-3">
                    <Col xs={12} className="border-gray-100 border-bottom ">
                        <h6 className="text-gray-800 tb-title-body-medium text-capitalize">Broker</h6>
                        <p>-</p>
                    </Col>
                </Row>

                <Row className=" gap-3 px-3">
                    <Col xs={12} className="border-gray-100 border-bottom ">
                        <h6 className="text-gray-800 tb-title-body-medium text-capitalize">Address</h6>
                        <div className="d-flex flex-column py-3">
                            {subcontractor?.contact?.addressLine1 && (
                                <span className="mb-1">{subcontractor?.contact?.addressLine1}</span>
                            )}
                            {subcontractor?.contact?.addressLine2 && (
                                <span className="mb-1">{subcontractor?.contact?.addressLine2}</span>
                            )}
                            {subcontractor?.contact?.country && (
                                <span className="mb-1">{subcontractor?.contact?.country}</span>
                            )}
                            {subcontractor?.contact?.state && (
                                <span className="mb-1">{subcontractor?.contact?.state}</span>
                            )}
                            {subcontractor?.contact?.city && (
                                <span className="mb-1">{subcontractor?.contact?.city}</span>
                            )}
                            {subcontractor?.contact?.zipCode && (
                                <span className="mb-1">{subcontractor?.contact?.zipCode}</span>
                            )}
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col xs={12} className="d-flex justify-content-between ">
                        <div className="d-flex justify-content-between align-items-center py-3 gap-3 px-3 w-100">
                            <small className="text-gray-800 tb-title-body-medium text-capitalize">Action</small>
                            <Dropdown>
                                <Dropdown.Toggle
                                    as="button"
                                    variant="default"
                                    className="btn btn-light bg-gray-50 border-0"
                                >
                                    <MoreHorizontal size={24} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={onUpdate}>
                                        <Edit2 size={16} className="me-2" /> Update
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={onAddToFavorites}>
                                        <Star1 size={16} className="me-2" /> Add to favorites
                                    </Dropdown.Item>

                                    <Dropdown.Item onClick={onDelete}>
                                        <Trash size={16} className="me-2 text-danger" />{" "}
                                        <span className="text-danger">Delete</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
