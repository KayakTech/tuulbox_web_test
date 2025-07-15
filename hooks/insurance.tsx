import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useEffect, useState, useReducer } from "react";
import { CreateInsurancePayload, InsuranceData } from "@/repositories/business-repository";
import { Accept } from "react-dropzone";
import {
    addSelectedTimeToDateTime,
    apiErrorMessage,
    convertDateStringToIsoString,
    formatDatetime,
    currentPage,
    getTimeFromTimestamp,
    getUrlQuery,
    isMobileDevice,
    isTabletDevice,
    snakeCaseToSentenceCase,
    stringToSnakeCase,
} from "@/helpers";
import DI from "@/di-container";
import { StartFileUploadPayload, StorageFile } from "@/repositories/storage-repository";
import Link from "next/link";
import { Dropdown } from "react-bootstrap";
import { MoreVertical } from "react-feather";
import PdfIcon from "@/components/icons/PdfIcon";
import { Archive, ArchiveAdd, ArchiveMinus, ArchiveSlash, Edit2, ReceiveSquare, Trash } from "iconsax-react";
import { SelectTimetype } from "@/components/TimeSelector";
import Image from "next/image";
import useStorage from "./storage";
import useSearchForm from "./searchForm";
import { useRouter } from "next/router";
import { useToast } from "@/context/ToastContext";

const useInsurance = (action?: string) => {
    const { user } = useSelector((state: RootState) => state.account);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { search, isSearching } = useSearchForm();
    const router = useRouter();
    const storageHook = useStorage({});

    const [insuranceId, setInsuranceId] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");
    const [file, setFile] = useState<File[]>();
    const [fileToDelete, setFileToDelete] = useState<Partial<StorageFile>>();
    const [yesDeleteFile, setYesDeleteFile] = useState<boolean>(false);
    const [showDeleteFileModal, setShowDeleteFileModal] = useState<boolean>(false);
    const [insurances, setInsurances] = useState<Partial<InsuranceData>[]>([]);
    const [insuranceToDelete, setInsuranceToDelete] = useState<Partial<InsuranceData>>();
    const [fileName, setFileName] = useState<string>("");
    const [newPolicy, setNewPolicy] = useState<string>("");
    const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [pageReady, setPageReady] = useState<boolean>(false);
    const [totalRows, setTotalRows] = useState<number>();
    const [tablePage, setTablePage] = useState<number>(1);
    const [status, setStatus] = useState<string>("active");
    const { showToast } = useToast();

    const [insurance, setInsurance] = useReducer(
        (state: CreateInsurancePayload, newState: Partial<CreateInsurancePayload>) => ({ ...state, ...newState }),
        {
            id: "",
            insuranceType: "",
            carrier: "",
            agent: "",
            contact: "",
            email: "",
            validFrom: "",
            validTo: "",
            reminder: "",
            policy: "",
            file: null,
            broker: "",
            customInsuranceType: "",
            policyNumber: "",
            extension: "",
        },
    );
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [isPickingtime, setIsPickingtime] = useState<boolean>(false);
    const [pickedTime, setPickedTime] = useState<SelectTimetype>({
        timeString: "Pick a Time",
        timeValue: 0,
        isPickingtime: true,
    });
    const [showTimePickerModal, setShowTimePickerModal] = useState<boolean>(false);

    const acceptedFiles: Accept = {
        "image/png": [".png", ".jpeg", ".jpg"],
        "application/pdf": [".pdf"],
    };

    function init() {
        resetPage();

        const query = getUrlQuery("query");
        if (query) {
            search({ query: query, categories: ["insurances"] });
            setIsLoading(false);
            setTimeout(() => {
                setPageReady(true);
            }, 2000);
            return;
        }
        if (isMobileDevice() || isTabletDevice() || listOrGrid.officer === "grid") {
            getInsurances();
        }
    }

    useEffect(() => {
        const payload = {
            ...insurance,
            policy: undefined,
            reminder:
                action === "add" && insurance.reminder
                    ? convertDateStringToIsoString(insurance.reminder)
                    : insurance.reminder,
        };
        yesDeleteFile && updateInsurance(payload);
    }, [yesDeleteFile]);

    useEffect(() => {
        const action = window.location.pathname.split("/")[3];
        if (action === "edit") {
            const id = window.location.pathname.split("/")[4];
            setInsuranceId(id);
            getInsurance(id);
        }
    }, [action]);

    async function deleteInsurance() {
        setIsDeleting(true);
        try {
            const response = await DI.businessService.deleteInsurance(user?.companyId, insuranceToDelete?.id);
            resetPage();
            init();
            setShowModal(false);
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    }

    async function getInsurances(resetInsurances?: boolean) {
        setIsLoading(true);
        const stat = location.pathname.split("/")[3];
        try {
            const res = await DI.businessService.getInsurances(user?.companyId, currentPageNumber(), stat || "active");
            setTotalRows(res.data.count);
            let theInsurances: InsuranceData[] = [];

            if (isMobileDevice() || isTabletDevice() || listOrGrid.insurance === "grid") {
                setHasMore(res.data.next != null);
                theInsurances = resetInsurances ? [...res.data.results] : [...insurances, ...res.data.results];

                if (res.data.next) {
                    increamentPage();
                }
            } else {
                theInsurances = res.data.results;
            }

            theInsurances.length && setInsurances(theInsurances);
        } catch (error) {
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }

    function filteredInsurances(stat: string) {
        if (!insurances.length) return [];
        return !stat ? insurances : insurances.filter(insurance => insurance.status === stat);
    }

    const tableColumns = () => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Type </span>,
                cell: (row: Partial<InsuranceData>) => (
                    <span className="rowclick">{snakeCaseToSentenceCase(row.insuranceType)}</span>
                ),
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Carrier </span>,
                cell: (row: Partial<InsuranceData>) => <span className="rowclick">{row.carrier}</span>,
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Agent</span>,
                cell: (row: Partial<InsuranceData>) => <span className="rowclick">{row.agent}</span>,
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Broker</span>,
                cell: (row: Partial<InsuranceData>) => <span className="rowclick">{row.broker}</span>,
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Period</span>,
                cell: (row: Partial<InsuranceData>) => (
                    <span className="rowclick">{`${formatDatetime(row.validFrom)} - ${formatDatetime(
                        row.validTo,
                    )}`}</span>
                ),
                grow: 1,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Attachment</span>,
                cell: (row: Partial<InsuranceData>) => (
                    <span className="text-muted offset">
                        {row.file?.originalFileName ? (
                            <div className="d-flex flex-nowrap align-items-center flex-row">
                                {row.file.thumbnail ? (
                                    <Image
                                        src={row.file.thumbnail}
                                        width={24}
                                        height={24}
                                        alt=""
                                        className="flex-shrink-0"
                                    />
                                ) : (
                                    <PdfIcon width={24} height={24} />
                                )}
                                <Link
                                    title={row?.file?.originalFileName}
                                    href="javascript:void(0)"
                                    onClick={() => storageHook.viewDocumentFile(row.file)}
                                    className="ms-2 text-blue-800 offset tb-body-default-medium text-decoration-none truncate-1"
                                >
                                    {row?.file?.originalFileName}
                                </Link>
                            </div>
                        ) : null}
                    </span>
                ),
                grow: 1.5,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize ms-auto">Action</span>,
                grow: 0.1,
                cell: (row: Partial<InsuranceData>, index: number) => (
                    <div className="d-flex flex-row flex-nowrap ms-auto">
                        <Dropdown
                            className="w-100 justify-content-end"
                            drop={insurances.length <= 2 ? "start" : "down"}
                        >
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square bordere-0 bg-transparent"
                                id="dropdown-basic"
                            >
                                <MoreVertical size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item href={`/business/insurance/edit/${row.id}`}>
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() =>
                                        row.status === "active" ? archiveInsurance(row) : unArchiveInsurance(row)
                                    }
                                >
                                    {row.status === "active" ? (
                                        <ArchiveAdd size={16} color="#888888" />
                                    ) : (
                                        <ArchiveMinus size={16} color="#888888" />
                                    )}
                                    <span className="tb-body-default-regular">
                                        {row.status === "active" ? "Archive" : "Unarchive"}
                                    </span>
                                </Dropdown.Item>

                                <Dropdown.Item
                                    onClick={() => {
                                        setInsuranceToDelete(row);
                                        setShowModal(true);
                                    }}
                                >
                                    <Trash size={16} className="me-2 text-danger" />{" "}
                                    <span className="text-danger tb-body-default-regular">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
            },
        ];
    };

    const insurancePoliciesTable = () => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">File Name </span>,
                cell: (file: Partial<StorageFile>) => <span className="rowclick">{file?.originalFileName}</span>,
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Attachment</span>,
                cell: (file: Partial<StorageFile>) => (
                    <span className="text-muted text-capitalize truncate-1m d-flex align-items-end">
                        <span className="object-fit-cover flex-shrink-0" style={{ width: "24px", height: "24px" }}>
                            {file.thumbnail ? (
                                <Image
                                    src={file.thumbnail}
                                    width={24}
                                    height={24}
                                    alt=""
                                    className="h-100 object-fit-cover flex-shrink-0"
                                />
                            ) : (
                                <PdfIcon width={24} height={24} />
                            )}
                        </span>
                        <Link
                            href={"javascript:void(0)"}
                            className="ms-2 text-blue-800 text-truncate text-decoration-none offset"
                            onClick={() => {
                                setIsLoading(true);
                                storageHook.viewDocumentFile(file);
                                setTimeout(() => {
                                    setIsLoading(false);
                                }, 2000);
                            }}
                        >
                            {`${file.originalFileName}`}
                        </Link>
                    </span>
                ),
                grow: 1.5,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize ms-auto">Action</span>,
                grow: 0.1,
                cell: (file: StorageFile, index: number) => (
                    <div className="d-flex flex-row flex-nowrap ms-auto">
                        <Dropdown
                            className="w-100 justify-content-end"
                            drop={insurances.length <= 2 ? "start" : "down"}
                        >
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square bordere-0"
                                id="dropdown-basic"
                            >
                                <MoreVertical size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item
                                    href={`/business/insurance/${insuranceId}?action=edit&fileId=${file.id}`}
                                >
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() =>
                                        file.status === "active" ? archivePolicyFile(file) : activatePolicyFile(file)
                                    }
                                >
                                    {file.status === "active" ? <Archive size={16} /> : <ArchiveSlash size={16} />}
                                    <span className="tb-body-default-regular">
                                        {file.status === "active" ? "Archive" : "Unarchive"}
                                    </span>
                                </Dropdown.Item>

                                <Dropdown.Item
                                    onClick={() => {
                                        storageHook.onTriggerDelete(file);
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

    async function onDeleteFile(file: any) {
        storageHook.setFileToDelete(file);
        setShowDeleteFileModal(true);
    }

    function handleOnFileChange(file: File[]) {
        setDropZoneErrorMessage("");
        if (!file.length) {
            setDropZoneErrorMessage("Only (png, jpg and pdf) files are accepted");
            return;
        }
        setFile(file);
        setFileName(file[0].name);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");

        if (!insurance.insuranceType) {
            setErrorMessage("Please select a type of insurance.");
            return;
        }

        if (insurance.insuranceType.toLowerCase() === "other" && !insurance.customInsuranceType) {
            setErrorMessage("Please provide your custom insurance type.");
            return;
        }

        if (!insurance.carrier) {
            setErrorMessage("Please add a carrier.");
            return;
        }
        if (!insurance.validFrom) {
            setErrorMessage("Please select an validity start date.");
            return;
        }
        if (!insurance.validTo) {
            setErrorMessage("Please select an validity end date.");
            return;
        }

        const payload = {
            ...insurance,
            reminder: convertDateStringToIsoString(insurance.reminder),
            validTo: convertDateStringToIsoString(insurance.validTo),
            policyFilename: insurance.policy ? fileName || insurance.policy : undefined,
            policy: insurance.policy ? insurance.policy : undefined,
        };

        setIsSubmitting(true);

        if (file?.length) uploadFile(payload);
        if (action === "add" && !file?.length) {
            delete payload.policy;
            addInsurance(payload, { callbackUrl: `/business/insurance` });
        }
        if (action === "edit" && !file?.length) updateInsurance(payload, { callbackUrl: `/business/insurance` });
    }

    async function uploadFile(payload: Partial<InsuranceData>) {
        const filePayload = {
            fileName: file?.length && file[0].name,
            fileType: file?.length && file[0].type,
            reminder: action === "add" ? payload.reminder : payload.reminder,
            expireAt: payload.validTo,
            file: file?.length && file[0],
        } as StartFileUploadPayload;

        try {
            const res: any = await DI.storageService.uploadFile(filePayload);
            setInsurance({ policy: res.file.id });
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (insurance.policy) {
            const payload = {
                ...insurance,
                reminder: convertDateStringToIsoString(insurance.reminder),
                validTo: convertDateStringToIsoString(insurance.validTo),
                policyFilename: fileName,
            };
            if (action === "add" && insurance.policy) addInsurance(payload, { callbackUrl: `/business/insurance` });
            if (action === "edit" && isSubmitting) updateInsurance(payload, { callbackUrl: `/business/insurance` });
        }
    }, [insurance.policy]);

    async function addInsurance(payload: Partial<InsuranceData>, props?: { callbackUrl: string }) {
        delete payload.id;
        try {
            const response = await DI.businessService.addInsurance(user?.companyId, payload);
            setInsurance({ id: response.data.id });
            showToast({ heading: "Success", message: "Insurance added.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function updateInsurance(payload: Partial<InsuranceData>, props?: { callbackUrl: string }) {
        try {
            const response = await DI.businessService.updateInsurance(user?.companyId, insuranceId, payload);

            showToast({ heading: "Success", message: "Insurance updated.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }

            setShowDeleteFileModal(false);
            setIsDeleting(false);
            await getInsurance(insuranceId);

            setShowModal(true);
            setYesDeleteFile(false);
            setFile(undefined);

            if (currentPage(2) === "insurance") {
                setShowFeedbackModal(true);
            }
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function archiveInsurance(payload: any, callbackUrl?: string) {
        payload.status = "archived";
        try {
            const response = await DI.businessService.updateInsurance(user?.companyId, payload.id, payload);
            showToast({ heading: "Success", message: "Insurance archived.", variant: "success" });
            getInsurances(true);
            if (callbackUrl) {
                router.push(callbackUrl);
            }
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    async function unArchiveInsurance(payload: any, callbackUrl?: string) {
        payload.status = "active";
        try {
            const response = await DI.businessService.updateInsurance(user?.companyId, payload.id, payload);
            showToast({ heading: "Success", message: "Insurance unarchived.", variant: "success" });
            getInsurances(true);
            if (callbackUrl) {
                router.push(callbackUrl);
            }
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    async function getInsurance(insuranceId: string) {
        setIsLoading(true);

        try {
            const response = await DI.businessService.getInsurance(user?.companyId, insuranceId);
            setInsurance({
                id: response.data.id,
                insuranceType: stringToSnakeCase(response.data.insuranceType),
                ...response.data,
                policy: response.data.policy,
            });

            response.data.file && setFileName(response.data.file.originalFileName);

            if (response.data.reminder) {
                const reminderTime = getTimeFromTimestamp(response.data.reminder);
                const selectedTime: SelectTimetype = {
                    timeValue: reminderTime,
                    timeString: reminderTime,
                    isPickingtime: true,
                };
                setIsPickingtime(true);
                setSelectedTime(reminderTime);
                setPickedTime(selectedTime);
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    function addFileAgain() {
        if (action === "add") {
            window.location.reload();
        }

        if (action === "edit") {
            setShowModal(false);
        }
    }

    const handleTimeSelection = (params: SelectTimetype) => {
        setIsPickingtime(params?.isPickingtime || false);
        let pickedT = { ...pickedTime };
        const { timeString } = params;
        setSelectedTime(timeString);

        const newTime = addSelectedTimeToDateTime(params, insurance?.reminder);
        setTime(newTime.chosenTime);

        setInsurance({ reminder: convertDateStringToIsoString(newTime.newDateTime) });

        if (params.isPickingtime) {
            pickedT.timeString = newTime.chosenTime;
        } else {
            pickedT.timeString = "Pick a Time";
        }
        setPickedTime(pickedT);
    };

    function currentPageNumber() {
        if (isMobileDevice() || isTabletDevice() || listOrGrid.insurance === "grid") {
            return page;
        }
        return tablePage;
    }

    function increamentPage() {
        if (isMobileDevice() || isTabletDevice() || listOrGrid.insurance === "grid") {
            setPage(page + 1);
            return;
        }
        setTablePage(page + 1);
    }

    function resetPage() {
        setHasMore(true);
        setPage(1);
        setTablePage(1);
        setInsurances([]);
    }

    useEffect(() => {
        if (searchResults) {
            setInsurances([]);
            setPage(1);
        }
    }, [searchResults]);

    useEffect(() => {
        if (!isMobileDevice() && !isTabletDevice() && listOrGrid.insurance === "list") {
            getInsurances();
        }
    }, [tablePage]);

    useEffect(() => {
        resetPage();
        (!currentPage(3) || currentPage(3) === "archived") && getInsurances(true);
    }, [listOrGrid.insurance]);

    useEffect(() => {
        if (!insurances.length && pageReady) {
            getInsurances();
        }
    }, [insurances]);

    function onTablePageChange(page: number) {
        setTablePage(page);
    }

    async function handleSubmitPolicy(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");

        if (!file && action === "add") {
            setErrorMessage("Please select a file.");
            return;
        }

        if (!fileName) {
            setErrorMessage("Please add a file name.");
            return;
        }

        setIsSubmitting(true);

        if (action === "edit") {
            updatePolicyFile();
        }

        if (file?.length) uploadPolicyFile();
    }

    async function updatePolicyFile() {
        const file = storageHook.storageFile;
        try {
            const res = await storageHook.updateFile({ id: file?.id, originalFileName: fileName });
            setIsSubmitting(false);
            setShowFeedbackModal(true);
        } catch (error) {}
    }

    async function deletePolicyFile() {
        try {
            const res = await storageHook.onDelete();
        } catch (error) {}
    }

    async function archivePolicyFile(file: StorageFile) {
        try {
            const res = await storageHook.updateFile({ id: file?.id, status: "archived" });
            getInsurance(insuranceId);
        } catch (error) {}
    }
    async function activatePolicyFile(file: StorageFile) {
        try {
            const res = await storageHook.updateFile({ id: file?.id, status: "active" });
            getInsurance(insuranceId);
        } catch (error) {}
    }

    async function uploadPolicyFile() {
        const filePayload = {
            fileName: fileName,
            fileType: file?.length && file[0].type,
            file: file?.length && file[0],
        } as StartFileUploadPayload;

        try {
            const res: any = await DI.storageService.uploadFile(filePayload);
            setNewPolicy(res.file.id);
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (newPolicy) {
            const additionalAttachments: any = [
                {
                    operation: "add",
                    files: [newPolicy],
                },
            ];

            const payload = {
                additionalAttachments,
            };

            updateInsurance(payload);
        }
    }, [newPolicy]);

    function insurancePolicyFiles(status: string) {
        const pFiles = insurance?.allAttachments?.filter((file: StorageFile) => file.status === status) ?? [];

        if (insurance.file && status === "active") {
            pFiles?.unshift(insurance.file as StorageFile);
        }
        return pFiles;
    }

    return {
        user,
        insuranceId,
        setInsuranceId,
        isLoading,
        setIsLoading,
        isSubmitting,
        setIsSubmitting,
        isDeleting,
        setIsDeleting,
        showModal,
        setShowModal,
        errorMessage,
        setErrorMessage,
        feedbackMessage,
        setFeedbackMessage,
        dropZoneErrorMessage,
        setDropZoneErrorMessage,
        file,
        setFile,
        fileToDelete,
        setFileToDelete,
        yesDeleteFile,
        setYesDeleteFile,
        showDeleteFileModal,
        setShowDeleteFileModal,
        insurance,
        setInsurance,
        acceptedFiles,
        insurances,
        setInsurances,
        insuranceToDelete,
        setInsuranceToDelete,
        onDeleteFile,
        handleOnFileChange,
        handleSubmit,
        uploadFile,
        addInsurance,
        updateInsurance,
        getInsurance,
        addFileAgain,
        deleteInsurance,
        tableColumns,
        getInsurances,
        handleTimeSelection,
        selectedTime,
        time,
        setTime,
        isPickingtime,
        setIsPickingtime,
        pickedTime,
        setPickedTime,
        showTimePickerModal,
        setShowTimePickerModal,
        listOrGrid,
        searchResults,
        setPageReady,
        totalRows,
        onTablePageChange,
        hasMore,
        init,
        isSearching,
        search,
        router,
        viewDocumentFile: storageHook.viewDocumentFile,
        insurancePoliciesTable,
        storageHook,
        fileName,
        setFileName,
        handleSubmitPolicy,
        insurancePolicyFiles,
        showFeedbackModal,
        setShowFeedbackModal,
        archivePolicyFile,
        activatePolicyFile,
        deletePolicyFile,
        showToast,
        archiveInsurance,
        unArchiveInsurance,
        filteredInsurances,
        status,
        setStatus,
    };
};

export default useInsurance;
