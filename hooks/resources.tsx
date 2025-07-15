import { Resource } from "@/repositories/resource-repository";
import { Badge, Dropdown } from "react-bootstrap";
import { MoreHorizontal, MoreVertical } from "react-feather";
import Link from "next/link";
import { copyText, ensureHttps, getUrlPreview } from "@/helpers";
import { useEffect, useState } from "react";
import DI from "@/di-container";
import Image from "next/image";
import { DocumentCopy, Edit2, Star1, Trash } from "iconsax-react";
import useFavorites from "./favorites";
import { DEFAULT_RESOURCE_PREVIEW } from "@/helpers/constants";
import { User } from "@/repositories/account-repository";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const useResource = () => {
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { user } = useSelector((state: RootState) => state.account);

    const { addToFavorites, showToast } = useFavorites();
    const [metaPreview, setMetaPreview] = useState<string | undefined>("");

    const [copyButtonText, setCopyButtonText] = useState<string>("Copy Link");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [metaDescription, setMetaDescription] = useState<string | undefined>("");

    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [resourceToDelete, setResourceToDelete] = useState<Partial<Resource>>();
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showCopyToast, setShowCopyToast] = useState<boolean>(false);

    const [hasMore, setHasMore] = useState<boolean>(true);
    const [pageReady, setPageReady] = useState<boolean>(false);
    const [totalRows, setTotalRows] = useState<number>();
    const [tablePage, setTablePage] = useState<number>(1);

    const [errors, setErrors] = useState<any>();

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
        setIsLoading(true);
        try {
            const res = await DI.resourceService.getResources(currentPageNumber());
            //{ results: [], count: 0, next: null }
            if (res.results.length) {
                setTotalRows(res.count);
                let theResources: Resource[] = [];

                // const promises = res.results.map(async (resource: Resource, index: number) => {
                //     const metaInfo = await getResourcePreview(resource.url);
                //     if (metaInfo) {
                //         resource.metaImage = metaInfo.metaImage ? ensureHttps(metaInfo.metaImage) : "";
                //         resource.metaDescription = metaInfo.metaDescription;
                //     }
                //     return resource;
                // });
                // const processedResources = await Promise.all(promises);

                if (listOrGrid.link === "grid") {
                    setHasMore(res.next != null);
                    theResources = [...resources, ...res.results];

                    if (res.next) {
                        increamentPage();
                    }
                } else {
                    theResources = res.results;
                }
                setResources(theResources);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            // Handle errors here
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }

    async function getResource(id: string) {
        try {
            const res = await DI.resourceService.getResource(id);
        } catch (error) {
            //
        }
    }

    function onDeleteFromTable(resource: Partial<Resource>) {
        setResourceToDelete(resource);
        setShowDeleteModal(true);
    }
    async function handleDeleteResource() {
        setIsDeleting(true);
        try {
            const res = await DI.resourceService.deleteResource(`${resourceToDelete?.id}`);
            setShowDeleteModal(false);
            setIsDeleting(false);
            getResources();
        } catch (error) {}
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
                        <Dropdown className="w-100" drop={resources.length <= 3 ? "start" : "down"}>
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

    // Pagination and search results

    function currentPageNumber() {
        if (listOrGrid.link === "list") {
            return tablePage;
        }
        return page;
    }

    function increamentPage() {
        if (listOrGrid.link === "list") {
            setTablePage(page + 1);
            return;
        }
        setPage(page + 1);
    }

    function resetPage() {
        setHasMore(true);
        setPage(1);
        setTablePage(1);
        setResources([]);
    }

    useEffect(() => {
        if (searchResults) {
            setResources([]);
            setPage(1);
        }
    }, [searchResults]);

    useEffect(() => {
        if (listOrGrid.link === "list") {
            getResources();
            return;
        }
    }, [tablePage]);

    useEffect(() => {
        resetPage();
        if (listOrGrid.link === "list") {
            getResources();
            return;
        }
    }, [listOrGrid.link]);

    useEffect(() => {
        if (!resources.length && pageReady) {
            getResources();
        }
    }, [resources]);

    function onTablePageChange(page: number) {
        setTablePage(page);
    }

    return {
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
        resources,
        setResources,
        page,
        setPage,
        isLoading,
        setIsLoading,
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
        hasMore,
        totalRows,
        onTablePageChange,
        errors,
        setErrors,
        user,
    };
};

export default useResource;
