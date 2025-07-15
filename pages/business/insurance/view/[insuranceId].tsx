import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Iconly } from "react-iconly";
import Link from "next/link";
import InsuranceFileCard from "@/components/InsuranceFileCard";
import { useEffect, useReducer, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { InsuranceData } from "@/repositories/business-repository";
import DI from "@/di-container";
import PageLoader from "@/components/PageLoader";
import DeleteModal from "@/components/DeleteModal";
import { useRouter } from "next/router";
import { StorageFile } from "@/repositories/storage-repository";
import { formatDatetime, isEmptyObject } from "@/helpers";

export default function ViewInsurance() {
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.account);
    const [insuranceId, setInsuranceId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showDeleteInsuranceModal, setShowDeleteInsuranceModal] = useState<boolean>(false);
    const [showDeleteFileModal, setShowDeleteFileModal] = useState<boolean>(false);
    const [fileToDelete, setFileToDelete] = useState<Partial<StorageFile>>();

    const [insurance, dispatch] = useReducer(
        (state: any, newState: Partial<InsuranceData>) => ({ ...state, ...newState }),
        {
            id: "",
            insuranceType: "",
            carrier: "",
            agent: "",
            contact: "",
            email: "",
            validFrom: "",
            validTo: "",
            reminder: "",
            policy: "",
            file: {},
        },
    );

    async function onDeleteFile(file: Partial<StorageFile> | undefined) {
        setFileToDelete(file);
        setShowDeleteFileModal(true);
    }

    async function deleteFile() {
        dispatch({ policy: "" });
        setIsDeleting(true);
    }

    async function deleteInsurance() {
        setIsDeleting(true);
        try {
            const response = await DI.businessService.deleteInsurance(user?.companyId, insurance?.id);
            router.push("/business/insurance");
        } catch (error) {
            setIsDeleting(false);
        }
    }

    async function getInsurance(insuranceId: string) {
        try {
            const response = await DI.businessService.getInsurance(user?.companyId, insuranceId);
            dispatch({
                id: response.data.id,
                insuranceType: response.data.insuranceType,
                carrier: response.data.carrier,
                agent: response.data.agent,
                contact: response.data.contact,
                email: response.data.email,
                validFrom: response.data.validFrom,
                validTo: response.data.validTo,
                reminder: response.data.reminder,
                policy: response.data.policy,
                file: response.data.file,
            });
            setIsLoading(false);
        } catch (error) {
            router.push("/business/insurance");
        }
    }

    async function updateInsurance() {
        try {
            const response = await DI.businessService.updateInsurance(user?.companyId, insuranceId, insurance);
            await getInsurance(insuranceId);
        } catch (error) {
        } finally {
            setShowDeleteFileModal(false);
            setIsDeleting(false);
        }
    }

    useEffect(() => {
        insurance.policy === null && updateInsurance();
    }, [insurance.policy]);

    useEffect(() => {
        setIsLoading(true);
        const id = window.location.pathname.split("/")[4];
        setInsuranceId(id);
        getInsurance(id);
    }, []);

    return (
        <DashboardLayout
            pageTitle="Add Insurance"
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "Insurance", url: "/business/insurance" },
                { name: "Insurance Details" },
            ]}
        >
            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="container-fluid">
                    <Row>
                        <Col sm={12} className="mb-4">
                            <Card className="p-4">
                                <Card.Body>
                                    <Row className="align-items-center">
                                        <Col sm={6}>
                                            <Card.Title className="font-size-20 ">Insurance information</Card.Title>
                                        </Col>
                                        <Col sm={6} className="d-flex justify-content-end">
                                            <Button
                                                variant="outline-secondary"
                                                className="float-md-end mt-4 mt-md-0 me-2"
                                                onClick={() => setShowDeleteInsuranceModal(true)}
                                            >
                                                <Iconly name="Delete" set="light" size={20} primaryColor="red" />
                                            </Button>

                                            <Link href={`/business/insurance/edit/${insurance.id}`}>
                                                <Button
                                                    variant="outline-secondary"
                                                    className="float-md-end mt-4 mt-md-0"
                                                    onClick={() => {}}
                                                >
                                                    <Iconly set="light" name="Edit" /> Update details
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
                                                            Carrier
                                                        </Col>
                                                        <Col sm={8} className="text-capitalize">
                                                            {insurance.carrier}
                                                        </Col>
                                                    </Row>
                                                </li>
                                                <li className="mt-3">
                                                    <Row>
                                                        <Col sm={4} className="text-muted">
                                                            Insurance Type
                                                        </Col>
                                                        <Col sm={8}>{insurance.insuranceType}</Col>
                                                    </Row>
                                                </li>
                                                <li className="mt-3">
                                                    <Row>
                                                        <Col sm={4} className="text-muted">
                                                            Period
                                                        </Col>
                                                        <Col sm={8}>
                                                            {formatDatetime(insurance.validFrom)} to{" "}
                                                            {formatDatetime(insurance.validTo)}
                                                        </Col>
                                                    </Row>
                                                </li>
                                                <li className="mt-3">
                                                    <Row>
                                                        <Col sm={4} className="text-muted">
                                                            Reminder
                                                        </Col>
                                                        <Col sm={8}>{formatDatetime(insurance.reminder) || "-"}</Col>
                                                    </Row>
                                                </li>
                                                <li className="mt-3">
                                                    <Row>
                                                        <Col sm={4} className="text-muted">
                                                            <span className="text-black">Policy</span> - Attachments
                                                        </Col>
                                                        {!insurance.file && <Col sm={8}>-</Col>}

                                                        {insurance.file && !isEmptyObject(insurance.file) && (
                                                            <Col sm={12}>
                                                                <Row className="mt-0 g-4">
                                                                    <Col md={`5`}>
                                                                        <InsuranceFileCard
                                                                            file={insurance.file}
                                                                            onDelete={file => onDeleteFile(file)}
                                                                        />
                                                                    </Col>
                                                                </Row>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                </li>
                                            </ul>
                                        </Col>
                                    </Row>

                                    <Row className="align-items-center mt-3">
                                        <Col sm={6}>
                                            <Card.Title className="font-size-20 ">Agent information</Card.Title>
                                        </Col>
                                        <Col sm={6} md={8}>
                                            <ul className="list-unstyled">
                                                <li className="mt-3">
                                                    <Row>
                                                        <Col sm={4} className="text-muted">
                                                            Agent
                                                        </Col>
                                                        <Col sm={8}>{insurance.agent || "-"}</Col>
                                                    </Row>
                                                </li>
                                                <li className="mt-3">
                                                    <Row>
                                                        <Col sm={4} className="text-muted">
                                                            Contact
                                                        </Col>
                                                        <Col sm={8}>
                                                            <a href={`tel:${insurance?.contact}`}>
                                                                {insurance.contact || "-"}
                                                            </a>
                                                        </Col>
                                                    </Row>
                                                </li>
                                                <li className="mt-3">
                                                    <Row>
                                                        <Col sm={4} className="text-muted">
                                                            Email
                                                        </Col>
                                                        <Col sm={8}>
                                                            <a href={`mailto:${insurance?.email}`}>
                                                                {insurance?.email?.toLowerCase() || "-"}
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
                    <DeleteModal
                        showModal={showDeleteInsuranceModal}
                        setShowModal={(value: boolean) => setShowDeleteInsuranceModal(value)}
                        dataToDeleteName={"Insurance"}
                        isDeleting={isDeleting}
                        onYesDelete={deleteInsurance}
                    />
                    <DeleteModal
                        showModal={showDeleteFileModal}
                        setShowModal={(value: boolean) => setShowDeleteFileModal(value)}
                        dataToDeleteName={"File"}
                        isDeleting={isDeleting}
                        onYesDelete={deleteFile}
                    />
                </div>
            )}
        </DashboardLayout>
    );
}
