import { LicenseData } from "@/repositories/business-repository";
import { useEffect, useReducer, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Iconly } from "react-iconly";
import { MoreHorizontal, MoreVertical } from "react-feather";
import DI from "@/di-container";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import {
    setLicenses,
    appendLicenses,
    setLicensesLoading,
    setSilentlyFetching,
    updateLicense as updateLicenseInStore,
    deleteLicense as deleteLicenseFromStore,
    moveLicense,
    setUserId,
    setLicenseDetails,
    clearLicenseDetails,
} from "@/store/license-reducer";
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
} from "@/helpers";
import { useRouter } from "next/router";
import { Archive, ArchiveAdd, ArchiveMinus, ArchiveSlash, Edit2, ExportSquare, Trash } from "iconsax-react";
import { SelectTimetype } from "@/components/TimeSelector";
import useSearchForm from "./searchForm";
import useStorage from "./useStorage";
import { StartFileUploadPayload, StorageFile } from "@/repositories/storage-repository";
import { Accept } from "react-dropzone";
import PdfIcon from "@/components/icons/PdfIcon";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";
import useFavorites from "./useFavorites";

const CACHE_EXPIRATION = 5 * 1000;

interface LicensesLocalState {
    isInitialLoading: boolean;
    page: number;
    hasMore: boolean;
}

interface FetchLicensesOptions {
    resetData?: boolean;
    pageNumber?: number;
}

const INITIAL_STATE: LicensesLocalState = {
    isInitialLoading: false,
    page: 1,
    hasMore: true,
};

const useLicense = (action?: string) => {
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

    const { activeLicenses, archivedLicenses, isSilentlyFetching, userId, licenseDetails } = useSelector(
        (state: RootState) => state.licenses,
    );

    const licensesData = currentStatus === "active" ? activeLicenses : archivedLicenses;

    const [localState, setLocalState] = useReducer(
        (state: LicensesLocalState, newState: Partial<LicensesLocalState>) => ({ ...state, ...newState }),
        INITIAL_STATE,
    );

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [licenseToDelete, setLicenseToDelete] = useState<Partial<LicenseData>>();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [fileToDelete, setFileToDelete] = useState<Partial<StorageFile>>();
    const [showDeleteFileModal, setShowDeleteFileModal] = useState<boolean>(false);
    const [licenseId, setLicenseId] = useState<string>("");
    const [fileName, setFileName] = useState<string>("");
    const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
    const [newFile, setNewFile] = useState<string>("");
    const [status, setStatus] = useState<string>("active");
    const [pageReady, setPageReady] = useState<boolean>(false);
    const [tablePage, setTablePage] = useState<number>(1);

    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");

    const [license, setLicense] = useReducer(
        (state: any, newState: Partial<LicenseData>) => ({ ...state, ...newState }),
        {
            id: "",
            name: "",
            firstName: "",
            lastName: "",
            licenseType: "",
            licenseNumber: "",
            validFrom: "",
            validTo: "",
            reminder: "",
            customLicenseType: "",
            attachment: "",
            file: null,
        },
    );

    const [showTimePickerModal, setShowTimePickerModal] = useState<boolean>(false);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [isPickingtime, setIsPickingtime] = useState<boolean>(false);
    const [pickedTime, setPickedTime] = useState<SelectTimetype>({
        timeString: "Pick a Time",
        timeValue: 0,
        isPickingtime: true,
    });
    const [file, setFile] = useState<File[]>();

    useEffect(() => {
        if (user?.id && user.id !== userId) {
            // @ts-ignore
            reduxDispatch(setUserId(user.id));
        }
    }, [user?.id, userId, reduxDispatch]);

    const fetchLicenses = async (options: FetchLicensesOptions = {}) => {
        const { resetData = false, pageNumber } = options;
        const currentPageNumber = pageNumber !== undefined ? pageNumber : resetData ? 1 : localState.page;

        // Show loading state if there's no data available
        if ((resetData || !licensesData.data.length) && !licensesData.lastFetched) {
            reduxDispatch(setLicensesLoading({ status: currentStatus, loading: true }));
            setLocalState({ isInitialLoading: true });
        } else {
            reduxDispatch(setSilentlyFetching(true));
        }

        try {
            const response = await DI.businessService.getLicenses(user?.companyId, currentPageNumber, currentStatus);

            if (resetData || currentPageNumber === 1) {
                reduxDispatch(
                    setLicenses({
                        status: currentStatus,
                        data: response.data.results,
                        count: response.data.count,
                        next: response.data.next,
                    }),
                );
            } else {
                reduxDispatch(
                    appendLicenses({
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
            reduxDispatch(setLicensesLoading({ status: currentStatus, loading: false }));
            reduxDispatch(setSilentlyFetching(false));
            setLocalState({ isInitialLoading: false });
        }
    };

    const loadMoreLicenses = async () => {
        if (!localState.hasMore || licensesData.loading || isSilentlyFetching) return;
        await fetchLicenses({ resetData: false });
    };

    const setPage = (page: number) => {
        setLocalState({ page });
        fetchLicenses({ resetData: false, pageNumber: page });
    };

    function init() {
        const urlQuery = getUrlQuery("query");
        if (urlQuery) {
            search({ query: urlQuery, categories: ["licenses"] });
            setPageReady(true);
            return;
        }

        setPageReady(true);
    }

    async function deleteLicense() {
        setIsDeleting(true);
        try {
            const response = await DI.businessService.deleteLicense(user?.companyId, licenseToDelete?.id);
            reduxDispatch(deleteLicenseFromStore(licenseToDelete?.id!));
            setShowModal(false);
            setIsDeleting(false);
            showToast({ heading: "Success", message: "License deleted successfully", variant: "success" });
        } catch (error) {
            setIsDeleting(false);
            showToast({ heading: "Error", message: "Failed to delete license", variant: "danger" });
        }
    }

    const licenses = licensesData.data;
    const isLoading = licensesData.loading;
    const totalRows = licensesData.count;
    const hasMore = localState.hasMore;

    function filteredLicenses(stat: string) {
        if (!licenses.length) return [];
        return !stat ? licenses : licenses.filter(license => license.status === stat);
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
    function tableColumns() {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Name</span>,
                cell: (row: Partial<LicenseData>) => (
                    <span className="text-muted text-capitalize rowclick" data-label="License">{`${row.name}`}</span>
                ),
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Type</span>,
                cell: (row: Partial<LicenseData>) => (
                    <span className="text-muted text-capitalize rowclick" data-label="Type">
                        {snakeCaseToSentenceCase(row.licenseType)}
                    </span>
                ),
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Number</span>,
                cell: (row: Partial<LicenseData>) => (
                    <span className="text-muted rowclick" data-label="Number">
                        {row.licenseNumber}
                    </span>
                ),
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Period</span>,
                cell: (row: Partial<LicenseData>) => (
                    <span className="text-muted rowclick" data-label="Period">
                        {`${formatDatetime(row.validFrom)} - ${formatDatetime(row.validTo)}`}
                    </span>
                ),
                grow: 1,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Notification</span>,
                cell: (row: Partial<LicenseData>) => (
                    <span className="text-muted rowclick" data-label="Period">
                        {`${formatDatetime(row.reminder)}`}
                    </span>
                ),
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Attachment</span>,
                cell: (row: Partial<LicenseData>) => (
                    <>
                        {row?.file?.file ? (
                            <span className="text-blue-900 text-decoration-none text-capitalize truncate-1m d-flex align-items-end">
                                <span
                                    className="object-fit-cover flex-shrink-0 rowclick"
                                    style={{ width: "24px", height: "24px" }}
                                >
                                    {row?.file?.thumbnail ? (
                                        <Image
                                            src={row?.file?.thumbnail}
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
                                    title={`${row?.file?.originalFileName}`}
                                    href={"javascript:void(0)"}
                                    className="ms-2 text-blue-800 truncate-1 offset text-decoration-none accordion tb-body-default-medium"
                                    onClick={() => {
                                        viewDocumentFile(row?.file);
                                    }}
                                >
                                    {`${row?.file?.originalFileName}`}
                                </Link>
                            </span>
                        ) : (
                            "-"
                        )}
                    </>
                ),
                grow: 1.5,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize ms-auto">Action</span>,
                grow: 0.1,
                cell: (row: Partial<LicenseData>, index: number) => (
                    <Dropdown className="w-100 ms-auto bg-transparent" drop={licenses.length <= 2 ? "start" : "down"}>
                        <Dropdown.Toggle
                            size="sm"
                            variant="default"
                            className="btn-square float-end bg-transparent"
                            id="dropdown-basic"
                        >
                            <MoreVertical size={24} />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align={`end`}>
                            <Dropdown.Item href={`/business/license/edit/${row.id}`}>
                                <Edit2 size={16} className="" />
                                <span className="tb-body-default-regular">Update</span>
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => (row.status === "active" ? archiveLicense(row) : unArchiveLicense(row))}
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
                                    setLicenseToDelete(row);
                                    setShowModal(true);
                                }}
                            >
                                <Trash size={16} color="#E70000" className="" />
                                <span className="text-danger tb-body-default-regular text-danger">Delete</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                ),
            },
        ];
    }

    const licenseFilesTable = () => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">File Name </span>,
                cell: (file: Partial<StorageFile>) => (
                    <span
                        onClick={() => {
                            storageHook.viewDocumentFile(file);
                        }}
                        className="rowclick"
                    >
                        {file?.originalFileName}
                    </span>
                ),
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Attachment</span>,
                cell: (file: Partial<StorageFile>) => (
                    <span className="text-muted text-capitalize truncate-1m d-flex align-items-end">
                        <span
                            className="object-fit-cover flex-shrink-0 rowclick"
                            style={{ width: "24px", height: "24px" }}
                        >
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
                            className="ms-2 text-blue-800 truncate-1 text-decoration-none offset"
                            onClick={() => {
                                storageHook.viewDocumentFile(file);
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
                        <Dropdown className="w-100 justify-content-end" drop={licenses.length <= 2 ? "start" : "down"}>
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square bordere-0"
                                id="dropdown-basic"
                            >
                                <MoreVertical size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item href={`/business/license/${licenseId}?action=edit&fileId=${file.id}`}>
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    onClick={() =>
                                        file.status === "active" ? archiveLicenseFile(file) : activateLicenseFile(file)
                                    }
                                >
                                    {file.status === "active" ? <ArchiveAdd size={16} /> : <ArchiveMinus size={16} />}
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

    function handleAddAgain() {
        if (action === "add") {
            window.location.reload();
        }
        if (action === "edit") {
            setShowModal(false);
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage("");

        if (!license.licenseType) {
            setErrorMessage("Please select a license type");
            return;
        }

        if (license?.licenseType?.toLowerCase() === "other" && !license.customLicenseType) {
            setErrorMessage("Please enter a custom license type");
            return;
        }

        if (!license.name) {
            setErrorMessage("Please enter your license name");
            return;
        }
        if (!license.licenseNumber) {
            setErrorMessage("Please enter the license number");
            return;
        }
        if (!license.validFrom) {
            setErrorMessage("Please select the validity start date");
            return;
        }
        if (!license.validTo) {
            setErrorMessage("Please select the validity end date");
            return;
        }
        if (!license.reminder) {
            setErrorMessage("Please select a reminder date");
            return;
        }

        const payload = {
            ...license,
            reminder: convertDateStringToIsoString(license.reminder),
            validTo: convertDateStringToIsoString(license.validTo),
            attachmentFilename: license.file ? fileName : undefined,
        };

        setIsSubmitting(true);

        if (file?.length) uploadFile(payload);
        if (action === "add" && !file?.length) {
            delete payload.attachment;
            addLicense(payload);
        }
        if (action === "edit" && !file?.length) {
            if (payload.file) {
                payload.attachmentFilename = fileName;
            }
            updateLicense(payload);
        }
    }

    async function uploadFile(payload: Partial<LicenseData>) {
        const filePayload = {
            fileName: fileName || (file?.length && file[0].name),
            fileType: file?.length && file[0].type,
            reminder: action === "add" ? payload.reminder : payload.reminder,
            expireAt: payload.validTo,
            file: file?.length && file[0],
        } as StartFileUploadPayload;

        try {
            const res: any = await DI.storageService.uploadFile(filePayload);
            setLicense({ attachment: res.file.id });
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        if (license.attachment) {
            const payload = {
                ...license,
                reminder: action === "add" ? convertDateStringToIsoString(license.reminder) : license.reminder,
                validTo: convertDateStringToIsoString(license.validTo),
                attachmentFilename: fileName,
            };
            if (action === "add" && license.attachment) addLicense(payload);
            if (action === "edit" && isSubmitting) updateLicense(payload);
        }
    }, [license.attachment]);

    async function addLicense(payload: LicenseData) {
        delete payload.id;
        try {
            const response = await DI.businessService.addLicense(user?.companyId, payload);

            reduxDispatch(setLicenseDetails({ licenseId: response.data.id, data: response.data }));

            showToast({
                heading: "License added successfully",
                message: "License added successfully",
                variant: "success",
            });
            router.push(`/business/license`);
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function updateLicense(payload: LicenseData, callbackUrl?: string) {
        if (!file?.length) {
            delete payload.attachment;
        }
        try {
            const response = await DI.businessService.updateLicense(user?.companyId, license.id, payload);
            reduxDispatch(updateLicenseInStore(response.data));

            reduxDispatch(setLicenseDetails({ licenseId: license.id, data: response.data }));

            showToast({
                heading: "License updated",
                message: "Your changes have been saved successfully.",
                variant: "success",
            });
            if (callbackUrl) {
                router.push(callbackUrl);
                return;
            }
            router.push(`/business/license`);
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function archiveLicense(payload: any) {
        const updatedPayload = { ...payload, status: "archived" };
        try {
            const response = await DI.businessService.updateLicense(user?.companyId, payload.id, updatedPayload);
            reduxDispatch(
                moveLicense({
                    licenseId: payload.id,
                    fromStatus: "active",
                    toStatus: "archived",
                }),
            );

            if (licenseDetails[payload.id]) {
                reduxDispatch(setLicenseDetails({ licenseId: payload.id, data: response.data }));
            }

            showToast({ heading: "Success", message: "License archived.", variant: "success" });
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    async function unArchiveLicense(payload: any) {
        const updatedPayload = { ...payload, status: "active" };
        try {
            const response = await DI.businessService.updateLicense(user?.companyId, payload.id, updatedPayload);
            reduxDispatch(
                moveLicense({
                    licenseId: payload.id,
                    fromStatus: "archived",
                    toStatus: "active",
                }),
            );

            if (licenseDetails[payload.id]) {
                reduxDispatch(setLicenseDetails({ licenseId: payload.id, data: response.data }));
            }

            showToast({ heading: "Success", message: "License unarchived.", variant: "success" });
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    function clearLicenseCache(licenseId: string) {
        reduxDispatch(clearLicenseDetails(licenseId));
    }

    async function getLicense(licenseId: string, forceRefresh = false) {
        const cachedLicense = licenseDetails[licenseId];
        const isDataStale = cachedLicense?.lastFetched && Date.now() - cachedLicense.lastFetched > CACHE_EXPIRATION;

        if (cachedLicense && !forceRefresh && !isDataStale) {
            setLicense(cachedLicense.data);
            cachedLicense.data.file ? setFileName(cachedLicense.data.file.originalFileName) : null;

            if (cachedLicense.data.reminder) {
                const reminderTime = getTimeFromTimestamp(cachedLicense.data.reminder);
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
            const res = await DI.businessService.getLicense(user?.companyId, licenseId);

            reduxDispatch(setLicenseDetails({ licenseId, data: res.data }));

            setLicense(res.data);
            res.data.file ? setFileName(res.data.file.originalFileName) : null;

            if (res.data.reminder) {
                const reminderTime = getTimeFromTimestamp(res.data.reminder);
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
            showToast({ heading: "Error", message: "Failed to fetch license", variant: "danger" });
        } finally {
            setLocalState({ isInitialLoading: false });
        }
    }

    const handleTimeSelection = (params: SelectTimetype) => {
        setIsPickingtime(params?.isPickingtime || false);
        let pickedT = { ...pickedTime };

        const { timeString } = params;

        setSelectedTime(timeString);
        const newTime = addSelectedTimeToDateTime(params, license.reminder);
        setTime(newTime.chosenTime);

        setLicense({ reminder: newTime.newDateTime });

        if (params.isPickingtime) {
            pickedT.timeString = newTime.chosenTime;
        } else {
            pickedT.timeString = "Pick a Time";
        }
        setPickedTime(pickedT);
    };

    async function onDeleteFile(file: Partial<StorageFile> | undefined) {
        setLicense({ file: null });
        setFileName("");
    }

    const acceptedFiles: Accept = {
        "image/png": [".png", ".jpeg", ".jpg"],
        "application/pdf": [".pdf"],
    };

    function handleOnFileChange(file: File[]) {
        setDropZoneErrorMessage("");
        if (!file.length) {
            setDropZoneErrorMessage("Only (png, jpg and pdf) files are accepted");
            return;
        }
        setFile(file);
        setFileName(file[0].name);
    }

    function onTablePageChange(page: number) {
        setTablePage(page);
        setPage(page);
    }

    async function handleSubmitLicenseFile(event: React.FormEvent<HTMLFormElement>) {
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
                updateLicenseFile({ callbackUrl: `/business/license/${licenseId}` }),
                updateLicenseFileData({ callbackUrl: `/business/license/${licenseId}` }),
            ]).catch(error => {
                console.error("Error during file update:", error);
            });
        } else if (action === "add" && file?.length) uploadLicenseFile();
    }

    async function updateLicenseFile(props?: { callbackUrl: string }) {
        // Get the file ID from the router query params or storage hook
        const fileId = router.query.fileId || storageHook.storageFile?.id;

        if (!fileId) {
            showToast({ heading: "Error", message: "File ID not found.", variant: "danger" });
            setIsSubmitting(false);
            return;
        }

        // Check if we have a new file to upload
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

    async function updateLicenseFileData(props?: { callbackUrl: string }) {
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
            reminder: convertDateStringToIsoString(license.reminder),
            expireAt: convertDateStringToIsoString(license.validTo),
        };

        try {
            //@ts-ignore
            const res = await storageHook.updateFileData(payload, props);
            showToast({ heading: "Success", message: "File details updated.", variant: "success" });
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

    async function deleteLicenseFile() {
        try {
            const res = await storageHook.onDelete();
        } catch (error) {}
    }

    async function archiveLicenseFile(file: StorageFile) {
        try {
            const res = await storageHook.updateFile({ id: file?.id, status: "archived" });
            showToast({ heading: "Success", message: "File archived.", variant: "success" });
            getLicense(licenseId);
        } catch (error) {}
    }

    async function activateLicenseFile(file: StorageFile) {
        try {
            const res = await storageHook.updateFile({ id: file?.id, status: "active" });
            showToast({ heading: "Success", message: "File unarchived.", variant: "success" });
            getLicense(licenseId);
        } catch (error) {}
    }

    async function uploadLicenseFile() {
        const filePayload = {
            fileName: fileName,
            fileType: file?.length && file[0].type,
            file: file?.length && file[0],
        } as StartFileUploadPayload;

        try {
            const res: any = await DI.storageService.uploadFile(filePayload);
            setNewFile(res.file.id);
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
            setIsSubmitting(false);
        }
    }

    // Listen to file upload
    useEffect(() => {
        if (newFile) {
            const additionalAttachments: any = [
                {
                    operation: "add",
                    files: [newFile],
                },
            ];

            const payload: any = {
                additionalAttachments,
            };

            updateLicense(payload, `/business/license/${licenseId}`);
        }
    }, [newFile]);

    function licenseFiles(status: string) {
        const allAttachments = license.allAttachments ?? [];
        const pFiles = license?.allAttachments?.filter((file: StorageFile) => file.status === status);

        if (license.file && status === "active") {
            pFiles?.unshift(license.file);
        }
        return pFiles;
    }

    useEffect(() => {
        setLocalState({ page: 1 });
    }, [currentStatus]);

    useEffect(() => {
        if (licensesData.data.length > 0) {
            setLocalState({ isInitialLoading: false });
            setPageReady(true);

            // Check if data is stale and needs a refresh
            const isDataStale = licensesData.lastFetched && Date.now() - licensesData.lastFetched > CACHE_EXPIRATION;

            // If data is stale, do a background refresh
            if (isDataStale) {
                fetchLicenses({ resetData: true });
            }
        } else {
            // No data in store? do a normal fetch with loading indicators
            setLocalState({ isInitialLoading: true });
            fetchLicenses({ resetData: true });
        }
    }, [currentStatus, user?.companyId]);

    useEffect(() => {
        init();
    }, []);

    return {
        user,
        isLoading: licensesData.loading,
        setIsLoading: (loading: boolean) => reduxDispatch(setLicensesLoading({ status: currentStatus, loading })),
        addToFavorites: onAddtoFavorites,
        removeFromFavorites: onRemoveFromFavorites,
        isInitialLoading: localState.isInitialLoading,
        isSilentlyFetching,
        setIsDeleting,
        isDeleting,
        licenses,
        setLicenses,
        licenseToDelete,
        setLicenseToDelete,
        showModal,
        setShowModal,
        deleteLicense,
        fetchLicenses,
        loadMoreLicenses,
        tableColumns,
        isSubmitting,
        setIsSubmitting,
        errorMessage,
        setErrorMessage,
        feedbackMessage,
        setFeedbackMessage,
        license,
        setLicense,
        handleAddAgain,
        handleSubmit,
        addLicense,
        updateLicense,
        getLicense,
        selectedTime,
        setSelectedTime,
        time,
        setTime,
        handleTimeSelection,
        isPickingtime,
        pickedTime,
        showTimePickerModal,
        setShowTimePickerModal,
        listOrGrid,
        setPageReady,
        pageReady,
        searchResults,
        totalRows,
        onTablePageChange,
        hasMore: localState.hasMore,
        page: localState.page,
        setPage,
        search,
        isSearching,
        router,
        init,
        viewDocumentFile,
        dropZoneErrorMessage,
        setDropZoneErrorMessage,
        onDeleteFile,
        acceptedFiles,
        handleOnFileChange,
        file,
        setFile,
        licenseId,
        setLicenseId,
        fileName,
        setFileName,
        storageHook,
        showFeedbackModal,
        setShowFeedbackModal,
        licenseFiles,
        licenseFilesTable,
        handleSubmitLicenseFile,
        updateLicenseFile,
        deleteLicenseFile,
        archiveLicenseFile,
        activateLicenseFile,
        uploadLicenseFile,
        status,
        setStatus,
        filteredLicenses,
        archiveLicense,
        unArchiveLicense,
        showToast,
        clearLicenseCache,
    };
};

export default useLicense;
