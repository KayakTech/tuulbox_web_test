import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import Required from "./Required";
import { useEffect, useState } from "react";
import Dropzone, { Accept } from "react-dropzone";
import { useReducer } from "react";
import FormLayout from "./FormLayout";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import FormErrorMessage from "./FormErrorMessage";
import ButtonLoader from "./ButtonLoader";
import DI from "@/di-container";
import { TagInput } from "./ResourceForm";
import { ProjectDocumentType } from "@/repositories/project-repository";
import { apiErrorMessage, convertDateStringToIsoString, getUrlQuery, isAlphabetic } from "@/helpers";
import { StartFileUploadPayload, Tag } from "@/repositories/storage-repository";
import { CheckCircle, Edit2, Trash2, X } from "react-feather";
import { ACCEPTED_IMAGE_FILES } from "@/helpers/constants";
import { GalleryAdd, InfoCircle } from "iconsax-react";
import SelectedFileBox from "./SelectedFileBox";
import useProject from "@/hooks/project";
import { useToast } from "@/context/ToastContext";
import ProjectFileEditModal, { FileEditData } from "./ProjectFileEditModal";
import UploadProjectProgress, { UploadFile } from "./uploadProjectProgress";
import CreatableSelect from "react-select/creatable";

type ProjectDocumentFormState = {
    action: string;
    activeMenu: ProjectDocumentMenuItem;
    onCancel: () => void;
    fileToUpdate?: ProjectDocumentType;
    projectId: string;
    showList: () => void;
};

type AttachmentWithMetadata = {
    file: File;
    name: string;
    tags: string[];
    visibility: "public" | "private";
    fileId?: string;
    isUploading?: boolean;
    uploadError?: string;
    status?: "selected" | "uploading" | "completed" | "failed";
    progress?: number;
};

const ProjectPhotosTopBar = ({ action }: { action: "add" | "edit" }) => {
    const [activeMenu, setActiveMenu] = useState<string>("");

    useEffect(() => {
        // Get activeMenu from URL
        const urlParams = new URLSearchParams(window.location.search);
        const menuFromUrl = urlParams.get("activeMenu") || "";
        setActiveMenu(menuFromUrl);
    }, []);

    const getMenuDisplayName = (menu: string): string => {
        const menuMap: { [key: string]: string } = {
            gallery: "Photos",
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

export default function ProjectGalleryForm(props: ProjectDocumentFormState) {
    const { action, activeMenu, onCancel, fileToUpdate, showList, projectId } = props;
    const { showToast } = useToast();

    const { getProjectDocument, projectDocument, isLoading, setIsLoading } = useProject({});

    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [tagSuggestions, setTagSuggestions] = useState<TagInput[]>([]);
    const [attachments, setAttachments] = useState<AttachmentWithMetadata[]>([]);
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingFile, setEditingFile] = useState<FileEditData | null>(null);
    const [uploadProgress, setUploadProgress] = useState<UploadFile[]>([]);
    const [showUploadProgress, setShowUploadProgress] = useState<boolean>(false);
    const [hasFileChanged, setHasFileChanged] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedTags, setSelectedTags] = useState<TagInput[]>([]);

    const [document, dispatch] = useReducer(
        (document: any, newState: Partial<ProjectDocumentType>) => ({ ...document, ...newState }),
        {
            id: "",
            tagNames: [],
            fileId: "",
            file: null,
            name: "",
            category: activeMenu.category,
            project: "",
            visibility: "public",
        },
    );

    const [errors, setErrors] = useState<any>();

    const acceptedFiles: Accept = {
        "image/png": [".png", ".jpeg", ".jpg"],
        "application/pdf": [".pdf"],
    };

    function handleOnFileChange(files: File[]) {
        setDropZoneErrorMessage("");

        if (!files.length) {
            setDropZoneErrorMessage("Only (png, jpg and pdf) files are accepted");
            return;
        }

        if (action === "edit") {
            const file = files[0];
            const fileName = file.name;
            const fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;

            dispatch({
                //@ts-ignore
                file: fileName,
                name: document.name || fileNameWithoutExtension,
            });

            setSelectedFile(file);
            setHasFileChanged(true);
            return;
        }

        const currentCount = attachments.length;
        const availableSlots = 10 - currentCount;

        if (files.length > availableSlots) {
            setDropZoneErrorMessage(`You can only upload ${availableSlots} more file(s). Maximum is 10 files.`);
            files = files.slice(0, availableSlots);
        }

        const newAttachments: AttachmentWithMetadata[] = files.map(file => {
            const fileName = file.name;
            const fileNameWithoutExtension = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;

            return {
                file,
                name: fileNameWithoutExtension,
                tags: [],
                visibility: "public",
                status: "selected",
            };
        });

        setAttachments(prev => [...prev, ...newAttachments]);
    }

    const handleTagsChange = (newTags: TagInput[]) => {
        if (newTags.length > 5) {
            newTags.pop();
        }
        setSelectedTags(newTags);
    };

    function handleDeleteFile() {
        dispatch({ file: null });
        setHasFileChanged(true);
    }

    const handleRetryUpload = async (fileId: string) => {
        const fileIndex = parseInt(fileId);
        const attachment = attachments[fileIndex];
        if (attachment) {
            setAttachments(prev =>
                prev.map((att, index) =>
                    index === fileIndex ? { ...att, status: "uploading", uploadError: undefined, progress: 0 } : att,
                ),
            );

            try {
                setUploadProgress(prev =>
                    prev.map(file =>
                        file.id === fileId ? { ...file, status: "uploading", progress: 50, error: undefined } : file,
                    ),
                );

                const filePayload: StartFileUploadPayload = {
                    fileName: attachment.file.name,
                    fileType: attachment.file.type,
                    file: attachment.file,
                };

                const uploadRes = await DI.storageService.uploadFile(filePayload);

                const documentData = {
                    tagNames: attachment.tags,
                    fileId: uploadRes.file.id,
                    name: attachment.name,
                    category: activeMenu.category,
                    visibility: attachment.visibility,
                };

                await DI.projectService.addProjectDocument(projectId, documentData);

                setUploadProgress(prev =>
                    prev.map(file => (file.id === fileId ? { ...file, status: "completed", progress: 100 } : file)),
                );

                setAttachments(prev =>
                    prev.map((att, index) =>
                        index === fileIndex ? { ...att, status: "completed", fileId: uploadRes.file.id } : att,
                    ),
                );

                showToast({
                    heading: "Success",
                    message: `${attachment.name} uploaded successfully`,
                    variant: "success",
                });
            } catch (error) {
                setUploadProgress(prev =>
                    prev.map(file =>
                        file.id === fileId
                            ? { ...file, status: "failed", progress: 0, error: apiErrorMessage(error) }
                            : file,
                    ),
                );

                setAttachments(prev =>
                    prev.map((att, index) =>
                        index === fileIndex ? { ...att, status: "failed", uploadError: apiErrorMessage(error) } : att,
                    ),
                );
            }
        }
    };

    const handleRemoveFromProgress = (fileId: string) => {
        setUploadProgress(prev => prev.filter(file => file.id !== fileId));
    };

    const handleHideProgress = () => {
        setShowUploadProgress(false);
        setUploadProgress([]);
    };

    function removeAttachment(index: number) {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    }

    function handleEditFile(index: number) {
        const attachment = attachments[index];
        setEditingFile({
            id: index.toString(),
            fileName: attachment.name,
            originalName: attachment.file.name,
            tags: attachment.tags.map(tag => ({ value: tag, label: tag })),
            visibility: attachment.visibility,
        });
        setShowEditModal(true);
    }

    function handleSaveFileEdit(
        fileId: string,
        fileName: string,
        tags: TagInput[],
        visibility: "public" | "private" = "public",
    ) {
        const index = parseInt(fileId);
        setAttachments(prev =>
            prev.map((attachment, i) =>
                i === index
                    ? {
                          ...attachment,
                          name: fileName,
                          tags: tags.map(tag => tag.value),
                          visibility,
                      }
                    : attachment,
            ),
        );
    }

    function handleSingleFileUpdate(field: keyof AttachmentWithMetadata, value: any) {
        if (attachments.length === 1) {
            setAttachments(prev => prev.map(att => ({ ...att, [field]: value })));
        }
    }

    function handleSingleFileTagsUpdate(tags: TagInput[]) {
        if (attachments.length === 1) {
            setAttachments(prev => prev.map(att => ({ ...att, tags: tags.map(tag => tag.value) })));
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
            console.error("Error fetching tags:", error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");

        if (action === "add") {
            if (!attachments.length) {
                setErrorMessage("Please attach at least one file.");
                return;
            }

            const filesWithoutNames = attachments.filter(att => !att.name.trim());
            if (filesWithoutNames.length) {
                setErrorMessage("Please provide names for all files.");
                return;
            }

            setIsSubmitting(true);
            uploadFiles();
        } else if (action === "edit") {
            updateProjectDocument();
        }
    }

    async function uploadFiles() {
        try {
            setShowUploadProgress(true);

            const progressFiles: UploadFile[] = attachments.map((attachment, index) => ({
                id: index.toString(),
                name: attachment.name,
                originalName: attachment.file.name,
                size: attachment.file.size,
                progress: 0,
                status: "uploading",
                type: attachment.file.type,
            }));
            setUploadProgress(progressFiles);

            const uploadPromises = attachments.map(async (attachment, index) => {
                try {
                    setUploadProgress(prev =>
                        prev.map(file =>
                            file.id === index.toString() ? { ...file, status: "uploading", progress: 50 } : file,
                        ),
                    );

                    const filePayload: StartFileUploadPayload = {
                        fileName: attachment.file.name,
                        fileType: attachment.file.type,
                        file: attachment.file,
                    };

                    const uploadRes = await DI.storageService.uploadFile(filePayload);

                    const documentData = {
                        tagNames: attachment.tags,
                        fileId: uploadRes.file.id,
                        name: attachment.name,
                        category: activeMenu.category,
                        visibility: attachment.visibility,
                    };

                    await DI.projectService.addProjectDocument(projectId, documentData);

                    setUploadProgress(prev =>
                        prev.map(file =>
                            file.id === index.toString() ? { ...file, status: "completed", progress: 100 } : file,
                        ),
                    );

                    return { success: true, index };
                } catch (error) {
                    setUploadProgress(prev =>
                        prev.map(file =>
                            file.id === index.toString()
                                ? { ...file, status: "failed", progress: 0, error: apiErrorMessage(error) }
                                : file,
                        ),
                    );
                    return { success: false, index, error };
                }
            });

            const results = await Promise.all(uploadPromises);
            const failedUploads = results.filter(result => !result.success);

            if (failedUploads.length === 0) {
                showToast({
                    heading: "Success",
                    message: `${attachments.length} image(s) successfully uploaded`,
                    variant: "success",
                });
                showList();
            } else if (failedUploads.length < attachments.length) {
                showToast({
                    heading: "Partial Success",
                    message: `${attachments.length - failedUploads.length} of ${
                        attachments.length
                    } images uploaded successfully`,
                    variant: "warning",
                });
            } else {
                setErrorMessage("Failed to upload images. Please try again.");
            }
        } catch (error) {
            setErrorMessage("An unexpected error occurred during upload.");
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
                const allCompleted = uploadProgress.every(file => file.status === "completed");
                if (allCompleted) {
                    setShowUploadProgress(false);
                }
            }, 3000);
        }
    }

    async function updateProjectDocument() {
        try {
            setIsSubmitting(true);

            if (hasFileChanged && selectedFile) {
                const filePayload: StartFileUploadPayload = {
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    file: selectedFile,
                };

                const uploadRes = await DI.storageService.uploadFile(filePayload);
                dispatch({ fileId: uploadRes.file.id });

                const updatedDocument = { ...document, fileId: uploadRes.file.id };
                await DI.projectService.updateProjectDocument(props.projectId, updatedDocument);
            } else {
                await DI.projectService.updateProjectDocument(props.projectId, document);
            }

            showToast({
                heading: "Success",
                message: "Image successfully updated",
                variant: "success",
            });
            showList();
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function getFile() {
        let newTagNames: string[] = [];

        if (projectDocument?.file?.tags.length) {
            const tags = projectDocument?.file?.tags?.map((tag: Tag) => {
                return {
                    value: tag.name,
                    label: tag.name,
                };
            });

            projectDocument?.tags?.map((tag: Tag) => {
                newTagNames.push(tag.name);
            });

            tags?.length && setTagSuggestions(tags);
        }

        dispatch({
            id: projectDocument?.id,
            tagNames: newTagNames?.length ? newTagNames : [],
            fileId: projectDocument?.file?.id,
            file: projectDocument?.file,
            name: projectDocument?.name,
            category: projectDocument?.category,
            project: projectDocument?.project,
            visibility: projectDocument?.visibility,
        });

        setIsLoading(false);
    }

    async function init() {
        const id = getUrlQuery("id");
        const urlAction = getUrlQuery("action");

        if (id) {
            await getProjectDocument({ projectId: projectId, documentId: id, hideLoader: false });
            return;
        }

        if (action === "add" || (urlAction && urlAction === "add")) {
            await getTags();
            setIsLoading(false);
        }
    }

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        if (projectDocument) {
            getFile();
        }
    }, [projectDocument]);

    const getFileIcon = (fileName: string) => {
        return <GalleryAdd size={40} variant="Bold" color="#D1D1D1" />;
    };

    const getStatusIndicator = (attachment: AttachmentWithMetadata) => {
        const sizeInMB = 1024 * 1024;
        switch (attachment.status) {
            case "uploading":
                return <small className="text-primary">{attachment.progress}% Uploading</small>;
            case "completed":
                return (
                    <div className="d-flex align-items-center gap-1">
                        <small className="text-muted fs-7">{(attachment.file.size / sizeInMB).toFixed(2)} MB</small>
                        <small className="text-success d-flex align-items-center fs-7">
                            <CheckCircle size={16} className="me-1" /> Completed
                        </small>
                    </div>
                );
            case "failed":
                return <small className="text-danger">Upload failed!</small>;
            default:
                return <small className="text-muted fs-7">{(attachment.file.size / sizeInMB).toFixed(2)} MB</small>;
        }
    };

    if (action === "edit") {
        return (
            <>
                <ProjectPhotosTopBar action={action as "add" | "edit"} />
                <div style={{ paddingTop: "80px" }}>
                    {isLoading ? (
                        <div className="d-flex align-items-center justify-content-center w-100 vh-100">
                            <Spinner className="m-auto" />
                        </div>
                    ) : (
                        <div className="d-flex align-items-center justify-content-center">
                            <FormLayout center={true} colSize={6} className="d-flex justify-content-center">
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Upload Image <Required />
                                        </Form.Label>

                                        {document.file ? (
                                            <SelectedFileBox
                                                icon={
                                                    <GalleryAdd
                                                        size={40}
                                                        variant="Bold"
                                                        color="#D1D1D1"
                                                        className="me-2"
                                                    />
                                                }
                                                file={document.file}
                                                onDelete={handleDeleteFile}
                                            />
                                        ) : (
                                            <Dropzone
                                                accept={ACCEPTED_IMAGE_FILES}
                                                multiple={false}
                                                onDrop={handleOnFileChange}
                                            >
                                                {({ getRootProps, getInputProps }) => (
                                                    <section className="dropzone-container border-radius-12 pointer">
                                                        <div {...getRootProps()}>
                                                            <input {...getInputProps()} />
                                                            <div className="text-muted text-center w-100 h-100 d-flex flex-column align-items-center">
                                                                <GalleryAdd
                                                                    size={40}
                                                                    variant="Bold"
                                                                    color="#D1D1D1"
                                                                    className="mb-3"
                                                                />
                                                                <div className="tb-body-default-medium text-gray-600">
                                                                    Drag and drop a file, or{" "}
                                                                    <a className="text-primary offset tb-body-default-medium">
                                                                        Choose File
                                                                    </a>
                                                                    <br />
                                                                    <small className="text-gray-600 tb-body-small-regular">
                                                                        File types: .png, .jpg, .pdf
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                )}
                                            </Dropzone>
                                        )}

                                        {dropZoneErrorMessage.length > 0 && (
                                            <p className="m-0 text-danger small mt-2">{dropZoneErrorMessage}</p>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-capitalize text-gray-600 tb-body-small-medium">
                                            Description <Required />
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={document.name}
                                            onChange={e => {
                                                const value = e.target.value;
                                                const isAlphanumeric = /^[a-zA-Z0-9 ]*$/;
                                                if (isAlphanumeric.test(value) || value === "") {
                                                    dispatch({ name: value });
                                                }
                                            }}
                                            className={`${errors?.description ? "border-danger" : ""}`}
                                            required
                                        />
                                        {errors?.description && (
                                            <small className="text-danger">{errors?.description}</small>
                                        )}
                                    </Form.Group>

                                    <Form.Group className="mb-4 d-flex justify-content-between">
                                        <Form.Label
                                            htmlFor="tax-document"
                                            className="text-gray-600 tb-body-small-medium d-flex align-items-center m-0 pointer"
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

                                    <div className="mt-4">
                                        {errorMessage && <FormErrorMessage message={errorMessage} />}
                                        <div className="d-flex gap-20 w-100">
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
                                                className="w-100 btn-240 px-3 py-2 tb-title-body-medium"
                                                type="submit"
                                                variant="primary"
                                                size="lg"
                                                disabled={!document.name || !document.file || isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <ButtonLoader buttonText={"Saving..."} />
                                                ) : (
                                                    "Save changes"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </FormLayout>
                        </div>
                    )}
                </div>
            </>
        );
    }

    return (
        <>
            <ProjectPhotosTopBar action={action as "add" | "edit"} />
            <div style={{ paddingTop: "30px" }}>
                {isLoading ? (
                    <div className="d-flex align-items-center justify-content-center w-100 vh-100">
                        <Spinner className="m-auto" />
                    </div>
                ) : (
                    <div className="d-flex align-items-center justify-content-center">
                        <FormLayout center={true} colSize={6} className="d-flex justify-content-center">
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        Upload Images <Required /> ({attachments.length}/10)
                                        {dropZoneErrorMessage.length > 0 && (
                                            <p className="m-0 text-danger small">{dropZoneErrorMessage}</p>
                                        )}
                                    </Form.Label>

                                    <Dropzone
                                        accept={ACCEPTED_IMAGE_FILES}
                                        multiple={true}
                                        onDrop={handleOnFileChange}
                                        disabled={attachments.length >= 10}
                                    >
                                        {({ getRootProps, getInputProps }) => (
                                            <>
                                                {attachments.length < 10 && (
                                                    <section
                                                        className="dropzone-container border-radius-12 pointer"
                                                        title="Drag and drop files, or browse. File types: .png, .jpg, .pdf"
                                                    >
                                                        <div {...getRootProps()}>
                                                            <input {...getInputProps()} />
                                                            <div className="text-muted text-center w-100 h-100 d-flex flex-column align-items-center">
                                                                <GalleryAdd
                                                                    size={40}
                                                                    variant="Bold"
                                                                    color="#D1D1D1"
                                                                    className="mb-3"
                                                                />
                                                                <div className="tb-body-default-medium text-gray-600">
                                                                    Drag and drop files, or{" "}
                                                                    <a className="text-primary offset tb-body-default-medium">
                                                                        Choose Files
                                                                    </a>
                                                                    <br />
                                                                    <small className="text-gray-600 tb-body-small-regular">
                                                                        File types: .png, .jpg, .pdf (Max 10 files)
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>
                                                )}
                                            </>
                                        )}
                                    </Dropzone>

                                    {attachments.length > 0 && (
                                        <div className="mb-3 mt-3">
                                            <div className="d-flex flex-column gap-3">
                                                {attachments.map((attachment, index) => (
                                                    <div
                                                        key={index}
                                                        className="border border-2 border-dashed rounded p-3 custom-z-index custom-border-color"
                                                    >
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <div className="d-flex align-items-center gap-3 flex-grow-1">
                                                                {getFileIcon(attachment.file.name)}
                                                                <div className="flex-grow-1">
                                                                    <p className="mb-1 tb-body-small-medium truncate-1">
                                                                        {attachments.length === 1
                                                                            ? attachment.file.name
                                                                            : attachment.name || attachment.file.name}
                                                                    </p>
                                                                    <div className="d-flex align-items-center gap-1">
                                                                        {getStatusIndicator(attachment)}
                                                                    </div>
                                                                    {attachment.uploadError && (
                                                                        <div className="text-danger tb-body-extra-small-regular">
                                                                            Error: {attachment.uploadError}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-1">
                                                                {attachments.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-link p-0 text-primary tb-body-small-medium text-decoration-underline"
                                                                        onClick={() => handleEditFile(index)}
                                                                        disabled={attachment.status === "uploading"}
                                                                    >
                                                                        Rename
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-link p-0 text-muted"
                                                                    onClick={() => removeAttachment(index)}
                                                                    disabled={attachment.status === "uploading"}
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </Form.Group>

                                {attachments.length === 1 && (
                                    <>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="text-capitalize text-gray-600 tb-body-small-medium">
                                                Description <Required />
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={attachments[0].name}
                                                onChange={e => {
                                                    const value = e.target.value;
                                                    const isAlphanumeric = /^[a-zA-Z0-9 ]*$/;
                                                    if (isAlphanumeric.test(value) || value === "") {
                                                        handleSingleFileUpdate("name", value);
                                                    }
                                                }}
                                                placeholder="Only letters, numbers and spaces are allowed"
                                                required
                                                disabled={attachments[0].status === "uploading"}
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4 d-flex justify-content-between">
                                            <Form.Label
                                                htmlFor="single-file-private-switch"
                                                className="text-gray-600 tb-body-small-medium d-flex align-items-center m-0 pointer"
                                            >
                                                Mark as private
                                            </Form.Label>

                                            <Form.Check
                                                id="single-file-private-switch"
                                                type="switch"
                                                className="d-flex justify-content-end big"
                                                checked={attachments[0].visibility === "private"}
                                                onChange={e => {
                                                    handleSingleFileUpdate(
                                                        "visibility",
                                                        e.target.checked ? "private" : "public",
                                                    );
                                                }}
                                                disabled={attachments[0].status === "uploading"}
                                            />
                                        </Form.Group>
                                    </>
                                )}

                                <div className="mt-4">
                                    {errorMessage && <FormErrorMessage message={errorMessage} />}
                                    <div className="d-flex gap-20 w-100">
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
                                            className="w-100 btn-240 px-3 py-2 tb-title-body-medium"
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            disabled={
                                                !attachments.length ||
                                                isSubmitting ||
                                                (attachments.length === 1 && !attachments[0].name.trim())
                                            }
                                        >
                                            {isSubmitting ? (
                                                <ButtonLoader
                                                    buttonText={`Uploading ${attachments.length} file(s)...`}
                                                />
                                            ) : (
                                                `Save changes`
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Form>

                            <ProjectFileEditModal
                                showModal={showEditModal}
                                setShowModal={setShowEditModal}
                                fileData={editingFile}
                                tagSuggestions={tagSuggestions}
                                onSave={handleSaveFileEdit}
                                showTagsField={false}
                                fieldLabel="description"
                            />
                        </FormLayout>
                    </div>
                )}

                {showUploadProgress && uploadProgress.length > 0 && (
                    <UploadProjectProgress
                        files={uploadProgress}
                        onRetry={handleRetryUpload}
                        onRemove={handleRemoveFromProgress}
                        onHide={handleHideProgress}
                        totalFiles={attachments.length}
                        uploadType="gallery"
                    />
                )}
            </div>
        </>
    );
}
