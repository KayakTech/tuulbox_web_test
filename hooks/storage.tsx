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
import DI from "@/di-container";
import { StartFileUploadPayload, StorageFile } from "@/repositories/storage-repository";
import { useRouter } from "next/router";
import { TagInput } from "@/components/ResourceForm";
import BadgeTag from "@/components/BadgeTag";
import useFavorites from "./favorites";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { User } from "@/repositories/account-repository";
import { SelectTimetype } from "@/components/TimeSelector";
import { TableColumn } from "react-data-table-component";
import Image from "next/image";
import * as helpers from "@/helpers";

export type StorageFormState = {
    fileName: string;
    originalFileName: string;
    fileId: string;
    fileType: string;
    isLoading?: boolean;
    attachment: File[];
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
};

const useStorage = (params: StorageHookProps) => {
    const { action, listOrGrid } = params;

    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.account);
    const { addToFavorites, showToast, removeFavoriteById } = useFavorites();
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [tablePage, setTablePage] = useState<number>(1);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [fileToDelete, setFileToDelete] = useState<Partial<FileAttachment>>({ fileName: "", id: "" });
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showTimePickerModal, setShowTimePickerModal] = useState<boolean>(false);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [isPickingtime, setIsPickingtime] = useState<boolean>(false);
    const [totalRows, setTotalRows] = useState<number>();
    const tagsSelector = useRef(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [pageReady, setPageReady] = useState<boolean>(false);
    const [errors, setErrors] = useState<any>();
    const [storageFile, setStorageFile] = useState<StorageFile>();
    const [uploadProgress, setUploadProgress] = useState<StorageFile[]>([]);
    const [showUploadProgress, setShowUploadProgress] = useState(false);
    const [filesWithMetadata, setFilesWithMetadata] = useState<FileWithMetadata[]>([]);

    const [pickedTime, setPickedTime] = useState<SelectTimetype>({
        timeString: "Pick a Time",
        timeValue: 0,
        isPickingtime: true,
    });
    const [expiredFiles, setExpiredFiles] = useState<any[]>([]);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);

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

    type FileWithMetadata = {
        file: File;
        fileName: string;
        tags: TagInput[];
        status: "selected" | "uploading" | "completed" | "failed";
        progress?: number;
        error?: string;
        expiryDate?: string | Date | "";
        reminder?: string | Date | "";
        selectedTime: string;
    };

    useEffect(() => {
        if (searchResults) {
            setFiles([]);
            setPage(1);
        }
    }, [searchResults]);

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
                                                getFiles();
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
                                                getFiles();
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

    function currentPage() {
        if (listOrGrid?.storage === "list") {
            return tablePage;
        }
        return page;
    }

    function increamentPage() {
        if (listOrGrid?.storage === "list") {
            setTablePage(page + 1);
            return;
        }
        setPage(page + 1);
    }

    function resetPage() {
        setHasMore(true);
        setPage(1);
        setTablePage(1);
        setFiles([]);
    }

    async function getFiles() {
        setIsLoading(true);
        try {
            const response = await DI.storageService.getFiles(currentPage());

            setTotalRows(response.data.count);

            let storedFiles: StorageFile[] = [];

            if (listOrGrid?.storage === "grid") {
                setHasMore(response.data.next != null);
                storedFiles = [...files, ...response.data.results];
                if (response.data.next) {
                    increamentPage();
                }
            } else {
                storedFiles = response.data.results;
            }
            storedFiles.length && setFiles(storedFiles);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

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
            setShowModal(false);
            setShowDeleteModal(false);

            const currentPage = location.pathname.split("/")[1];
            if (currentPage === "expirations") {
                getExpiredFiles();
                return;
            }
            if (currentPage === "business") {
                router.reload();
                return;
            }
            router.reload();
            return res;
        } catch (error) {
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

    function handleOnFileChange(acceptedFiles: File[]) {
        setFile({ dropZoneErrorMessage: "" });

        const currentAttachments = file.attachment || [];
        const totalFiles = currentAttachments.length + acceptedFiles.length;

        // For edit mode, only allow single file
        if (action === "edit" && acceptedFiles.length > 1) {
            setFile({
                dropZoneErrorMessage: "You can only upload one file in edit mode.",
            });
            return;
        }

        // For creation mode, check 10 file limit
        if (action === "add" && totalFiles > 10) {
            const remainingSlots = 10 - currentAttachments.length;
            setFile({
                dropZoneErrorMessage: `You can only upload up to 10 files. You have ${remainingSlots} slot(s) remaining.`,
            });
            return;
        }

        const invalidFiles = acceptedFiles.filter(file => {
            const fileExtension = file.name.split(".").pop()?.toLowerCase();
            const allowedExtensions = ["png", "jpg", "jpeg", "pdf", "docx", "xlsx"];
            const maxSize = 10 * 1024 * 1024; // 10MB

            return !allowedExtensions.includes(fileExtension || "") || file.size > maxSize;
        });

        if (invalidFiles.length > 0) {
            setFile({
                dropZoneErrorMessage:
                    "Some files are invalid. Please ensure all files are PDF, DOCX, JPG, PNG, or XLSX and under 10MB.",
            });
            return;
        }

        // For edit mode, replace the current file
        if (action === "edit") {
            setFile({
                attachment: acceptedFiles,
                originalFileName: acceptedFiles[0].name.split(".")[0],
            });
        } else {
            // For creation mode, append files
            const newAttachments = [...currentAttachments, ...acceptedFiles];
            setFile({ attachment: newAttachments });
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        setFile({ errorMessage: "" });
        setErrors(null);

        if (action === "add") {
            // For add mode, check if we have files with metadata
            if (!filesWithMetadata.length) {
                setFile({ errorMessage: "Please attach at least one file." });
                return;
            }

            // Validate that each file has required fields
            const filesWithoutNames = filesWithMetadata.filter(f => !f.fileName.trim());
            if (filesWithoutNames.length > 0) {
                setFile({ errorMessage: "Please provide a name for all files." });
                return;
            }
        } else if (action === "edit") {
            if (!file.attachment.length && !file.originalFileName) {
                setFile({ errorMessage: "Please attach a file or provide a file name." });
                return;
            }

            if (!file.originalFileName) {
                setFile({ errorMessage: "Please add a file name." });
                return;
            }
        }

        setFile({ isAdding: true });

        if (action === "add" && filesWithMetadata.length > 1) {
            // Upload multiple files with their individual metadata
            uploadMultipleFilesWithMetadata();
        } else if (action === "add" && filesWithMetadata.length === 1) {
            // Upload single file with itss metadata
            const fileWithMetadata = filesWithMetadata[0];
            const payload = {
                fileName: `${fileWithMetadata.fileName}.${fileWithMetadata.file.name.split(".").pop()}`,
                originalFileName: fileWithMetadata.fileName,
                fileType: fileWithMetadata.file.type,
                tagNames: fileWithMetadata.tags.map(tag => tag.value),
                file: fileWithMetadata.file,
            } as StartFileUploadPayload;

            // Use individual file's reminder and expiry date
            if (fileWithMetadata.reminder) {
                let formattedReminder = convertDateStringToIsoString(fileWithMetadata.reminder);

                if (fileWithMetadata.selectedTime && fileWithMetadata.selectedTime !== "Pick a Time") {
                    const [datePart] = formattedReminder.split("T");

                    if (fileWithMetadata.selectedTime === "None") {
                        formattedReminder = `${datePart}T00:00:00`;
                    } else if (fileWithMetadata.selectedTime.includes(":")) {
                        formattedReminder = `${datePart}T${fileWithMetadata.selectedTime}:00`;
                    } else if (fileWithMetadata.expiryDate) {
                        const expiryDate = new Date(convertDateStringToIsoString(fileWithMetadata.expiryDate));
                        let reminderDate;

                        switch (fileWithMetadata.selectedTime) {
                            case "15 Minutes Before":
                                reminderDate = new Date(expiryDate.getTime() - 15 * 60 * 1000);
                                break;
                            case "30 Minutes Before":
                                reminderDate = new Date(expiryDate.getTime() - 30 * 60 * 1000);
                                break;
                            case "1 Hour Before":
                                reminderDate = new Date(expiryDate.getTime() - 60 * 60 * 1000);
                                break;
                            default:
                                reminderDate = new Date(formattedReminder);
                        }
                        formattedReminder = reminderDate.toISOString();
                    }
                }

                payload.reminder = formattedReminder;
            }

            if (fileWithMetadata.expiryDate) {
                const formattedExpiryDate = convertDateStringToIsoString(fileWithMetadata.expiryDate);
                payload.expireAt = formattedExpiryDate;
            }

            addFile(payload, { callbackUrl: "/storage" });
        } else if (action === "edit") {
            const tagNames: string[] = file.tags.map((tag: TagInput) => tag.value);

            let payload = {
                //@ts-ignore
                id: file.fileId || file.id,
                fileName:
                    action === "edit" && !file.attachment.length
                        ? file.fileName
                        : `${file.originalFileName}.${file.attachment[0].name.split(".").pop()}`,
                originalFileName: file.originalFileName,
                fileType: action === "edit" && !file.attachment.length ? file.fileType : file.attachment[0].type,
                tagNames: tagNames.length ? tagNames : [],
                file: file.attachment[0],
            } as StartFileUploadPayload;

            if (file.reminder && file.expiryDate) {
                let reminderTimestamp;
                const expiryDate = new Date(convertDateStringToIsoString(file.expiryDate));

                if (selectedTime === "None") {
                    const [datePart] = convertDateStringToIsoString(file.reminder).split("T");
                    reminderTimestamp = `${datePart}T00:00:00`;
                } else if (selectedTime === "15 Minutes Before") {
                    const reminderDate = new Date(expiryDate.getTime() - 15 * 60 * 1000);
                    reminderTimestamp = reminderDate.toISOString();
                } else if (selectedTime === "30 Minutes Before") {
                    const reminderDate = new Date(expiryDate.getTime() - 30 * 60 * 1000);
                    reminderTimestamp = reminderDate.toISOString();
                } else if (selectedTime === "1 Hour Before") {
                    const reminderDate = new Date(expiryDate.getTime() - 60 * 60 * 1000);
                    reminderTimestamp = reminderDate.toISOString();
                } else if (selectedTime && selectedTime !== "Pick a Time" && selectedTime.includes(":")) {
                    const [datePart] = convertDateStringToIsoString(file.reminder).split("T");
                    reminderTimestamp = `${datePart}T${selectedTime}:00`;
                } else {
                    reminderTimestamp = convertDateStringToIsoString(file.reminder);
                }

                payload.reminder = reminderTimestamp;
            }

            if (file.attachment.length) {
                Promise.all([
                    updateFile(payload, { callbackUrl: "/storage" }),
                    updateFileData(payload, { callbackUrl: "/storage" }),
                ]).catch(error => {
                    console.error("Error during file update:", error);
                });
            } else {
                updateFileData(payload, { callbackUrl: "/storage" });
            }
        }
    }

    async function uploadMultipleFilesWithMetadata() {
        //@ts-ignore
        const progressFiles: StorageFile[] = filesWithMetadata.map((fileWithMeta, index) => ({
            id: `${Date.now()}-${index}`,
            name: fileWithMeta.fileName,
            size: fileWithMeta.file.size,
            progress: 0,
            status: "uploading" as const,
        }));

        setUploadProgress(progressFiles);
        setShowUploadProgress(true);

        let completedCount = 0;
        let failedCount = 0;

        // Upload files concurrently with their individual metadata
        const uploadPromises = filesWithMetadata.map(async (fileWithMetadata, index) => {
            const fileId = progressFiles[index].id;

            try {
                const payload = {
                    fileName: `${fileWithMetadata.fileName}.${fileWithMetadata.file.name.split(".").pop()}`,
                    originalFileName: fileWithMetadata.fileName,
                    fileType: fileWithMetadata.file.type,
                    tagNames: fileWithMetadata.tags.map(tag => tag.value),
                    file: fileWithMetadata.file,
                } as StartFileUploadPayload;

                // Use individual file's reminder and expiry date
                if (fileWithMetadata.reminder) {
                    let formattedReminder = convertDateStringToIsoString(fileWithMetadata.reminder);

                    if (fileWithMetadata.selectedTime && fileWithMetadata.selectedTime !== "Pick a Time") {
                        const [datePart] = formattedReminder.split("T");

                        if (fileWithMetadata.selectedTime === "None") {
                            formattedReminder = `${datePart}T00:00:00`;
                        } else if (fileWithMetadata.selectedTime.includes(":")) {
                            formattedReminder = `${datePart}T${fileWithMetadata.selectedTime}:00`;
                        } else if (fileWithMetadata.expiryDate) {
                            const expiryDate = new Date(convertDateStringToIsoString(fileWithMetadata.expiryDate));
                            let reminderDate;

                            switch (fileWithMetadata.selectedTime) {
                                case "15 Minutes Before":
                                    reminderDate = new Date(expiryDate.getTime() - 15 * 60 * 1000);
                                    break;
                                case "30 Minutes Before":
                                    reminderDate = new Date(expiryDate.getTime() - 30 * 60 * 1000);
                                    break;
                                case "1 Hour Before":
                                    reminderDate = new Date(expiryDate.getTime() - 60 * 60 * 1000);
                                    break;
                                default:
                                    reminderDate = new Date(formattedReminder);
                            }
                            formattedReminder = reminderDate.toISOString();
                        }
                    }

                    payload.reminder = formattedReminder;
                }

                if (fileWithMetadata.expiryDate) {
                    const formattedExpiryDate = convertDateStringToIsoString(fileWithMetadata.expiryDate);
                    payload.expireAt = formattedExpiryDate;
                }

                const progressInterval = setInterval(() => {
                    setUploadProgress(prev =>
                        prev.map(f =>
                            f.id === fileId && f.status === "uploading"
                                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                                : f,
                        ),
                    );
                }, 200);

                const response = await DI.storageService.uploadFile(payload);

                clearInterval(progressInterval);

                // Mark as completed
                setUploadProgress(prev =>
                    prev.map(f => (f.id === fileId ? { ...f, progress: 100, status: "completed" as const } : f)),
                );

                completedCount++;
                return response;
            } catch (error: any) {
                // Mark as failed
                setUploadProgress(prev =>
                    prev.map(f =>
                        f.id === fileId ? { ...f, status: "failed" as const, error: apiErrorMessage(error) } : f,
                    ),
                );

                failedCount++;
                throw error;
            }
        });

        try {
            await Promise.allSettled(uploadPromises);

            if (completedCount === filesWithMetadata.length) {
                showToast({
                    heading: "Success",
                    message: `All ${filesWithMetadata.length} files uploaded successfully.`,
                    variant: "success",
                });
                setTimeout(() => {
                    router.push("/storage");
                }, 2000);
            } else if (completedCount > 0) {
                showToast({
                    heading: "Partial Success",
                    message: `${completedCount} of ${filesWithMetadata.length} files uploaded successfully.`,
                    variant: "warning",
                });
            } else {
                showToast({ heading: "Error", message: "Failed to upload files.", variant: "danger" });
            }
        } catch (error: any) {
            console.error("Upload error:", error);
        } finally {
            setFile({ isAdding: false });
        }
    }

    async function uploadMultipleFiles(tagNames: string[]) {
        const files: File[] = file.attachment;
        //@ts-ignore
        const progressFiles: StorageFile[] = files.map((f: File, index: number) => ({
            id: `${Date.now()}-${index}`,
            name: f.name,
            size: f.size,
            progress: 0,
            status: "uploading" as const,
        }));

        setUploadProgress(progressFiles);
        setShowUploadProgress(true);

        let completedCount = 0;
        let failedCount = 0;

        // Upload files concurrently
        const uploadPromises = files.map(async (StorageFile, index) => {
            const fileId = progressFiles[index].id;

            try {
                const payload = {
                    fileName: `${file.originalFileName}_${index + 1}.${StorageFile.name.split(".").pop()}`,
                    originalFileName: `${file.originalFileName}_${index + 1}`,
                    fileType: StorageFile.type,
                    tagNames: tagNames,
                    file: StorageFile,
                } as StartFileUploadPayload;

                // Simulate progress updates
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev =>
                        prev.map(f =>
                            f.id === fileId && f.status === "uploading"
                                ? { ...f, progress: Math.min(f.progress + 10, 90) }
                                : f,
                        ),
                    );
                }, 200);

                const response = await DI.storageService.uploadFile(payload);

                clearInterval(progressInterval);

                // Mark as completed
                setUploadProgress(prev =>
                    prev.map(f => (f.id === fileId ? { ...f, progress: 100, status: "completed" as const } : f)),
                );

                completedCount++;
                return response;
            } catch (error: any) {
                // Mark as failed
                setUploadProgress(prev =>
                    prev.map(f =>
                        f.id === fileId ? { ...f, status: "failed" as const, error: apiErrorMessage(error) } : f,
                    ),
                );

                failedCount++;
                throw error;
            }
        });

        try {
            await Promise.allSettled(uploadPromises);

            if (completedCount === files.length) {
                showToast({
                    heading: "Success",
                    message: `All ${files.length} files uploaded successfully.`,
                    variant: "success",
                });
                setTimeout(() => {
                    router.push("/storage");
                }, 2000);
            } else if (completedCount > 0) {
                showToast({
                    heading: "Partial Success",
                    message: `${completedCount} of ${files.length} files uploaded successfully.`,
                    variant: "warning",
                });
            } else {
                showToast({ heading: "Error", message: "Failed to upload files.", variant: "danger" });
            }
        } catch (error: any) {
            console.error("Upload error:", error);
        } finally {
            setFile({ isAdding: false });
        }
    }

    const handleRemoveUploadFile = (fileId: string) => {
        setUploadProgress(prev => prev.filter(f => f.id !== fileId));

        // If no files left, hide the progress component
        if (uploadProgress.length <= 1) {
            setShowUploadProgress(false);
        }
    };

    const handleRetryUpload = async (fileId: string) => {
        const fileToRetry = uploadProgress.find(f => f.id === fileId);
        if (!fileToRetry) return;

        const fileIndex = uploadProgress.findIndex(f => f.id === fileId);
        const actualFile = file.attachment[fileIndex];
        if (!actualFile) return;

        // Reset file status to uploading
        setUploadProgress(prev =>
            prev.map(f =>
                f.id === fileId ? { ...f, status: "uploading" as const, progress: 0, error: undefined } : f,
            ),
        );

        try {
            const tagNames: string[] = file.tags.map((tag: TagInput) => tag.value);
            const payload = {
                fileName: `${file.originalFileName}_${fileIndex + 1}.${actualFile.name.split(".").pop()}`,
                originalFileName: `${file.originalFileName}_${fileIndex + 1}`,
                fileType: actualFile.type,
                tagNames: tagNames,
                file: actualFile,
                reminder: file.reminder ? convertDateStringToIsoString(file.reminder) : undefined,
                expireAt: file.expiryDate ? convertDateStringToIsoString(file.expiryDate) : undefined,
            } as StartFileUploadPayload;

            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev =>
                    prev.map(f =>
                        f.id === fileId && f.status === "uploading"
                            ? { ...f, progress: Math.min(f.progress + 10, 90) }
                            : f,
                    ),
                );
            }, 200);

            await DI.storageService.uploadFile(payload);

            clearInterval(progressInterval);

            // Mark as completed
            setUploadProgress(prev =>
                prev.map(f => (f.id === fileId ? { ...f, progress: 100, status: "completed" as const } : f)),
            );

            showToast({ heading: "Success", message: "File uploaded successfully.", variant: "success" });
        } catch (error: any) {
            setUploadProgress(prev =>
                prev.map(f =>
                    f.id === fileId ? { ...f, status: "failed" as const, error: apiErrorMessage(error) } : f,
                ),
            );

            showToast({ heading: "Error", message: "Failed to retry upload.", variant: "warning" });
        }
    };

    async function addFile(payload: StartFileUploadPayload, props?: { callbackUrl: string }) {
        try {
            const response = await DI.storageService.uploadFile(payload);
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
        // send only send id and file for only file updates
        const updatePayload: Partial<StartFileUploadPayload> = {
            id: payload.id,
        };

        // Only include the file if a new file is being uploaded
        if (payload.file) {
            updatePayload.file = payload.file;
        }

        try {
            const res = await DI.storageService.updateFile(updatePayload);
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
            setFile({ fileId: response.file.id }); // let useEffect listing and update file
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

            if (file.reminder) {
                const reminderTime = getTimeFromTimestamp(file.reminder);

                if (reminderTime === "00:00") {
                    setSelectedTime("None");
                } else {
                    const reminderDate = new Date(file.reminder);
                    const expiryDate = new Date(file.expireAt);
                    const diffMinutes = Math.floor((expiryDate.getTime() - reminderDate.getTime()) / (1000 * 60));

                    if (diffMinutes === 15) {
                        setSelectedTime("15 Minutes Before");
                    } else if (diffMinutes === 30) {
                        setSelectedTime("30 Minutes Before");
                    } else if (diffMinutes === 60) {
                        setSelectedTime("1 Hour Before");
                    } else {
                        setSelectedTime(reminderTime);
                        setIsPickingtime(true);
                        //@ts-ignore
                        setPickedTime({
                            timeString: reminderTime,
                            isPickingtime: true,
                        });
                    }
                }
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
        setTime(timeString);

        if (params.isPickingtime) {
            pickedT.timeString = timeString;
        } else {
            pickedT.timeString = "Pick a Time";
        }
        setPickedTime(pickedT);
    };

    async function getExpiredFiles() {
        setIsLoading(true);
        try {
            const response = await DI.storageService.getExpiredFiles(page);
            setExpiredFiles(response.data.results);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    function getTimeFromTimestamp(timestamp: string): string {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`;
    }

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

                                        addToFavorites(payload);
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
            getFiles();
            return;
        }
    }, [tablePage]);

    useEffect(() => {
        if (listOrGrid?.storage === "list") {
            getFiles();
            return;
        }
        resetPage();
    }, [listOrGrid?.storage]);

    useEffect(() => {
        if (!files.length) {
            getFiles();
        }
    }, [files]);

    function onTablePageChange(page: number) {
        setTablePage(page);
    }

    return {
        tableColumns,
        files,
        setFiles,
        isLoading,
        setIsLoading,
        page,
        showModal,
        setShowModal,
        isDeleting,
        setIsDeleting,
        getFiles,
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
        getExpiredFiles,
        expiredFiles,
        expiredFilesTable,
        viewDocumentFile,
        tagsSelector,
        setTotalRows,
        totalRows,
        onTablePageChange,
        hasMore,
        setHasMore,
        listOrGrid,
        currentPage,
        resetPage,
        setPageReady,
        errors,
        downloadDocumentFile,
        showToast,
        addToFavorites,
        setFileToDelete,
        storageFile,
        setStorageFile,

        uploadProgress,
        showUploadProgress,
        setShowUploadProgress,
        handleRetryUpload,
        handleRemoveUploadFile,
        filesWithMetadata,
        setFilesWithMetadata,
    };
};

export default useStorage;
