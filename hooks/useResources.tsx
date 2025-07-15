import { Resource } from "@/repositories/resource-repository";
import { Badge, Dropdown } from "react-bootstrap";
import { MoreHorizontal, MoreVertical } from "react-feather";
import Link from "next/link";
import { copyText, ensureHttps, getUrlPreview } from "@/helpers";
import { useEffect, useState, useReducer } from "react";
import DI from "@/di-container";
import Image from "next/image";
import { DocumentCopy, Edit2, Star1, Trash } from "iconsax-react";
import useFavorites from "./favorites";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";
import { User } from "@/repositories/account-repository";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
    setResources,
    appendResources,
    setResourcesLoading,
    setSilentlyFetching,
    removeResource,
} from "@/store/links-reducer";
import { useToast } from "@/context/ToastContext";

interface UseResourceReturn {
    resources: Resource[];
    isLoading: boolean;
    isInitialLoading: boolean;
    isSilentlyFetching: boolean;
    totalRows: number;
    hasMore: boolean;
    fetchResources: (options?: { resetData?: boolean; pageNumber?: number }) => Promise<void>;
    loadMoreResources: () => Promise<void>;
    page: number;
    setPage: (page: number) => void;
    tableColumns: (user?: User | null) => any[];
    DEFAULT_RESOURCE_PREVIEW: string;
    metaPreview: string | undefined;
    setMetaPreview: (value: string | undefined) => void;
    metaDescription: string | undefined;
    setMetaDescription: (value: string | undefined) => void;
    copyButtonText: string;
    setCopyButtonText: (value: string) => void;
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    showDeleteModal: boolean;
    setShowDeleteModal: (value: boolean) => void;
    isDeleting: boolean;
    setIsDeleting: (value: boolean) => void;
    resourceToDelete: Partial<Resource> | undefined;
    setResourceToDelete: (value: Partial<Resource> | undefined) => void;
    handleCopy: (text: string) => void;
    getResourcePreview: (url: string) => Promise<any>;
    onDeleteFromTable: (resource: Partial<Resource>) => void;
    handleDeleteResource: () => Promise<void>;
    getResources: () => Promise<void>;
    triggerDeleteModal: (resource: Resource) => void;
    addToFavorites: any;
    getResource: (id: string) => Promise<void>;
    setShowCopyToast: (value: boolean) => void;
    showCopyToast: boolean;
    listOrGrid: any;
    pageReady: boolean;
    setPageReady: (value: boolean) => void;
    searchResults: any;
    onTablePageChange: (page: number) => void;
    errors: any;
    setErrors: (value: any) => void;
    user: User | null;
}

const CACHE_EXPIRATION = 2 * 1000;

interface ResourcesLocalState {
    isInitialLoading: boolean;
    page: number;
    hasMore: boolean;
}

interface FetchResourcesOptions {
    resetData?: boolean;
    pageNumber?: number;
}

const INITIAL_STATE: ResourcesLocalState = {
    isInitialLoading: false,
    page: 1,
    hasMore: true,
};

const useResource = (): UseResourceReturn => {
    const reduxDispatch = useDispatch();
    const { showToast } = useToast();
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { user } = useSelector((state: RootState) => state.account);
    const { resources: resourcesData, isSilentlyFetching } = useSelector((state: RootState) => state.links);

    const { addToFavorites } = useFavorites();

    const [localState, setLocalState] = useReducer(
        (state: ResourcesLocalState, newState: Partial<ResourcesLocalState>) => ({ ...state, ...newState }),
        INITIAL_STATE,
    );

    const [metaPreview, setMetaPreview] = useState<string | undefined>("");
    const [copyButtonText, setCopyButtonText] = useState<string>("Copy Link");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [metaDescription, setMetaDescription] = useState<string | undefined>("");
    const [resourceToDelete, setResourceToDelete] = useState<Partial<Resource>>();
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showCopyToast, setShowCopyToast] = useState<boolean>(false);
    const [pageReady, setPageReady] = useState<boolean>(false);
    const [tablePage, setTablePage] = useState<number>(1);
    const [errors, setErrors] = useState<any>();

    const fetchResources = async (options: FetchResourcesOptions = {}) => {
        const { resetData = false, pageNumber } = options;
        const currentPageNumber = pageNumber !== undefined ? pageNumber : resetData ? 1 : localState.page;

        if ((resetData || !resourcesData.data.length) && !resourcesData.lastFetched) {
            reduxDispatch(setResourcesLoading(true));
            setLocalState({ isInitialLoading: true });
        } else {
            reduxDispatch(setSilentlyFetching(true));
        }

        try {
            const response = await DI.resourceService.getResources(currentPageNumber);

            if (resetData || currentPageNumber === 1) {
                reduxDispatch(
                    setResources({
                        data: response.results,
                        count: response.count,
                        next: response.next,
                    }),
                );
            } else {
                reduxDispatch(
                    appendResources({
                        data: response.results,
                        next: response.next,
                    }),
                );
            }

            const newPage = response.next ? (resetData ? 2 : currentPageNumber + 1) : currentPageNumber;

            setLocalState({
                hasMore: response.next !== null,
                page: newPage,
                isInitialLoading: false,
            });
        } catch (error) {
            showToast({ heading: "Error", message: "Error fetching resources", variant: "danger" });
            setLocalState({ hasMore: false });
        } finally {
            reduxDispatch(setResourcesLoading(false));
            reduxDispatch(setSilentlyFetching(false));
            setLocalState({ isInitialLoading: false });
        }
    };

    const loadMoreResources = async () => {
        if (!localState.hasMore || resourcesData.loading || isSilentlyFetching) return;
        await fetchResources({ resetData: false });
    };

    const setPage = (page: number) => {
        setLocalState({ page });
        fetchResources({ resetData: false, pageNumber: page });
    };

    function handleCopy(text: string) {
        copyText(text);
        showToast({ heading: "Success", message: "Link copied.", variant: "success" });
    }

    async function getResourcePreview(url: string) {
        try {
            const response = await getUrlPreview(url);
            response?.metaImage && setMetaPreview(response.metaImage);
            response?.metaDescription && setMetaDescription(response?.metaDescription);
            return {
                metaImage: response?.metaImage,
                metaDescription: response?.metaDescription,
            };
        } catch (error: any) {
            return null;
        }
    }

    async function getResources() {
        await fetchResources({ resetData: false });
    }

    async function getResource(id: string) {
        try {
            const res = await DI.resourceService.getResource(id);
        } catch (error) {}
    }

    function onDeleteFromTable(resource: Partial<Resource>) {
        setResourceToDelete(resource);
        setShowDeleteModal(true);
    }

    async function handleDeleteResource() {
        setIsDeleting(true);
        try {
            const res = await DI.resourceService.deleteResource(`${resourceToDelete?.id}`);

            if (resourceToDelete?.id) {
                reduxDispatch(removeResource(resourceToDelete.id));
            }

            setShowDeleteModal(false);
            setIsDeleting(false);
            showToast({ heading: "Success", message: "Resource deleted successfully", variant: "success" });
        } catch (error) {
            showToast({ heading: "Error", message: "Error deleting resource", variant: "danger" });
            setIsDeleting(false);
        }
    }

    function triggerDeleteModal(resource: Resource) {
        setResourceToDelete(resource);
        setShowDeleteModal(true);
    }

    const tableColumns = (user?: User | null) => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Description</span>,
                cell: (row: Partial<Resource>) => (
                    <Link
                        className="d-flex text-decoration-none gap-4 align-items-center object-fit-cover flex-shrink-0 w-100 text-truncate"
                        href={`${row.url}`}
                        onClick={() => {
                            getResource(`${row.id}`);
                        }}
                        target="_blank"
                        title={row.url}
                    >
                        <div className="border border-gray-100 rounded-md resource-list-view-image">
                            <Image
                                width={56}
                                height={56}
                                className="resource-list-view-image rounded-md object-fit-cover flex-shrink-0 w-56 h-56"
                                alt="resouce"
                                src={row.thumbnail ?? DEFAULT_RESOURCE_PREVIEW}
                            />
                        </div>
                        <div className="d-flex align-items-center truncate-1 justify-content-center">
                            <p
                                title={`${row.description}`}
                                className="text-gray-700 text-capitalize text-wrap"
                            >{`${row.description}`}</p>
                        </div>
                    </Link>
                ),
                grow: 3,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Link</span>,
                cell: (row: Partial<Resource>, index: number) => (
                    <Link
                        onClick={() => {
                            getResource(`${row.id}`);
                        }}
                        target="_blank"
                        title={row.url}
                        href={`${row.url}`}
                        className="d-flex flex-row w-100 flex-nowrap text-decoration-none"
                    >
                        <p
                            title={`${row.url}`}
                            className="text-blue-900 truncate-1 text-decoration-none tb-body-default-medium"
                        >
                            {row.url}
                        </p>
                    </Link>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize ms-auto">Action</span>,
                cell: (resource: Resource, index: number) => (
                    <div className="d-flex flex-row flex-nowrap ms-auto ">
                        <Dropdown className="w-100" drop={resourcesData.data.length <= 3 ? "start" : "down"}>
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square bg-transparent"
                                id="dropdown-basic"
                            >
                                <MoreVertical size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="resource-card dropdown-menu" align={`end`}>
                                <Dropdown.Item href={`/links/edit/${resource.id}`}>
                                    <Edit2 size="16" color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => handleCopy(`${resource.url}`)}>
                                    <DocumentCopy size="16" color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Copy link</span>
                                </Dropdown.Item>

                                <Dropdown.Item
                                    onClick={() => {
                                        const payload = {
                                            objectType: "resource",
                                            objectId: resource.id,
                                            createdBy: user?.id,
                                            company: user?.companyId,
                                        };

                                        addToFavorites(payload);
                                    }}
                                >
                                    <Star1 size="16" color="#888888" />{" "}
                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                </Dropdown.Item>
                                <Dropdown.Item className="text-danger" onClick={() => triggerDeleteModal(resource)}>
                                    <Trash size={16} className="text-danger" />{" "}
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ];
    };

    function currentPageNumber() {
        if (listOrGrid.link === "list") {
            return tablePage;
        }
        return localState.page;
    }

    function increamentPage() {
        if (listOrGrid.link === "list") {
            setTablePage(tablePage + 1);
            return;
        }
        setLocalState({ page: localState.page + 1 });
    }

    function resetPage() {
        setLocalState({ hasMore: true, page: 1 });
        setTablePage(1);
    }

    function onTablePageChange(page: number) {
        setTablePage(page);
    }

    useEffect(() => {
        if (searchResults) {
            setLocalState({ page: 1 });
        }
    }, [searchResults]);

    useEffect(() => {
        if (listOrGrid.link === "list") {
            fetchResources({ resetData: false, pageNumber: tablePage });
        }
    }, [tablePage]);

    useEffect(() => {
        resetPage();
        if (listOrGrid.link === "list") {
            fetchResources({ resetData: true });
        }
    }, [listOrGrid.link]);

    useEffect(() => {
        if (resourcesData.data.length > 0) {
            setLocalState({ isInitialLoading: false });

            const isDataStale = resourcesData.lastFetched && Date.now() - resourcesData.lastFetched > CACHE_EXPIRATION;

            if (isDataStale) {
                fetchResources({ resetData: true });
            }
        } else {
            setLocalState({ isInitialLoading: true });
            fetchResources({ resetData: true });
        }
    }, []);

    useEffect(() => {
        if (!resourcesData.data.length && pageReady && listOrGrid.link === "grid") {
            fetchResources({ resetData: true });
        }
    }, [pageReady]);

    return {
        resources: resourcesData.data,
        isLoading: resourcesData.loading,
        isInitialLoading: localState.isInitialLoading,
        isSilentlyFetching,
        totalRows: resourcesData.count,
        hasMore: localState.hasMore,
        fetchResources,
        loadMoreResources,
        page: localState.page,
        setPage,

        tableColumns,
        DEFAULT_RESOURCE_PREVIEW,
        metaPreview,
        setMetaPreview,
        metaDescription,
        setMetaDescription,
        copyButtonText,
        setCopyButtonText,
        showModal,
        setShowModal,
        showDeleteModal,
        setShowDeleteModal,
        isDeleting,
        setIsDeleting,
        resourceToDelete,
        setResourceToDelete,
        handleCopy,
        getResourcePreview,
        onDeleteFromTable,
        handleDeleteResource,
        getResources,
        triggerDeleteModal,
        addToFavorites,
        getResource,
        setShowCopyToast,
        showCopyToast,
        listOrGrid,
        pageReady,
        setPageReady,
        searchResults,
        onTablePageChange,
        errors,
        setErrors,
        //@ts-ignore
        user,
    };
};

export default useResource;
