import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Button, Form, Dropdown } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useReducer } from "react";
import { CheckCircle, MoreHorizontal, MoreVertical } from "react-feather";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Officer } from "@/repositories/business-repository";
import DI from "@/di-container";
import {
    apiErrorMessage,
    formatPhoneNumber,
    formatPhoneNumberWithSpace,
    getUrlQuery,
    isMobileDevice,
    isTabletDevice,
    validateMobileNumber,
} from "@/helpers";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Edit2, ExportSquare, People, Trash } from "iconsax-react";
import useSearchForm from "./searchForm";
import { count } from "console";
import { useToast } from "@/context/ToastContext";

const useOfficers = (action?: string) => {
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.account);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { search, isSearching } = useSearchForm();
    const { showToast } = useToast();

    const [officerId, setOfficerId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [officers, setOfficers] = useState<Partial<Officer>[]>([]);
    const [officerToDelete, setOfficerToDelete] = useState<Partial<Officer>>();
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [pageReady, setPageReady] = useState<boolean>(false);
    const [totalRows, setTotalRows] = useState<number>();
    const [tablePage, setTablePage] = useState<number>(1);

    const [officer, dispatch] = useReducer(
        (state: Officer, newState: Partial<Officer>) => ({ ...state, ...newState }),
        {
            title: "",
            firstname: "",
            lastname: "",
            mobileNumber: "",
            email: "",
            addressLine1: "",
            addressLine2: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
            extension: "",
        },
    );

    function init() {
        resetPage();

        const query = getUrlQuery("query");
        if (query) {
            search({ query: query, categories: ["officers"] });
            setIsLoading(false);
            setTimeout(() => {
                setPageReady(true);
            }, 2000);
            return;
        }
        if (isMobileDevice() || isTabletDevice() || listOrGrid.officer === "grid") {
            getOfficers();
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");

        if (!officer.firstname) {
            setErrorMessage("Please enter the First Name.");
            return;
        }

        setIsSubmitting(true);
        action === "add" && addOfficer();
        action === "edit" && updateOfficer();
    }

    async function addOfficer() {
        try {
            const response = await DI.businessService.addOfficer(user?.companyId, officer);
            showToast({
                heading: "Officer added successfully",
                message: "Officer added successfully",
                variant: "success",
            });
            router.push(`/business/company/officers`);
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function updateOfficer() {
        try {
            const response = await DI.businessService.updateOfficer(user?.companyId, officerId, officer);
            showToast({
                heading: "Officer Updated",
                message: "Your changes have been saved successfully.",
                variant: "success",
            });
            router.push(`/business/company/officers`);
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function getOfficer(id: string) {
        setIsLoading(true);
        try {
            const res = await DI.businessService.getOfficer(user?.companyId, id);
            dispatch({ ...res.data });
            setIsLoading(false);
        } catch (error) {
            router.push("/business/company/officers");
        }
    }

    function handleAddAgain() {
        if (action === "add") {
            window.location.reload();
        }
        if (action === "edit") {
            setShowModal(false);
        }
    }

    async function getOfficers() {
        setIsLoading(true);
        try {
            const res = await DI.businessService.getOfficers(user?.companyId, currentPageNumber());
            setTotalRows(res.data.count);
            let theOfficers: Partial<Officer>[] = [];

            if (isMobileDevice() || isTabletDevice() || listOrGrid.officer === "grid") {
                setHasMore(res.data.next != null);
                theOfficers = page === 1 ? res.data.results : [...officers, ...res.data.results];
                if (res.data.next) {
                    increamentPage();
                }
            } else {
                theOfficers = res.data.results;
            }

            theOfficers.length && setOfficers(theOfficers);
            setPageReady(true);
        } catch (error) {
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }

    async function deleteOfficer(redirectUrl?: string) {
        setIsDeleting(true);
        try {
            const response = await DI.businessService.deleteOfficer(user?.companyId, officerToDelete?.id);
            if (redirectUrl) {
                router.push(redirectUrl);
                return;
            }
            resetPage();
            init();
            setShowDeleteModal(false);
            setIsDeleting(false);
        } catch (error) {
            setIsDeleting(false);
        }
    }

    function triggerDelete(officer: Partial<Officer>) {
        setOfficerToDelete(officer);
        setShowDeleteModal(true);
    }

    function tableColumns() {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Full Name</span>,
                cell: (row: Partial<Officer>) => (
                    <>
                        <span className="text-muted tb-body-default-medium text-capitalize rowclick">{`${row.firstname} ${row.lastname}`}</span>
                    </>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Email</span>,
                cell: (row: Partial<Officer>) => (
                    <a
                        title={row.email?.toLowerCase()}
                        href={`mailto:${row.email}`}
                        className="text-muted text-decoration-none text-blue-900 tb-body-default-medium rowclick"
                    >
                        {row.email?.toLowerCase() || "-"}
                    </a>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Phone</span>,
                cell: (row: Partial<Officer>) =>
                    row.mobileNumber ? (
                        <span className="tb-body-default-medium text-blue-900">
                            <Link className="text-blue-900 text-decoration-none" href={`tel:${row.mobileNumber}`}>
                                {row.mobileNumber}
                            </Link>
                        </span>
                    ) : (
                        "-"
                    ),
                grow: 2,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Extension</span>,
                cell: (row: Partial<Officer>) => (
                    <span className="text-muted tb-body-default-medium rowclick">{row.extension || "-"}</span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize ms-auto">Action</span>,
                grow: 1,
                cell: (row: Partial<Officer>, index: number) => (
                    <div className="d-flex flex-row flex-nowrap ms-auto">
                        <Dropdown className="w-100 text-end" drop={officers.length <= 2 ? "start" : "down"}>
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square bg-transparent"
                                id="dropdown-basic"
                            >
                                <MoreVertical size={20} className="text-muted" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item href={`/business/company/officers/edit/${row.id}`}>
                                    <Edit2 size="16" color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item className="text-danger" onClick={() => triggerDelete(row)}>
                                    <Trash size={16} color="#E70000" />{" "}
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ];
    }

    // Pagination and search results

    function currentPageNumber() {
        if (isMobileDevice() || isTabletDevice() || listOrGrid.officer === "grid") {
            return page;
        }
        return tablePage;
    }

    function increamentPage() {
        if (isMobileDevice() || isTabletDevice() || listOrGrid.officer === "grid") {
            setPage(page + 1);
            return;
        }
        setTablePage(page + 1);
    }

    function resetPage() {
        setHasMore(true);
        setPage(1);
        setTablePage(1);
        setOfficers([]);
    }

    useEffect(() => {
        if (searchResults) {
            setOfficers([]);
            setPage(1);
        }
    }, [searchResults]);

    useEffect(() => {
        if (!isMobileDevice() && !isTabletDevice() && listOrGrid.officer === "list") {
            getOfficers();
        }
    }, [tablePage]);

    useEffect(() => {
        resetPage();
        getOfficers();
    }, [listOrGrid.officer]);

    useEffect(() => {
        if (!officers.length && pageReady) {
            getOfficers();
        }
    }, [officers]);

    function onTablePageChange(page: number) {
        setTablePage(page);
    }

    return {
        user,
        isLoading,
        setIsLoading,
        isSubmitting,
        setIsSubmitting,
        showModal,
        setShowModal,
        feedbackMessage,
        setFeedbackMessage,
        errorMessage,
        setErrorMessage,
        officer,
        officerId,
        setOfficerId,
        dispatch,
        handleSubmit,
        addOfficer,
        updateOfficer,
        getOfficer,
        handleAddAgain,
        getOfficers,
        setOfficerToDelete,
        officers,
        deleteOfficer,
        isDeleting,
        tableColumns,
        setPageReady,
        searchResults,
        totalRows,
        onTablePageChange,
        hasMore,
        resetPage,
        router,
        init,
        search,
        isSearching,
        listOrGrid,
        triggerDelete,
        showDeleteModal,
        setShowDeleteModal,
    };
};

export default useOfficers;
