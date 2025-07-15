import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import Required from "./Required";
import { useEffect, useRef, useState } from "react";
import Dropzone, { Accept } from "react-dropzone";
import { useReducer } from "react";
import FormLayout from "./FormLayout";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import CreatableSelect from "react-select/creatable";
import FormErrorMessage from "./FormErrorMessage";
import ButtonLoader from "./ButtonLoader";
import DI from "@/di-container";
import { TagInput } from "./ResourceForm";
import { ProjectDocumentType } from "@/repositories/project-repository";
import { apiErrorMessage, convertDateStringToIsoString, getUrlQuery, isAlphabetic } from "@/helpers";
import { StartFileUploadPayload, Tag } from "@/repositories/storage-repository";
import { CheckCircle, X } from "react-feather";
import FeedbackModalInner from "./FeedbackModalInner";
import { ACCEPTED_FILES } from "@/helpers/constants";
import { DocumentText, InfoCircle } from "iconsax-react";
import SelectedFileBox from "./SelectedFileBox";
import useProject, { FileWithMetadata, ProjectDocumentFormState } from "@/hooks/project";
import { useToast } from "@/context/ToastContext";
import UploadProjectProgress, { UploadFile } from "./uploadProjectProgress";
import ProjectFileEditModal, { FileEditData } from "./ProjectFileEditModal";

const ProjectDocumentTopBar = ({ action }: { action: "add" | "edit" }) => {
    const [activeMenu, setActiveMenu] = useState("");

    useEffect(() => {
        // Get activeMenu from URL
        const urlParams = new URLSearchParams(window.location.search);
        const menuFromUrl = urlParams.get("activeMenu") || "";
        setActiveMenu(menuFromUrl);
    }, []);

    const getMenuDisplayName = (menu: string): string => {
        const menuMap: { [key: string]: string } = {
            "plans-and-elevation": "Plans & Elevation",
            permits: "Permits",
            estimates: "Estimates",
            contracts: "Contracts",
            "change-orders": "Change Orders",
            specifications: "Specifications",
            "additional-documents": "Additional Documents",
        };
        return menuMap[menu] || menu;
    };

    const getActionDisplayName = (action: string): string => {
        return action === "edit" ? "Update" : "New";
    };

    const menuDisplayName = getMenuDisplayName(activeMenu);
    const actionDisplayName = getActionDisplayName(action);

    return (
        <div className="position-fixed w-100 bg-white border-bottom px-4 py-3 custom-z-index custom-border-color">
            <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">{menuDisplayName}</span>
                <span className="text-dark">{">"}</span>
                <span className="text-dark small fw-semibold">
                    {actionDisplayName} {menuDisplayName}
                </span>
            </div>
        </div>
    );
};

export default function ProjectDocumentForm(props: ProjectDocumentFormState) {
    const { action, activeMenu, onCancel, fileToUpdate, showList, projectId } = props;

    const {
        getProjectDocument,
        projectDocument,
        setProjectDocument,
        isLoading,
        setIsLoading,
        uploadMultipleFilesWithProgress,
        addProjectDocument,
        document,
        dispatch,
        updateProjectDocument,
    } = useProject({ showList, docProjectId: projectId });

    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [tagsAutoFocus, setTagsAutoFocus] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [tagSuggestions, setTagSuggestions] = useState<any>([]);
    const [defaultTags, setDefaultTags] = useState<TagInput[]>([]);
    const [attachment, setAttachment] = useState<File[]>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const tagsSelector = useRef(null);
    const [isCentered, setIsCentered] = useState(true);

    const [filesWithMetadata, setFilesWithMetadata] = useState<FileWithMetadata[]>([]);
    const [showUploadProgress, setShowUploadProgress] = useState<boolean>(false);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingFileIndex, setEditingFileIndex] = useState<number | null>(null);

    const [singleFileData, setSingleFileData] = useState<{
        fileName: string;
        tags: TagInput[];
        visibility: "public" | "private";
    }>({
        fileName: "",
        tags: [],
        visibility: "public",
    });

    useEffect(() => {
        const updateCenter = () => {
            setIsCentered(window.innerWidth >= 1024);
        };
        updateCenter();
        window.addEventListener("resize", updateCenter);
        return () => window.removeEventListener("resize", updateCenter);
    }, []);

    function addFileAgain() {
        if (action === "add") {
            dispatch({
                id: "",
                tagNames: [],
                file: null,
                name: "",
            });
            setDefaultTags([]);
            setIsSubmitting(false);
            setAttachment([]);
            setFilesWithMetadata([]);
            setSingleFileData({ fileName: "", tags: [], visibility: "public" });
            setFeedbackMessage("");
            setErrorMessage("");
            setShowModal(false);
            setShowUploadProgress(false);
        }

        if (action === "edit") {
            setShowModal(false);
        }
    }

    function handleTagsChange(newTags: any) {
        if (newTags && newTags.length > 5) {
            newTags.pop();
        }
        if (newTags && newTags.length >= 5) {
            // @ts-ignore
            tagsSelector?.current?.blur();
        }

        const tagNames = newTags ? newTags.map((tag: TagInput) => tag.value) : [];

        dispatch({
            tagNames: tagNames,
        });

        setDefaultTags(newTags || []);
        setTagsAutoFocus(true);
    }

    function handleSingleFileTagsChange(newTags: TagInput[]) {
        if (newTags && newTags.length > 5) {
            newTags.pop();
        }
        setSingleFileData(prev => ({ ...prev, tags: newTags }));
    }

    function handleOnFileChange(files: File[]) {
        setDropZoneErrorMessage("");

        if (action === "edit") {
            if (!files.length) {
                setDropZoneErrorMessage("Only (png, jpg and pdf) files are accepted");
                return;
            }
            setAttachment(files);

            const fileName = files[0].name;
            const fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;

            dispatch({ name: fileNameWithoutExtension });
            return;
        }

        const currentFiles = filesWithMetadata.length;
        const totalFiles = currentFiles + files.length;

        if (totalFiles > 10) {
            const remainingSlots = 10 - currentFiles;
            setDropZoneErrorMessage(
                `You can only upload up to 10 files. You have ${remainingSlots} slot(s) remaining.`,
            );
            return;
        }

        const allowedExtensions = ["png", "jpg", "jpeg", "pdf", "docx", "xlsx"];
        const maxSize = 10 * 1024 * 1024; // 10MB

        const invalidFiles = files.filter(file => {
            const fileExtension = file.name.split(".").pop()?.toLowerCase();
            return !allowedExtensions.includes(fileExtension || "") || file.size > maxSize;
        });

        if (invalidFiles.length > 0) {
            setDropZoneErrorMessage(
                "Some files are invalid. Please ensure all files are PNG, JPG, PDF, DOCX, or XLSX and under 10MB.",
            );
            return;
        }

        const newFilesWithMetadata: FileWithMetadata[] = files.map(file => ({
            file,
            fileName: file.name.split(".")[0],
            tags: [],
            visibility: "public",
            status: "selected",
        }));

        const updatedFiles = [...filesWithMetadata, ...newFilesWithMetadata];
        setFilesWithMetadata(updatedFiles);

        if (updatedFiles.length === 1) {
            setSingleFileData({
                fileName: newFilesWithMetadata[0].fileName,
                tags: [],
                visibility: "public",
            });
        }

        const allFiles = [...filesWithMetadata.map(f => f.file), ...files];
        setAttachment(allFiles);
    }

    function handleFileRemoval(indexToRemove?: number) {
        if (action === "edit") {
            setAttachment(undefined);
            dispatch({
                name: "",
                file: null,
                fileId: "",
            });
            setDropZoneErrorMessage("");
        } else {
            if (typeof indexToRemove === "number") {
                const newFilesWithMetadata = filesWithMetadata.filter((_, index) => index !== indexToRemove);
                setFilesWithMetadata(newFilesWithMetadata);
                setAttachment(newFilesWithMetadata.map(f => f.file));

                if (newFilesWithMetadata.length === 0) {
                    setSingleFileData({ fileName: "", tags: [], visibility: "public" });
                } else if (newFilesWithMetadata.length === 1) {
                    setSingleFileData({
                        fileName: newFilesWithMetadata[0].fileName,
                        tags: newFilesWithMetadata[0].tags,
                        visibility: newFilesWithMetadata[0].visibility,
                    });
                }
            } else {
                setFilesWithMetadata([]);
                setAttachment([]);
                setSingleFileData({ fileName: "", tags: [], visibility: "public" });
            }
        }
    }

    function handleEditFile(index: number) {
        setEditingFileIndex(index);
        setShowEditModal(true);
    }

    function handleSaveFileEdit(
        fileId: string,
        fileName: string,
        tags: TagInput[],
        visibility: "public" | "private" = "public",
    ) {
        if (editingFileIndex !== null) {
            const updatedFiles = [...filesWithMetadata];
            updatedFiles[editingFileIndex] = {
                ...updatedFiles[editingFileIndex],
                fileName,
                tags,
                visibility,
            };
            setFilesWithMetadata(updatedFiles);
        }
        setShowEditModal(false);
        setEditingFileIndex(null);
    }

    function handleSingleFileUpdate() {
        if (filesWithMetadata.length === 1) {
            const updatedFiles = [...filesWithMetadata];
            updatedFiles[0] = {
                ...updatedFiles[0],
                fileName: singleFileData.fileName,
                tags: singleFileData.tags,
                visibility: singleFileData.visibility,
            };
            setFilesWithMetadata(updatedFiles);
        }
    }

    useEffect(() => {
        if (filesWithMetadata.length === 1 && singleFileData.fileName) {
            handleSingleFileUpdate();
        }
    }, [singleFileData]);

    const getEditingFileData = (): FileEditData | null => {
        if (editingFileIndex === null) return null;

        const fileWithMetadata = filesWithMetadata[editingFileIndex];
        return {
            id: `file-${editingFileIndex}`,
            fileName: fileWithMetadata?.fileName,
            originalName: fileWithMetadata?.file.name,
            tags: fileWithMetadata?.tags,
            visibility: fileWithMetadata?.visibility,
        };
    };

    function handleRetryUpload(fileId: string) {
        const fileIndex = parseInt(fileId.split("-")[1]);
        if (fileIndex >= 0 && fileIndex < filesWithMetadata.length) {
            const updatedFiles = [...filesWithMetadata];
            updatedFiles[fileIndex] = {
                ...updatedFiles[fileIndex],
                status: "selected",
                error: undefined,
                progress: 0,
            };
            setFilesWithMetadata(updatedFiles);
        }
    }

    function handleRemoveUploadFile(fileId: string) {
        const fileIndex = parseInt(fileId.split("-")[1]);
        if (fileIndex >= 0) {
            handleFileRemoval(fileIndex);
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage("");

        if (action === "add") {
            if (!filesWithMetadata.length) {
                setErrorMessage("Please attach at least one file.");
                return;
            }

            const filesWithoutNames = filesWithMetadata.filter(file => !file.fileName.trim());
            if (filesWithoutNames.length > 0) {
                setErrorMessage("Please provide names for all files before uploading.");
                return;
            }

            setIsSubmitting(true);
            setShowUploadProgress(true);
            uploadMultipleFiles();
        } else if (action === "edit") {
            if (!attachment?.length && !document.file) {
                setErrorMessage("Please attach a file.");
                return;
            }
            if (!document.name) {
                setErrorMessage("Please add a file name.");
                return;
            }

            setIsSubmitting(true);
            updateProjectDocument(attachment);
        }
    }

    async function uploadMultipleFiles() {
        setFilesWithMetadata(prev => prev.map(file => ({ ...file, status: "uploading" })));

        try {
            await uploadMultipleFilesWithProgress(
                filesWithMetadata,
                projectId,
                activeMenu.category,
                (fileIndex: number, progress: number) => {
                    setFilesWithMetadata(prev => prev.map((f, i) => (i === fileIndex ? { ...f, progress } : f)));
                },
                (fileIndex: number, success: boolean, error?: string) => {
                    setFilesWithMetadata(prev =>
                        prev.map((f, i) =>
                            i === fileIndex
                                ? {
                                      ...f,
                                      status: success ? "completed" : "failed",
                                      error: error,
                                  }
                                : f,
                        ),
                    );
                },
            );

            setFeedbackMessage("Files uploaded successfully");
            setShowModal(true);
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    const { showToast } = useToast();

    useEffect(() => {
        if (action === "add" && document.fileId) addProjectDocumentHandler();
    }, [document.fileId]);

    async function addProjectDocumentHandler() {
        try {
            const response = await addProjectDocument(props.projectId, document);
            setFeedbackMessage("File added");
            showList();
            showToast({ heading: "Success", message: "File added.", variant: "success" });
        } catch (error) {
            showToast({ heading: "Failed to add file", message: apiErrorMessage(error), variant: "danger" });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function getTags() {
        try {
            const res = await DI.resourceService.getTags(1);
            if (res.results.length) {
                let preparedTags = res.results.map((tag: any) => {
                    return { value: tag.name, label: tag.name };
                });
                setTagSuggestions(preparedTags);
            }
        } catch (error) {
        } finally {
        }
    }

    async function init() {
        await getTags();

        const id = getUrlQuery("id");
        const urlAction = getUrlQuery("action");
        if (id) {
            await getProjectDocument({ projectId: projectId, documentId: id, hideLoader: false });
            return;
        }

        if (action === "add" || (urlAction && urlAction === "add")) {
            setIsLoading(false);
        }
    }

    async function getFile() {
        const tags = projectDocument?.tags?.map((tag: Tag) => {
            return {
                value: tag.name,
                label: tag.name,
            };
        });

        const newTagNames = projectDocument?.tags?.map((tag: Tag) => {
            return tag.name;
        });

        if (tags?.length) {
            setDefaultTags(tags);
        } else {
            setDefaultTags([]);
        }

        dispatch({
            id: projectDocument?.id,
            tagNames: newTagNames?.length ? newTagNames : [],
            fileId: projectDocument?.file?.id,
            file: projectDocument?.file,
            name: projectDocument?.name || projectDocument?.file?.originalFileName,
            category: projectDocument?.category,
            project: projectDocument?.project,
            visibility: projectDocument?.visibility,
        });

        setIsLoading(false);
    }

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (projectDocument && projectDocument.id) {
            getFile();
        }
    }, [projectDocument]);

    const hasAttachment =
        (action === "edit" && ((document.file && document.fileId) || (attachment && attachment.length > 0))) ||
        (action === "add" && filesWithMetadata.length > 0);

    const canShowDropzone =
        action === "edit"
            ? !(attachment && attachment.length > 0) && !(document.file && document.fileId)
            : filesWithMetadata.length < 10;

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split(".").pop()?.toLowerCase();
        return <DocumentText size={40} variant="Bold" color="#D1D1D1" />;
    };

    const getStatusIndicator = (status: string, progress?: number, fileSize?: number) => {
        const sizeInMB = 1024 * 1024;
        switch (status) {
            case "uploading":
                return <small className="text-primary">{progress}% Uploading</small>;
            case "completed":
                return (
                    <div className="d-flex align-items-center gap-1">
                        <small className="text-muted fs-7">
                            {fileSize ? (fileSize / sizeInMB).toFixed(2) + " MB" : ""}
                        </small>
                        <small className="text-success d-flex align-items-center fs-7">
                            <CheckCircle size={16} className="me-1" /> Completed
                        </small>
                    </div>
                );
            case "failed":
                return <small className="text-danger">Upload failed!</small>;
            case "selected":
                return (
                    <small className="text-muted fs-7">
                        {fileSize ? (fileSize / (1024 * 1024)).toFixed(2) + " MB" : ""}
                    </small>
                );
            default:
                return null;
        }
    };

    const uploadProgressFiles: UploadFile[] = filesWithMetadata.map((file, index) => ({
        id: `file-${index}`,
        name: file.fileName || file.file.name,
        size: file.file.size,
        progress: file.progress || 0,
        status:
            file.status === "selected"
                ? "uploading"
                : file.status === "uploading"
                ? "uploading"
                : file.status === "completed"
                ? "completed"
                : "failed",
        error: file.error,
    }));

    // Check if we should show inline editing for single file
    const shouldShowInlineEditing = action === "add" && filesWithMetadata.length === 1;

    return (
        <>
            <ProjectDocumentTopBar action={action as "add" | "edit"} />
            <div className="pt-5">
                {isLoading ? (
                    <div className="d-flex min-vh-30 mt-5">
                        <Spinner className="m-auto" />
                    </div>
                ) : (
                    <FormLayout center={true} colSize={5} className="d-flex justify-content-center">
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Attachment <Required />
                                    {action === "add" && (
                                        <small className="text-muted d-block">
                                            You can upload up to 10 files (PNG, JPG, PDF, DOCX, XLSX)
                                        </small>
                                    )}
                                    {dropZoneErrorMessage.length > 0 && (
                                        <p className="m-0 text-danger small">{dropZoneErrorMessage}</p>
                                    )}
                                </Form.Label>

                                {canShowDropzone && (
                                    <Dropzone
                                        accept={ACCEPTED_FILES}
                                        multiple={action === "add"}
                                        onDrop={handleOnFileChange}
                                        disabled={false}
                                    >
                                        {({ getRootProps, getInputProps }) => (
                                            <section
                                                className={`dropzone-container border-radius-12 ${
                                                    (action === "add" || action === "edit") && "pointer"
                                                }`}
                                                title={
                                                    action === "add"
                                                        ? "Drag and drop files, or browse. File types: PNG, JPG, PDF, DOCX, XLSX (up to 10 files)"
                                                        : "Drag and drop file, or browse. File types: PNG, JPG, PDF, DOCX, XLSX"
                                                }
                                            >
                                                <div {...getRootProps()}>
                                                    <input {...getInputProps()} />
                                                    <div className="text-muted text-center d-flex flex-column align-items-center w-100 h-100">
                                                        <DocumentText
                                                            size={40}
                                                            variant="Bold"
                                                            color="#D1D1D1"
                                                            className="mb-3"
                                                        />
                                                        <div className="text-gray-500 truncate-1 tb-body-default-medium">
                                                            {action === "add" ? (
                                                                <>
                                                                    Drag and drop files, or{" "}
                                                                    <a className="text-primary offset tb-body-default-medium">
                                                                        Choose Files
                                                                    </a>
                                                                    <br />
                                                                    <small className="text-gray-500 tb-body-small-regular">
                                                                        File types: PNG, JPG, PDF, DOCX, XLSX (up to 10
                                                                        files)
                                                                    </small>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Drag and drop file, or{" "}
                                                                    <a className="text-primary offset tb-body-default-medium">
                                                                        Choose a File
                                                                    </a>
                                                                    <br />
                                                                    <small className="text-gray-500 tb-body-small-regular">
                                                                        File types: PNG, JPG, PDF, DOCX, XLSX
                                                                    </small>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        )}
                                    </Dropzone>
                                )}

                                {hasAttachment && (
                                    <div className="mb-3 mt-3">
                                        {action === "edit" ? (
                                            <SelectedFileBox
                                                key={`selected-file-${document.name}-${attachment?.length || 0}`}
                                                file={
                                                    document.file
                                                        ? {
                                                              id: document.file.id,
                                                              originalFileName: document.name
                                                                  ? `${document.name}.pdf`
                                                                  : document.file.originalFileName,
                                                              fileName: document.file.fileName,
                                                              name: document.name
                                                                  ? `${document.name}.pdf`
                                                                  : document.file.originalFileName,
                                                          }
                                                        : attachment && attachment.length > 0
                                                        ? {
                                                              id: "temp-file",
                                                              originalFileName: attachment[0].name,
                                                              fileName: attachment[0].name,
                                                              name: document.name
                                                                  ? `${document.name}.${attachment[0].name
                                                                        .split(".")
                                                                        .pop()}`
                                                                  : attachment[0].name,
                                                              size: attachment[0].size,
                                                              type: attachment[0].type,
                                                          }
                                                        : null
                                                }
                                                onDelete={() => handleFileRemoval()}
                                            />
                                        ) : (
                                            <div className="d-flex flex-column gap-3">
                                                {filesWithMetadata.map((fileWithMetadata, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-2 border-dashed rounded p-3 d-flex align-items-center justify-content-between border-secondary-subtle"
                                                    >
                                                        <div className="d-flex align-items-center gap-3 flex-grow-1">
                                                            {getFileIcon(fileWithMetadata.file.name)}
                                                            <div className="flex-grow-1">
                                                                <p className="mb-1 tb-body-small-medium truncate-1">
                                                                    {fileWithMetadata.fileName ||
                                                                        fileWithMetadata.file.name}
                                                                </p>
                                                                <div className="d-flex align-items-center gap-1">
                                                                    {getStatusIndicator(
                                                                        fileWithMetadata.status,
                                                                        fileWithMetadata.progress,
                                                                        fileWithMetadata.file.size,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-1">
                                                            {/* Only show rename button when multiple files are selected */}
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

                            {shouldShowInlineEditing && (
                                <>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            File Name <Required />
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter File Name"
                                            value={singleFileData.fileName}
                                            onChange={e => {
                                                const value = e.target.value;
                                                const isAlphanumeric = /^[a-zA-Z0-9 ]*$/;
                                                if (isAlphanumeric.test(value) || value === "") {
                                                    setSingleFileData(prev => ({ ...prev, fileName: value }));
                                                }
                                            }}
                                        />
                                        <small className="text-gray-500 tb-body-extra-small-regular mt-1">
                                            Only letters, numbers and spaces are allowed
                                        </small>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">Tags</Form.Label>
                                        <CreatableSelect
                                            value={singleFileData.tags}
                                            isMulti
                                            isClearable
                                            options={tagSuggestions}
                                            //@ts-ignore
                                            onChange={handleSingleFileTagsChange}
                                            openMenuOnFocus={true}
                                            noOptionsMessage={() => "No more tags"}
                                            placeholder="Add keywords to your resource"
                                            className="react-select-container tb-body-small-medium"
                                            classNamePrefix="react-select"
                                        />
                                        <small className="text-gray-500 tb-body-extra-small-regular d-flex align-items-center gap-2 mt-2">
                                            <InfoCircle variant="Bold" size={16} color="#4F4F4F" />
                                            Keyword for ease of search
                                        </small>
                                    </Form.Group>

                                    <Form.Group className="mb-4 d-flex justify-content-between">
                                        <Form.Label
                                            htmlFor="single-file-private"
                                            className="d-flex align-items-center m-0 pointer text-gray-600 tb-body-small-medium"
                                        >
                                            Mark as private
                                        </Form.Label>

                                        <Form.Check
                                            id="single-file-private"
                                            type="switch"
                                            className="d-flex justify-content-end big"
                                            checked={singleFileData.visibility === "private"}
                                            onChange={e => {
                                                setSingleFileData(prev => ({
                                                    ...prev,
                                                    visibility: e.target.checked ? "private" : "public",
                                                }));
                                            }}
                                        />
                                    </Form.Group>
                                </>
                            )}

                            {action === "edit" && (attachment?.length || document.file) && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        File Name <Required />
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Eg. license"
                                        value={document.name}
                                        onChange={e => {
                                            dispatch({ name: e.target.value });
                                        }}
                                    />
                                </Form.Group>
                            )}

                            {action === "edit" && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Tags</Form.Label>

                                    <CreatableSelect
                                        key={`tags-${projectDocument?.id}-${defaultTags.length}`}
                                        value={defaultTags}
                                        isMulti
                                        isClearable
                                        autoFocus={tagsAutoFocus}
                                        options={tagSuggestions}
                                        onChange={handleTagsChange}
                                        openMenuOnFocus={true}
                                        noOptionsMessage={() => "No more tags"}
                                        placeholder="Add keywords to your resource"
                                        className="tb-body-small-medium"
                                    />
                                    <small className="text-gray-600 tb-body-extra-small-regular d-flex gap-2 mt-2">
                                        <InfoCircle variant="Bold" size={16} color="#4F4F4F" /> Keyword for ease of
                                        search
                                    </small>
                                </Form.Group>
                            )}

                            {action === "edit" && (
                                <Form.Group className="mb-4 d-flex justify-content-between">
                                    <Form.Label
                                        htmlFor="tax-document"
                                        className="d-flex align-items-center m-0 pointer text-gray-600 tb-body-small-medium"
                                    >
                                        Mark as private
                                    </Form.Label>

                                    <Form.Check
                                        id="tax-document"
                                        type="switch"
                                        className="d-flex justify-content-end big"
                                        checked={document.visibility === "private"}
                                        onChange={e => {
                                            dispatch({ visibility: e.target.checked ? "private" : "public" });
                                        }}
                                    />
                                </Form.Group>
                            )}

                            <div className="mt-4">
                                {errorMessage && <FormErrorMessage message={errorMessage} />}
                                <div className="d-flex gap-20">
                                    <Button
                                        onClick={onCancel}
                                        className="w-140 btn-140 tb-title-body-medium"
                                        variant="outline-secondary"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        className="w-100 tb-title-body-medium"
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={
                                            isSubmitting ||
                                            (action === "edit" && !document.name) ||
                                            (action === "add" && !filesWithMetadata.length) ||
                                            (shouldShowInlineEditing && !singleFileData.fileName.trim())
                                        }
                                    >
                                        {isSubmitting ? <ButtonLoader buttonText={"Saving..."} /> : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </Form>

                        {showUploadProgress && filesWithMetadata.length > 0 && (
                            <UploadProjectProgress
                                files={uploadProgressFiles}
                                onRetry={handleRetryUpload}
                                onRemove={handleRemoveUploadFile}
                                onHide={() => setShowUploadProgress(false)}
                                totalFiles={filesWithMetadata.length}
                            />
                        )}

                        <ProjectFileEditModal
                            showModal={showEditModal}
                            setShowModal={setShowEditModal}
                            fileData={getEditingFileData()}
                            tagSuggestions={tagSuggestions}
                            onSave={handleSaveFileEdit}
                            fieldLabel="fileName"
                        />

                        <FeedbackModalInner
                            icon={<CheckCircle color="green" size={50} />}
                            showModal={showModal}
                            setShowModal={value => setShowModal(value)}
                            primaryButtonText={`View details`}
                            secondaryButtonText={action === "edit" ? "Close" : `Add more files`}
                            feedbackMessage={feedbackMessage}
                            onPrimaryButtonClick={showList}
                            onSecondaryButtonClick={addFileAgain}
                        />
                    </FormLayout>
                )}
            </div>
        </>
    );
}
