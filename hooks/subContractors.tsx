import { useRouter } from "next/router";
import { useEffect, useReducer, useState } from "react";
import DI from "@/di-container";
import useContact from "./useContact";
import { FILE_MOCK } from "@/mock/projectDocument";
import { Project } from "@/repositories/project-repository";
import { Contact } from "@/repositories/contact-repositories";
import { Button, Dropdown } from "react-bootstrap";
import { MoreHorizontal, MoreVertical } from "react-feather";
import { Iconly } from "react-iconly";
import {
    Archive,
    ArchiveMinus,
    DocumentDownload,
    Edit2,
    ExportSquare,
    ReceiveSquare,
    Star1,
    Trash,
} from "iconsax-react";
import { StartFileUploadPayload } from "@/repositories/storage-repository";
import {
    AddQueryToUrl,
    apiErrorMessage,
    formatDatetime,
    currentPage,
    formatPhoneNumber,
    updateUrlQuery,
} from "@/helpers";
import {
    ProjectSubcontractor,
    Subcontractor,
    SubcontractorCertificate,
    SubcontractorDocumenCategory,
    SubcontractorDocument,
    SubcontractorEstimate,
    TaxDocument,
} from "@/repositories/subcontractor-repository";
import PdfIcon from "@/components/icons/PdfIcon";
import Link from "next/link";
import useProject from "./project";
import useFavorites from "./favorites";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useStorage from "./storage";
import useSearchForm from "./searchForm";

type UseSubcontractorsProps = {
    projectId?: string;
    project?: Partial<Project>;
    action?: string;
};

export enum SubcontractorPages {
    list = "list",
    form = "form",
    details = "details",
    addEstimate = "addEstimate",
}

const useSubcontractors = (props: UseSubcontractorsProps) => {
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.account);
    const { search, isSearching, setIsSearching } = useSearchForm();
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);

    const { getContacts, contacts } = useContact({});
    const { addToFavorites, showToast } = useFavorites();
    const projectHook = useProject({});
    const storageHook = useStorage({});
    const { projectId, project, action } = props;

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [subContractors, setSubcontractors] = useState<Subcontractor[]>([]);
    const [subContractor, setSubcontractor] = useState<Subcontractor>();
    const [subcontractorId, setSubcontractorId] = useState<string>("");
    const [pageToView, setPageToView] = useState<string>(SubcontractorPages.list);
    const [estimates, setEstimates] = useState<SubcontractorEstimate[]>([]);
    const [document, setDocument] = useState<SubcontractorEstimate>();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [subContractorToDelete, setSubContractorToDelete] = useState<any>();
    const [documentName, setDocumentName] = useState<string>("");
    const [attachment, setAttachment] = useState<File[]>();
    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");
    const [uploadedFileId, setUploadedFileId] = useState<string>("");
    const [uploadedCertificateId, setUploadedCertificateId] = useState<string>("");
    const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [hasAddedEstimate, setHasAddedEstimate] = useState<boolean>(false);
    const [estimateToDelete, setEstimatesToDelete] = useState<SubcontractorEstimate>();
    const [page, setPage] = useState<number>(1);
    const [searchResults, setSearchResults] = useState<Subcontractor[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showDropdown, setShowDropdown] = useState<boolean>(false);
    const [allProjectSubcontractors, setAllProjectSubcontractors] = useState<ProjectSubcontractor[]>([]);
    const [totalRows, setTotalRows] = useState<number>(0);
    const [contactDocumentAction, setContactDocumentAction] = useState("list");

    const [certificate, setCertificate] = useReducer(
        (state: Partial<SubcontractorCertificate>, newState: Partial<SubcontractorCertificate>) => ({
            ...state,
            ...newState,
        }),
        {
            id: "",
            tags: [],
            file: "",
            createdAt: "",
            updatedAt: "",
            originalFileName: "",
            fileName: "",
            fileType: "",
            uploadFinishedAt: "",
            expireAt: "",
            reminder: "",
            fileCategory: "",
        },
    );

    const [selectedSubcontractor, setSelectedSubcontractor] = useReducer(
        (state: Partial<Subcontractor>, newState: Partial<Subcontractor>) => ({ ...state, ...newState }),
        {
            contact: {
                id: "",
                fullName: "",
                firstName: "",
                lastName: "",
                phoneNumber: "",
                countryCode: "",
                email: "",
                address: "",
                company: "",
                profilePicture: "",
            } as Contact,
            contactId: "",
            certificatesIds: [],
            hasTaxDocuments: false,
            taxId: "",
            certificates: [],
            id: "",
            taxDocuments: [],
            updatedAt: "",
            createdAt: "",
            fileName: "",
        },
    );

    async function getEstimates(params: { subContractor?: Subcontractor }) {
        setIsLoading(true);

        try {
            const res = await DI.subcontractorService.getSubcontractorEstimates({
                projectId,
                subcontractorId: params?.subContractor?.id,
            });

            const filteredEstimates = res.data.results.filter(
                cert => cert?.subcontractorObj?.id === params?.subContractor?.id,
            );
            setEstimates(filteredEstimates);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    async function getEstimate(params: { subContractorId: string; certificateId: string }) {
        setIsLoading(true);

        try {
            const res = await DI.subcontractorService.getSubcontractorEstimate({
                subcontractorId: params?.subContractorId,
                certificateId: params?.certificateId,
            });
            // @ts-ignore
            setDocument(res);
            return res;
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    async function getSubcontractors() {
        setIsLoading(true);
        try {
            const res = await DI.subcontractorService.getSubcontractors({ pageNumber: 1 });
            setSubcontractors(res.data.results);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    async function getProjectSubcontractors() {
        setIsLoading(true);
        try {
            const res = await DI.subcontractorService.getProjectSubcontractors({ projectId: projectId, pageNumber: 1 });
            setTotalRows(res?.data?.subcontractors?.length ?? 0);
            setSubcontractors(res.data.subcontractors);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    async function getSubcontractor(props: { subcontractorId: string; certificateId?: string }) {
        setIsLoading(true);
        let res;
        try {
            res = await DI.subcontractorService.getSubcontractor({ subcontractorId: props.subcontractorId });
            setSubcontractor(res.data);

            if (props.certificateId) {
                const cert = res.data.certificates.find(cert => cert.id === props.certificateId);

                setCertificate({
                    ...cert?.certificate,
                    fileCategory: cert?.fileCategory,
                    id: cert?.id,
                });
            }
            return res;
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    async function viewSubcontractorDetails(subContractor?: Subcontractor, projectId?: string) {
        if (projectHook.projectDocumentCategoryPath() === "sub-contractors") {
            router.push(
                `/projects/${projectId}?action=${
                    SubcontractorPages.details
                }&activeMenu=${projectHook.projectDocumentCategoryPath()}&id=${subContractor?.id}`,
            );
            return;
        }

        setSubcontractor(subContractor);
        updateUrlQuery({ key: "action", value: "details" });
        updateUrlQuery({ key: "id", value: subContractor?.id ?? "" });
        setPageToView(SubcontractorPages.details);
    }

    async function viewSubContractors() {
        await getProjectSubcontractors();
        updateUrlQuery({ key: "action", value: "list" });
        setPageToView(SubcontractorPages.list);
    }

    async function viewEstimateForm() {
        setPageToView(SubcontractorPages.addEstimate);
    }
    async function viewSubContractorForm() {
        updateUrlQuery({ key: "action", value: "form" });
        setPageToView(SubcontractorPages.form);
    }

    async function addSubcontractor(payload: { contact?: Partial<Contact>; contactId?: string }) {
        try {
            setIsSubmitting(true);
            const res = await DI.subcontractorService.addSubcontractor(payload);
            setShowModal(true);
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    }

    async function addOrRemoveProjectSubcontractor(payload: {
        projectId?: string;
        subcontractorIds?: string[];
        operation: string;
    }) {
        try {
            setIsSubmitting(true);
            setIsDeleting(true);
            const res = await DI.subcontractorService.addOrRemoveProjectSubcontractor(payload);
            if (payload.operation === "add") {
                setShowModal(true);
                setIsSubmitting(false);
                return;
            }
            setIsDeleting(false);
            setShowDeleteModal(false);
            getProjectSubcontractors();
        } catch (error) {
        } finally {
        }
    }

    function triggerDeleteModal(subcontractorId: any) {
        setSubContractorToDelete(subcontractorId);
        setShowDeleteModal(true);
    }

    async function deleteSubcontractorFromProject() {
        const payload = {
            projectId,
            subcontractorIds: [subContractorToDelete],
            operation: "remove",
        };
        addOrRemoveProjectSubcontractor(payload);
    }

    function handleOnFileChange(file: File[]) {
        setDropZoneErrorMessage("");
        if (!file.length) {
            setDropZoneErrorMessage("Only (png, jpg and pdf) files are accepted");
            return;
        }
        setAttachment(file);
    }

    async function submitSubcontractorDocuments() {
        try {
            setIsSubmitting(true);
            const payload = {
                category: SubcontractorDocumenCategory.estimate,
                fileId: uploadedFileId,
                name: documentName,
                subcontractorObject: subContractor,
                subcontractor: subContractor?.contact?.subcontractorId,
            } as Partial<SubcontractorDocument>;
            const res = await DI.subcontractorService.addSubcontractorDocument(payload, projectId);
            setIsSubmitting(false);
            setHasAddedEstimate(true);
        } catch (error) {}
    }

    async function handleSubmitEstimate(e?: React.FormEvent, subcontractor?: Subcontractor) {
        e && e?.preventDefault();
        subcontractor && setSubcontractor(subcontractor);

        setIsSubmitting(true);
        const filePayload = {
            fileName: documentName,
            fileType: attachment?.length && attachment[0].type,
            file: attachment?.length && attachment[0],
        } as StartFileUploadPayload;

        try {
            const res: any = await DI.storageService.uploadFile(filePayload);
            setUploadedFileId(res.file.id); // useEffect is listening to uploadedFileId to take action
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
            setIsSubmitting(false);
        }
    }

    async function uploadCertificateFile() {
        setIsSubmitting(true);
        const filePayload = {
            fileName: certificate.originalFileName,
            fileType: attachment?.length && attachment[0].type,
            file: attachment?.length && attachment[0],
            expireAt: certificate.expireAt,
            reminder: certificate.reminder,
            validityStartDate: certificate.createdAt,
        } as StartFileUploadPayload;

        try {
            const res: any = await DI.storageService.uploadFile(filePayload);
            setUploadedCertificateId(res.file.id); // useEffect is listening to uploadedFileId to take action
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
            setIsSubmitting(false);
        }
    }

    async function handleCertificateSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        setErrorMessage("");
        if (
            (action === "add" && !attachment?.length) ||
            (action === "edit" && !certificate.file && !attachment?.length)
        ) {
            setErrorMessage("Please attache a file.");
            return;
        }
        if (!certificate.originalFileName) {
            setErrorMessage("Please add a file name.");
            return;
        }
        if (!certificate.fileCategory) {
            setErrorMessage("Please select a category.");
            return;
        }
        if (!certificate.createdAt) {
            setErrorMessage("Please select a validity start date.");
            return;
        }
        if (!certificate.expireAt) {
            setErrorMessage("Please select a validity end date.");
            return;
        }
        if (!certificate.reminder) {
            setErrorMessage("Please select a reminder date.");
            return;
        }

        if (action === "add" || (action === "edit" && !certificate.file && attachment?.length)) {
            uploadCertificateFile();
            return;
        }
        if (action === "edit" && !attachment?.length) {
            updateCertificate();
            return;
        }
    }

    async function addCertificate() {
        const payload = {
            certificateId: uploadedCertificateId,
            fileCategory: certificate?.fileCategory,
        };

        try {
            const res = await DI.subcontractorService.addSubcontractorCertificate(payload, subcontractorId);

            // @ts-ignore
            subContractor?.certificates.push(res.data);

            setShowFeedbackModal(true);
            setFeedbackMessage("Document saved successfully!");
            return res;
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    }

    async function updateCertificate() {
        setIsSubmitting(true);

        const payload = {
            certificateId: uploadedCertificateId ? uploadedCertificateId : certificate.id,
            fileCategory: certificate?.fileCategory,
        };

        try {
            const res = await DI.subcontractorService.updateSubcontractorCertificate(payload, subcontractorId);
            setShowFeedbackModal(true);
            setFeedbackMessage("Document updated successfully!");
            return res;
        } catch (error) {
            setErrorMessage("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    }

    function filterSubcontractors() {
        setShowDropdown(true);

        const searchedSubcontractors = subContractors.filter(subcontractor =>
            subcontractor?.contact?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        setSearchResults(searchedSubcontractors);
    }

    function selectSubcontractor(subcontractor: Subcontractor) {
        setSelectedSubcontractor({
            ...subcontractor,
            fileName: subcontractor.taxDocuments.length
                ? subcontractor?.taxDocuments[0]?.certificate?.originalFileName
                : "",
        });
        setSearchResults([]);
        setShowDropdown(false);
    }

    function resetFields() {
        setSelectedSubcontractor({
            contact: {
                fullName: "",
                firstName: "",
                lastName: "",
                email: "",
                company: "",
                phoneNumber: "",
            },
        });
    }

    function handleFullNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        event.preventDefault();
        setSelectedSubcontractor({
            contact: { fullName: event.target.value, firstName: event.target.value, email: "" },
        });
        setSearchTerm(event.target.value);
    }

    function handleSubmitSubcontractor(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const payload = {
            projectId: projectId,
            subcontractorIds: [selectedSubcontractor.contact?.subcontractorId],
            operation: "add",
        };

        // @ts-ignore
        addOrRemoveProjectSubcontractor(payload);
    }

    function triggerDeleteSubcontractorEstimateModal(payload: {
        subcontractor?: Subcontractor;
        estimate: SubcontractorEstimate;
    }) {
        setSubcontractor(payload.subcontractor);
        setEstimatesToDelete(payload.estimate);
        setShowDeleteModal(true);
    }

    function triggerDeleteSubcontractorDocumentModal(document: SubcontractorEstimate) {
        setEstimatesToDelete(document);
        setShowDeleteModal(true);
    }

    async function deleteSubcontractorEstimate() {
        setIsDeleting(true);

        const payload: { subcontractorId?: string; estimateId?: string } = {
            subcontractorId: subContractor?.id,
            estimateId: estimateToDelete?.id,
        };

        try {
            const res = await DI.subcontractorService.deleteSubcontractorEstimate(payload);
            setShowDeleteModal(false);

            if (currentPage() === "contacts") {
                getSubcontractor({ subcontractorId: subcontractorId });
            } else {
                getEstimates({ subContractor: subContractorToDelete });
            }
            return res;
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    }

    useEffect(() => {
        if (uploadedFileId) {
            submitSubcontractorDocuments();
            return;
        }
        if (uploadedCertificateId) {
            action === "add" && addCertificate();
            action === "edit" && updateCertificate();
        }
    }, [uploadedFileId, uploadedCertificateId]);

    async function viewDocumentFile(document: any) {
        const doc = await getEstimate({ subContractorId: document.contractor, certificateId: document.id });
        doc?.data?.certificate?.file && window.open(doc?.data?.certificate?.file, "_blank");
    }

    const tableColumns = (isSingle?: boolean, hideControls?: boolean, projectId?: string) => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Full Name</span>,
                cell: (row: any) => (
                    <div className="text-muted  text-capitalize d-flex align-items-center">
                        <span className="">{`${row.contact.firstName} ${row.contact.lastName}`}</span>
                    </div>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Email</span>,
                cell: (row: any) => (
                    <span className="text-muted  d-flex flex-column gap-2">
                        <a
                            title={row?.contact?.email?.toLowerCase()}
                            className="text-blue-900 text-decoration-none"
                            href={`mailto:${row?.contact?.email}`}
                        >
                            {row?.contact?.email?.toLowerCase()}
                        </a>
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Company</span>,
                cell: (row: any) => <span className="text-muted ">{row?.contact.company}</span>,
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Contact</span>,
                cell: (row: Subcontractor) => (
                    <span className="d-flex flex-column gap-2">
                        <a className="text-blue-900 text-decoration-none" href={`tel:${row?.contact.phoneNumber}`}>
                            {row?.contact?.phoneNumber}
                        </a>
                        {row?.contact?.extension && <p className="m-0">Extension: {row.contact.extension}</p>}
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Attachment</span>,
                cell: (row: any) => (
                    <span className={` d-flex flex-column gap-2 `}>
                        {row?.taxDocuments?.length ? (
                            <span className="text-muted d-flex align-items-end">
                                <span>
                                    <PdfIcon width={21} height={24} />
                                </span>
                                <Link
                                    href={"javascript:void(0)"}
                                    className="ms-1 text-blue-800 tb-body-default-medium truncate-1"
                                    onClick={() => storageHook.viewDocumentFile(row?.taxDocuments[0]?.certificate)}
                                >
                                    {row?.taxDocuments[0]?.certificate?.originalFileName}
                                </Link>
                            </span>
                        ) : (
                            "-"
                        )}
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Action</span>,
                grow: 1,
                cell: (row: any, index: number) => (
                    <>
                        {(!isSingle || (isSingle && !hideControls)) && (
                            <span className="ms-0">
                                {isSingle && !hideControls ? (
                                    <span className="d-flex align-items-center">
                                        <Button variant="default" onClick={() => {}}>
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button variant="default" onClick={() => {}}>
                                            <Trash size={16} color="#E70000" />
                                        </Button>
                                    </span>
                                ) : (
                                    <Dropdown className="w-100" drop={subContractors.length <= 3 ? "start" : "down"}>
                                        <Dropdown.Toggle
                                            size="sm"
                                            variant="default"
                                            className="btn-square bg-transparent"
                                            id="dropdown-basic"
                                        >
                                            <MoreVertical size={24} />
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu align={`end`}>
                                            <>
                                                <Dropdown.Item
                                                    href={`/contacts/edit/${row?.contact?.id}?redirect=${
                                                        location.pathname + location.search
                                                    }`}
                                                >
                                                    <Edit2 size={16} color="#888888" />{" "}
                                                    <span className="tb-body-default-regular">Update</span>
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => onAddToFavorites(row)}>
                                                    <Star1 size={16} color="#888888" />{" "}
                                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    onClick={() => triggerDeleteModal(row.contact.subcontractorId)}
                                                    className="text-danger"
                                                >
                                                    <Trash size={16} className="" color="#E70000" />
                                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                                </Dropdown.Item>
                                            </>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                )}
                            </span>
                        )}
                    </>
                ),
            },
        ];
    };

    function onAddToFavorites(data: any) {
        const payload = {
            objectType: "contact",
            objectId: data.contact.id,
            createdBy: user?.id,
            company: user?.companyId,
        };
        addToFavorites(payload);
    }

    const documentsTable = (params?: { subcontractor: Subcontractor }) => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">File Name</span>,
                cell: (row: any) => (
                    <div className="text-muted  text-capitalize d-flex align-items-center">
                        <span className="">{row?.certificate?.originalFileName}</span>
                    </div>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Category</span>,
                cell: (row: any) => <span className="text-muted  d-flex flex-column gap-2">{row?.fileCategory}</span>,
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Attachment</span>,
                cell: (row: any) => (
                    <span className={` d-flex flex-column gap-2 `}>
                        <span className="text-muted d-flex align-items-end">
                            <span>
                                <PdfIcon width={21} height={24} />
                            </span>
                            <Link
                                href={"javascript:void(0)"}
                                className="ms-1 text-blue-800 text-decoration-none truncate-1"
                                onClick={() => {
                                    storageHook.viewDocumentFile(row.certificate);
                                }}
                            >
                                {row?.certificate?.originalFileName}
                            </Link>
                        </span>
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Period</span>,
                cell: (row: any) => (
                    <span className="text-muted  d-flex flex-column gap-2">
                        {`${formatDatetime(row?.certificate.createdAt)} ${
                            row?.certificate.expireAt ? "to " + formatDatetime(row?.certificate.expireAt) : ""
                        }`}
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Reminder</span>,
                cell: (row: any) => (
                    <span className="text-muted  d-flex flex-column gap-2">
                        {formatDatetime(row?.certificate?.reminder)}
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className=" ms-auto text-gray-800 tb-title-body-medium text-capitalize">Action</span>,
                grow: 0.1,
                cell: (row: any, index: number) => (
                    <span className="ms-auto">
                        <Dropdown className="w-100" drop={subContractors.length <= 2 ? "start" : "down"}>
                            <Dropdown.Toggle size="sm" variant="default" className="btn-square" id="dropdown-basic">
                                <MoreVertical size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`} className="">
                                <Dropdown.Item
                                    onClick={() => {
                                        updateUrlQuery({ key: "action", value: "edit" });
                                        updateUrlQuery({ key: "certId", value: row.id });
                                        setContactDocumentAction("edit");
                                    }}
                                >
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>

                                <Dropdown.Item>
                                    <Archive size={16} /> <span className="tb-body-default-regular">Archive</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() => {
                                        const payload = {
                                            createdBy: user?.id,
                                            company: user?.companyId,
                                            objectId: row.certificate.id,
                                            objectType: "storage",
                                        };
                                        storageHook.addToFavorites(payload);
                                    }}
                                >
                                    <Star1 size={16} />{" "}
                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    className="text-danger"
                                    onClick={() => triggerDeleteSubcontractorDocumentModal(row)}
                                >
                                    <Trash size={20} color="#E70000" className="" />
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </span>
                ),
            },
        ];
    };

    const estimatesTable = (params?: { subcontractor?: Subcontractor }) => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">File Name</span>,
                cell: (row: any) => (
                    <div className="text-muted  text-capitalize d-flex align-items-center">
                        <span className="">{row?.name}</span>
                    </div>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Attachment</span>,
                cell: (row: any) => (
                    <span className={` d-flex flex-column gap-2 `}>
                        <span className="text-muted d-flex align-items-end">
                            <span>
                                <PdfIcon width={21} height={24} />
                            </span>
                            <Link
                                href={"javascript:void(0)"}
                                onClick={() => {
                                    setIsLoading(true);
                                    projectHook.viewDocumentFile(row);
                                    setTimeout(() => {
                                        setIsLoading(false);
                                    }, 2000);
                                }}
                                className="ms-1 text-muted truncate-1"
                            >
                                {row?.name}
                            </Link>
                        </span>
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Action</span>,
                grow: 0.1,
                cell: (row: any, index: number) => (
                    <span className="ms-auto">
                        <Dropdown className="w-100" drop={estimates.length <= 2 ? "start" : "down"}>
                            <Dropdown.Toggle size="sm" variant="default" className="btn-square" id="dropdown-basic">
                                <MoreHorizontal size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item href={`#!`}>
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item>
                                    <Star1 size={16} />{" "}
                                    <span className="tb-body-default-regular">Add to Favorites</span>
                                </Dropdown.Item>
                                <Dropdown.Item className="text-danger" onClick={() => {}}>
                                    <Trash size={20} color="#E70000" className="" />
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </span>
                ),
            },
        ];
    };

    async function getAllProjectSubcontractors() {
        setIsLoading(true);
        try {
            const res = await DI.subcontractorService.getAllProjectSubcontractors(page);
            setAllProjectSubcontractors(res);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    return {
        isLoading,
        setIsLoading,
        subContractors,
        getSubcontractors,
        viewSubContractors,
        addSubcontractor,
        pageToView,
        getSubcontractor,
        subContractor,
        viewSubcontractorDetails,
        viewSubContractorForm,
        viewEstimateForm,
        contacts,
        getContacts,
        getEstimates,
        estimates,
        isSubmitting,
        errorMessage,
        showModal,
        setShowModal,
        isDeleting,
        setIsDeleting,
        setPageToView,
        tableColumns,
        showDeleteModal,
        setShowDeleteModal,
        subContractorToDelete,
        triggerDeleteModal,
        getProjectSubcontractors,
        addOrRemoveProjectSubcontractor,
        deleteSubcontractorFromProject,
        documentName,
        setDocumentName,
        submitSubcontractorDocuments,
        attachment,
        setAttachment,
        dropZoneErrorMessage,
        setDropZoneErrorMessage,
        handleOnFileChange,
        handleSubmitEstimate,
        documentsTable,
        subcontractorId,
        setSubcontractorId,
        certificate,
        setCertificate,
        handleCertificateSubmit,
        showFeedbackModal,
        setShowFeedbackModal,
        feedbackMessage,
        setFeedbackMessage,
        hasAddedEstimate,
        setHasAddedEstimate,
        estimatesTable,
        selectedSubcontractor,
        setSelectedSubcontractor,
        searchResults,
        setSearchResults,
        searchTerm,
        setSearchTerm,
        showDropdown,
        setShowDropdown,
        filterSubcontractors,
        selectSubcontractor,
        resetFields,
        handleFullNameChange,
        handleSubmitSubcontractor,
        deleteSubcontractorEstimate,
        triggerDeleteSubcontractorEstimateModal,
        viewDocumentFile,
        getAllProjectSubcontractors,
        allProjectSubcontractors,
        totalRows,
        setTotalRows,
        showToast,
        setSubcontractor,
        contactDocumentAction,
        setContactDocumentAction,
        triggerDeleteSubcontractorDocumentModal,
        storageHook,
        search,
        isSearching,
    };
};

export default useSubcontractors;
