import { Badge, Button, Col, Dropdown, Form, NavDropdown, Row } from "react-bootstrap";
import DashboardLayout from "./DashboardLayout";
import ButtonLoader from "./ButtonLoader";
import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { TagInput } from "./ResourceForm";
import Link from "next/link";
import Dropzone, { Accept } from "react-dropzone";
import { CheckCircle, MoreHorizontal, X } from "react-feather";
import { StartFileUploadPayload } from "@/repositories/storage-repository";
import FeedbackModal from "./FeedbackModal";
import PageLoader from "./PageLoader";
import { convertDateStringToIsoString } from "@/helpers";
import Required from "./Required";
import FormErrorMessage from "./FormErrorMessage";
import DatePicker from "react-date-picker";
import {
    ArrowDown2,
    ArrowRight2,
    Calendar,
    Clock,
    DocumentText,
    FolderAdd,
    Gallery,
    InfoCircle,
    WristClock,
    Edit,
} from "iconsax-react";
import FormLayout from "./FormLayout";
import SelectedFileBox from "./SelectedFileBox";
import useStorage from "@/hooks/storage";
import DeleteModal from "./DeleteModal";
import { ACCEPTED_FILES, DATE_PICKER_FORMAT, PREDEFINED_TIMES } from "@/helpers/constants";
import TimeSelector, { SelectTimetype } from "./TimeSelector";
import TimePickerModal from "./TimePickerModal";
import { toInteger } from "lodash";
import { useRouter } from "next/router";
import UploadStorageProgress from "./uploadStorageProgress";
import StorageFileEditModal, { FileEditData } from "./StorageEditFileModal";

type StorageFormProps = {
    action: string;
};

export type FileWithMetadata = {
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

export default function StorageForm(props: StorageFormProps) {
    const sizeInMB = toInteger((1024 * 1024).toFixed(2));
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const { action } = props;
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingFileIndex, setEditingFileIndex] = useState<number | null>(null);
    const [localPickedTime, setLocalPickedTime] = useState<SelectTimetype>({
        timeString: "Pick a time",
        time: "",
        active: false,
    });

    const {
        time,
        setTime,
        getTags,
        file,
        setFile,
        getFile,
        handleSubmit,
        updateFile,
        showDeleteModal,
        setShowDeleteModal,
        isDeleting,
        onDelete,
        addFileAgain,
        handleTagsChange,
        handleOnFileChange: originalHandleOnFileChange,
        onTriggerDelete,
        selectedTime,
        handleTimeSelection,
        showModal,
        setShowModal,
        isPickingtime,
        pickedTime,
        showTimePickerModal,
        setShowTimePickerModal,
        tagsSelector,
        errors,
        filesWithMetadata,
        setFilesWithMetadata,
        uploadProgress,
        showUploadProgress,
        setShowUploadProgress,
        handleRetryUpload,
        handleRemoveUploadFile,
    } = useStorage({ action: action });

    const router = useRouter();

    useEffect(() => {
        getTags();
    }, []);

    useEffect(() => {
        if (action === "edit") {
            setFile({ isLoading: true });
            const id = window.location.pathname.split("/")[3];
            setFile({ fileId: id });
            getFile({ fileId: id });
        }
    }, [action]);

    useEffect(() => {
        if (action === "edit" && file.attachment.length) {
            const tagNames: string[] = file.tags.map((tag: TagInput) => tag.value);
            const payload = {
                id: file.fileId,
                fileName: file.attachment[0].name,
                originalFileName: file.originalFileName,
                fileType: file.attachment[0].type,
                reminder: file.reminder ? convertDateStringToIsoString(file.reminder) : null,
                expireAt: file.expiryDate ? convertDateStringToIsoString(file.expiryDate) : null,
                tagNames: tagNames.length ? tagNames : [],
                file: file.attachment[0],
            } as StartFileUploadPayload;

            updateFile(payload);
            router.push("/storage");
        }
    }, [file.fileId]);

    // Check if we should show inline fields for single file mode
    const shouldShowInlineFields = action === "add" && filesWithMetadata.length === 1;

    useEffect(() => {
        const currentSelectedTime =
            action === "edit" ? selectedTime : shouldShowInlineFields ? filesWithMetadata[0]?.selectedTime || "" : "";

        const isPredefinedTime = PREDEFINED_TIMES.some(time => time.timeString === currentSelectedTime);

        if (currentSelectedTime && !isPredefinedTime) {
            const newPickedTime = {
                timeString: currentSelectedTime,
                time: currentSelectedTime,
                active: true,
            };

            if (action === "edit") {
                setTime({
                    //@ts-ignore
                    pickedTime: newPickedTime,
                });
            } else {
                setLocalPickedTime(newPickedTime);
            }
        } else {
            const defaultPickedTime = {
                timeString: "Pick a time",
                time: "",
                active: false,
            };

            if (action === "edit") {
                setTime({
                    //@ts-ignore
                    pickedTime: defaultPickedTime,
                });
            } else {
                setLocalPickedTime(defaultPickedTime);
            }
        }
    }, [selectedTime, filesWithMetadata, action, shouldShowInlineFields, setTime]);

    const handleSingleFileTimeSelection = (selectedTimeData: SelectTimetype) => {
        const timeString = selectedTimeData.timeString;

        if (timeString === "Pick a time") {
            setShowTimePickerModal(true);
            return;
        }

        handleSingleFileSelectedTimeChange(timeString);

        setLocalPickedTime({
            timeString: "Pick a time",
            time: "",
            active: false,
        });
    };

    const handleOnFileChange = (acceptedFiles: File[]) => {
        setFile({ dropZoneErrorMessage: "" });

        if (action === "edit") {
            originalHandleOnFileChange(acceptedFiles);
            return;
        }

        const currentFiles = filesWithMetadata.length;
        const totalFiles = currentFiles + acceptedFiles.length;

        if (totalFiles > 10) {
            const remainingSlots = 10 - currentFiles;
            setFile({
                dropZoneErrorMessage: `You can only upload up to 10 files. You have ${remainingSlots} slot(s) remaining.`,
            });
            return;
        }

        // Validate file types and sizes
        const allowedExtensions = ["png", "jpg", "jpeg", "pdf", "docx", "xlsx"];
        const maxSize = 10 * 1024 * 1024; // 10MB

        const invalidFiles = acceptedFiles.filter(file => {
            const fileExtension = file.name.split(".").pop()?.toLowerCase();
            return !allowedExtensions.includes(fileExtension || "") || file.size > maxSize;
        });

        if (invalidFiles.length > 0) {
            setFile({
                dropZoneErrorMessage:
                    "Some files are invalid. Please ensure all files are PDF, DOCX, JPG, PNG, or XLSX and under 10MB.",
            });
            return;
        }

        // Create new files with metadata
        const newFilesWithMetadata: FileWithMetadata[] = acceptedFiles.map(file => ({
            file,
            fileName: file.name.split(".")[0],
            tags: [],
            status: "completed" as const,
            expiryDate: "" as string | Date,
            reminder: "" as string | Date,
            selectedTime: "",
        }));

        setFilesWithMetadata(prev => [...prev, ...newFilesWithMetadata]);

        const allFiles = [...filesWithMetadata.map(f => f.file), ...acceptedFiles];
        setFile({ attachment: allFiles });
    };

    const handleFileRemoval = (indexToRemove?: number) => {
        if (action === "edit") {
            setFile({
                originalFileName: "",
                attachment: [],
                fileId: "",
            });
        } else {
            if (typeof indexToRemove === "number") {
                const newFilesWithMetadata = filesWithMetadata.filter((_, index) => index !== indexToRemove);
                setFilesWithMetadata(newFilesWithMetadata);
                setFile({ attachment: newFilesWithMetadata.map(f => f.file) });
            } else {
                // Remove all files
                setFilesWithMetadata([]);
                setFile({ attachment: [] });
            }
        }
    };

    const handleEditFile = (index: number) => {
        setEditingFileIndex(index);
        setShowEditModal(true);
    };

    const handleSaveFileEdit = (
        fileId: string,
        fileName: string,
        tags: TagInput[],
        expiryDate?: string | Date,
        reminder?: string | Date,
        selectedTime?: string,
    ) => {
        if (editingFileIndex !== null) {
            const updatedFiles = [...filesWithMetadata];
            updatedFiles[editingFileIndex] = {
                ...updatedFiles[editingFileIndex],
                fileName,
                tags,
                expiryDate: expiryDate || "",
                reminder: reminder || "",
                selectedTime: selectedTime || "",
            };
            setFilesWithMetadata(updatedFiles);
        }
        setShowEditModal(false);
        setEditingFileIndex(null);
    };

    const getEditingFileData = (): FileEditData | null => {
        if (editingFileIndex === null) return null;

        const fileWithMetadata = filesWithMetadata[editingFileIndex];
        return {
            id: `file-${editingFileIndex}`,
            fileName: fileWithMetadata?.fileName,
            originalName: fileWithMetadata?.fileName,
            tags: fileWithMetadata?.tags,
            expiryDate: fileWithMetadata?.expiryDate,
            reminder: fileWithMetadata?.reminder,
            selectedTime: fileWithMetadata?.selectedTime,
        };
    };

    // Handle single file field changes when only one file is uploaded
    const handleSingleFileNameChange = (fileName: string) => {
        if (filesWithMetadata.length === 1) {
            const updatedFiles = [...filesWithMetadata];
            updatedFiles[0] = {
                ...updatedFiles[0],
                fileName,
            };
            setFilesWithMetadata(updatedFiles);
        }
    };

    const handleSingleFileTagsChange = (tags: TagInput[]) => {
        if (filesWithMetadata.length === 1) {
            const updatedFiles = [...filesWithMetadata];
            updatedFiles[0] = {
                ...updatedFiles[0],
                tags,
            };
            setFilesWithMetadata(updatedFiles);
        }
    };

    // Handle single file expiry date change
    const handleSingleFileExpiryDateChange = (expiryDate: string | Date) => {
        if (filesWithMetadata.length === 1) {
            const updatedFiles = [...filesWithMetadata];
            updatedFiles[0] = {
                ...updatedFiles[0],
                expiryDate,
            };
            setFilesWithMetadata(updatedFiles);
        }
    };

    // Handle single file reminder change
    const handleSingleFileReminderChange = (reminder: string | Date) => {
        if (filesWithMetadata.length === 1) {
            const updatedFiles = [...filesWithMetadata];
            updatedFiles[0] = {
                ...updatedFiles[0],
                reminder,
            };
            setFilesWithMetadata(updatedFiles);
        }
    };

    // Handle single file selected time change
    const handleSingleFileSelectedTimeChange = (selectedTime: string) => {
        if (filesWithMetadata.length === 1) {
            const updatedFiles = [...filesWithMetadata];
            updatedFiles[0] = {
                ...updatedFiles[0],
                selectedTime,
            };
            setFilesWithMetadata(updatedFiles);
        }
    };

    // Check if file is attached
    const hasAttachment =
        (action === "edit" && file.originalFileName) ||
        (action === "add" && filesWithMetadata.length > 0) ||
        (file.attachment && file.attachment.length > 0);

    // Check if we can show the dropzone component
    const canShowDropzone = action === "edit" ? !file.attachment.length : filesWithMetadata.length < 10;

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split(".").pop()?.toLowerCase();
        return <DocumentText size={40} variant="Bold" color="#D1D1D1" />;
    };

    const getStatusIndicator = (status: string, progress?: number, fileSize?: number) => {
        switch (status) {
            case "uploading":
                return <small className="text-primary">{progress}% Uploading</small>;
            case "failed":
                return <small className="text-danger">Upload failed!</small>;
            default:
                return <small className="text-muted">{fileSize ? (fileSize / sizeInMB).toFixed(2) + " MB" : ""}</small>;
        }
    };

    return (
        <DashboardLayout
            breadCrumbs={[{ name: "Storage", url: "/storage" }, { name: `${action === "add" ? "Add" : "Edit"}` }]}
            pageTitle={action === "add" ? "Add File" : "Edit File"}
        >
            {file.isLoading ? (
                <PageLoader />
            ) : (
                <div className="my-5">
                    <FormLayout
                        leftSideText={action === "add" ? "New File" : "Edit File"}
                        leftSideDescription={
                            action === "add"
                                ? "Fill in the correct details to add new files"
                                : "Fill in the correct details to update a file"
                        }
                        leftSideIcon={<FolderAdd size={24} color="#888888" />}
                    >
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Attachment <Required />
                                    {action === "add" && (
                                        <small className="text-muted d-block">
                                            You can upload up to 10 files (PDF, DOCX, JPG, PNG, XLSX)
                                        </small>
                                    )}
                                    {file.dropZoneErrorMessage.length > 0 && (
                                        <p className="m-0 text-danger small">{file.dropZoneErrorMessage}</p>
                                    )}
                                </Form.Label>

                                {/* Show dropzone only if we can add more files */}
                                {canShowDropzone && (
                                    <Dropzone
                                        accept={ACCEPTED_FILES}
                                        multiple={action === "add"}
                                        onDrop={handleOnFileChange}
                                    >
                                        {({ getRootProps, getInputProps }) => (
                                            <section
                                                className="dropzone-container pointer border-radius-12"
                                                title="Drag and drop file, or browse. File types: PDF, DOCX, JPG, PNG, XLSX"
                                            >
                                                <div {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <div className="text-muted d-flex align-items-center flex-column text-center gap-3 w-100 h-100">
                                                        <DocumentText variant="Bold" size={40} color="#D1D1D1" />
                                                        <div className="text-gray-500 tb-body-default-medium">
                                                            Drag and drop file, or{" "}
                                                            <a className="text-primary offset tb-body-default-medium">
                                                                Choose a File
                                                            </a>
                                                            <br />
                                                            <small className="text-gray-500 tb-body-small-regular">
                                                                File types: PDF, DOCX, JPG, PNG, XLSX
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        )}
                                    </Dropzone>
                                )}

                                {hasAttachment && (
                                    <div className="mt-3">
                                        {action === "edit" ? (
                                            <SelectedFileBox
                                                file={[
                                                    {
                                                        name: file.originalFileName,
                                                        size: file.fileSize || 0,
                                                    },
                                                ]}
                                                onDelete={() => handleFileRemoval()}
                                                icon={<DocumentText size={40} variant="Bold" color="#D1D1D1" />}
                                            />
                                        ) : (
                                            // Show multiple files for add mode
                                            <div className="d-flex flex-column gap-3">
                                                {filesWithMetadata.map((fileWithMetadata, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-2 border-dashed rounded p-3 d-flex align-items-center justify-content-between"
                                                        style={{ borderStyle: "dashed", borderColor: "#E5E5E5" }}
                                                    >
                                                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                                                            {getFileIcon(fileWithMetadata.file.name)}
                                                            <div className="flex-grow-1">
                                                                <p className="mb-1 tb-body-small-medium truncate-1">
                                                                    {fileWithMetadata.fileName ||
                                                                        fileWithMetadata.file.name}
                                                                </p>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    {getStatusIndicator(
                                                                        fileWithMetadata.status,
                                                                        fileWithMetadata.progress,
                                                                        fileWithMetadata.file.size,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            {/* Only show rename button if more than one file selected */}
                                                            {filesWithMetadata.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link p-0 text-primary tb-body-small-medium text-decoration-underline"
                                                                    onClick={() => handleEditFile(index)}
                                                                >
                                                                    Rename
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="btn btn-link p-0 text-muted"
                                                                onClick={() => handleFileRemoval(index)}
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Form.Group>

                            {(action === "edit" || shouldShowInlineFields) && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        File Name <Required />
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={
                                            action === "edit"
                                                ? file.originalFileName
                                                : shouldShowInlineFields
                                                ? filesWithMetadata[0]?.fileName || ""
                                                : ""
                                        }
                                        onChange={e => {
                                            if (action === "edit") {
                                                setFile({ originalFileName: e.target.value });
                                            } else if (shouldShowInlineFields) {
                                                handleSingleFileNameChange(e.target.value);
                                            }
                                        }}
                                        placeholder="Ex. May 2023 Invoice"
                                        required
                                        disabled={!hasAttachment}
                                    />
                                </Form.Group>
                            )}

                            {(action === "edit" || shouldShowInlineFields) && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        Expiration Date
                                    </Form.Label>

                                    <DatePicker
                                        onChange={value => {
                                            if (action === "edit") {
                                                setFile({ expiryDate: value ?? "" });
                                            } else if (shouldShowInlineFields) {
                                                handleSingleFileExpiryDateChange((value as string | Date) || "");
                                            }
                                        }}
                                        value={
                                            action === "edit"
                                                ? file.expiryDate
                                                : shouldShowInlineFields
                                                ? filesWithMetadata[0]?.expiryDate || ""
                                                : ""
                                        }
                                        dayPlaceholder="dd"
                                        monthPlaceholder="mm"
                                        yearPlaceholder="yyyy"
                                        format={DATE_PICKER_FORMAT}
                                        className={`form-control ${errors?.expiryDate ? "border-danger" : ""}`}
                                        calendarIcon={
                                            !(action === "edit"
                                                ? file.expiryDate
                                                : shouldShowInlineFields
                                                ? filesWithMetadata[0]?.expiryDate
                                                : "") ? (
                                                <Calendar size={16} color="#B0B0B0" />
                                            ) : null
                                        }
                                        clearIcon={
                                            (
                                                action === "edit"
                                                    ? file.expiryDate
                                                    : shouldShowInlineFields
                                                    ? filesWithMetadata[0]?.expiryDate
                                                    : ""
                                            ) ? (
                                                <X size={16} color="#B0B0B0" />
                                            ) : null
                                        }
                                    />
                                    {errors?.expiryDate && <small className="text-danger">{errors?.expiryDate}</small>}
                                </Form.Group>
                            )}

                            {(action === "edit" || shouldShowInlineFields) && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Reminder</Form.Label>
                                    <DatePicker
                                        onChange={value => {
                                            if (action === "edit") {
                                                setFile({ reminder: value ?? "" });
                                            } else if (shouldShowInlineFields) {
                                                handleSingleFileReminderChange((value as string | Date) || "");
                                            }
                                        }}
                                        value={
                                            action === "edit"
                                                ? file.reminder
                                                : shouldShowInlineFields
                                                ? filesWithMetadata[0]?.reminder || ""
                                                : ""
                                        }
                                        dayPlaceholder="dd"
                                        monthPlaceholder="mm"
                                        yearPlaceholder="yyyy"
                                        format={DATE_PICKER_FORMAT}
                                        className={`form-control border ${errors?.reminder ? "border-danger" : ""}`}
                                        calendarIcon={
                                            !(action === "edit"
                                                ? file.reminder
                                                : shouldShowInlineFields
                                                ? filesWithMetadata[0]?.reminder
                                                : "") ? (
                                                <Calendar size={16} color="#B0B0B0" />
                                            ) : null
                                        }
                                        clearIcon={
                                            (
                                                action === "edit"
                                                    ? file.reminder
                                                    : shouldShowInlineFields
                                                    ? filesWithMetadata[0]?.reminder
                                                    : ""
                                            ) ? (
                                                <X size={16} color="#B0B0B0" />
                                            ) : null
                                        }
                                        disabled={
                                            !(action === "edit"
                                                ? file.expiryDate
                                                : shouldShowInlineFields
                                                ? filesWithMetadata[0]?.expiryDate
                                                : "")
                                        }
                                        minDate={new Date()}
                                    />
                                    {errors?.reminder && <small className="text-danger">{errors?.reminder}</small>}
                                </Form.Group>
                            )}

                            {(action === "edit" || shouldShowInlineFields) &&
                                (action === "edit"
                                    ? file.reminder
                                    : shouldShowInlineFields
                                    ? filesWithMetadata[0]?.reminder
                                    : "") && (
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Notify me
                                        </Form.Label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {PREDEFINED_TIMES.map((time: SelectTimetype) => (
                                                <TimeSelector
                                                    key={time.timeString}
                                                    time={time}
                                                    onSelectedTime={selectedTimeData => {
                                                        if (action === "edit") {
                                                            handleTimeSelection(selectedTimeData);
                                                        } else if (shouldShowInlineFields) {
                                                            handleSingleFileTimeSelection(selectedTimeData);
                                                        }
                                                    }}
                                                    selectedTime={
                                                        action === "edit"
                                                            ? selectedTime
                                                            : shouldShowInlineFields
                                                            ? filesWithMetadata[0]?.selectedTime || ""
                                                            : ""
                                                    }
                                                    active={
                                                        (action === "edit"
                                                            ? selectedTime
                                                            : shouldShowInlineFields
                                                            ? filesWithMetadata[0]?.selectedTime
                                                            : "") === time.timeString
                                                    }
                                                />
                                            ))}
                                            <TimeSelector
                                                time={action === "edit" ? pickedTime : localPickedTime}
                                                onSelectedTime={() => {
                                                    setShowTimePickerModal(true);
                                                }}
                                                selectedTime={
                                                    action === "edit"
                                                        ? selectedTime
                                                        : shouldShowInlineFields
                                                        ? filesWithMetadata[0]?.selectedTime || ""
                                                        : ""
                                                }
                                                active={
                                                    isPickingtime ||
                                                    (action === "edit"
                                                        ? false
                                                        : shouldShowInlineFields
                                                        ? !PREDEFINED_TIMES.some(
                                                              time =>
                                                                  time.timeString ===
                                                                  (filesWithMetadata[0]?.selectedTime || ""),
                                                          ) && !!filesWithMetadata[0]?.selectedTime
                                                        : false)
                                                }
                                            />
                                        </div>
                                    </Form.Group>
                                )}

                            {(action === "edit" || shouldShowInlineFields) && (
                                <Form.Group>
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Tag</Form.Label>
                                    <CreatableSelect
                                        ref={tagsSelector}
                                        defaultValue={
                                            action === "edit"
                                                ? file.tags
                                                : shouldShowInlineFields
                                                ? filesWithMetadata[0]?.tags || []
                                                : []
                                        }
                                        value={
                                            action === "edit"
                                                ? file.tags
                                                : shouldShowInlineFields
                                                ? filesWithMetadata[0]?.tags || []
                                                : []
                                        }
                                        isMulti
                                        isClearable
                                        autoFocus={file.autoFocus}
                                        options={file.tagSuggestions}
                                        onChange={tags => {
                                            if (action === "edit") {
                                                handleTagsChange(tags);
                                            } else if (shouldShowInlineFields) {
                                                handleSingleFileTagsChange(tags as TagInput[]);
                                            }
                                        }}
                                        openMenuOnFocus={true}
                                        noOptionsMessage={() => "No more tags"}
                                        placeholder="Add keywords to your resource"
                                    />
                                    <small className="text-gray-500 tb-body-extra-small-regular d-flex align-items-center gap-2 mt-2">
                                        {" "}
                                        <InfoCircle variant="Bold" size={16} color="#4F4F4F" /> Keyword for ease of
                                        search
                                    </small>
                                </Form.Group>
                            )}

                            <div className="mt-4">
                                <div className="d-flex gap-20 w-100">
                                    <Link href={`/storage`} className="text-decoration-none">
                                        <Button
                                            className="w-140 px-3 py-2 tb-title-body-medium"
                                            variant="outline-secondary"
                                            size="lg"
                                            disabled={file.isAdding}
                                        >
                                            Cancel
                                        </Button>
                                    </Link>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-100 btn-240 tb-title-body-medium text-center"
                                        type="submit"
                                        disabled={
                                            file.isAdding ||
                                            (action === "edit" && !file.originalFileName) ||
                                            (action === "add" && filesWithMetadata.length === 0)
                                        }
                                    >
                                        {isAdding ? (
                                            <ButtonLoader
                                                buttonText={action === "edit" ? "Updating..." : "Saving..."}
                                            />
                                        ) : action === "edit" ? (
                                            "Save changes"
                                        ) : (
                                            "Save"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </FormLayout>
                    <TimePickerModal
                        showModal={showTimePickerModal}
                        setShowModal={setShowTimePickerModal}
                        onSelectedTime={selectedTimeData => {
                            const customTime = selectedTimeData.time || selectedTimeData.timeString;

                            if (action === "edit") {
                                handleTimeSelection(selectedTimeData);
                            } else if (shouldShowInlineFields) {
                                handleSingleFileSelectedTimeChange(customTime);

                                setLocalPickedTime({
                                    timeString: customTime,
                                    time: customTime,
                                    active: true,
                                });
                            }
                            setShowTimePickerModal(false);
                        }}
                        selectedTime={
                            action === "edit"
                                ? selectedTime
                                : shouldShowInlineFields
                                ? filesWithMetadata[0]?.selectedTime || ""
                                : ""
                        }
                    />
                </div>
            )}

            {showUploadProgress && uploadProgress.length > 0 && (
                <UploadStorageProgress
                    //@ts-ignore
                    files={uploadProgress}
                    onRetry={handleRetryUpload}
                    onRemove={handleRemoveUploadFile}
                    onHide={() => setShowUploadProgress(false)}
                    totalFiles={uploadProgress.length}
                />
            )}

            <StorageFileEditModal
                showModal={showEditModal}
                setShowModal={setShowEditModal}
                fileData={getEditingFileData()}
                tagSuggestions={file.tagSuggestions}
                onSave={handleSaveFileEdit}
            />

            <FeedbackModal
                icon={<CheckCircle color="green" size={50} />}
                showModal={file.showModal}
                setShowModal={value => setFile({ showModal: value })}
                primaryButtonText={"Go to storage"}
                primaryButtonUrl={"/storage"}
                secondaryButtonText={action === "edit" ? "Close" : "Add another attachment"}
                feedbackMessage={file.feedbackMessage}
                onSecondaryButtonClick={addFileAgain}
            />

            <DeleteModal
                showModal={showDeleteModal}
                setShowModal={(value: boolean) => setShowDeleteModal(value)}
                dataToDeleteName={"File"}
                message="Are you sure you want to delete file? This action cannot be undone"
                isDeleting={isDeleting}
                onYesDelete={onDelete}
            />
        </DashboardLayout>
    );
}
