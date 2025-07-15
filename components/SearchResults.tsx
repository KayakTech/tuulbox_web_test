import { ArrowRight2, ExportCircle, Briefcase, ArrowRight, DocumentDownload } from "iconsax-react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { useRouter } from "next/router";
import { formatDatetime, getUrlQuery } from "@/helpers";
import { searchActions } from "@/store/search-reducer";
import { useDispatch } from "react-redux";
import PdfIcon from "./icons/PdfIcon";
import { Tag } from "@/repositories/resource-repository";
import Image from "next/image";
import useContact from "@/hooks/useContact";
import BadgeTag from "./BadgeTag";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";
import { CalendarEvent } from "@/repositories/calendar-repository";
import CalendarEventComponent from "./CalendarEventComponent";
import useInsurance from "@/hooks/insurance";

export type SearchResultsProps = {
    searchType: string;
    searchResult: any[];
    count: number;
};

export default function SearchResults(props: SearchResultsProps) {
    const { searchType, searchResult, count } = props;
    const { contactsTable } = useContact({});
    const insuranceHook = useInsurance();
    const router = useRouter();
    const dispatch = useDispatch();

    function onActionClicked(data: any) {
        if (["storages", "licenses"].includes(`${searchType?.toLowerCase()}`)) {
            router.push(data.file);
        }
        if (searchType?.toLowerCase() === "resources") {
            router.push(data.url);
        }
        if (searchType?.toLowerCase() === "projects") {
            router.push(`/projects/${data.id}`);
        }
        if (
            [
                "estimates",
                "contracts",
                "changeorders",
                "galleries",
                "paymentschedules",
                "performanceschedules",
                "additionaldocuments",
            ].includes(searchType?.toLowerCase())
        ) {
            router.push(data.file.file);
        }
        dispatch(searchActions.setShowModal(false));
    }

    function name(data: any) {
        if (searchType?.toLowerCase() === "storages") {
            return data.originalFileName;
        }
        if (searchType?.toLowerCase() === "resources") {
            return data.description;
        }
        if (
            [
                "projects",
                "estimates",
                "contracts",
                "changeorders",
                "galleries",
                "paymentschedules",
                "performanceschedules",
                "additionaldocuments",
                "specifications",
                "planandelevations",
                "permits",
                "licenses",
            ].includes(searchType?.toLowerCase())
        ) {
            return data.name;
        }
        return "";
    }

    function description(data: any) {
        if (
            [
                "estimates",
                "contracts",
                "changeorders",
                "galleries",
                "paymentschedules",
                "performanceschedules",
                "additionaldocuments",
                "specifications",
                "storages",
                "licenses",
                "planandelevations",
                "permits",
                "licenses",
            ].includes(searchType?.toLowerCase())
        ) {
            return `Uploaded: ${formatDatetime(data.createdAt)}`;
        }
        if (searchType?.toLowerCase() === "resources") {
            return data.url;
        }
        if (searchType?.toLowerCase() === "projects") {
            return `Owner: ${data.createdBy.firstName} ${data.createdBy.lastName}`;
        }
        if (searchType?.toLowerCase() === "licenses" && data?.ownerContact) {
            return `Owner: ${data.ownerContact.firstName ?? ""} ${data.ownerContact.lastName ?? ""}`;
        }
    }

    function title() {
        if (searchType.toLowerCase() === "resources") return "Links & Resources";
        if (searchType.toLowerCase() === "insurances") return "Insurance";
        if (searchType.toLowerCase() === "additionaldocuments") return "Additional Documents";
        if (searchType.toLowerCase() === "storages") return "Storage";
        if (searchType.toLowerCase() === "contacts") return "Contact";
        if (searchType.toLowerCase() === "planandelevations") return "Plans & Elevations";
        if (searchType.toLowerCase() === "permits") return "Permits";
        if (searchType.toLowerCase() === "calendarevents") return "Calendar";
        if (searchType.toLowerCase() === "estimates") return "Estimate";
        if (searchType.toLowerCase() === "performanceschedules") return "Performance Schedule";
        if (searchType.toLowerCase() === "changeorders") return "Change Order";
        if (searchType.toLowerCase() === "paymentschedules") return "Payment Schedule";
        if (searchType.toLowerCase() === "performanceschedules") return "Performance Schedule";
        if (searchType.toLowerCase() === "galleries") return "Gallery";

        return searchType;
    }

    function seeAll(e: any) {
        e.preventDefault();

        let page = searchType;
        switch (searchType) {
            case "storages":
                page = "storage";
                break;
            case "licenses":
                page = "business/license";
                break;
            case "resources":
                page = "links";
                break;
            case "calendarEvents":
                page = "calendar";
                break;
            case "estimates":
                page = "projects/categories/estimate";
                break;
            case "contracts":
                page = "projects/categories/contract";
                break;
            case "changeOrders":
                page = "projects/categories/change-order";
                break;
            case "insurances":
                page = "business/insurance";
                break;
            case "planAndElevations":
                page = "/projects/categories/plan-and-elevation";
                break;
            case "permits":
                page = "/projects/categories/permit";
                break;
            case "paymentSchedules":
                page = "/projects/categories/payment-schedule";
                break;
            case "performanceSchedules":
                page = "/projects/categories/performance-schedule";
                break;
            case "specifications":
                page = "/projects/categories/specification";
                break;
            case "additionalDocuments":
                page = "/projects/categories/additional-documents";
                break;
            case "galleries":
                page = "/projects/categories/gallery";
                break;
            default:
                break;
        }

        dispatch(searchActions.setShowDropdown(false));
        dispatch(searchActions.setShowModal(false));
        router.push(`/${page}?query=${getUrlQuery("query")}`);
    }

    return (
        <>
            <div className="mb-4">
                <div className="container-fluid">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <p className="mb-0 text-capitalize">
                            {title()} <span className="">({count})</span>
                        </p>
                        <p onClick={seeAll} className="text-decoration-none text-black mb-0 pointer">
                            <small>See all</small>
                            <ArrowRight2 className="ms-1" size={16} />
                        </p>
                    </div>
                </div>

                <Row className="">
                    <Col>
                        {searchType?.toLowerCase() === "contacts" && (
                            <Card className="overflow-hidden rounded-0 mb-4">
                                <DataTable
                                    className="light-header"
                                    columns={contactsTable({ isSearch: true })}
                                    data={searchResult}
                                />
                            </Card>
                        )}

                        {searchType?.toLowerCase() === "insurances" && (
                            <Card className="overflow-hidden rounded-0 mb-4">
                                <DataTable
                                    className="light-header"
                                    columns={insuranceHook.tableColumns()}
                                    data={searchResult}
                                />
                            </Card>
                        )}

                        {[
                            "resources",
                            "storages",
                            "licenses",
                            "projects",
                            "estimates",
                            "contracts",
                            "changeorders",
                            "galleries",
                            "paymentschedules",
                            "performanceschedules",
                            "additionaldocuments",
                            "specifications",
                            "planandelevations",
                            "permits",
                        ].includes(searchType?.toLowerCase()) &&
                            searchResult.map((data: any, index: number) => (
                                <div className="container-fluid" key={index}>
                                    <Card className="search-result-card overflow-hidden d-flex flex-row flex-wrap flex-md-nowrap gap-3 justify-content-between align-items-center mb-4 w-100 border-0 px-0">
                                        <div className="d-flex flex-row w-100 w-md-auto gap-3">
                                            <span>
                                                {searchType?.toLowerCase() === "resources" && (
                                                    <Image
                                                        src={data?.thumbnail ?? DEFAULT_RESOURCE_PREVIEW}
                                                        width={80}
                                                        height={80}
                                                        alt=""
                                                        className="border-radius-12"
                                                    />
                                                )}
                                                {searchType?.toLowerCase() === "galleries" && (
                                                    <Image
                                                        src={data.file.thumbnail ?? data.file.file}
                                                        width={80}
                                                        height={80}
                                                        alt=""
                                                        className="border-radius-12"
                                                    />
                                                )}
                                                {[
                                                    "storages",
                                                    "licenses",
                                                    "estimates",
                                                    "contracts",
                                                    "changeorders",
                                                    "paymentschedules",
                                                    "performanceschedules",
                                                    "additionaldocuments",
                                                    "specifications",
                                                    "planandelevations",
                                                    "permits",
                                                ].includes(searchType?.toLowerCase()) && (
                                                    <PdfIcon width={80} height={80} />
                                                )}
                                                {searchType?.toLowerCase() === "projects" && <Briefcase size={24} />}
                                            </span>
                                            <div className="w-100 d-flex flex-column gap-1">
                                                <p className="mb-0 text-gray-600">{name(data)}</p>
                                                <small className="text-muted mb-0 truncate-1">
                                                    {description(data)}
                                                </small>
                                                {data?.tags?.length > 0 && (
                                                    <div className="d-flex flex-wrap gap-3">
                                                        {data.tags.map((tag: Tag, index: number) => (
                                                            <BadgeTag tag={tag.name} key={index} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant={"secondary"}
                                            className={`d-flex align-items-center search-result-download-container ${
                                                searchType.toLowerCase() === "projects"
                                                    ? "rounded-circle search-result-icon-container"
                                                    : ""
                                            }`}
                                            onClick={() => onActionClicked(data)}
                                        >
                                            {[
                                                "storages",
                                                "licenses",
                                                "estimates",
                                                "contracts",
                                                "changeorders",
                                                "galleries",
                                                "specifications",
                                                "paymentschedules",
                                                "additionaldocuments",
                                                "performanceschedules",
                                                "planandelevations",
                                                "permits",
                                            ].includes(searchType.toLowerCase()) && (
                                                <>
                                                    <DocumentDownload size={16} className="me-2" />{" "}
                                                    <span>Download</span>
                                                </>
                                            )}
                                            {searchType.toLowerCase() === "resources" && (
                                                <>
                                                    <ExportCircle size={16} className="me-2" /> <span>Open Link</span>
                                                </>
                                            )}
                                            {searchType.toLowerCase() === "projects" && (
                                                <>
                                                    <ArrowRight size={24} className="" />
                                                </>
                                            )}
                                        </Button>
                                    </Card>
                                </div>
                            ))}

                        {["calendarevents"].includes(searchType?.toLowerCase()) && (
                            <Container fluid>
                                {searchResult.map((event: CalendarEvent, index: number) => (
                                    <CalendarEventComponent event={event} key={event.id} />
                                ))}
                            </Container>
                        )}
                    </Col>
                </Row>
            </div>
        </>
    );
}
