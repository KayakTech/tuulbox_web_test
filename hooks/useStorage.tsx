import { FileAttachment } from "@/components/FileCard";
import {
    addSelectedTimeToDateTime,
    apiErrorMessage,
    convertDateStringToIsoString,
    formatDatetime,
    downloadFile,
    getTimeFromTimestamp,
    isAlphabetic,
} from "@/helpers";
import { Dropdown } from "react-bootstrap";
import { MoreHorizontal, MoreVertical, Share2 } from "react-feather";
import resources from "./useResources";
import PdfIcon from "@/components/icons/PdfIcon";
import Link from "next/link";
import { DocumentCopy, Edit2, NotificationBing, ReceiveSquare, Star1, StarSlash, Trash } from "iconsax-react";
import { useEffect, useReducer, useRef, useState } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
    setUserId,
    setFiles,
    appendFiles,
    setFilesLoading,
    setSilentlyFetching,
    resetFiles,
    updateFile as updateFileInStore,
    deleteFile as deleteFileFromStore,
    addFile as addFileToStore,
} from "@/store/storage-reducer";
import DI from "@/di-container";
import { StartFileUploadPayload, StorageFile } from "@/repositories/storage-repository";
import { useRouter } from "next/router";
import { TagInput } from "@/components/ResourceForm";
import BadgeTag from "@/components/BadgeTag";
import useFavorites from "./favorites";
import { User } from "@/repositories/account-repository";
import { SelectTimetype } from "@/components/TimeSelector";
import { TableColumn } from "react-data-table-component";
import Image from "next/image";
import * as helpers from "@/helpers";
import { useToast } from "@/context/ToastContext";

export type StorageFormState = {
    fileName: string;
    originalFileName: string;
    fileId: string;
    fileType: string;
    isLoading?: boolean;
    attachment: any;
    expiryDate: any;
    reminder: any;
    tags: TagInput[];
    tagSuggestions: TagInput[];
    autoFocus: boolean;
    errorMessage: string;
    isAdding: boolean;
    dropZoneErrorMessage: string;
    page: number;
    showModal: boolean;
    feedbackMessage: string;
    notifyMe: string;
    expireAt: string;
    fileSize: number;
};

type StorageHookProps = {
    action?: string;
    listOrGrid?: any;
    type?: "files" | "expired";
    searchTerm?: string;
};

interface StorageLocalState {
    page: number;
    hasMore: boolean;
    tablePage: number;
    isInitialLoading: boolean;
    currentSearchTerm: string;
}

interface FetchFilesOptions {
    resetData?: boolean;
    pageNumber?: number;
}

const CACHE_EXPIRATION = 2 * 1000;

const INITIAL_LOCAL_STATE: StorageLocalState = {
    page: 1,
    hasMore: true,
    tablePage: 1,
    isInitialLoading: false,
    currentSearchTerm: "",
};

const useStorage = (params: StorageHookProps) => {
    const { action, listOrGrid, type = "files", searchTerm } = params;

    const router = useRouter();
    const reduxDispatch = useDispatch();
    const { showToast } = useToast();
    const { user } = useSelector((state: RootState) => state.account);
    const { addToFavorites, removeFavoriteById } = useFavorites();

    const storageState = useSelector((state: RootState) => state.storage);
    const { files: filesData, expiredFiles: expiredFilesData, isSilentlyFetching } = storageState;
    const currentFilesData = type === "files" ? filesData : expiredFilesData;

    const filteredFiles = React.useMemo(() => {
        if (!searchTerm || !searchTerm.trim()) {
            return currentFilesData.data;
        }

        const searchLower = searchTerm.toLowerCase().trim();
        return currentFilesData.data.filter((file: StorageFile) => {
            const originalFileName = file.originalFileName?.toLowerCase() || "";
            const fileName = file.fileName?.toLowerCase() || "";
            const tags = file.tags?.map((tag: any) => tag.name.toLowerCase()).join(" ") || "";

            return (
                originalFileName.includes(searchLower) || fileName.includes(searchLower) || tags.includes(searchLower)
            );
        });
    }, [currentFilesData.data, searchTerm]);

    const [localState, setLocalState] = useReducer(
        (state: StorageLocalState, newState: Partial<StorageLocalState>) => ({ ...state, ...newState }),
        INITIAL_LOCAL_STATE,
    );

    const [showModal, setShowModal] = useState<boolean>(false);
    const [fileToDelete, setFileToDelete] = useState<Partial<FileAttachment>>({ fileName: "", id: "" });
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showTimePickerModal, setShowTimePickerModal] = useState<boolean>(false);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [isPickingtime, setIsPickingtime] = useState<boolean>(false);
    const tagsSelector = useRef(null);
    const [pageReady, setPageReady] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>();
    const [storageFile, setStorageFile] = useState<StorageFile>();

    const [pickedTime, setPickedTime] = useState<SelectTimetype>({
        timeString: "Pick a Time",
        timeValue: 0,
        isPickingtime: true,
    });

    const [file, setFile] = useReducer(
        (state: StorageFormState, newState: Partial<StorageFormState>) => ({ ...state, ...newState }),
        {
            fileName: "",
            fileId: "",
            fileType: "",
            originalFileName: "",
            isLoading: false,
            attachment: [],
            expiryDate: "",
            reminder: "",
            tags: [],
            tagSuggestions: [],
            autoFocus: false,
            errorMessage: "",
            isAdding: false,
            dropZoneErrorMessage: "",
            page: 1,
            showModal: false,
            feedbackMessage: "",
            notifyMe: "",
            expireAt: "",
            fileSize: 0,
        },
    );

    useEffect(() => {
        if (user?.id) {
            //@ts-ignore
            reduxDispatch(setUserId(user.id));
        }
    }, [user?.id, reduxDispatch]);

    useEffect(() => {
        const currentSearch = searchTerm || "";

        if (localState.currentSearchTerm !== currentSearch) {
            setLocalState({
                currentSearchTerm: currentSearch,
                page: 1,
                tablePage: 1,
                hasMore: true,
            });
        }
    }, [searchTerm]);

    const fetchFiles = async (options: FetchFilesOptions = {}) => {
        const { resetData = false, pageNumber } = options;
        const currentPageNumber = pageNumber !== undefined ? pageNumber : resetData ? 1 : getCurrentPage();

        if ((resetData || !currentFilesData.data.length) && !currentFilesData.lastFetched) {
            reduxDispatch(setFilesLoading({ type, loading: true }));
            setLocalState({ isInitialLoading: true });
        } else {
            reduxDispatch(setSilentlyFetching(true));
        }

        try {
            const response =
                type === "expired"
                    ? await DI.storageService.getExpiredFiles(currentPageNumber)
                    : await DI.storageService.getFiles(currentPageNumber);

            if (resetData || currentPageNumber === 1) {
                reduxDispatch(
                    setFiles({
                        type,
                        data: response.data.results,
                        count: response.data.count,
                        next: response.data.next,
                    }),
                );
            } else {
                reduxDispatch(
                    appendFiles({
                        type,
                        data: response.data.results,
                        next: response.data.next,
                    }),
                );
            }

            const newPage = response.data.next ? (resetData ? 2 : currentPageNumber + 1) : currentPageNumber;

            setLocalState({
                hasMore: response.data.next !== null,
                page: listOrGrid?.storage === "list" ? localState.page : newPage,
                tablePage: listOrGrid?.storage === "list" ? newPage : localState.tablePage,
                isInitialLoading: false,
            });
        } catch (error) {
            showToast({ heading: "Error", message: "Error fetching files", variant: "danger" });
        } finally {
            reduxDispatch(setFilesLoading({ type, loading: false }));
            reduxDispatch(setSilentlyFetching(false));
            setLocalState({ isInitialLoading: false });
        }
    };

    const loadMoreFiles = async () => {
        if (!localState.hasMore || currentFilesData.loading || isSilentlyFetching || searchTerm) return;
        await fetchFiles({ resetData: false });
    };

    const setPage = (page: number) => {
        setLocalState({
            [listOrGrid?.storage === "list" ? "tablePage" : "page"]: page,
        });
        fetchFiles({ resetData: false, pageNumber: page });
    };

    function getCurrentPage() {
        return listOrGrid?.storage === "list" ? localState.tablePage : localState.page;
    }

    function clearSearch() {
        setLocalState({
            currentSearchTerm: "",
            page: 1,
            tablePage: 1,
            hasMore: true,
        });
    }

    function resetPage() {
        reduxDispatch(resetFiles({ type }));
        setLocalState({
            hasMore: true,
            page: 1,
            tablePage: 1,
        });
    }

    useEffect(() => {
        setLocalState({ page: 1, tablePage: 1 });
    }, [type]);

    useEffect(() => {
        setLocalState({ page: 1, tablePage: 1, hasMore: true });

        if (currentFilesData.data.length === 0) {
            setLocalState({ isInitialLoading: true });
            fetchFiles({ resetData: true });
        } else {
            const isDataStale =
                currentFilesData.lastFetched && Date.now() - currentFilesData.lastFetched > CACHE_EXPIRATION;

            if (isDataStale) {
                fetchFiles({ resetData: true });
            }
        }

        setPageReady(true);
    }, [type]);

    useEffect(() => {
        if (listOrGrid?.storage === "list") {
            setLocalState({ tablePage: getCurrentPage() });
        } else {
            setLocalState({ page: 1, tablePage: 1 });
        }
    }, [listOrGrid?.storage]);

    const onTablePageChange = (page: number) => {
        setLocalState({ tablePage: page });
    };

    const tableColumns = (user?: User | null): TableColumn<StorageFile>[] => {
        return [
            {
                name: "Attachment",
                selector: (row: StorageFile) => row.originalFileName,
                cell: (row: StorageFile) => (
                    <Link
                        onClick={() => {
                            viewDocumentFile(row);
                        }}
                        href={"javascript:void(0)"}
                        className="text-muted text-capitalize text-decoration-none truncate-1m d-flex align-items-end"
                    >
                        <span className="object-fit-cover flex-shrink-0" style={{ width: "24px", height: "24px" }}>
                            {row.thumbnail ? (
                                <Image
                                    src={row.thumbnail}
                                    width={24}
                                    height={24}
                                    alt=""
                                    className="h-100 object-fit-cover flex-shrink-0"
                                />
                            ) : (
                                <PdfIcon width={24} height={24} />
                            )}
                        </span>
                        <span
                            className="ms-2 text-blue-800 truncate-1 text-decoration-none offset"
                            title={row.originalFileName}
                        >
                            {row.originalFileName}
                        </span>
                    </Link>
                ),
                grow: 3,
            },
            {
                name: "Expiration",
                selector: (row: StorageFile) => row.expireAt,
                cell: (row: StorageFile) => (
                    <Link
                        href={"javascript:void(0)"}
                        onClick={() => viewDocumentFile(row)}
                        className="text-muted text-decoration-none text-capitalize"
                    >
                        {formatDatetime(row.expireAt)}
                    </Link>
                ),
                grow: 2,
            },
            {
                name: "Reminder",
                selector: (row: StorageFile) => row.reminder,
                cell: (row: StorageFile) => (
                    <Link
                        href={"javascript:void(0)"}
                        onClick={() => viewDocumentFile(row)}
                        className="text-muted text-decoration-none text-capitalize"
                    >
                        {formatDatetime(row.reminder)}
                    </Link>
                ),
                grow: 2,
            },
            {
                name: "Action",
                cell: (row: StorageFile) => (
                    <div className="d-flex flex-row flex-nowrap ms-auto">
                        <Dropdown className="w-100" drop={resources.length <= 3 ? "start" : "down"}>
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square bg-transparent"
                                id="dropdown-basic"
                            >
                                <MoreVertical size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align="end">
                                <Dropdown.Item href={`/storage/edit/${row.id}`}>
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item href={row.downloadUrl}>
                                    <ReceiveSquare size={16} />{" "}
                                    <span className="tb-body-default-regular">Download</span>
                                </Dropdown.Item>
                                {row.inFavorite ? (
                                    <Dropdown.Item
                                        onClick={() => {
                                            removeFavoriteById(row.favoriteId!).then(() => {
                                                fetchFiles({ resetData: true });
                                            });
                                        }}
                                    >
                                        <StarSlash size={16} />
                                        <span className="tb-body-default-regular">Remove from Favorites</span>
                                    </Dropdown.Item>
                                ) : (
                                    <Dropdown.Item
                                        onClick={() => {
                                            const payload = {
                                                createdBy: user?.id,
                                                company: user?.companyId,
                                                objectId: row.id,
                                                objectType: "storage",
                                            };
                                            addToFavorites(payload).then(() => {
                                                fetchFiles({ resetData: true });
                                            });
                                        }}
                                    >
                                        <Star1 size={16} />
                                        <span className="tb-body-default-regular">Add to Favorites</span>
                                    </Dropdown.Item>
                                )}
                                <Dropdown.Item className="text-danger" onClick={() => onTriggerDelete(row)}>
                                    <Trash size={16} color="#E70000" />
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ];
    };

    function onTriggerDelete(file: any) {
        if ("fileId" in file) {
            file = {
                ...file,
                id: file.fileId,
            };
        }
        setFileToDelete(file);
        setShowModal(true);
        setShowDeleteModal(true);
    }

    async function onDelete() {
        setIsDeleting(true);

        try {
            const res = await DI.storageService.deleteFile(fileToDelete.id);

            reduxDispatch(deleteFileFromStore(fileToDelete.id!));

            setShowModal(false);
            setShowDeleteModal(false);

            const currentPage = location.pathname.split("/")[1];
            if (currentPage === "expirations") {
                fetchFiles({ resetData: true });
                return;
            }
            if (currentPage === "business") {
                router.reload();
                return;
            }

            showToast({ heading: "Success", message: "File deleted successfully", variant: "success" });
            return res;
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to delete file", variant: "danger" });
        } finally {
            setIsDeleting(false);
        }
    }

    function addFileAgain() {
        if (action === "add") {
            window.location.reload();
        }

        if (action === "edit") {
            setFile({ showModal: false });
        }
    }

    function handleTagsChange(newTags: any) {
        if (newTags.length > 5) {
            newTags.pop();
        }
        if (newTags.length >= 5) {
            // @ts-ignore
            tagsSelector?.current?.blur();
        }
        setFile({ tags: newTags, autoFocus: true });
    }

    function handleOnFileChange(file: File[]) {
        setFile({ dropZoneErrorMessage: "" });
        if (!file.length) {
            setFile({ dropZoneErrorMessage: "Only (png, jpg and pdf) files are accepted" });
            return;
        }
        setFile({ attachment: file, originalFileName: file[0].name.split(".")[0] });
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setFile({ errorMessage: "" });
        setErrors(null);
        if (action === "add" && !file.attachment.length) {
            setFile({ errorMessage: "Please attach a file." });
            return;
        }
        if (!file.originalFileName) {
            setFile({ errorMessage: "Please add a short description." });
            return;
        }

        setFile({ isAdding: true });

        const tagNames: string[] = file.tags.map((tag: TagInput) => tag.value);

        let payload = {
            //@ts-ignore
            id: action === "edit" ? file.fileId || file.id : "",
            fileName:
                action === "edit" && !file.attachment.length
                    ? file.fileName
                    : `${file.originalFileName}.${file.attachment[0].name.split(".").pop()}`,
            originalFileName: file.originalFileName,
            fileType: action === "edit" && !file.attachment.length ? file.fileType : file.attachment[0].type,
            tagNames: tagNames.length ? tagNames : [],
            file: file.attachment[0],
        } as StartFileUploadPayload;

        if (file.reminder) {
            const formattedReminder = convertDateStringToIsoString(file.reminder);
            payload.reminder = formattedReminder;
        }
        if (file.expiryDate) {
            const formattedExpiryDate = convertDateStringToIsoString(file.expiryDate);
            payload.expireAt = formattedExpiryDate;
        }

        if (action === "add") {
            addFile(payload, { callbackUrl: "/storage" });
        } else if (action === "edit" && file.attachment.length) {
            Promise.all([
                updateFile(payload, { callbackUrl: "/storage" }),
                updateFileData(payload, { callbackUrl: "/storage" }),
            ]).catch(error => {
                console.error("Error during file update:", error);
            });
        } else if (action === "edit" && !file.attachment.length) {
            updateFileData(payload, { callbackUrl: "/storage" });
        }
    }

    async function addFile(payload: StartFileUploadPayload, props?: { callbackUrl: string }) {
        try {
            const response = await DI.storageService.uploadFile(payload);

            reduxDispatch(addFileToStore(response.file));

            showToast({ heading: "Success", message: "File added.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
            return response;
        } catch (error: any) {
            if (error?.response?.data?.data) {
                setErrors({
                    ...errors,
                    expiryDate: error?.response?.data?.data?.expireAt
                        ? error?.response?.data?.data?.expireAt.join(" ")
                        : "",
                    reminder: error?.response?.data?.data?.reminder
                        ? error?.response?.data?.data?.reminder.join(" ")
                        : "",
                });
            }

            setFile({ errorMessage: apiErrorMessage(error) });
        } finally {
            setFile({ isAdding: false });
        }
    }

    async function updateFile(payload: Partial<StartFileUploadPayload>, props?: { callbackUrl: string }) {
        const updatePayload: Partial<StartFileUploadPayload> = {
            id: payload.id,
        };

        // Only include the file if a new file is being uploaded
        if (payload.file) {
            updatePayload.file = payload.file;
        }

        try {
            const res = await DI.storageService.updateFile(updatePayload);
            //@ts-ignore
            reduxDispatch(updateFileInStore(res.file));

            showToast({ heading: "Success", message: "File updated successfully.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
            return res;
        } catch (error: any) {
            if (error?.response?.data?.data) {
                setErrors({
                    ...errors,
                    expiryDate: error?.response?.data?.data?.expireAt
                        ? error?.response?.data?.data?.expireAt.join(" ")
                        : "",
                    reminder: error?.response?.data?.data?.reminder
                        ? error?.response?.data?.data?.reminder.join(" ")
                        : "",
                });
            }
            setFile({ errorMessage: apiErrorMessage(error) });
        } finally {
            setFile({ isAdding: false });
        }
    }

    async function updateFileData(payload: Partial<StartFileUploadPayload>, props?: { callbackUrl: string }) {
        const { file, ...metadataPayload } = payload;

        try {
            const res = await DI.storageService.updateFileMetadata(metadataPayload);

            //@ts-ignore
            reduxDispatch(updateFileInStore(res.file));

            showToast({ heading: "Success", message: "File updated successfully", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
            return res;
        } catch (error: any) {
            if (error?.response?.data?.data) {
                setErrors({
                    ...errors,
                    expiryDate: error?.response?.data?.data?.expireAt
                        ? error?.response?.data?.data?.expireAt.join(" ")
                        : "",
                    reminder: error?.response?.data?.data?.reminder
                        ? error?.response?.data?.data?.reminder.join(" ")
                        : "",
                });
            }
            setFile({ errorMessage: apiErrorMessage(error) });
        } finally {
            setFile({ isAdding: false });
        }
    }

    async function updateAttachment(payload: StartFileUploadPayload) {
        try {
            const response = await DI.storageService.uploadFile(payload);
            setFile({ fileId: response.file.id });
        } catch (error: any) {
            setFile({ errorMessage: apiErrorMessage(error) });
            setFile({ isAdding: false });
        }
    }

    async function getTags() {
        try {
            const res = await DI.resourceService.getTags(file.page);
            if (res.results.length) {
                let preparedTags = res.results.map((tag: any) => {
                    return { value: tag.name, label: tag.name };
                });
                setFile({ tagSuggestions: preparedTags });
                if (action === "edit") {
                    setFile({ tags: preparedTags });
                }
            }
        } catch (error) {}
    }

    async function getFile(params: { fileId: string; isDownloading?: boolean; isPreviewing?: boolean }) {
        const { fileId, isDownloading, isPreviewing } = params;
        try {
            const res = await DI.storageService.getFile(fileId);
            const file: StorageFile = res.data;

            let newTags: any = [];

            if (file.tags.length) {
                file.tags.map(tag => {
                    newTags.push({ label: tag.name, value: tag.name });
                });
            }

            if (file.expireAt) {
                const time = getTimeFromTimestamp(file.expireAt);
                const selectedTime: any = {
                    timeValue: time,
                    timeString: time,
                    isPickingtime: true,
                };
                handleTimeSelection(selectedTime);
            }

            setStorageFile(file);

            setFile({
                ...file,
                fileName: file.fileName,
                originalFileName: file?.originalFileName?.split(".")[0],
                fileType: file.fileType,
                expiryDate: file.expireAt ? convertDateStringToIsoString(file.expireAt).split("T")[0] : "",
                reminder: file.reminder ? convertDateStringToIsoString(file.reminder).split("T")[0] : "",
                tags: newTags.length ? newTags : [],
                isLoading: false,
            });

            if (isDownloading) {
                downloadFile({ fileUrl: file.file, fileName: file.originalFileName });
            }
            if (isPreviewing) {
                window.open(file?.file, "_blank");
            }

            return res;
        } catch (error) {
            router.push("/storage");
        }
    }

    async function viewDocumentFile(document: any) {
        const doc = await getFile({ fileId: document.id });
        doc?.data?.file && window.open(doc?.data?.file, "_blank");
    }

    async function downloadDocumentFile(document: any) {
        const doc = await getFile({ fileId: document.id });
        if (doc?.data?.file) {
            downloadFile({ fileUrl: doc.data.file, fileName: document.originalFileName });
        }
    }

    const handleTimeSelection = (params: SelectTimetype) => {
        setIsPickingtime(params?.isPickingtime || false);
        let pickedT = { ...pickedTime };

        const { timeString } = params;

        setSelectedTime(timeString);
        const newTime = addSelectedTimeToDateTime(params, file.reminder);
        setTime(newTime.chosenTime);
        setFile({ expiryDate: newTime.newDateTime });

        if (params.isPickingtime) {
            pickedT.timeString = newTime.chosenTime;
        } else {
            pickedT.timeString = "Pick a Time";
        }
        setPickedTime(pickedT);
    };

    const expiredFilesTable = () => {
        return [
            {
                name: <span className="text-gray-400 tb-body-title-caps">Description</span>,
                cell: (row: FileAttachment) => (
                    <span className="text-muted text-capitalize">{`${row.originalFileName}`}</span>
                ),
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Category</span>,
                cell: (row: FileAttachment) => <span className="text-muted text-capitalize">{`-`}</span>,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Expiration date</span>,
                cell: (row: FileAttachment) => (
                    <span className="text-muted text-capitalize">{`${formatDatetime(row.expireAt)}`}</span>
                ),
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Attachment</span>,
                cell: (row: FileAttachment) => (
                    <span className="text-muted text-capitalize truncate-1 d-flex align-items-end">
                        <span>
                            <PdfIcon width={24} height={24} />
                        </span>
                        <Link
                            href={"javascript:void(0)"}
                            className="ms-2 text-blue-800 truncate-1 tb-body-default-medium"
                            onClick={() => {
                                viewDocumentFile(row);
                            }}
                        >
                            {`${row.originalFileName}`}
                        </Link>
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps">Status</span>,
                cell: (row: FileAttachment) => <span className="text-muted text-capitalize">{`-`}</span>,
            },
            {
                name: <span className="text-gray-400 tb-body-title-caps ms-auto">Action</span>,
                cell: (row: FileAttachment, index: number) => (
                    <div className="d-flex flex-row flex-nowrap ms-auto">
                        <Dropdown className="w-100" drop={resources.length <= 3 ? "start" : "down"}>
                            <Dropdown.Toggle size="sm" variant="default" className="btn-square" id="dropdown-basic">
                                <MoreHorizontal size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item href={`/storage/edit/${row.id}`}>
                                    <Edit2 className="" size={16} />{" "}
                                    <span className="tb-body-default-regular">Renew</span>
                                </Dropdown.Item>

                                <Dropdown.Item
                                    onClick={() => {
                                        const payload = {
                                            createdBy: user?.id,
                                            company: user?.companyId,
                                            objectId: row.id,
                                            objectType: "storage",
                                        };

                                        addToFavorites(payload).then(() => {
                                            fetchFiles({ resetData: true });
                                        });
                                    }}
                                >
                                    <Star1 className="" size={16} />{" "}
                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                </Dropdown.Item>
                                <Dropdown.Item href={row?.file} target="_blank">
                                    <NotificationBing className="" size={16} />{" "}
                                    <span className="tb-body-default-regular">Remind Me</span>
                                </Dropdown.Item>
                                <Dropdown.Item className="text-danger" onClick={() => onTriggerDelete(row)}>
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

    useEffect(() => {
        if (listOrGrid?.storage === "list") {
            setLocalState({ tablePage: getCurrentPage() });
        }
    }, [localState.tablePage]);

    useEffect(() => {
        if (listOrGrid?.storage === "list") {
            return;
        }
        setLocalState({ page: 1, tablePage: 1 });
    }, [listOrGrid?.storage]);

    useEffect(() => {
        setPageReady(true);
    }, []);

    return {
        tableColumns,
        clearSearch,
        files: filteredFiles,
        allFiles: currentFilesData.data,
        setFiles: (files: StorageFile[]) =>
            reduxDispatch(setFiles({ type, data: files, count: files.length, next: null })),
        isLoading: currentFilesData.loading || localState.isInitialLoading,
        setIsLoading: (loading: boolean) => reduxDispatch(setFilesLoading({ type, loading })),
        page: getCurrentPage(),
        showModal,
        setShowModal,
        isDeleting,
        setIsDeleting,
        getFiles: () => fetchFiles({ resetData: true }),
        onTriggerDelete,
        onDelete,
        showDeleteModal,
        setShowDeleteModal,
        file,
        setFile,
        addFileAgain,
        handleTagsChange,
        handleOnFileChange,
        handleSubmit,
        addFile,
        updateFile,
        getTags,
        getFile,
        selectedTime,
        setSelectedTime,
        time,
        setTime,
        handleTimeSelection,
        isPickingtime,
        pickedTime,
        showTimePickerModal,
        setShowTimePickerModal,
        expiredFiles: type === "expired" ? filteredFiles : [],
        expiredFilesTable,
        viewDocumentFile,
        tagsSelector,
        setTotalRows: () => {},
        totalRows: searchTerm ? filteredFiles.length : currentFilesData.count,
        onTablePageChange,
        hasMore: localState.hasMore,
        setHasMore: (hasMore: boolean) => setLocalState({ hasMore }),
        listOrGrid,
        currentPage: getCurrentPage(),
        resetPage,
        setPageReady,
        errors,
        downloadDocumentFile,
        showToast,
        addToFavorites,
        setFileToDelete,
        storageFile,
        setStorageFile,
        loadMoreFiles,
        isSilentlyFetching,
        setPage,
        pageReady,
        updateFileData,
        updateAttachment,
    };
};

export default useStorage;
