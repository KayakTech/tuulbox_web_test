import BadgeTag from "@/components/BadgeTag";
import PdfIcon from "@/components/icons/PdfIcon";
import DI from "@/di-container";
import {
    apiErrorMessage,
    convertCamelCaseToSentenceCase,
    formatDatetime,
    isEmptyObject,
    projectCategoryToUrl,
} from "@/helpers";
import { RecentActivity, RecentActivityDestructuredObject } from "@/repositories/recent-repository";
import { ExportSquare, ReceiveSquare, Star1, Trash } from "iconsax-react";
import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { TableColumn } from "react-data-table-component";
import { MoreHorizontal, User } from "react-feather";
import { Edit2 } from "iconsax-react";
import useStorage from "./storage";
import useResource from "./useResources";
import useSearchForm from "./searchForm";
import { useRouter } from "next/router";
import { useToast } from "@/context/ToastContext";
import useProject from "./project";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setRecentActivities, setRecentActivitiesLoading, setSilentlyFetchingRecents } from "@/store/recent-reducer";

interface UseRecentsReturn {
    isLoading: boolean;
    isLoadingRecentActivities: boolean;
    isInitialLoading: boolean;
    isSilentlyFetchingRecents: boolean;
    recentActivities: RecentActivityDestructuredObject | undefined;
    showDeleteModal: boolean;
    dataToDelete: any;
    isDeleting: boolean;
    sorting: string;
    search: any;
    isSearching: boolean;
    pageReady: React.MutableRefObject<boolean>;
    getRecentActivities: () => Promise<void>;
    setRecentActivities: React.Dispatch<React.SetStateAction<RecentActivityDestructuredObject | undefined>>;
    setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
    triggerDeleteModal: (data: any) => void;
    deleteRecentActivity: () => Promise<void>;
    setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
    contactsTable: () => TableColumn<RecentActivity>[];
    licensesTable: () => TableColumn<RecentActivity>[];
    insurancesTable: () => TableColumn<RecentActivity>[];
    projectsTable: () => TableColumn<RecentActivity>[];
    storagesTable: () => TableColumn<RecentActivity>[];
    onSort: (sort: string) => void;
    setSorting: React.Dispatch<React.SetStateAction<string>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    processSearchResults: (recents: RecentActivity[]) => any;
    projectDocumentTable: () => TableColumn<RecentActivity>[];
    deleteRecentActivityById: (id: string) => Promise<void>;
    setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
    clearSearch: () => void;
    displayData: RecentActivityDestructuredObject | undefined;
    hasActiveSearch: boolean;
}

const CACHE_EXPIRATION = 5 * 1000;

interface RecentsLocalState {
    isInitialLoading: boolean;
    showDeleteModal: boolean;
    dataToDelete: any;
    isDeleting: boolean;
    errorMessage: string;
    sorting: string;
}

const INITIAL_STATE: RecentsLocalState = {
    isInitialLoading: false,
    showDeleteModal: false,
    dataToDelete: null,
    isDeleting: false,
    errorMessage: "",
    sorting: "Newest",
};

const useRecents = (): UseRecentsReturn => {
    const router = useRouter();
    const storage = useStorage({});
    const { search, isSearching, setIsSearching } = useSearchForm();
    const { showToast } = useToast();
    const reduxDispatch = useDispatch();
    const pageReady = useRef<boolean>(false);

    const { recentActivities: reduxRecentActivities, isSilentlyFetchingRecents } = useSelector(
        (state: RootState) => state.recents,
    );

    const [localState, setLocalState] = useReducer(
        (state: RecentsLocalState, newState: Partial<RecentsLocalState>) => ({ ...state, ...newState }),
        INITIAL_STATE,
    );

    const [searchRecentActivities, setSearchRecentActivities] = useState<
        RecentActivityDestructuredObject | undefined
    >();
    const [hasActiveSearch, setHasActiveSearch] = useState(false);

    const storeRecentActivities = reduxRecentActivities.data || undefined;
    const displayData = hasActiveSearch && searchRecentActivities ? searchRecentActivities : storeRecentActivities;
    const isLoading = reduxRecentActivities.loading;

    async function getRecentActivities() {
        if (!reduxRecentActivities.data && !reduxRecentActivities.lastFetched) {
            reduxDispatch(setRecentActivitiesLoading(true));
            setLocalState({ isInitialLoading: true });
        } else {
            reduxDispatch(setSilentlyFetchingRecents(true));
        }

        try {
            const res = await DI.recentService.getRecentActivities(1);
            let recents: any = res.data;
            const processedResults = processRecentActivities(recents);

            if (processedResults) {
                reduxDispatch(setRecentActivities({ data: processedResults }));
            }
            pageReady.current = true;
        } catch (error) {
            showToast({ heading: "Error", message: "Error fetching recent activities", variant: "danger" });
        } finally {
            reduxDispatch(setRecentActivitiesLoading(false));
            reduxDispatch(setSilentlyFetchingRecents(false));
            setLocalState({ isInitialLoading: false });
        }
    }

    function processRecentActivities(recents: any) {
        let newData: any = {};

        Object.keys(recents).forEach(key => {
            const recent = recents[key];

            if (Array.isArray(recent) && recent.length > 0) {
                if (key.toLowerCase() === "today") {
                    newData.today = recent;
                }
                if (key.toLowerCase() === "yesterday") {
                    newData.yesterday = recent;
                }
                if (["this week", "thisweek"].includes(key.toLowerCase())) {
                    newData.thisWeek = recent;
                }
                if (["last week", "lastweek"].includes(key.toLowerCase())) {
                    newData.lastWeek = recent;
                }
                if (["this month", "thismonth"].includes(key.toLowerCase())) {
                    newData.thisMonth = recent;
                }
                if (["this year", "thisyear"].includes(key.toLowerCase())) {
                    newData.thisYear = recent;
                }
                if (["last year", "lastyear"].includes(key.toLowerCase())) {
                    newData.lastYear = recent;
                }
                if (["older"].includes(key.toLowerCase())) {
                    newData.older = recent;
                }
            }
        });

        return isEmptyObject(newData) ? null : newData;
    }

    function processSearchResults(recents: RecentActivity[]) {
        const grouped: any = {
            Today: [],
            Yesterday: [],
            ThisWeek: [],
            LastWeek: [],
            ThisMonth: [],
            ThisYear: [],
            LastYear: [],
            Older: [],
        };

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfToday.getDate() - 1);

        const startOfThisWeek = new Date(startOfToday);
        startOfThisWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        const lastYearStart = new Date(thisYearStart);
        lastYearStart.setFullYear(thisYearStart.getFullYear() - 1);

        recents.forEach(item => {
            const dateField = item.updatedAt || item.createdAt;
            const updatedAt = new Date(dateField);

            if (updatedAt >= startOfToday) {
                grouped.Today.push(item);
            } else if (updatedAt >= startOfYesterday) {
                grouped.Yesterday.push(item);
            } else if (updatedAt >= startOfThisWeek) {
                grouped.ThisWeek.push(item);
            } else if (updatedAt >= startOfLastWeek) {
                grouped.LastWeek.push(item);
            } else if (updatedAt >= startOfThisMonth) {
                grouped.ThisMonth.push(item);
            } else if (updatedAt >= thisYearStart && updatedAt < startOfThisMonth) {
                grouped.ThisYear.push(item);
            } else if (updatedAt >= lastYearStart && updatedAt < thisYearStart) {
                grouped.LastYear.push(item);
            } else {
                grouped.Older.push(item);
            }
        });

        const processedGroupedData = processRecentActivities(grouped);

        setSearchRecentActivities(processedGroupedData);
        setHasActiveSearch(true);

        return grouped;
    }

    function clearSearch() {
        setSearchRecentActivities(undefined);
        setHasActiveSearch(false);
        setIsSearching(false);
    }

    function triggerDeleteModal(data: any) {
        setLocalState({ dataToDelete: data, showDeleteModal: true });
    }

    async function deleteRecentActivity() {
        setLocalState({ isDeleting: true, errorMessage: "" });
        try {
            const res = await DI.recentService.deleteRecentActivity(localState.dataToDelete?.id);
            await getRecentActivities();
            setLocalState({ showDeleteModal: false });
            showToast({ heading: "Success", message: "Recent activity deleted.", variant: "success" });
        } catch (error) {
            setLocalState({ errorMessage: apiErrorMessage(error) });
            showToast({ heading: "Error", message: "Failed to delete recent activity.", variant: "danger" });
        } finally {
            setLocalState({ isDeleting: false });
        }
    }

    async function deleteRecentActivityById(id: string) {
        try {
            await DI.recentService.deleteRecentActivity(id);
            showToast({ heading: "Success", message: "Recent activity deleted.", variant: "success" });
            await getRecentActivities();
        } catch {
            showToast({ heading: "Error", message: "Failed to delete recent activity.", variant: "danger" });
        }
    }

    useEffect(() => {
        // Don't set initial loading state if we have already set data in the store
        if (reduxRecentActivities.data) {
            setLocalState({ isInitialLoading: false });

            // Check if data is stale and needs a refresh
            const isDataStale =
                reduxRecentActivities.lastFetched && Date.now() - reduxRecentActivities.lastFetched > CACHE_EXPIRATION;

            // If data is stale, do a background refresh
            if (isDataStale) {
                getRecentActivities();
            }
        } else {
            setLocalState({ isInitialLoading: true });
            getRecentActivities();
        }
    }, []);

    const contactsTable = (): TableColumn<RecentActivity>[] => {
        return [
            {
                name: <span className="text-gray-400 tb-body-title-caps">Full Name</span>,
                cell: (activity: RecentActivity) => (
                    <div className="text-muted  text-capitalize d-flex align-items-center">
                        <span
                            className="bg-gray-50 rounded-circle d-flex me-2 flex-shrink-0 justify-content-center align-items-center"
                            style={{ width: "40px", height: "40px" }}
                        >
                            <User size={16} color="#B0B0B0" />
                        </span>
                        <span className="d-flex flex-column">
                            <span className="text-muted tb-body-default-medium">{`${activity?.originalObject?.firstName} ${activity?.originalObject?.lastName}`}</span>
                        </span>
                    </div>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Contact</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted tb-body-default-medium d-flex flex-column gap-2">
                        {activity.originalObject.email && (
                            <a
                                title={activity.originalObject.email.toLowerCase()}
                                className="text-blue-900 text-decoration-none"
                                href={`mailto:${activity.originalObject.email}`}
                            >
                                {activity.originalObject.email.toLowerCase()}
                            </a>
                        )}
                        {activity.originalObject.phoneNumber && (
                            <a
                                className="text-blue-900 text-decoration-none"
                                href={`tel:${activity.originalObject.phoneNumber}`}
                            >
                                {activity.originalObject.phoneNumber}
                            </a>
                        )}

                        {activity.originalObject.company && (
                            <span className="text-muted text-decoration-none">{activity.originalObject.company}</span>
                        )}
                    </span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Address</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  d-flex flex-column gap-2">
                        {activity.originalObject.addressLine1 && (
                            <span className="text-muted ">{activity.originalObject.addressLine1}</span>
                        )}
                        {activity.originalObject.addressLine2 && (
                            <span className="text-muted ">{activity.originalObject.addressLine2}</span>
                        )}
                        {activity.originalObject.country && (
                            <span className="text-muted ">{activity.originalObject.country}</span>
                        )}
                        {activity.originalObject.state && (
                            <span className="text-muted ">{activity.originalObject.state}</span>
                        )}
                        {activity.originalObject.city && (
                            <span className="text-muted ">{activity.originalObject.city}</span>
                        )}
                        {activity.originalObject.zipCode && (
                            <span className="text-muted ">{activity.originalObject.zipCode}</span>
                        )}
                    </span>
                ),
                grow: 3,
            },

            {
                name: <span className={`text-gray-400 tb-body-title-caps ms-auto`}></span>,
                cell: (activity: any) =>
                    activity?.originalObject?.isSubcontractor && (
                        <span className={`text-muted  d-flex flex-column gap-2 ms-auto`}>
                            <a
                                href={`/contacts/${activity?.subcontractorId}`}
                                className="small d-flex align-items-center text-decoration-none justify-content-center gap-2 tb-body-small-regular text-blue-900"
                            >
                                view document details
                            </a>
                        </span>
                    ),
                grow: 3,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps ms-auto">Action</span>,
                grow: 0.1,
                cell: (activity: any, index: number) => (
                    <span className="ms-auto">
                        <Dropdown className="w-100" drop={"start"}>
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square bg-gray-50 border-0"
                                id="dropdown-basic"
                            >
                                <MoreHorizontal size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`} className="p-8">
                                <Dropdown.Item href={`/contacts/edit/${activity?.originalObject?.id}`}>
                                    <Edit2 size={16} color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <Star1 size={16} color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Add to Favorites </span>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => triggerDeleteModal(activity)} className="text-danger">
                                    <Trash size={16} className="" color="#E70000" />{" "}
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </span>
                ),
            },
        ];
    };

    const licensesTable = (): TableColumn<RecentActivity>[] => {
        return [
            {
                name: <span className="text-gray-400 tb-body-title-caps">License</span>,
                cell: (activity: Partial<RecentActivity>) => (
                    <span className="text-muted text-capitalize ">{`${activity?.originalObject?.name}`}</span>
                ),
                grow: 1.5,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Type</span>,
                cell: (activity: Partial<RecentActivity>) => (
                    <span className="text-muted text-capitalize ">{activity?.originalObject?.licenseType}</span>
                ),
                grow: 1.5,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Number</span>,
                cell: (activity: Partial<RecentActivity>) => (
                    <span className="text-muted">{activity?.originalObject?.licenseNumber}</span>
                ),
                grow: 1.5,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Period</span>,
                cell: (activity: Partial<RecentActivity>) => (
                    <span className="text-muted ">
                        {`${formatDatetime(activity?.originalObject?.validFrom)} to ${formatDatetime(
                            activity?.originalObject?.validTo,
                        )}`}
                    </span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Reminder</span>,
                cell: (activity: Partial<RecentActivity>) => (
                    <span className="text-muted ">{formatDatetime(activity?.originalObject?.reminder)}</span>
                ),
                grow: 1,
            },
            {
                name: <span className=" ms-auto"></span>,
                grow: 0.1,
                cell: (activity: Partial<RecentActivity>, index: number) => (
                    <Dropdown className="w-100 ms-auto" drop={"start"}>
                        <Dropdown.Toggle
                            size="sm"
                            variant="default"
                            className="btn-square float-end"
                            id="dropdown-basic"
                        >
                            <MoreHorizontal size={24} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align={`end`}>
                            <Dropdown.Item href={`/business/license/edit/${activity.originalObject.id}`}>
                                <Edit2 size={16} className="" />
                                <span className="tb-body-default-regular">Update</span>
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => {
                                    triggerDeleteModal(activity);
                                }}
                            >
                                <Trash size={16} color="#E70000" className="" />
                                <span className="text-danger tb-body-default-regular">Delete</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                ),
            },
        ];
    };

    const insurancesTable = (): TableColumn<RecentActivity>[] => {
        return [
            {
                name: <span className="text-gray-400 tb-body-title-caps">Carrier</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize ">
                        <p className="mb-2 fw-500">{activity?.originalObject?.carrier}</p>
                        <small className="text-muted">
                            {activity?.originalObject?.customInsuranceType || activity?.originalObject?.insuranceType}
                        </small>
                    </span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Agent</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted ">{activity?.originalObject?.agent}</span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Broker</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted ">{activity?.originalObject?.broker}</span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Contact</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted ">
                        <p className="mb-2 fw-500">
                            <a
                                className="text-blue-900 text-decoration-none "
                                href={`tel:${activity?.originalObject?.contact}`}
                            >
                                {activity?.originalObject?.contact}
                            </a>
                        </p>
                        <span className="text-muted">
                            <a
                                className="text-blue-900 text-decoration-none"
                                href={`mailto:${activity?.originalObject?.email}`}
                            >
                                {activity?.originalObject?.email.toLowerCase()}
                            </a>
                        </span>
                    </span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Policy</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-muted">
                        {activity?.originalObject?.file?.originalFileName ? (
                            <div className="d-flex flex-nowrap flex-row">
                                <PdfIcon width={24} height={24} />
                                <Link
                                    href={activity?.originalObject?.file?.file || "javascript:void(0)"}
                                    className="ms-2 text-muted"
                                >
                                    {activity?.originalObject?.file?.originalFileName}
                                </Link>
                            </div>
                        ) : null}
                    </span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Period</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted ">{`${formatDatetime(
                        activity?.originalObject?.validFrom,
                    )} to ${formatDatetime(activity?.originalObject?.validTo)}`}</span>
                ),
                grow: 4,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Reminder</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted ">{formatDatetime(activity?.originalObject?.reminder)}</span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps ms-auto">Action</span>,
                grow: 0.1,
                cell: (activity: Partial<RecentActivity>, index: number) => (
                    <div className="d-flex flex-row flex-nowrap ms-auto">
                        <Dropdown className="w-100 justify-content-end" drop={"start"}>
                            <Dropdown.Toggle size="sm" variant="default" className="btn-square" id="dropdown-basic">
                                <MoreHorizontal size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item href={`/business/insurance/edit/${activity.originalObject.id}`}>
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item href={activity.originalObject.file?.downloadUrl}>
                                    <ReceiveSquare size={16} />{" "}
                                    <span className="tb-body-default-regular">Download</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => {
                                        triggerDeleteModal(activity);
                                    }}
                                >
                                    <Trash size={16} className="me-2" color="red" />{" "}
                                    <span className="text-danger tb-body-default-regular">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ];
    };

    const projectsTable = (): TableColumn<RecentActivity>[] => {
        return [
            {
                name: <span className="text-gray-400 tb-body-title-caps">Project Name</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted text-capitalize">{`${activity?.originalObject?.name}`}</span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Owner</span>,
                cell: (activity: RecentActivity, index: number) => (
                    <div className="d-flex flex-column gap-2">
                        <span className="text-muted  text-capitalize">{`${activity?.originalObject?.owner}`}</span>
                        <a
                            href={`mailto:${activity?.originalObject?.email}`}
                            className=" text-capitalize text-decoration-none text-blue-900"
                        >{`${activity?.originalObject?.email.toLowerCase()}`}</a>
                        <a
                            href={`tel:${activity?.originalObject?.contact}`}
                            className="text-blue-900  text-capitalize text-decoration-none"
                        >{`${activity?.originalObject?.contact}`}</a>
                    </div>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Address</span>,
                cell: (activity: RecentActivity, index: number) => (
                    <div className="d-flex flex-column">
                        {activity?.originalObject?.addressLine1 && (
                            <span className="text-muted ">{`${activity?.originalObject?.addressLine1}`}</span>
                        )}
                        {activity?.originalObject?.addressLine2 && (
                            <span className="text-muted ">{`${activity?.originalObject?.addressLine2}`}</span>
                        )}
                        {activity?.originalObject?.country && (
                            <span className="text-muted ">{`${activity?.originalObject?.country}`}</span>
                        )}
                        {activity?.originalObject?.state && (
                            <span className="text-muted ">{`${activity?.originalObject?.state}`}</span>
                        )}
                        {activity?.originalObject?.city && (
                            <span className="text-muted ">{`${activity?.originalObject?.city}`}</span>
                        )}
                        {activity?.originalObject?.zipCode && (
                            <span className="text-muted ">{`${activity?.originalObject?.zipCode}`}</span>
                        )}
                    </div>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps ms-auto">Action</span>,
                cell: (activity: Partial<RecentActivity>, index: number) => (
                    <span className="ms-auto">
                        <Dropdown className="w-100" drop={"start"}>
                            <Dropdown.Toggle size="sm" variant="default" className="btn-square" id="dropdown-basic">
                                <MoreHorizontal size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item href={`/projects/${activity?.originalObject?.id}`}>
                                    <ExportSquare size={16} color="#888888" />
                                    <span className="tb-body-default-regular">View Details</span>
                                </Dropdown.Item>
                                <Dropdown.Item href={`/projects/edit/${activity?.originalObject?.id}`}>
                                    <Edit2 size={16} color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>

                                <Dropdown.Item onClick={() => triggerDeleteModal(activity)} className="text-danger">
                                    <Trash size={16} className="" color="#E70000" />{" "}
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </span>
                ),
            },
        ];
    };

    const storagesTable = (): TableColumn<RecentActivity>[] => {
        return [
            {
                name: <span className="text-gray-400 tb-body-title-caps">Description</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize truncate-3">{`${activity.originalObject.originalFileName}`}</span>
                ),
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Tags</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize d-flex flex-wrap gap-2">
                        {activity?.originalObject?.tags?.length > 0 &&
                            activity.originalObject.tags.map((tag: any, index: number) => (
                                <BadgeTag tag={tag.name} key={index} />
                            ))}
                    </span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Expiration</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize">{`${formatDatetime(
                        activity.originalObject.expireAt,
                    )}`}</span>
                ),
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Reminder</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize">{`${formatDatetime(
                        activity.originalObject.reminder,
                    )}`}</span>
                ),
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Attachment</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize truncate-1 d-flex align-items-end">
                        <span>
                            <PdfIcon width={24} height={24} />
                        </span>
                        <Link
                            href={"javascript:void(0)"}
                            className="ms-2 text-gray-400 truncate-1 offset"
                            onClick={() => {
                                setIsLoading(true);
                                storage.viewDocumentFile(activity.originalObject);
                                setTimeout(() => {
                                    setIsLoading(false);
                                }, 2000);
                            }}
                        >
                            {`${activity.originalObject.originalFileName}`}
                        </Link>
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps ms-auto">Action</span>,
                cell: (activity: RecentActivity, index: number) => (
                    <div className="d-flex flex-row flex-nowrap ms-auto">
                        <Dropdown className="w-100" drop={"start"}>
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square border-0"
                                id="dropdown-basic"
                            >
                                <MoreHorizontal size={24} color="#454545" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item href={`/storage/edit/${activity.originalObject.id}`}>
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item href={activity?.originalObject?.downloadUrl} target="_blank">
                                    <ReceiveSquare size={16} />{" "}
                                    <span className="tb-body-default-regular">Download</span>
                                </Dropdown.Item>
                                <Dropdown.Item className="text-danger" onClick={() => triggerDeleteModal(activity)}>
                                    <Trash size={16} className="" color="#E70000" />{" "}
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ];
    };

    const projectDocumentTable = (): TableColumn<RecentActivity>[] => {
        return [
            {
                name: <span className="text-gray-400 tb-body-title-caps">Description</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted truncate-3 text-capitalize">{`${activity.originalObject?.name}`}</span>
                ),
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Type</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize">{`${convertCamelCaseToSentenceCase(
                        activity.originalObject.category,
                    )}`}</span>
                ),
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Tags</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize d-flex flex-wrap gap-2">
                        {activity?.originalObject?.tags?.length > 0 &&
                            activity.originalObject.tags.map((tag: any, index: number) => (
                                <BadgeTag tag={tag.name} key={index} />
                            ))}
                    </span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Expiration</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize">{`${formatDatetime(
                        activity?.originalObject?.file?.expireAt,
                    )}`}</span>
                ),
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Reminder</span>,
                cell: (activity: RecentActivity) => (
                    <span className="text-muted  text-capitalize">{`${formatDatetime(
                        activity?.originalObject?.file?.reminder,
                    )}`}</span>
                ),
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Attachment</span>,
                cell: (activity: RecentActivity) =>
                    activity.originalObject?.file ? (
                        <span className="text-muted  text-capitalize truncate-1 d-flex align-items-end">
                            <span>
                                <PdfIcon width={24} height={24} />
                            </span>
                            <Link
                                href={"javascript:void(0)"}
                                className="ms-2 text-gray-400 truncate-1 offset"
                                onClick={() => {
                                    setIsLoading(true);
                                    storage.viewDocumentFile(activity?.originalObject?.file);
                                    setTimeout(() => {
                                        setIsLoading(false);
                                    }, 2000);
                                }}
                            >
                                {`${activity.originalObject.file?.originalFileName}`}
                            </Link>
                        </span>
                    ) : (
                        "-"
                    ),
                grow: 3,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps ms-auto">Action</span>,
                cell: (activity: RecentActivity, index: number) => (
                    <div className="d-flex flex-row flex-nowrap ms-auto">
                        <Dropdown className="w-100" drop={"start"}>
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square border-0"
                                id="dropdown-basic"
                            >
                                <MoreHorizontal size={24} color="#454545" />
                            </Dropdown.Toggle>

                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item
                                    href={`/projects/${
                                        activity?.originalObject?.project
                                    }?action=edit&activeMenu=${projectCategoryToUrl(activity.category)}&id=${
                                        activity?.originalObject?.id
                                    }`}
                                >
                                    <Edit2 size={16} />
                                    <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => {
                                        setIsLoading(true);
                                        storage.viewDocumentFile(activity?.originalObject?.downloadUrl);
                                        setTimeout(() => {
                                            setIsLoading(false);
                                        }, 2000);
                                    }}
                                >
                                    <ReceiveSquare size={16} />{" "}
                                    <span className="tb-body-default-regular">Download</span>
                                </Dropdown.Item>
                                <Dropdown.Item className="text-danger" onClick={() => triggerDeleteModal(activity)}>
                                    <Trash size={16} className="" color="#E70000" />{" "}
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ];
    };

    function onSort(sort: string) {
        if (displayData && sort.toLowerCase() !== localState.sorting.toLowerCase()) {
            setLocalState({ sorting: sort });

            // @ts-ignore
            const reversedData = Object.fromEntries(Object.entries(displayData).reverse());

            if (hasActiveSearch) {
                //@ts-ignore
                setSearchRecentActivities(reversedData);
            } else {
                //@ts-ignore
                reduxDispatch(setRecentActivities({ data: reversedData }));
            }
        }
    }

    const setIsLoading = (loading: boolean) => {
        //@ts-ignore
        setLocalState({ isLoading: loading });
    };

    const setSorting = (sorting: string) => {
        setLocalState({ sorting });
    };

    return {
        isLoading: isLoading || localState.isInitialLoading,
        isLoadingRecentActivities: isLoading || localState.isInitialLoading,
        isInitialLoading: localState.isInitialLoading,
        isSilentlyFetchingRecents,
        recentActivities: displayData,
        showDeleteModal: localState.showDeleteModal,
        dataToDelete: localState.dataToDelete,
        isDeleting: localState.isDeleting,
        sorting: localState.sorting,
        search,
        isSearching,
        pageReady,
        getRecentActivities,
        //@ts-ignore
        setRecentActivities: (data: RecentActivityDestructuredObject | undefined) => {
            if (hasActiveSearch) {
                setSearchRecentActivities(data);
            } else {
                //@ts-ignore
                reduxDispatch(setRecentActivities({ data }));
            }
        },
        //@ts-ignore
        setShowDeleteModal: (show: boolean) => setLocalState({ showDeleteModal: show }),
        triggerDeleteModal,
        deleteRecentActivity,
        //@ts-ignore
        setIsDeleting: (deleting: boolean) => setLocalState({ isDeleting: deleting }),
        contactsTable,
        licensesTable,
        insurancesTable,
        projectsTable,
        storagesTable,
        onSort,
        //@ts-ignore
        setSorting,
        //@ts-ignore
        setIsLoading,
        processSearchResults,
        projectDocumentTable,
        deleteRecentActivityById,
        setIsSearching,
        clearSearch,
        displayData,
        hasActiveSearch,
    };
};

export default useRecents;
