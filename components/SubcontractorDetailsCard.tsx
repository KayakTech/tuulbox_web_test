import { Subcontractor } from "@/repositories/subcontractor-repository";
import { Card, Col, Dropdown, Row } from "react-bootstrap";
import { Edit2, Message, Star1, Trash } from "iconsax-react";
import { MoreVertical } from "react-feather";
import Image from "next/image";

type SubcontractorDetailsCardProps = {
    subContractor: Subcontractor;
    onUpdate?: () => void;
    onDelete?: () => void;
    onAddToFavorites?: () => void;
};

export default function SubcontractorDetailsCard(props: SubcontractorDetailsCardProps) {
    const { subContractor, onUpdate, onDelete, onAddToFavorites } = props;

    return (
        <Card className="overflow-hidden">
            <Card.Header className="p-16 d-flex justify-content-between">
                <div className="d-flex justify-content-between tb-body-default-medium text-gray-800 align-items-center">
                    Subcontractor details
                </div>
                <span className="ms-auto">
                    <Dropdown className="w-100">
                        <Dropdown.Toggle
                            size="sm"
                            variant="default"
                            className="btn-square border-0"
                            id="dropdown-basic"
                        >
                            <MoreVertical size={24} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end">
                            <Dropdown.Item href="">
                                <Message size={16} /> <span className="tb-body-default-regular">Send Email</span>
                            </Dropdown.Item>
                            {onUpdate && (
                                <Dropdown.Item onClick={onUpdate}>
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                            )}
                            {onAddToFavorites && (
                                <Dropdown.Item onClick={onAddToFavorites}>
                                    <Star1 size={16} color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Add to Favorites </span>
                                </Dropdown.Item>
                            )}
                            {onDelete && (
                                <Dropdown.Item className="text-danger" onClick={onDelete}>
                                    <Trash size={16} className="" color="#E70000" />
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </span>
            </Card.Header>
            <Card.Body className="p-16">
                <div className="d-flex flex-column gap-4">
                    <Row className="g-0">
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">Business Name</p>
                            <span className="d-flex gap-2">
                                {subContractor?.contact?.profilePicture && (
                                    <Image
                                        src={subContractor.contact.profilePicture}
                                        alt=""
                                        width={44}
                                        height={44}
                                        className="border-radius-4 object-fit-cover"
                                    />
                                )}
                                <span>
                                    <p className="tb-body-default-medium m-0 text-gray-800">
                                        {subContractor?.contact?.company}
                                    </p>
                                </span>
                            </span>
                        </Col>
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">Contact Person</p>
                            <p className="tb-body-default-medium text-gray-800 m-0">
                                {subContractor?.contact?.firstName} {subContractor?.contact?.lastName}
                            </p>
                        </Col>
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">Status</p>
                            <p className="tb-body-default-medium text-gray-800 m-0">
                                {subContractor?.contact?.status || "-"}
                            </p>
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">Email</p>
                            {subContractor?.contact?.email ? (
                                <a
                                    title={subContractor.contact.email}
                                    href={`mailto:${subContractor.contact.email}`}
                                    className="tb-body-default-medium truncat-1 m-0 text-blue-900 text-decoration-none"
                                >
                                    {subContractor.contact.email}
                                </a>
                            ) : (
                                "-"
                            )}
                        </Col>
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">Phone</p>
                            {subContractor?.contact?.phoneNumber ? (
                                <a
                                    href={`tel:${subContractor.contact.phoneNumber}`}
                                    className="tb-body-default-medium m-0 text-blue-900 text-decoration-none"
                                >
                                    {subContractor.contact.phoneNumber}
                                </a>
                            ) : (
                                "-"
                            )}
                        </Col>
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">Extension</p>
                            <p className="tb-body-default-medium m-0">{subContractor?.contact?.extension || "-"}</p>
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">Address Line 1</p>
                            <p className="tb-body-default-medium m-0">{subContractor?.contact?.addressLine1 || "-"}</p>
                        </Col>
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">Address Line 2</p>
                            <p className="tb-body-default-medium text-gray-800 m-0">
                                {subContractor?.contact?.addressLine2 || "-"}
                            </p>
                        </Col>
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">City</p>
                            <p className="tb-body-default-medium text-gray-800 m-0">
                                {subContractor?.contact?.city || "-"}
                            </p>
                        </Col>
                    </Row>
                    <Row className="g-0">
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">State</p>
                            <p className="tb-body-default-medium m-0">{subContractor?.contact?.state || "-"}</p>
                        </Col>
                        <Col md={4}>
                            <p className="tb-body-small-medium text-gray-400 m-0">Zip Code</p>
                            <p className="tb-body-default-medium text-gray-800 m-0">
                                {subContractor?.contact?.zipCode || "-"}
                            </p>
                        </Col>
                    </Row>
                </div>
            </Card.Body>
        </Card>
    );
}
