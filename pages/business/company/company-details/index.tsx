import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Iconly } from "react-iconly";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function CompanyDetails() {
    const { company } = useSelector((state: RootState) => state.business);

    return (
        <DashboardLayout
            pageTitle="Company details"
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "Company details", url: "/business/company" },
                { name: "Update company details" },
            ]}
        >
            <div className="container-fluid">
                <Row>
                    <Col sm={12} className="my-4">
                        <Card className="p-4">
                            <Card.Body>
                                <Row className="align-items-center">
                                    <Col sm={6}>
                                        <Card.Title className="font-size-20 ">Company details</Card.Title>
                                    </Col>
                                    <Col sm={6}>
                                        <Link href={`/business/company/update`}>
                                            <Button
                                                variant="outline-secondary"
                                                className="float-md-end mt-4 mt-md-0"
                                                onClick={() => {}}
                                            >
                                                <Iconly set="light" name="Edit" /> Update Details
                                            </Button>
                                        </Link>
                                    </Col>
                                </Row>

                                <Row className="mt-4">
                                    <Col sm={6} md={8}>
                                        <ul className="list-unstyled">
                                            <li className="mt-3">
                                                <Row>
                                                    <Col sm={4} className="text-muted">
                                                        Legal name
                                                    </Col>
                                                    <Col sm={8}>{company?.name || "-"}</Col>
                                                </Row>
                                            </li>
                                            <li className="mt-3">
                                                <Row>
                                                    <Col sm={4} className="text-muted">
                                                        Business address
                                                    </Col>
                                                    <Col sm={8}>{company?.address || "-"}</Col>
                                                </Row>
                                            </li>
                                            <li className="mt-3">
                                                <Row>
                                                    <Col sm={4} className="text-muted">
                                                        Tax ID
                                                    </Col>
                                                    <Col sm={8}>{company?.taxId || "-"}</Col>
                                                </Row>
                                            </li>
                                            <li className="mt-3">
                                                <Row>
                                                    <Col sm={4} className="text-muted">
                                                        Website
                                                    </Col>
                                                    <Col sm={8}>
                                                        <a
                                                            href={company?.website || "javascript:void(0)"}
                                                            target="_blank"
                                                        >
                                                            {company?.website || "-"}
                                                        </a>
                                                    </Col>
                                                </Row>
                                            </li>
                                        </ul>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </DashboardLayout>
    );
}
