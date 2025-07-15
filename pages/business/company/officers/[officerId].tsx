import DashboardLayout from "@/components/DashboardLayout";
import DeleteModal from "@/components/DeleteModal";
import PageLoader from "@/components/PageLoader";
import { formatPhoneNumber, formatPhoneNumberWithSpace } from "@/helpers";
import useOfficers from "@/hooks/useOfficers";
import Link from "next/link";
import { useEffect } from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";

export default function OfficerDetails() {
    const {
        setOfficerId,
        getOfficer,
        officer,
        isLoading,
        deleteOfficer,
        showModal,
        setShowModal,
        isDeleting,
        triggerDelete,
    } = useOfficers();

    useEffect(() => {
        const id = window.location.pathname.split("/")[4];
        setOfficerId(id);
        getOfficer(id);
    }, []);

    return (
        <DashboardLayout
            pageTitle="Officer Details"
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "Company", url: "/business/company" },
                { name: "View Officer Details" },
            ]}
        >
            {isLoading ? (
                <PageLoader />
            ) : (
                <Container fluid className="mt-5">
                    <Card className="overflow-hidden mt-4">
                        <Card.Header className="p-16">
                            <div className="d-flex justify-content-between align-items-center">
                                <p className="tb-body-default-medium m-0">Officer details</p>
                                <span className="d-flex gap-3">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="px-3 bg-red-50 text-red-600 btn-secondary-danger"
                                        onClick={() => triggerDelete(officer)}
                                    >
                                        Delete
                                    </Button>
                                    <Link href={`/business/company/officers/edit/${officer.id}`}>
                                        <Button variant="secondary" size="sm" className="px-3">
                                            Update
                                        </Button>
                                    </Link>
                                </span>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-16">
                            <div className="d-flex flex-column gap-4">
                                <Row className="g-0">
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">First Name</p>
                                        {officer.firstname ? (
                                            <p className="tb-body-default-medium m-0">{officer.firstname}</p>
                                        ) : (
                                            "-"
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">Last Name</p>
                                        {officer.lastname ? (
                                            <p className="tb-body-default-medium m-0">{officer.lastname}</p>
                                        ) : (
                                            "-"
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">Email</p>
                                        <p className="tb-body-default-medium m-0">
                                            {officer.email ? (
                                                <a
                                                    title={officer?.email}
                                                    href={`mailto:${officer.email}`}
                                                    className="text-decoration-none text-blue-800"
                                                >
                                                    {officer?.email}
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </p>
                                    </Col>
                                </Row>
                                <Row className="g-0">
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">Phone</p>
                                        <p className="tb-body-default-medium m-0">
                                            {officer.mobileNumber ? (
                                                <a
                                                    href={`tel:${officer.mobileNumber}`}
                                                    className="text-decoration-none text-blue-800"
                                                >
                                                    {officer.mobileNumber}
                                                </a>
                                            ) : (
                                                "-"
                                            )}
                                        </p>
                                    </Col>
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">Extension</p>
                                        {officer.extension ? (
                                            <p className="tb-body-default-medium m-0">{officer.extension}</p>
                                        ) : (
                                            "-"
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">Job Title</p>
                                        <p className="tb-body-default-medium m-0">
                                            {officer.jobPosition ? (
                                                <p className="tb-body-default-medium m-0">{officer.jobPosition}</p>
                                            ) : (
                                                "-"
                                            )}
                                        </p>
                                    </Col>
                                </Row>
                                <Row className="g-0">
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">Address 1</p>
                                        {officer.addressLine1 ? (
                                            <p className="tb-body-default-medium m-0">{officer.addressLine1}</p>
                                        ) : (
                                            "-"
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">Address 2</p>
                                        {officer.addressLine2 ? (
                                            <p className="tb-body-default-medium m-0">{officer.addressLine2}</p>
                                        ) : (
                                            "-"
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">Zip code</p>
                                        <p className="tb-body-default-medium m-0">
                                            {officer.zipCode ? (
                                                <p className="tb-body-default-medium m-0">{officer.zipCode}</p>
                                            ) : (
                                                "-"
                                            )}
                                        </p>
                                    </Col>
                                </Row>
                                <Row className="g-0">
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">City</p>
                                        {officer.city ? (
                                            <p className="tb-body-default-medium m-0">{officer.city}</p>
                                        ) : (
                                            "-"
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">State</p>
                                        {officer.state ? (
                                            <p className="tb-body-default-medium m-0">{officer.state}</p>
                                        ) : (
                                            "-"
                                        )}
                                    </Col>
                                    <Col md={4}>
                                        <p className="tb-body-small-medium text-gray-400 m-0">Country</p>
                                        <p className="tb-body-default-medium m-0">
                                            {officer.country ? (
                                                <p className="tb-body-default-medium m-0">{officer.country}</p>
                                            ) : (
                                                "-"
                                            )}
                                        </p>
                                    </Col>
                                </Row>
                            </div>
                        </Card.Body>
                    </Card>

                    <DeleteModal
                        showModal={showModal}
                        setShowModal={(value: boolean) => setShowModal(value)}
                        dataToDeleteName={"Officer"}
                        isDeleting={isDeleting}
                        onYesDelete={() => deleteOfficer(`/business/company`)}
                    />
                </Container>
            )}
        </DashboardLayout>
    );
}
