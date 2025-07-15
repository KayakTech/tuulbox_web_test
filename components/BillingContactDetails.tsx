import { Edit2 } from "iconsax-react";
import React from "react";
import { Button, Card, Col, Row } from "react-bootstrap";

interface BillingContactDetailsProps {
    contactData: {
        fullName: string;
        email: string;
        address: string;
        state: string;
        country: string;
        companyName: string;
        phoneNumber: string;
    };
}
export default function BillingContactDetails({ contactData }: BillingContactDetailsProps) {
    return (
        <div>
            <Card className="mt-3 border-radius-12 mb-3 border-gray-100">
                <Card.Header className="px-3 d-flex border-radius-12 py-3 border-gray-100 bg-white">
                    <div className="w-100">
                        <p className="m-0 tb-title-body-medium text-gray-800">Billing Contact</p>
                        <p className="text-muted mb-0 tb-body-small-regular mt-1">
                            <small>Manage your contact information</small>
                        </p>
                    </div>
                    <div className="w-100 d-flex align-items-center justify-content-end">
                        <Button size="sm" variant="secondary" className="tb-body-default-medium d-flex gap-2 p-0 m-0">
                            <Edit2 size="16" variant="Outline" className="stroke-blue-950" />
                            Edit contact
                        </Button>
                    </div>
                </Card.Header>
                <Card.Body className="pb-3 pt-4 d-flex flex-column gap-3">
                    <Row className="d-flex pt-4m justify-content-between gap-3m">
                        <Col md={4} className="">
                            <p className="m-0 tb-body-small-medium text-muted">
                                <small>Full Name</small>
                            </p>
                            <div className="d-flex gap-2">
                                <p className="m-0 tb-body-default-medium">Jim Johnson</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <p className="m-0 tb-body-small-medium text-muted">
                                <small>Company</small>
                            </p>
                            <p className="m-0 tb-body-default-medium">Caistor constructions</p>
                        </Col>
                        <Col md={4}>
                            <p className="m-0 tb-body-small-medium text-muted">
                                <small>Email</small>
                            </p>
                            <a
                                href={`mailto:Clayton@gmail.com`}
                                className="text-blue-900 tb-body-default-medium text-decoration-none"
                            >
                                Clayton@gmail.com
                            </a>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={4}>
                            <p className="m-0 tb-body-small-medium text-muted">
                                <small>Phone Number</small>
                            </p>
                            <a
                                href={`tel:${"+1 (123) 456 7890"}`}
                                className="text-blue-900 tb-body-default-medium text-decoration-none"
                            >
                                {"+1 (123) 456 7890"}
                            </a>
                        </Col>
                        <div className="d-flex flex-column gap-1 w-256">
                            <p className="m-0 tb-body-small-medium text-muted">
                                <small>Address</small>
                            </p>
                            <p className="m-0 tb-body-default-medium">
                                123 Test Way Livermore, CA, 94551 United States
                            </p>
                        </div>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}
