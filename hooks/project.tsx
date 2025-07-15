import DI from "@/di-container";
import convertImageToBase64, {
    apiErrorMessage,
    currentPage,
    downloadFile,
    getUrlQuery,
    hyphenToSnakeCase,
    isTabletDevice,
} from "@/helpers";
import {
    Project,
    ProjectDocumentCategories,
    ProjectDocumentType,
    ProjectSharePayload,
} from "@/repositories/project-repository";
import {
    ArchiveAdd,
    ArchiveMinus,
    DocumentDownload,
    DocumentText,
    Edit2,
    Lock1,
    ReceiveSquare,
    Star1,
    Trash,
    UserAdd,
} from "iconsax-react";
import { useRouter } from "next/router";
import { JSXElementConstructor, ReactElement, useEffect, useReducer, useRef, useState } from "react";
import { Badge, Dropdown } from "react-bootstrap";
import { MoreHorizontal, MoreVertical } from "react-feather";
import { ExportSquare } from "iconsax-react";
import useFavorites from "./favorites";
import { User } from "@/repositories/account-repository";
import Image from "next/image";
import { Contact } from "@/repositories/contact-repositories";
import { useSelector } from "react-redux";
import { ProjectInviteResponse } from "@/repositories/project-repository";
import { RootState } from "@/store";
import { SubcontractorEstimate } from "@/repositories/subcontractor-repository";
import { Tag } from "@/repositories/resource-repository";
import BadgeTag from "@/components/BadgeTag";
import { PROJECT_DOCUMENT_MENU } from "@/helpers/constants";
import { StartFileUploadPayload, StorageFile } from "@/repositories/storage-repository";
import { ProjectDocumentMenuItem } from "@/components/ProjectDocumentSection";
import useSearchForm from "./searchForm";
import _ from "lodash";
import { useToast } from "@/context/ToastContext";
import { TagInput } from "@/components/ResourceForm";

type ProjectProps = {
    onShowAddButton?: (value: boolean) => void;
    action?: string;
    isShared?: boolean;
    status?: string;
    activeMenu?: ProjectDocumentMenuItem;
    showList?: () => void;
    docProjectId?: string;
};

export interface FileWithMetadata {
    file: File;
    fileName: string;
    description?: string;
    tags: TagInput[];
    visibility: "public" | "private";
    status: "selected" | "uploading" | "completed" | "failed";
    progress?: number;
    error?: string;
}

export type ProjectDocumentFormState = {
    action: string;
    activeMenu: ProjectDocumentMenuItem;
    onCancel: () => void;
    fileToUpdate?: ProjectDocumentType;
    projectId: string;
    showList: () => void;
};

const useProject = ({
    action,
    onShowAddButton,
    isShared,
    status,
    activeMenu,
    showList,
    docProjectId,
}: ProjectProps) => {
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.account);
    const { query } = router;
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { search, isSearching, setIsSearching } = useSearchForm();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const { addToFavorites } = useFavorites();
    const { removeFavorite } = useFavorites();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [tablePage, setTablePage] = useState<number>(1);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [projectId, setProjectId] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showDeleteProjectModal, setShowDeleteProjectModal] = useState<boolean>(false);
    const [showRevokeModal, setShowRevokeModal] = useState<boolean>(false);
    const [showArchiveProjectModal, setShowArchiveProjectModal] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [projectToDelete, setProjectToDelete] = useState<string>();
    const [dataToDelete, setDataToDelete] = useState<any>();
    const [projectToArchive, setProjectToArchive] = useState<Partial<Project>>();
    const [allProjectDocuments, setAllProjectDocuments] = useState<any[]>([]);
    const [projectDocuments, setProjectDocuments] = useState<ProjectDocumentType[]>([]);
    const [projectDocument, setProjectDocument] = useState<ProjectDocumentType>();
    const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState<boolean>(false);
    const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
    const [documentToDelete, setDocumentToDelete] = useState<ProjectDocumentType>();
    const [selectedFiles, setSelectedFiles] = useState<ProjectDocumentType[]>([]);
    const [attachment, setAttachment] = useState<File[]>();
    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");
    const [images, setImages] = useState<string[]>([]);
    const [photoIndex, setPhotoIndex] = useState<number>(0);
    const [showLightbox, setShowLightbox] = useState<boolean>(false);
    const [showShareProjectModal, setShowShareProjectModal] = useState<boolean>(false);
    const [showProjectShareSuccessModal, setShowProjectShareSuccessModal] = useState<boolean>(false);
    const [permissionId, setPermissionId] = useState<string>("");
    const [sharedLink, setSharedLink] = useState<string>("");
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [invitationsSent, setInvitationsSent] = useState<any>();
    const [invitedUsers, setInvitedUsers] = useState<Contact[]>([]);
    const [shareSent, setShareSent] = useState<any>();
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [invitedUserToUpdate, setInvitedUserToUpdate] = useState<any>();
    const [inviteAccepted, setInviteAccepted] = useState<boolean>(false);
    const [pathId, setPathId] = useState<string>("");
    const [projectInvite, setProjectInvite] = useState<ProjectInviteResponse>();
    const [step, setStep] = useState<number>(1);
    const [isAcceptingInvite, setIsAcceptingInvite] = useState<boolean>(false);
    const [isRejectingInvite, setIsRejectingInvite] = useState<boolean>(false);
    const [inviteAction, setInviteAction] = useState<string>("");
    const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
    const [showAdditionalContacts, setShowAdditionalContacts] = useState<boolean>(false);
    const [isSelecting, setIsSelecting] = useState<boolean>(false);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const { showToast } = useToast();

    const [hasMore, setHasMore] = useState<boolean>(true);
    const pageReady = useRef(false);

    const [totalRows, setTotalRows] = useState<number>();

    const [project, setProject] = useReducer((state: any, newState: Partial<Project>) => ({ ...state, ...newState }), {
        id: "",
        name: "",
        owner: "",
        contact: "",
        email: "",
        country: "",
        state: "",
        city: "",
        zipCode: "",
        addressLine1: "",
        addressLine2: "",
        projectLogo: "",
        extension: "",
    });
    const [newAdditionalContact, setNewAdditionalContact] = useReducer(
        (state: any, newState: Partial<Contact>) => ({ ...state, ...newState }),
        {
            firstName: "",
            phoneNumber: "",
            email: "",
            extension: "",
        },
    );

    const [document, dispatch] = useReducer(
        (document: any, newState: Partial<ProjectDocumentType>) => ({ ...document, ...newState }),
        {
            id: "",
            tagNames: [],
            fileId: "",
            file: null,
            name: "",
            category: activeMenu?.category,
            project: "",
            visibility: "public",
        },
    );

    async function getProjects(params: { status: string }) {
        const { status } = params;

        if (currentPage() === "projects") {
            setIsLoading(true);
        }
        try {
            const response = await DI.projectService.getProjects(currentPageNumber(), status ?? "active");
            setTotalRows(response.count);

            let theProjects: Project[] = [];

            if (listOrGrid.project === "grid") {
                setHasMore(response.next != null);
                theProjects = [...projects, ...response.results];

                if (response.next) {
                    increamentPage();
                }
            } else {
                theProjects = response.results;
            }
            theProjects?.length && setProjects(theProjects);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    async function getAllProjectDocuments(args: { category: string }) {
        setIsLoading(true);
        try {
            const res = await DI.projectService.getAllProjectDocuments(args.category, page);
            const updatedDocuments = res.map((doc: any) => {
                if (Array.isArray(doc.files)) {
                    doc.files.forEach((file: any) => {
                        if (file && file.file) {
                            file.file.name = file.name;
                            file.file.tags = file.tags;
                        }
                    });
                }
                return doc;
            });
            setAllProjectDocuments(updatedDocuments);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    function handleRowClicked(row: any) {
        router.push(`/projects/${row.id}`);
    }

    function isCreatorOfProject(project?: Partial<Project>) {
        if (project) return user?.id === project.createdBy?.id;
        return false;
    }

    function onAddtoFavorites(doc: any) {
        if (doc.file) {
            let payload = {
                objectId: doc?.file?.id,
                createdBy: user?.id,
                company: user?.companyId,
            } as any;

            payload = {
                ...payload,
                objectType: "storage",
            };

            addToFavorites(payload);
        }
    }

    const tableColumns = (props?: { isSingleProject?: boolean; user?: User | null }) => {
        let columns = [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Project Name</span>,
                cell: (row: Partial<Project>) => (
                    <span className="text-muted text-wrap text-capitalize d-flex align-items-center flex-shrink-0">
                        {row.projectLogo ? (
                            <div
                                className="border-radius-12 border-gray-100 flex-shrink-0 d-flex"
                                style={{ height: "56px", width: "56px", objectFit: "cover" }}
                            >
                                <Image
                                    src={`${row.projectLogo}`}
                                    height={56}
                                    width={56}
                                    alt=""
                                    className="border-radius-12 border border-gray-100 object-fit-cover  flex-shrink-0"
                                />
                            </div>
                        ) : (
                            <div className="w-56 h-56 border-radius-12 d-flex justify-content-center align-items-center  bg-gray-50">
                                <DocumentText color="#B0B0B0" size={30} />
                            </div>
                        )}

                        <span className="ms-3 bg-gray-10 text-wrap w-260">
                            <span className="tb-body-default-medium text-wrap ">{`${row?.name}`}</span> <br />
                            {row.isInvited && (
                                <Badge className="badgem bg-gray-100 px-1 py-1m radius-4m w-100m mt-2">
                                    <small className="badge-font text-black text-capitalize"> COLLABORATOR</small>
                                </Badge>
                            )}
                        </span>
                    </span>
                ),
                grow: isTabletDevice() ? 4 : 4,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Primary Contact</span>,
                cell: (row: Partial<Project>, index: number) => (
                    <div className="d-flex flex-column">
                        {row.owner && <span className="text-muted">{`${row.owner}`}</span>}
                        {row.email && (
                            <a
                                title={`${row.email.toLowerCase()}`}
                                href={`mailto:${row.email}`}
                                className="text-blue-900 text-decoration-none truncate-1"
                            >
                                {`${row.email.toLowerCase()}`}
                            </a>
                        )}
                    </div>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Secondary Contact</span>,
                cell: (row: Partial<Project>, index: number) =>
                    row?.additionalContacts?.length ? (
                        <div className="d-flex flex-column">
                            {row.additionalContacts[0].firstName && (
                                <span className="text-muted">{`${row?.additionalContacts[0].firstName}`}</span>
                            )}
                            {row.additionalContacts[0].email && (
                                <a
                                    href={`mailto:${row.additionalContacts[0].email}`}
                                    className="text-blue-900 text-decoration-none "
                                >
                                    {`${row.additionalContacts[0].email.toLowerCase()}`}
                                </a>
                            )}
                        </div>
                    ) : (
                        <></>
                    ),
                grow: 3,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Action</span>,
                cell: (row: Partial<Project>, index: number) => (
                    <>
                        {(!props?.isSingleProject || (props?.isSingleProject && isCreatorOfProject(row))) && (
                            <Dropdown className="ms-autom" drop={projects.length <= 2 ? "start" : "down"}>
                                <Dropdown.Toggle
                                    size="sm"
                                    variant="default"
                                    className="btn-square ms-auto bg-transparent"
                                    id="dropdown-basic"
                                >
                                    <MoreVertical size={24} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align={`end`}>
                                    {isCreatorOfProject(row) && (
                                        <>
                                            <Dropdown.Item href={`/projects/edit/${row.id}`}>
                                                <Edit2 size={16} color="#888888" />{" "}
                                                <span className="tb-body-default-regular">Update</span>
                                            </Dropdown.Item>
                                            {!props?.isSingleProject && (
                                                <Dropdown.Item onClick={() => triggerArchiveModal(row)}>
                                                    {row.status === "active" ? (
                                                        <ArchiveAdd size={16} color="#888888" />
                                                    ) : (
                                                        <ArchiveMinus size={16} color="#888888" />
                                                    )}
                                                    <span className="tb-body-default-regular">
                                                        {row.status === "active" ? "Archive" : "Unarchive"}
                                                    </span>
                                                </Dropdown.Item>
                                            )}

                                            {!props?.isSingleProject && (
                                                <Dropdown.Item
                                                    onClick={() => {
                                                        const payload = {
                                                            objectType: "project",
                                                            objectId: row.id,
                                                            createdBy: props?.user?.id,
                                                            company: props?.user?.companyId,
                                                        };
                                                        addToFavorites(payload);
                                                    }}
                                                >
                                                    <Star1 size={16} color="#888888" />{" "}
                                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                                </Dropdown.Item>
                                            )}
                                            <Dropdown.Item
                                                onClick={() => triggerDeleteModal(row.id)}
                                                className="text-danger"
                                            >
                                                <Trash size={16} className="" color="#E70000" />
                                                <span className="tb-body-default-regular text-danger">Delete</span>
                                            </Dropdown.Item>
                                        </>
                                    )}
                                </Dropdown.Menu>
                            </Dropdown>
                        )}
                    </>
                ),
            },
        ];

        if (isShared) {
            columns = [
                {
                    name: <span className="text-gray-800 tb-title-body-medium text-capitalize">PROJECT NAME</span>,
                    cell: (row: Partial<Project>) => (
                        <span className="text-muted text-capitalize d-flex align-items-center">
                            {row.projectLogo ? (
                                <Image
                                    src={`${row.projectLogo}`}
                                    height={56}
                                    width={56}
                                    alt=""
                                    className="border-radius-12"
                                />
                            ) : (
                                <div className="w-56 h-56 border-radius-12 d-flex justify-content-center align-items-center  bg-gray-50">
                                    <DocumentText color="#B0B0B0" size={30} />
                                </div>
                            )}
                            <span className="ms-3">{`${row.name}`}</span>
                        </span>
                    ),
                    grow: 2,
                },
            ];
        }
        return columns;
    };

    const projectDocumentTable = () => {
        let columns = [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Description</span>,
                cell: (doc: Partial<ProjectDocumentType>) => (
                    <span className="text-gray-600 tb-body-default-medium">{doc.name}</span>
                ),
                grow: 2,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Tags</span>,
                cell: (doc: Partial<ProjectDocumentType>) => (
                    <div className="mt-2 d-flex flex-wrap gap-2">
                        {doc?.tags?.map((tag: Tag, index: number) => (
                            <BadgeTag tag={tag.name} key={index + tag.id} />
                        ))}
                    </div>
                ),
                grow: 2,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Action</span>,
                cell: (doc: Partial<ProjectDocumentType>, index: number) => (
                    <>
                        <Dropdown className="ms-auto" drop={projects.length <= 2 ? "start" : "down"}>
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square ms-auto border-0 bg-gray-50"
                                id="dropdown-basic"
                            >
                                <MoreHorizontal size={20} color="#454545" />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                {isShared ? (
                                    <>
                                        <Dropdown.Item
                                            onClick={() =>
                                                downloadFile({
                                                    fileName: `${doc.file?.fileName}`,
                                                    fileUrl: doc.file?.downloadUrl ?? "",
                                                })
                                            }
                                        >
                                            <ReceiveSquare className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">Download</span>
                                        </Dropdown.Item>
                                    </>
                                ) : (
                                    <>
                                        <Dropdown.Item
                                            href={`/projects/${
                                                doc.project
                                            }?activeMenu=${projectDocumentCategoryPath()}&action=edit&fileId=${
                                                doc?.file?.id
                                            }`}
                                        >
                                            <Edit2 className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">{"Update"}</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item>
                                            <Lock1 className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">Mark as Private</span>
                                            <div className="form-check form-switch">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id="privateToggle"
                                                />
                                            </div>
                                        </Dropdown.Item>
                                        <Dropdown.Item href={doc?.file?.downloadUrl} target="_blank">
                                            <DocumentDownload className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">Download</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={() => onAddtoFavorites(doc)} target="_blank">
                                            <Star1 className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">Add to Favorites</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            className="text-danger"
                                            onClick={() => triggerDeleteDocumentModal(doc)}
                                        >
                                            <Trash className="" size={16} color="#E70000" />
                                            <span className="tb-body-default-regular text-danger">Delete</span>
                                        </Dropdown.Item>
                                    </>
                                )}
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                ),
            },
        ];

        return columns;
    };

    function handleAddAgain() {
        if (action === "add") {
            window.location.reload();
        }
        if (action === "edit") {
            setShowModal(false);
        }
    }

    async function addProject(payload: Project, props?: { callbackUrl: string }) {
        setIsSubmitting(true);
        try {
            const response = await DI.projectService.addProject(payload);
            showToast({ heading: "Success", message: "Project created successfully.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
            return response;
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErrorMessage("");
        if (!project.name) {
            setErrorMessage("Please add a project name.");
            return;
        }
        if (!project.owner) {
            setErrorMessage("Please add a project owner.");
            return;
        }
        if (!project.contact) {
            setErrorMessage("Please add a contact.");
            return;
        }
        if (!project.email) {
            setErrorMessage("Please add an email.");
            return;
        }

        const payload = {
            ...project,
            newAdditionalContacts: showAdditionalContacts ? [newAdditionalContact] : [],
        };

        delete payload?.newAdditionalContacts[0]?.profilePicture;

        if (attachment?.length) {
            const base64String = await convertImageToBase64(attachment[0]);
            payload.projectLogo = base64String;
        }

        let formData: any = new FormData();
        for (const key in project) {
            if (project.hasOwnProperty(key)) {
                // @ts-ignore
                formData.append(key, payload[key]);
            }
        }

        setIsSubmitting(true);

        if (action === "add") {
            addProject(payload, { callbackUrl: `/projects` });
            return;
        }
        if (action === "edit") {
            if (!attachment?.length) delete payload.projectLogo;
            updateProject(payload, { callbackUrl: `/projects` });
        }
    }

    async function getProject(projectId: string, isShared: boolean = false) {
        setIsLoading(true);
        try {
            const res = isShared
                ? await DI.projectService.getProjectByPermission(projectId)
                : await DI.projectService.getProject(projectId);

            setProject({ ...project, ...res });
            if (res.additionalContacts?.length) {
                setNewAdditionalContact({ ...newAdditionalContact, ...res.additionalContacts[0] });
                setShowAdditionalContacts(true);
            }
            return res;
        } catch (error) {
            console.error("Error fetching project:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

    async function uploadMultipleFiles(filesWithMetadata: FileWithMetadata[], projectId: string, category: string) {
        return uploadMultipleFilesWithProgress(filesWithMetadata, projectId, category);
    }

    async function addProjectDocument(projectId: string, documentData: any) {
        try {
            const response = await DI.projectService.addProjectDocument(projectId, documentData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async function uploadFile(file?: File): Promise<string> {
        if (!file) {
            throw new Error("No file provided for upload");
        }

        const filePayload = {
            fileName: document?.name || file.name,
            fileType: file.type,
            file: file,
        } as StartFileUploadPayload;

        try {
            const res: any = await DI.storageService.uploadFile(filePayload);
            dispatch({ fileId: res.file.id });
            return res.file.id;
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
            setIsSubmitting(false);
            throw error;
        }
    }

    async function updateProjectDocument(attachmentFiles?: File[]) {
        let updatedFileId = document.fileId;

        const getFileExtension = (filename: any) => {
            if (!filename || typeof filename !== "string") return "";
            const parts = filename.split(".");
            return parts.length > 1 ? parts.pop() : "";
        };

        if (attachmentFiles?.length) {
            try {
                updatedFileId = await uploadFile(attachmentFiles[0]);
                dispatch({ fileId: updatedFileId });
            } catch (error) {
                return;
            }
        }

        const extension = document.file?.fileName
            ? getFileExtension(document.file.fileName)
            : attachmentFiles?.[0]?.name
            ? getFileExtension(attachmentFiles[0].name)
            : "";

        const payload = {
            ...document,
            fileId: updatedFileId,
            file: document.file
                ? {
                      ...document.file,
                      originalFileName: document.name,
                      fileName: extension ? `${document.name}.${extension}` : document.name,
                  }
                : null,
        };

        try {
            //@ts-ignore
            await DI.projectService.updateProjectDocument(docProjectId, payload);
            showList?.();
            showToast({
                heading: "Success",
                message: "File updated.",
                variant: "success",
            });
        } catch (error) {
            showToast({
                heading: "Failed to update file",
                message: apiErrorMessage(error),
                variant: "danger",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function updateProject(payload?: Project, props?: { callbackUrl: string }) {
        setIsSubmitting(true);
        try {
            const res = await DI.projectService.updateProject(payload || project);
            showToast({ heading: "Success", message: "Project updated.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setShowArchiveProjectModal(false);
            setIsSubmitting(false);
        }
    }

    async function uploadMultipleFilesWithProgress(
        filesWithMetadata: FileWithMetadata[],
        projectId: string,
        category: string,
        onProgress?: (fileIndex: number, progress: number) => void,
        onFileComplete?: (fileIndex: number, success: boolean, error?: string) => void,
    ) {
        const uploadResults: Array<{ success: boolean; fileData?: any; error?: string; index: number }> = [];

        for (let i = 0; i < filesWithMetadata.length; i++) {
            const fileWithMetadata = filesWithMetadata[i];
            try {
                onProgress?.(i, 0);

                const filePayload: StartFileUploadPayload = {
                    fileName: fileWithMetadata.fileName || fileWithMetadata.file.name,
                    fileType: fileWithMetadata.file.type,
                    file: fileWithMetadata.file,
                };

                for (let progress = 10; progress <= 90; progress += 20) {
                    onProgress?.(i, progress);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const storageResponse = await DI.storageService.uploadFile(filePayload);
                onProgress?.(i, 95);

                const projectDocumentPayload = {
                    name: fileWithMetadata.fileName,
                    fileId: storageResponse.file.id,
                    tagNames: fileWithMetadata.tags.map((tag: TagInput) => tag.value),
                    category: category,
                    visibility: fileWithMetadata.visibility,
                    project: projectId,
                };

                const projectDocResponse = await DI.projectService.addProjectDocument(
                    projectId,
                    projectDocumentPayload,
                );
                onProgress?.(i, 100);
                onFileComplete?.(i, true);

                uploadResults.push({
                    success: true,
                    fileData: projectDocResponse,
                    index: i,
                });
            } catch (error) {
                const errorMsg = apiErrorMessage(error);
                onFileComplete?.(i, false, errorMsg);
                uploadResults.push({
                    success: false,
                    error: errorMsg,
                    index: i,
                });
            }
        }

        return uploadResults;
    }

    async function archiveProject(payload: Project) {
        setIsSubmitting(true);
        try {
            const res = await DI.projectService.updateProject(payload);
            showToast({
                heading: "Success",
                message: `Project ${payload.status === "active" ? "unarchived" : "archived"}.`,
                variant: "success",
            });
            resetPage();
            if (currentPage(2)) {
                router.push(`/projects${payload.status === "active" ? "" : "/archived"}`);
            }
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setShowArchiveProjectModal(false);
            setIsSubmitting(false);
        }
    }

    async function getInvitedProject(inviteId: string) {
        setIsLoading(true);
        try {
            const res = await DI.projectService.getInvitedProject(inviteId || pathId);
            setProjectInvite(res);
            return res;
        } catch (error) {
            showToast({
                heading: "Fetching Invite Failed",
                message: "An error occurred while fetching invite.",
                variant: "danger",
            });
        } finally {
            setIsLoading(false);
        }
    }

    async function acceptOrDeclineInvite(payload: { projectId?: string; status: string }) {
        setIsRejectingInvite(payload.status === "rejected");
        setIsAcceptingInvite(payload.status === "accepted");

        try {
            let currentProjectInvite = projectInvite;

            if (!currentProjectInvite && payload.projectId) {
                currentProjectInvite = await getInvitedProject(payload.projectId);
            }

            const projectObjectId = currentProjectInvite?.projectObject?.id;
            const projectName = currentProjectInvite?.projectObject?.name;

            const res = await DI.projectService.acceptOrDeclineInvite(payload);

            if (payload.status === "accepted") {
                setInviteAccepted(true);
                showToast({
                    heading: "Invite accepted successfully",
                    message: `You are now a collaborator on ${projectName || "this"} project.`,
                    variant: "success",
                });

                if (projectObjectId) {
                    router.push(`/projects/${projectObjectId}`);
                } else {
                    router.push("/projects");
                }
                return;
            }

            setInviteAccepted(false);
            showToast({
                heading: "Invite declined successfully",
                message: `You have declined the invite to collaborate on ${projectName || "this"} project.`,
                variant: "success",
            });
            router.push(`/`);
        } catch (error) {
            const message = `Failed to ${payload.status === "accepted" ? "accept" : "decline"} invite.`;
            showToast({ heading: "Error", message, variant: "danger" });
        } finally {
            setIsAcceptingInvite(false);
            setIsRejectingInvite(false);
        }
    }

    async function deleteProject() {
        setIsDeleting(true);
        try {
            const res = await DI.projectService.deleteProject(projectToDelete);
            status && (await getProjects({ status: status }));
            if (currentPage() === "projects") {
                resetPage();
                return;
            }
            router.push("/projects");
        } catch (error) {
        } finally {
            setIsDeleting(false);
            setShowDeleteProjectModal(false);
        }
    }

    function triggerDeleteModal(projectId?: string) {
        setProjectToDelete(projectId);
        setShowDeleteProjectModal(true);
    }

    function triggerDeleteAllModal() {
        setShowDeleteAllModal(true);
    }

    function triggerRevokeModal(id?: string) {
        setIsDeleting(false);
        setDataToDelete(id);
        setShowRevokeModal(true);
    }

    function triggerDeleteDocumentModal(document: any) {
        setDocumentToDelete(document);
        setShowDeleteDocumentModal(true);
    }

    function onSelectFile(document: any) {
        const index = selectedFiles.findIndex(f => f.id === document.id);
        let files: ProjectDocumentType[] = _.cloneDeep(selectedFiles);

        if (index !== -1) {
            files = selectedFiles.filter((_, i) => i !== index);
        } else {
            files = [...files, document];
        }
        setSelectedFiles(files);
    }

    function triggerShareProjectModal(params: {
        project: Partial<Project>;
        isSharing: boolean;
        user?: any;
        updating?: boolean;
    }) {
        const { project, isSharing, user, updating } = params;
        project && setProject(project);
        setIsSharing(isSharing);

        updating ? setIsUpdating(true) : setIsUpdating(false);

        user && updating && setInvitedUserToUpdate(user);
        setShowShareProjectModal(true);
    }

    function triggerArchiveModal(project: Partial<Project>) {
        const payload = {
            ...project,
            status: project.status === "active" ? "archived" : "active",
        };
        delete payload?.projectLogo;

        setDataToDelete(payload);
        setShowArchiveProjectModal(true);
    }

    async function getProjectDocuments(props: {
        projectId: string;
        category: string;
        sharedDocuments?: ProjectDocumentType[];
    }) {
        const { projectId, category, sharedDocuments } = props;
        setIsLoading(true);

        try {
            let documents: ProjectDocumentType[] = currentPageNumber() === 1 ? [] : projectDocuments;

            const response = await DI.projectService.getProjectDocuments(projectId, {
                category: category,
                page: currentPageNumber(),
            });

            setTotalRows(response.count);
            setHasMore(response.next != null);

            documents = [...documents, ...response.results];
            if (response.next) {
                increamentPage();
            }

            setProjectDocuments(documents);
            pageReady.current = true;
            onShowAddButton && onShowAddButton(true);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    async function getProjectDocument(params: { projectId: string; documentId: string; hideLoader?: boolean }) {
        const { projectId, documentId, hideLoader = true } = params;

        if (!hideLoader) {
            setIsLoading(true);
        }

        try {
            const response = await DI.projectService.getProjectDocument(projectId, documentId);
            setProjectDocument(response);
            return response;
        } catch (error) {
            throw error;
        } finally {
            if (!hideLoader) {
                setIsLoading(false);
            }
        }
    }

    function isSelected(doc: any) {
        const index = selectedFiles.find(file => file.id === doc.id);
        return index ? true : false;
    }

    async function onDeleteSelectedProjectDocumentFiles(props: { category: string; projectId: string }) {
        try {
            const deleteRequests = selectedFiles.map(file => {
                return onDeleteProjectDocument(file, props.category, props.projectId);
            });

            Promise.all(deleteRequests);
        } catch (error) {
            console.error("Error deleting files:", error);
        }
    }

    async function onDeleteProjectDocument(documentToDelete: any, category: string, projectId?: string) {
        setIsDeleting(true);
        try {
            const response = await DI.projectService.deleteProjectDocument(projectId ?? "", documentToDelete?.id);

            const query = getUrlQuery("query");
            if (query) {
                search({ query: query, categories: [activeMenu?.searchCategory ?? ""] });
                setShowDeleteDocumentModal(false);
                return;
            }

            getProjectDocuments({ projectId: projectId ?? "", category: category });
            getAllProjectDocuments({ category });
            setShowDeleteDocumentModal(false);
            return response;
        } catch (error) {
            throw error;
        } finally {
            setIsDeleting(false);
        }
    }

    const updateUrlQueryParam = (props: { key: string; value: string; isShared?: boolean }) => {
        const { isShared, key, value } = props;

        let urlId = query.permissionId || query.projectId;

        const idParam = isShared ? "[permissionId]" : "[projectId]";

        if (!urlId) {
            console.error("the id is missing in the query parameters.");
            return;
        }

        const retainedParams = { action: "list" };
        const newQuery = { ...retainedParams, [key]: value };
        const pathname = router.pathname.replace(idParam, urlId as string);
        router.push(
            {
                pathname: pathname,
                query: newQuery,
            },
            undefined,
            { shallow: true },
        );
    };

    function handleOnFileChange(file: File[]) {
        setDropZoneErrorMessage("");
        if (!file.length) {
            setDropZoneErrorMessage("Only (png, jpg and pdf) files are accepted");
            return;
        }
        setAttachment(file);
    }

    function handleProjectShareOrInvite(params: {
        project: Project;
        selectedEmails: string[];
        selectedModules: string[];
    }) {
        let payload: ProjectSharePayload;
        setErrorMessage("");

        if (isSharing) {
            payload = {
                documentCategoryAccesses: params.selectedModules.map(module => {
                    return {
                        accessLevel: "read",
                        documentCategory: module,
                    };
                }),
                userEmails: params.selectedEmails,
            };
        } else {
            payload = {
                documentCategoryAccesses: params.selectedModules.map(module => {
                    return {
                        accessLevel: "write",
                        documentCategory: module,
                    };
                }),
                inviteeEmails: params.selectedEmails,
            };
        }

        !isUpdating && shareOrInviteUsersToProject({ id: params.project.id, payload, isSharing: isSharing });
        isUpdating &&
            updateSharedOrInvitedUsersToProject({
                id: isSharing ? invitedUserToUpdate.id : invitedUserToUpdate.inviteId,
                payload,
                isSharing: isSharing,
            });
    }

    async function shareOrInviteUsersToProject(params: { id: any; payload: any; isSharing: boolean }) {
        const { isSharing, payload, id } = params;
        setIsSubmitting(true);

        try {
            const res = await DI.projectService.shareProject(id, payload, isSharing);
            setPermissionId(res.permissionId);
            setSharedLink(res.link);
            setShowShareProjectModal(false);
            setShowProjectShareSuccessModal(true);
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function updateSharedOrInvitedUsersToProject(params: { id: any; payload: any; isSharing: boolean }) {
        const { isSharing, payload, id } = params;
        setIsSubmitting(true);

        try {
            const res = await DI.projectService.updateProjectShareOrInvite(id, payload, isSharing);

            if (isSharing) {
                setPermissionId(res.permissionId);
                setSharedLink(res.link);
            }
            setShowShareProjectModal(false);
            setShowProjectShareSuccessModal(true);
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function getInvitationsSent(projectId: string) {
        try {
            const res = await DI.projectService.getProjectInvitationsSent(projectId);

            let data;
            let theInvtedUsers = [];

            if (res.results.length) {
                data = res.results[res.results.length - 1];
                data.userEmails = [data.user.email];

                theInvtedUsers = res.results.map((data: any) => {
                    const modules = data.documentCategoryAccesses.filter(
                        (data: any) => data.accessLevel != "no_access",
                    );
                    return {
                        ...data.user,
                        inviteId: data.id,
                        invitedModules: modules,
                        documentCategoryAccesses: data.documentCategoryAccesses,
                        status: data.status,
                    };
                });
            }

            setInvitedUsers(theInvtedUsers);
            setInvitationsSent(data ?? undefined);
        } catch (error) {}
    }

    async function getShareSent(projectId: string) {
        try {
            const res = await DI.projectService.getProjectShareSent(projectId);
            setShareSent(res.results);
        } catch (error) {}
    }

    function revokeAccess() {
        if (isSharing) {
            revokeShareAccess();
            return;
        }
        revokeInviteAccess();
    }

    async function revokeShareAccess() {
        setIsDeleting(true);
        try {
            const res = await DI.projectService.revokeShareAccess(dataToDelete);
            setShowRevokeModal(false);
            getShareSent(projectId);
        } catch (error) {
            setIsDeleting(false);
        }
    }
    async function revokeInviteAccess() {
        setIsDeleting(true);
        try {
            const res = await DI.projectService.revokeInviteAccess(dataToDelete);
            getInvitationsSent(projectId);
            getProject(projectId);
            setShowRevokeModal(false);
        } catch (error) {}
    }

    async function viewDocumentFile(document: ProjectDocumentType | SubcontractorEstimate, noRedirect?: boolean) {
        //@ts-ignore
        const doc = await getProjectDocument({ projectId: document.project ?? projectId, documentId: document.id });
        !noRedirect && doc?.file?.file && window.open(doc?.file?.file, "_blank");
    }

    function projectDocumentCategory(): any {
        const category = location.pathname.split("/")[3];
        return hyphenToSnakeCase(category);
    }

    function projectDocumentCategoryPath() {
        const category = location.pathname.split("/")[3];

        if (category === "plan-and-elevation") return "plans-and-elevation";
        if (category === "estimate") return "estimates";
        if (category === "contract") return "contracts";
        if (category === "change-order") return "change-orders";
        if (category === "payment-schedule") return "payment-schedules";
        if (category === "performance-schedule") return "performance-schedules";
        if (category === "specification") return "specifications";
        if (category === "permit") return "permits";
        if (category === "communication") return "communications";
        return category;
    }

    function projectDocumentCategoryIcon(
        category: string,
    ): ReactElement<any, string | JSXElementConstructor<any>> | undefined {
        const cat = PROJECT_DOCUMENT_MENU.find(projCat => projCat.category === category);
        if (cat) {
            return <cat.icon size={56} color="#B0B0B0" />;
        }
    }

    function toggleAdditionalContacts() {
        setShowAdditionalContacts(!showAdditionalContacts);
    }

    function currentPageNumber() {
        if (listOrGrid.project === "list") {
            return tablePage;
        }
        return page;
    }

    function increamentPage() {
        if (listOrGrid.project === "list") {
            setTablePage(page + 1);
            return;
        }
        setPage(page + 1);
    }

    function resetPage() {
        setHasMore(true);
        setPage(1);
        setTablePage(1);
        setProjects([]);
    }

    useEffect(() => {
        if (searchResults) {
            setProjects([]);
            setPage(1);
        }
    }, [searchResults]);

    useEffect(() => {
        if (listOrGrid.project === "list") {
            status && getProjects({ status: status });
            return;
        }
    }, [tablePage]);

    useEffect(() => {
        resetPage();
        if (listOrGrid.project === "list") {
            status && getProjects({ status: status });
            return;
        }
    }, [listOrGrid.project]);

    useEffect(() => {
        if (!projects.length && pageReady) {
            status && getProjects({ status: status });
        }
    }, [projects]);

    function onTablePageChange(page: number) {
        setTablePage(page);
    }

    function processProjectDocumentsResults(params: {
        results: ProjectDocumentType[];
        activeMenu: Partial<ProjectDocumentMenuItem>;
    }) {
        const { results, activeMenu } = params;

        const updatedResults = results.map((doc: any) => ({
            ...doc,
            file: {
                ...doc.file,
                name: doc.name || doc.file?.name,
                tags: doc.tags || doc.file?.tags || [],
            },
        }));

        if (activeMenu.category === "gallery") {
            const gallery = updatedResults.filter(result => result?.file?.file).map(result => result.file.file);
            if (gallery.length) {
                setImages(gallery);
            }
        }

        return updatedResults;
    }

    async function processProjectDocumentsSearchResults(params: {
        results: any[];
        activeMenu: Partial<ProjectDocumentMenuItem>;
    }) {
        const { results, activeMenu } = params;

        setIsLoading(true);
        const data = processProjectDocumentsResults({ results, activeMenu });
        setProjectDocuments(data);
        setIsLoading(false);
    }

    return {
        tableColumns,
        getProjects,
        projects,
        setProjects,
        isLoading,
        projectId,
        errorMessage,
        isSubmitting,
        showModal,
        project,
        feedbackMessage,
        showDeleteProjectModal,
        showArchiveProjectModal,
        setShowArchiveProjectModal,
        isDeleting,
        projectToDelete,
        setIsDeleting,
        setShowDeleteProjectModal,
        handleAddAgain,
        handleSubmit,
        addProject,
        updateProject,
        getProject,
        setProject,
        setProjectId,
        setShowModal,
        deleteProject,
        triggerDeleteModal,
        archiveProject,
        triggerArchiveModal,
        handleRowClicked,
        getAllProjectDocuments,
        allProjectDocuments,
        onDeleteProjectDocument,
        getProjectDocuments,
        projectDocuments,
        setProjectDocuments,
        showDeleteDocumentModal,
        setShowDeleteDocumentModal,
        triggerDeleteDocumentModal,
        documentToDelete,
        setDocumentToDelete,
        updateUrlQueryParam,
        router,
        attachment,
        setAttachment,
        dropZoneErrorMessage,
        setDropZoneErrorMessage,
        handleOnFileChange,
        addToFavorites,
        images,
        photoIndex,
        setPhotoIndex,
        showLightbox,
        setShowLightbox,
        triggerShareProjectModal,
        showShareProjectModal,
        setShowShareProjectModal,
        showProjectShareSuccessModal,
        setShowProjectShareSuccessModal,
        permissionId,
        handleProjectShareOrInvite,
        selectedContacts,
        setSelectedContacts,
        isShared,
        selectedModules,
        setSelectedModules,
        getInvitationsSent,
        getShareSent,
        shareSent,
        invitationsSent,
        setShareSent,
        setInvitationsSent,
        isSharing,
        setIsSharing,
        triggerRevokeModal,
        showRevokeModal,
        setShowRevokeModal,
        revokeAccess,
        invitedUsers,
        isUpdating,
        setIsUpdating,
        setErrorMessage,
        sharedLink,
        viewDocumentFile,
        isCreatorOfProject,
        inviteAccepted,
        setInviteAccepted,
        getInvitedProject,
        pathId,
        setPathId,
        projectInvite,
        setProjectInvite,
        step,
        setStep,
        acceptOrDeclineInvite,
        isAcceptingInvite,
        isRejectingInvite,
        inviteAction,
        showFeedbackModal,
        setShowFeedbackModal,
        getProjectDocument,
        projectDocumentCategory,
        projectDocumentCategoryPath,
        projectDocumentTable,
        projectDocumentCategoryIcon,
        showAdditionalContacts,
        setShowAdditionalContacts,
        toggleAdditionalContacts,
        newAdditionalContact,
        setNewAdditionalContact,
        listOrGrid,
        setIsLoading,
        searchResults,
        hasMore,
        totalRows,
        onTablePageChange,
        showToast,
        dataToDelete,
        projectDocument,
        setProjectDocument,
        pageReady,
        processProjectDocumentsSearchResults,
        search,
        isSearching,
        isSelecting,
        setIsSelecting,
        selectAll,
        setSelectAll,
        onSelectFile,
        selectedFiles,
        setSelectedFiles,
        showDeleteAllModal,
        setShowDeleteAllModal,
        triggerDeleteAllModal,
        onDeleteSelectedProjectDocumentFiles,
        isSelected,
        uploadMultipleFilesWithProgress,
        addProjectDocument,
        document,
        dispatch,
        updateProjectDocument,
    };
};

export default useProject;
