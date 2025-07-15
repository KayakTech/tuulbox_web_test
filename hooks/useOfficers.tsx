import { useEffect, useReducer } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
    setUserAndCompany,
    setOfficers,
    appendOfficers,
    setOfficersLoading,
    setSilentlyFetching,
    setCurrentPage,
    setTablePage,
    resetPagination,
    resetOfficers,
    setOfficerDetails,
    setOfficerDetailsLoading,
    addOfficer as addOfficerToStore,
    updateOfficer as updateOfficerInStore,
    deleteOfficer as deleteOfficerFromStore,
} from "@/store/officers-reducer";
import DI from "@/di-container";
import { Officer } from "@/repositories/business-repository";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/router";
import { apiErrorMessage, getUrlQuery, isMobileDevice, isTabletDevice } from "@/helpers";
import useSearchForm from "./searchForm";
import { Dropdown } from "react-bootstrap";
import { MoreVertical } from "react-feather";
import { Edit2, Trash } from "iconsax-react";
interface UseOfficersReturn {
    officers: Partial<Officer>[];
    isLoading: boolean;
    isInitialLoading: boolean;
    isSilentlyFetching: boolean;
    totalRows: number;
    hasMore: boolean;
    fetchOfficers: (options?: { resetData?: boolean; pageNumber?: number; isTableView?: boolean }) => Promise<void>;
    loadMoreOfficers: () => Promise<void>;
    page: number;
    tablePage: number;
    setPage: (page: number) => void;
    setTablePage: (page: number) => void;
    officer: Officer;
    dispatch: React.Dispatch<Partial<Officer>>;
    isSubmitting: boolean;
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (show: boolean) => void;
    errorMessage: string;
    setErrorMessage: (message: string) => void;
    feedbackMessage: string;
    setFeedbackMessage: (message: string) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    addOfficer: () => Promise<void>;
    updateOfficer: () => Promise<void>;
    deleteOfficer: (redirectUrl?: string) => Promise<void>;
    getOfficer: (id: string) => Promise<void>;
    triggerDelete: (officer: Partial<Officer>) => void;
    handleAddAgain: () => void;
    tableColumns: () => any[];
    resetPage: () => void;
    init: () => void;
    searchResults: any;
    search: any;
    isSearching: boolean;
    listOrGrid: any;
    user: any;
    router: any;
    officerId: string;
    setOfficerId: (id: string) => void;
    officerToDelete?: Partial<Officer>;
    setOfficerToDelete: (officer: Partial<Officer>) => void;
    isDeleting: boolean;
    pageReady: boolean;
    setPageReady: (ready: boolean) => void;
    onTablePageChange: (page: number) => void;
    hasStoreData: boolean;
    shouldShowEmptyState: boolean;
}

const CACHE_EXPIRATION = 5 * 1000;

interface OfficersLocalState {
    isInitialLoading: boolean;
    isSubmitting: boolean;
    showModal: boolean;
    showDeleteModal: boolean;
    errorMessage: string;
    feedbackMessage: string;
    officerId: string;
    officerToDelete?: Partial<Officer>;
    isDeleting: boolean;
    pageReady: boolean;
    initialFetchCompleted: boolean;
}

interface FetchOfficersOptions {
    resetData?: boolean;
    pageNumber?: number;
    isTableView?: boolean;
}

const INITIAL_LOCAL_STATE: OfficersLocalState = {
    isInitialLoading: false,
    isSubmitting: false,
    showModal: false,
    showDeleteModal: false,
    errorMessage: "",
    feedbackMessage: "",
    officerId: "",
    isDeleting: false,
    pageReady: false,
    initialFetchCompleted: false,
};

const INITIAL_OFFICER_STATE: Officer = {
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
};

export default function useOfficers(action?: string): UseOfficersReturn {
    const router = useRouter();
    const reduxDispatch = useDispatch();
    const { showToast } = useToast();

    const { user } = useSelector((state: RootState) => state.account);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { search, isSearching } = useSearchForm();

    const {
        officers: officersData,
        isSilentlyFetching,
        currentPage,
        tablePage,
        hasMore,
        officerDetails,
    } = useSelector((state: RootState) => state.officers);

    const [localState, setLocalState] = useReducer(
        (state: OfficersLocalState, newState: Partial<OfficersLocalState>) => ({ ...state, ...newState }),
        INITIAL_LOCAL_STATE,
    );

    const [officer, dispatchOfficer] = useReducer(
        (state: Officer, newState: Partial<Officer>) => ({ ...state, ...newState }),
        INITIAL_OFFICER_STATE,
    );

    useEffect(() => {
        if (user?.id && user?.companyId) {
            //@ts-ignore
            reduxDispatch(setUserAndCompany({ userId: user.id, companyId: user.companyId }));
        }
    }, [user?.id, user?.companyId, reduxDispatch]);

    const hasStoreData = officersData.data.length > 0;
    const shouldShowEmptyState = localState.initialFetchCompleted && !hasStoreData && !searchResults;

    const fetchOfficers = async (options: FetchOfficersOptions = {}) => {
        const { resetData = false, pageNumber, isTableView = false } = options;
        const currentPageNumber =
            pageNumber !== undefined ? pageNumber : resetData ? 1 : isTableView ? tablePage : currentPage;

        const shouldShowInitialLoading = !hasStoreData && !localState.initialFetchCompleted;

        if (shouldShowInitialLoading) {
            reduxDispatch(setOfficersLoading(true));
            setLocalState({ isInitialLoading: true });
        } else {
            // Silent background fetch when we have new data from backend
            reduxDispatch(setSilentlyFetching(true));
        }

        try {
            const response = await DI.businessService.getOfficers(user?.companyId, currentPageNumber);

            reduxDispatch(
                setOfficers({
                    data: response.data.results,
                    count: response.data.count,
                    next: response.data.next,
                    page: currentPageNumber,
                    isTableView,
                }),
            );

            if (isTableView || (!isMobileDevice() && !isTabletDevice() && listOrGrid.officer === "list")) {
                reduxDispatch(setTablePage(currentPageNumber));
            } else {
                const newPage = response.data.next ? (resetData ? 2 : currentPageNumber + 1) : currentPageNumber;
                reduxDispatch(setCurrentPage(newPage));

                if (response.data.next && !resetData) {
                    reduxDispatch(
                        appendOfficers({
                            data: response.data.results,
                            next: response.data.next,
                        }),
                    );
                }
            }

            setLocalState({
                isInitialLoading: false,
                pageReady: true,
                initialFetchCompleted: true,
            });
        } catch (error) {
            showToast({ heading: "Error", message: "Error fetching officers", variant: "danger" });
            setLocalState({
                isInitialLoading: false,
                pageReady: true,
                initialFetchCompleted: true,
            });
        } finally {
            reduxDispatch(setOfficersLoading(false));
            reduxDispatch(setSilentlyFetching(false));
        }
    };

    const loadMoreOfficers = async () => {
        if (!hasMore || officersData.loading || isSilentlyFetching) return;

        await fetchOfficers({ resetData: false });
    };

    const setPage = (page: number) => {
        reduxDispatch(setCurrentPage(page));
        fetchOfficers({ resetData: false, pageNumber: page });
    };

    const setTablePageHandler = (page: number) => {
        reduxDispatch(setTablePage(page));
        fetchOfficers({ resetData: false, pageNumber: page, isTableView: true });
    };

    const onTablePageChange = (page: number) => {
        setTablePageHandler(page);
    };

    const resetPage = () => {
        reduxDispatch(resetPagination());
        setLocalState({ pageReady: false });
    };

    const init = () => {
        const query = getUrlQuery("query");
        if (query) {
            search({ query: query, categories: ["officers"] });
            setLocalState({ pageReady: true, initialFetchCompleted: true });
            return;
        }

        // Always fetch if we don't have data in the store, regardless of view type
        if (!hasStoreData) {
            fetchOfficers({ resetData: true });
        } else {
            // If we have data in store, just mark as ready
            setLocalState({ pageReady: true, initialFetchCompleted: true });

            // Check if data is stale and needs a refresh
            const isDataStale = officersData.lastFetched && Date.now() - officersData.lastFetched > CACHE_EXPIRATION;
            if (isDataStale) {
                fetchOfficers({ resetData: true });
            }
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLocalState({ errorMessage: "" });

        if (!officer.firstname) {
            setLocalState({ errorMessage: "Please enter the First Name." });
            return;
        }

        setLocalState({ isSubmitting: true });
        if (action === "add") {
            addOfficer();
        } else if (action === "edit") {
            updateOfficer();
        }
    };

    const addOfficer = async () => {
        try {
            const response = await DI.businessService.addOfficer(user?.companyId, officer);

            // Update store optimistically
            reduxDispatch(addOfficerToStore(response.data));

            showToast({
                heading: "Officer added successfully",
                message: "Officer added successfully",
                variant: "success",
            });
            router.push(`/business/company/officers`);
        } catch (error) {
            setLocalState({ errorMessage: apiErrorMessage(error) });
        } finally {
            setLocalState({ isSubmitting: false });
        }
    };

    const updateOfficer = async () => {
        try {
            const response = await DI.businessService.updateOfficer(user?.companyId, localState.officerId, officer);

            // Update store optimistically
            reduxDispatch(updateOfficerInStore({ ...officer, id: localState.officerId }));

            showToast({
                heading: "Officer Updated",
                message: "Your changes have been saved successfully.",
                variant: "success",
            });
            router.push(`/business/company/officers`);
        } catch (error) {
            setLocalState({ errorMessage: apiErrorMessage(error) });
        } finally {
            setLocalState({ isSubmitting: false });
        }
    };

    const getOfficer = async (id: string) => {
        setLocalState({ officerId: id });

        // Check if officer details are cached and not stale
        const cachedOfficer = officerDetails[id];
        if (cachedOfficer && cachedOfficer.lastFetched && Date.now() - cachedOfficer.lastFetched < CACHE_EXPIRATION) {
            dispatchOfficer({ ...cachedOfficer.data });
            return;
        }

        reduxDispatch(setOfficerDetailsLoading({ officerId: id, loading: true }));

        try {
            const res = await DI.businessService.getOfficer(user?.companyId, id);

            reduxDispatch(setOfficerDetails({ officerId: id, data: res.data }));

            dispatchOfficer({ ...res.data });
        } catch (error) {
            router.push("/business/company/officers");
        } finally {
            reduxDispatch(setOfficerDetailsLoading({ officerId: id, loading: false }));
        }
    };

    const deleteOfficer = async (redirectUrl?: string) => {
        if (!localState.officerToDelete) return;

        setLocalState({ isDeleting: true });

        try {
            await DI.businessService.deleteOfficer(user?.companyId, localState.officerToDelete.id);

            reduxDispatch(deleteOfficerFromStore(localState.officerToDelete.id!));

            if (redirectUrl) {
                router.push(redirectUrl);
                return;
            }

            setLocalState({ showDeleteModal: false });

            showToast({
                heading: "Officer Deleted",
                message: "Officer has been deleted successfully.",
                variant: "success",
            });
        } catch (error) {
            showToast({
                heading: "Error",
                message: "Failed to delete officer",
                variant: "danger",
            });
        } finally {
            setLocalState({ isDeleting: false });
        }
    };

    const triggerDelete = (officer: Partial<Officer>) => {
        setLocalState({ officerToDelete: officer, showDeleteModal: true });
    };

    const handleAddAgain = () => {
        if (action === "add") {
            window.location.reload();
        }
        if (action === "edit") {
            setLocalState({ showModal: false });
        }
    };

    const tableColumns = () => {
        const officers = officersData.data;
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
                            <a className="text-blue-900 text-decoration-none" href={`tel:${row.mobileNumber}`}>
                                {row.mobileNumber}
                            </a>
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
    };

    useEffect(() => {
        if (searchResults) {
            setLocalState({ pageReady: true });
        }
    }, [searchResults]);

    useEffect(() => {
        if (listOrGrid.officer) {
            if (!hasStoreData) {
                fetchOfficers({ resetData: true });
            } else {
                setLocalState({ pageReady: true });
            }
        }
    }, [listOrGrid.officer]);

    return {
        officers: officersData.data,
        isLoading: officersData.loading,
        isInitialLoading: localState.isInitialLoading,
        isSilentlyFetching,
        totalRows: officersData.count,
        hasMore,
        fetchOfficers,
        loadMoreOfficers,
        page: currentPage,
        tablePage,
        setPage,
        setTablePage: setTablePageHandler,
        officer,
        dispatch: dispatchOfficer,
        isSubmitting: localState.isSubmitting,
        showModal: localState.showModal,
        setShowModal: (show: boolean) => setLocalState({ showModal: show }),
        showDeleteModal: localState.showDeleteModal,
        setShowDeleteModal: (show: boolean) => setLocalState({ showDeleteModal: show }),
        errorMessage: localState.errorMessage,
        setErrorMessage: (message: string) => setLocalState({ errorMessage: message }),
        feedbackMessage: localState.feedbackMessage,
        setFeedbackMessage: (message: string) => setLocalState({ feedbackMessage: message }),
        handleSubmit,
        addOfficer,
        updateOfficer,
        deleteOfficer,
        getOfficer,
        triggerDelete,
        handleAddAgain,
        tableColumns,
        resetPage,
        init,
        searchResults,
        search,
        isSearching,
        listOrGrid,
        user,
        router,
        officerId: localState.officerId,
        setOfficerId: (id: string) => setLocalState({ officerId: id }),
        officerToDelete: localState.officerToDelete,
        setOfficerToDelete: (officer: Partial<Officer>) => setLocalState({ officerToDelete: officer }),
        isDeleting: localState.isDeleting,
        pageReady: localState.pageReady,
        setPageReady: (ready: boolean) => setLocalState({ pageReady: ready }),
        onTablePageChange,
        hasStoreData,
        shouldShowEmptyState,
    };
}
