import { useSelector, useDispatch } from "react-redux";
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
import useStorage from "./useStorage";
import useSearchForm from "./searchForm";
import useFavorites from "./favorites";
import { useRouter } from "next/router";
import { useToast } from "@/context/ToastContext";
import {
    setUserId,
    setInsurances,
    appendInsurances,
    setInsurancesLoading,
    setSilentlyFetching,
    resetInsurances,
    updateInsurance as updateInsuranceInStore,
    deleteInsurance as deleteInsuranceFromStore,
    moveInsurance,
    setInsuranceDetails,
    clearInsuranceDetails,
} from "@/store/insurance-reducer";

const CACHE_EXPIRATION = 3 * 1000;

interface InsurancesLocalState {
    isInitialLoading: boolean;
    page: number;
    hasMore: boolean;
}

interface FetchInsurancesOptions {
    resetData?: boolean;
    pageNumber?: number;
}

const INITIAL_STATE: InsurancesLocalState = {
    isInitialLoading: false,
    page: 1,
    hasMore: true,
};

const useInsurance = (action?: string) => {
    const router = useRouter();
    const reduxDispatch = useDispatch();
    const storageHook = useStorage({});
    const { user } = useSelector((state: RootState) => state.account);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { search, isSearching } = useSearchForm();
    const { viewDocumentFile } = useStorage({});
    const { showToast } = useToast();
    const { addToFavorites } = useFavorites();
    const { removeFavoriteById } = useFavorites();

    const currentStatus = location.pathname.split("/")[3] || "active";

    const { activeInsurances, archivedInsurances, isSilentlyFetching, userId, insuranceDetails } = useSelector(
        (state: RootState) => state.insurances,
    );

    const insurancesData = currentStatus === "active" ? activeInsurances : archivedInsurances;

    const [localState, setLocalState] = useReducer(
        (state: InsurancesLocalState, newState: Partial<InsurancesLocalState>) => ({ ...state, ...newState }),
        INITIAL_STATE,
    );

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [insuranceToDelete, setInsuranceToDelete] = useState<Partial<InsuranceData>>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [fileToDelete, setFileToDelete] = useState<Partial<StorageFile>>();
    const [showDeleteFileModal, setShowDeleteFileModal] = useState<boolean>(false);
    const [insuranceId, setInsuranceId] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
    const [newPolicy, setNewPolicy] = useState<string>("");
    const [status, setStatus] = useState<string>("active");
    const [pageReady, setPageReady] = useState<boolean>(false);
    const [tablePage, setTablePage] = useState<number>(1);
    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");
    const [file, setFile] = useState<File[]>();
    const [yesDeleteFile, setYesDeleteFile] = useState<boolean>(false);

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

    useEffect(() => {
        if (user?.id && user.id !== userId) {
            //@ts-ignore
            reduxDispatch(setUserId(user.id));
        }
    }, [user?.id, userId, reduxDispatch]);

    const fetchInsurances = async (options: FetchInsurancesOptions = {}) => {
        const { resetData = false, pageNumber } = options;
        const currentPageNumber = pageNumber !== undefined ? pageNumber : resetData ? 1 : localState.page;

        if ((resetData || !insurancesData.data.length) && !insurancesData.lastFetched) {
            reduxDispatch(setInsurancesLoading({ status: currentStatus, loading: true }));
            setLocalState({ isInitialLoading: true });
        } else {
            reduxDispatch(setSilentlyFetching(true));
        }

        try {
            const response = await DI.businessService.getInsurances(user?.companyId, currentPageNumber, currentStatus);

            if (resetData || currentPageNumber === 1) {
                reduxDispatch(
                    setInsurances({
                        status: currentStatus,
                        data: response.data.results,
                        count: response.data.count,
                        next: response.data.next,
                    }),
                );
            } else {
                reduxDispatch(
                    appendInsurances({
                        status: currentStatus,
                        data: response.data.results,
                        next: response.data.next,
                    }),
                );
            }

            const newPage = response.data.next ? (resetData ? 2 : currentPageNumber + 1) : currentPageNumber;

            setLocalState({
                hasMore: response.data.next !== null,
                page: newPage,
                isInitialLoading: false,
            });

            setPageReady(true);
        } catch (error) {
            setLocalState({ hasMore: false });
        } finally {
            reduxDispatch(setInsurancesLoading({ status: currentStatus, loading: false }));
            reduxDispatch(setSilentlyFetching(false));
            setLocalState({ isInitialLoading: false });
        }
    };

    const loadMoreInsurances = async () => {
        if (!localState.hasMore || insurancesData.loading || isSilentlyFetching) return;
        await fetchInsurances({ resetData: false });
    };

    const setPage = (page: number) => {
        setLocalState({ page });
        fetchInsurances({ resetData: false, pageNumber: page });
    };

    function init() {
        const urlQuery = getUrlQuery("query");
        if (urlQuery) {
            search({ query: urlQuery, categories: ["insurances"] });
            setPageReady(true);
            return;
        }

        setPageReady(true);
    }

    async function deleteInsurance() {
        setIsDeleting(true);
        try {
            const response = await DI.businessService.deleteInsurance(user?.companyId, insuranceToDelete?.id);

            reduxDispatch(deleteInsuranceFromStore(insuranceToDelete?.id!));

            if (insuranceToDelete?.id) {
                clearInsuranceCache(insuranceToDelete.id);
            }

            setShowModal(false);
            setIsDeleting(false);
            showToast({ heading: "Success", message: "Insurance deleted successfully", variant: "success" });
        } catch (error) {
            setIsDeleting(false);
            showToast({ heading: "Error", message: "Failed to delete insurance", variant: "danger" });
        }
    }

    const insurances = insurancesData.data;
    const isLoading = insurancesData.loading;
    const totalRows = insurancesData.count;
    const hasMore = localState.hasMore;

    function filteredInsurances(stat: string) {
        if (!insurances.length) return [];
        return !stat ? insurances : insurances.filter(insurance => insurance.status === stat);
    }

    function onAddtoFavorites(file: any) {
        const fileId = file?.objectId;

        if (!fileId) {
            showToast({ heading: "Error", message: "File ID not found.", variant: "danger" });
            return;
        }

        let payload = {
            objectId: fileId,
            createdBy: user?.id,
            company: user?.companyId,
            objectType: "storage",
        };

        addToFavorites(payload);
    }

    function onRemoveFromFavorites(file: any) {
        console.log("onRemoveFromFavorites called with file:", file);

        const favoriteId = file?.favoriteId || file?.favorite?.id || file?.inFavorite?.id;

        if (!favoriteId) {
            showToast({
                heading: "Error",
                message: "Unable to remove from favorites. Favorite ID not found.",
                variant: "danger",
            });
            return;
        }

        removeFavoriteById(favoriteId);
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
            if (action === "add" && insurance.policy) addInsurance(payload);
            if (action === "edit" && isSubmitting) updateInsurance(payload);
        }
    }, [insurance.policy]);

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

    async function addInsurance(payload: Partial<InsuranceData>) {
        delete payload.id;
        try {
            const response = await DI.businessService.addInsurance(user?.companyId, payload);

            reduxDispatch(setInsuranceDetails({ insuranceId: response.data.id, data: response.data }));

            showToast({
                heading: "Success",
                message: "Insurance added successfully",
                variant: "success",
            });
            router.push(`/business/insurance`);
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function updateInsurance(payload: Partial<InsuranceData>, props?: { callbackUrl: string }) {
        try {
            const response = await DI.businessService.updateInsurance(user?.companyId, insuranceId, payload);

            reduxDispatch(updateInsuranceInStore(response.data));

            reduxDispatch(setInsuranceDetails({ insuranceId: insuranceId, data: response.data }));

            showToast({
                heading: "Success",
                message: "Insurance updated successfully",
                variant: "success",
            });

            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
                return;
            }

            setShowDeleteFileModal(false);
            setIsDeleting(false);

            await getInsurance(insuranceId, true);

            setShowModal(true);
            setYesDeleteFile(false);
            setFile(undefined);

            if (currentPage(2) === "insurance") {
                setShowFeedbackModal(true);
            }
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    function clearInsuranceCache(insuranceId: string) {
        reduxDispatch(clearInsuranceDetails(insuranceId));
    }

    async function getInsurance(insuranceId: string, forceRefresh = false) {
        const cachedInsurance = insuranceDetails[insuranceId];
        const isDataStale = cachedInsurance?.lastFetched && Date.now() - cachedInsurance.lastFetched > CACHE_EXPIRATION;

        if (cachedInsurance && !forceRefresh && !isDataStale) {
            setInsurance({
                id: cachedInsurance.data.id,
                ...cachedInsurance.data,
                insuranceType: stringToSnakeCase(cachedInsurance.data.insuranceType),
                policy: cachedInsurance.data.policy,
            });
            //@ts-ignore
            cachedInsurance.data.file ? setFileName(cachedInsurance.data.file.originalFileName) : null;

            if (cachedInsurance.data.reminder) {
                const reminderTime = getTimeFromTimestamp(cachedInsurance.data.reminder);
                const selectedTime: SelectTimetype = {
                    timeValue: reminderTime,
                    timeString: reminderTime,
                    isPickingtime: true,
                };
                setIsPickingtime(true);
                setSelectedTime(reminderTime);
                setPickedTime(selectedTime);
            }
            return;
        }

        setLocalState({ isInitialLoading: true });
        try {
            const response = await DI.businessService.getInsurance(user?.companyId, insuranceId);

            reduxDispatch(setInsuranceDetails({ insuranceId, data: response.data }));

            setInsurance({
                id: response.data.id,
                ...response.data,
                insuranceType: stringToSnakeCase(response.data.insuranceType),
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
            showToast({ heading: "Error", message: "Failed to fetch insurance", variant: "danger" });
        } finally {
            setLocalState({ isInitialLoading: false });
        }
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
            addInsurance(payload);
        }
        if (action === "edit" && !file?.length) updateInsurance(payload, { callbackUrl: `/business/insurance` });
    }

    async function archiveInsurance(payload: any, callbackUrl?: string) {
        const updatedPayload = { ...payload, status: "archived" };

        try {
            const response = await DI.businessService.updateInsurance(
                user?.companyId,
                updatedPayload.id,
                updatedPayload,
            );

            reduxDispatch(
                moveInsurance({ insuranceId: updatedPayload.id, fromStatus: "active", toStatus: "archived" }),
            );

            reduxDispatch(setInsuranceDetails({ insuranceId: updatedPayload.id, data: response.data }));

            showToast({ heading: "Success", message: "Insurance archived.", variant: "success" });

            if (callbackUrl) {
                router.push(callbackUrl);
            }
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    async function unArchiveInsurance(payload: any, callbackUrl?: string) {
        const updatedPayload = { ...payload, status: "active" };

        try {
            const response = await DI.businessService.updateInsurance(
                user?.companyId,
                updatedPayload.id,
                updatedPayload,
            );

            reduxDispatch(
                moveInsurance({ insuranceId: updatedPayload.id, fromStatus: "archived", toStatus: "active" }),
            );

            reduxDispatch(setInsuranceDetails({ insuranceId: updatedPayload.id, data: response.data }));

            showToast({ heading: "Success", message: "Insurance unarchived.", variant: "success" });

            if (callbackUrl) {
                router.push(callbackUrl);
            }
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
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

    function onTablePageChange(page: number) {
        setTablePage(page);
        fetchInsurances({ resetData: false, pageNumber: page });
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

        if (action === "edit" && file?.length) {
            Promise.all([
                updateInsuranceFile({ callbackUrl: `/business/insurance/${insuranceId}` }),
                updateInsuranceFileData({ callbackUrl: `/business/insurance/${insuranceId}` }),
            ]).catch(error => {
                console.error("Error during file update:", error);
            });
        } else if (action === "add" && file?.length) {
            uploadPolicyFile();
        }
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

    async function onDeleteFile(file: any) {
        storageHook.setFileToDelete(file);
        setShowDeleteFileModal(true);
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
                                setLocalState({ isInitialLoading: true });
                                storageHook.viewDocumentFile(file);
                                setTimeout(() => {
                                    setLocalState({ isInitialLoading: false });
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

    async function updateInsuranceFile(props?: { callbackUrl: string }) {
        const fileId = router.query.fileId || storageHook.storageFile?.id;

        if (!fileId) {
            showToast({ heading: "Error", message: "File ID not found.", variant: "danger" });
            setIsSubmitting(false);
            return;
        }

        if (!file || !file.length) {
            showToast({ heading: "Error", message: "No file selected.", variant: "danger" });
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await storageHook.updateFile({
                //@ts-ignore
                id: fileId,
                file: file[0],
            });

            showToast({ heading: "Success", message: "File updated.", variant: "success" });

            await getInsurance(insuranceId, true);

            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error) {
            console.error("Update file error:", error);
            showToast({ heading: "Error", message: "Failed to update file.", variant: "warning" });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function updateInsuranceFileData(props?: { callbackUrl: string }) {
        const fileId = router.query.fileId || storageHook.storageFile?.id;

        if (!fileId) {
            showToast({ heading: "Error", message: "File ID not found.", variant: "danger" });
            setIsSubmitting(false);
            return;
        }

        const payload = {
            id: fileId,
            originalFileName: fileName,
            fileName: fileName,
            fileType: file?.[0]?.type || storageHook.storageFile?.fileType,
            reminder: convertDateStringToIsoString(insurance.reminder),
            expireAt: convertDateStringToIsoString(insurance.validTo),
        };

        try {
            //@ts-ignore
            const res = await storageHook.updateFileData(payload, props);

            showToast({ heading: "Success", message: "File details updated.", variant: "success" });

            await getInsurance(insuranceId, true);

            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error) {
            console.error("Update file data error:", error);
            showToast({ heading: "Error", message: "Failed to update file details.", variant: "warning" });
        } finally {
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

    function currentPageNumber() {
        if (isMobileDevice() || isTabletDevice() || listOrGrid.insurance === "grid") {
            return localState.page;
        }
        return tablePage;
    }

    function increamentPage() {
        if (isMobileDevice() || isTabletDevice() || listOrGrid.insurance === "grid") {
            setLocalState({ page: localState.page + 1 });
            return;
        }
        setTablePage(tablePage + 1);
    }

    function resetPage() {
        setLocalState({ hasMore: true, page: 1 });
        setTablePage(1);
    }

    useEffect(() => {
        setLocalState({ page: 1 });
    }, [currentStatus]);

    useEffect(() => {
        if (insurancesData.data.length > 0) {
            setLocalState({ isInitialLoading: false });
            setPageReady(true);
            const isDataStale =
                insurancesData.lastFetched && Date.now() - insurancesData.lastFetched > CACHE_EXPIRATION;
            if (isDataStale) {
                fetchInsurances({ resetData: true });
            }
        } else {
            setLocalState({ isInitialLoading: true });
            fetchInsurances({ resetData: true });
        }
    }, [currentStatus, user?.companyId]);

    useEffect(() => {
        if (searchResults) {
            setLocalState({ page: 1 });
        }
    }, [searchResults]);

    useEffect(() => {
        if (!isMobileDevice() && !isTabletDevice() && listOrGrid.insurance === "list") {
            fetchInsurances();
        }
    }, [tablePage]);

    useEffect(() => {
        resetPage();
        (!currentPage(3) || currentPage(3) === "archived") && fetchInsurances({ resetData: true });
    }, [listOrGrid.insurance]);

    useEffect(() => {
        if (!insurances.length && pageReady) {
            fetchInsurances();
        }
    }, [insurances]);

    useEffect(() => {
        init();
    }, []);

    return {
        user,
        insuranceId,
        setInsuranceId,
        isLoading: localState.isInitialLoading,
        setIsLoading: (loading: boolean) => setLocalState({ isInitialLoading: loading }),
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
        insuranceToDelete,
        setInsuranceToDelete,
        onDeleteFile,
        handleOnFileChange,
        handleSubmit,
        uploadFile,
        addInsurance,
        updateInsurance,
        getInsurance,
        clearInsuranceCache,
        addFileAgain,
        deleteInsurance,
        tableColumns,
        fetchInsurances,
        loadMoreInsurances,
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
        updateInsuranceFile,
        updateInsuranceFileData,
        onAddtoFavorites,
        onRemoveFromFavorites,
        setPage,
        currentPageNumber,
        increamentPage,
        resetPage,
        isSilentlyFetching,
        isInitialLoading: localState.isInitialLoading,
        addToFavorites: onAddtoFavorites,
        removeFromFavorites: onRemoveFromFavorites,
    };
};

export default useInsurance;
