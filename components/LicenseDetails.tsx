import { Row, Col, Card, Button, Accordion, Container } from "react-bootstrap";
import { useState } from "react";
import { ArrowUp2, ArrowDown2 } from "iconsax-react";
import Image from "next/image";
import CertificateForm from "@/components/CertificateForm";
import ContactDocumentsComponent from "@/components/ContactDocumentsComponent";
import Header from "@/components/Header";
import { getUrlQuery, updateUrlQuery } from "@/helpers";
import search from "@/pages/search";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteModal from "@/components/DeleteModal";
import EmptyState from "@/components/EmptyState";
import { useEffect } from "react";
import { ListGroup, Spinner, Tab } from "react-bootstrap";
import InsuranceIcon from "@/components/icons/Insurance";
import useInsurance from "@/hooks/insurance";
import { isMobileDevice, isTabletDevice } from "@/helpers";
import useSearchForm from "@/hooks/searchForm";
import DataTableComponent from "@/components/DataTableComponent";
import { SearchNormal1, ShieldTick, ArchiveBox } from "iconsax-react";
import InsuranceDetailsMobile from "@/components/InsuranceCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { InsuranceData } from "@/repositories/business-repository";
import InsuranceCard from "@/components/InsuranceCard";
import PageLoader from "@/components/PageLoader";
import InsuranceCardSmall from "@/components/InsuranceCardSmall";
import SettingsMenu from "@/components/SettingsMenu";
import Link from "next/link";

export default function ViewInsuranceDetails() {
    const [isOpen, setIsOpen] = useState(false);
    const {
        isLoading,
        isDeleting,
        insurances,
        showModal,
        setShowModal,
        tableColumns,
        deleteInsurance,
        getInsurances,
        setIsLoading,
        insuranceId,
        setInsuranceId,
        setPageReady,
        searchResults,
        totalRows,
        onTablePageChange,
        hasMore,
        search,
        init,
        isSearching,
        router,
        viewDocumentFile,
        setInsuranceToDelete,
        listOrGrid,
    } = useInsurance();

    return (
        <>
            <Accordion className="mt-3m border-radius-12 mb-3">
                <Accordion.Item eventKey="0" className="border-gray-100 rounded-4">
                    <Accordion.Header as={"div"} className="px-3 py-12 pb-0" onClick={() => setIsOpen(!isOpen)}>
                        <div className="w-100 py-3m">
                            <p className="m-0 tb-body-default-medium text-gray-800">License Details</p>
                            <p className="text-muted tb-body-small-regular m-0">
                                <small>License, License type, License number...</small>
                            </p>
                        </div>
                        {isOpen ? <ArrowDown2 size="16" color="#454545" /> : <ArrowUp2 size="16" color="#454545" />}
                    </Accordion.Header>
                    <Accordion.Body className="pb-3 pt-4 border-top d-flex flex-column gap-3 border-gray-100">
                        <Row className="d-flex pt-4m justify-content-between gap-3m">
                            <Col md={4} className="">
                                <p className="m-0 tb-body-small-medium text-muted">
                                    <small>License</small>
                                </p>

                                <div className="d-flex gap-2">
                                    <div className="rounded-1 border border-gray-100 flex-shrink-0 w-24 h-24">
                                        <Image
                                            src={""}
                                            loading="lazy"
                                            alt=""
                                            className="rounded-1 flex-shrink-0 object-fit-cover h-100"
                                            width={24}
                                            height={24}
                                        />
                                    </div>
                                    <p className="m-0 tb-body-default-medium"></p>
                                </div>
                            </Col>
                            <Col md={4}>
                                <p className="m-0 tb-body-small-medium text-muted">
                                    <small>License Type</small>
                                </p>
                                <p className="m-0 tb-body-default-medium"></p>
                            </Col>
                            <Col md={4}>
                                <p className="m-0 tb-body-small-medium text-muted">
                                    <small>NUmber</small>
                                </p>
                                <p className="m-0 tb-body-default-medium"></p>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <p className="m-0 tb-body-small-medium text-muted">
                                    <small>Validity Start Date</small>
                                </p>
                                <p className="m-0 tb-body-default-medium"></p>
                            </Col>

                            <Col md={4}>
                                <p className="m-0 tb-body-small-medium text-muted">
                                    <small>Validity Start End</small>
                                </p>
                                <p className="m-0 tb-body-default-medium"></p>
                            </Col>
                            <Col md={4}>
                                <p className="m-0 tb-body-small-medium text-muted">
                                    <small>Reminder</small>
                                </p>
                                <p className="m-0 tb-body-default-medium"></p>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <p className="m-0 tb-body-small-medium text-muted">
                                    <small>Notify Me</small>
                                </p>
                                <p className="m-0 tb-body-default-medium"></p>
                            </Col>
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            <div id="project-documents">
                <Container fluid className="p-0">
                    <Accordion defaultActiveKey="0" className="mt-4">
                        <Accordion.Item eventKey="0" className="border-gray-100 rounded-4">
                            <Accordion.Header className="p-3 py-12 pb-0" as={"div"} onClick={() => setIsOpen(!isOpen)}>
                                <div className=" w-100">
                                    <p className="m-0 tb-body-default-medium text-gray-900">Policies</p>
                                </div>
                                {isOpen ? (
                                    <ArrowDown2 size="16" color="#454545" />
                                ) : (
                                    <ArrowUp2 size="16" color="#454545" />
                                )}
                            </Accordion.Header>

                            <Accordion.Body className="py-0 text-muted border-top border-gray-100">
                                <Header
                                    className=" px-0"
                                    searchPlaceholder="Search document"
                                    buttonText="New Policy"
                                    hideContainerClass
                                    showBottomBorder={false}
                                    listOrGridKey="contactDocument"
                                    showSearchForm={
                                        insurances.length > 0 ||
                                        (router?.query?.query && router?.query?.query?.length > 0) ||
                                        isLoading ||
                                        isSearching
                                    }
                                    isSearching={isSearching}
                                />
                            </Accordion.Body>

                            <Accordion.Body className="pb-3  text-muted border-top border-gray-100"></Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Container>
            </div>
        </>
    );
}
