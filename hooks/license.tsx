import { LicenseData } from "@/repositories/business-repository";
import { useEffect, useReducer, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Iconly } from "react-iconly";
import { MoreHorizontal, MoreVertical } from "react-feather";
import DI from "@/di-container";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
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
import useStorage from "./storage";
import { StartFileUploadPayload, StorageFile } from "@/repositories/storage-repository";
import { Accept } from "react-dropzone";
import PdfIcon from "@/components/icons/PdfIcon";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";

const useLicense = (action?: string) => {
    const router = useRouter();
    const storageHook = useStorage({});
    const { user } = useSelector((state: RootState) => state.account);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { search, isSearching } = useSearchForm();
    const { viewDocumentFile } = useStorage({});
    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [licenses, setLicenses] = useState<Partial<LicenseData>[]>([]);
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

    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [pageReady, setPageReady] = useState<boolean>(false);
    const [totalRows, setTotalRows] = useState<number>();
    const [tablePage, setTablePage] = useState<number>(1);

    function init() {
        resetPage();

        const urlQuery = getUrlQuery("query");
        if (urlQuery) {
            search({ query: urlQuery, categories: ["licenses"] });
            setIsLoading(false);
            setTimeout(() => {
                setPageReady(true);
            }, 2000);
            return;
        }
        if (isMobileDevice() || isTabletDevice() || listOrGrid.license === "grid") {
            getLicenses(true);
        }
    }

    async function deleteLicense() {
        setIsDeleting(true);
        try {
            const response = await DI.businessService.deleteLicense(user?.companyId, licenseToDelete?.id);
            resetPage();
            init();
            setShowModal(false);
            setIsDeleting(false);
        } catch (error) {
            setIsDeleting(false);
        }
    }

    async function getLicenses(resetLicenses?: boolean) {
        setIsLoading(true);
        const stat = location.pathname.split("/")[3];
        try {
            const res = await DI.businessService.getLicenses(user?.companyId, currentPageNumber(), stat || "active");
            setTotalRows(res.data.count);
            let theLicenses: LicenseData[] = [];

            if (isMobileDevice() || isTabletDevice() || listOrGrid.license === "grid") {
                setHasMore(res.data.next != null);
                theLicenses = resetLicenses ? [...res.data.results] : [...licenses, ...res.data.results];

                if (res.data.next) {
                    increamentPage();
                }
            } else {
                theLicenses = res.data.results;
            }

            theLicenses && setLicenses(theLicenses);
            setPageReady(true);
        } catch (error) {
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }

    function filteredLicenses(stat: string) {
        if (!licenses.length) return [];
        return !stat ? licenses : licenses.filter(license => license.status === stat);
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
                                    className="object-fit-cover flex-shrink-0"
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
                                        setIsLoading(true);
                                        viewDocumentFile(row?.file);
                                        setTimeout(() => {
                                            setIsLoading(false);
                                        }, 2000);
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
                            className="ms-2 text-blue-800 truncate-1 text-decoration-none offset"
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

        // if (!file?.length) {
        //     delete payload.file;
        // }

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
            setLicense({ attachment: res.file.id }); // useEffect is listening to insurance.policy to take action
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
            setIsSubmitting(false);
        }
    }

    // Listen to file upload
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
            showToast({ heading: "License added successfully", message: "", variant: "success" });
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
        payload.status = "archived";
        try {
            const response = await DI.businessService.updateLicense(user?.companyId, payload.id, payload);
            showToast({ heading: "Success", message: "License archived.", variant: "success" });
            getLicenses(true);
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    async function unArchiveLicense(payload: any) {
        payload.status = "active";
        try {
            const response = await DI.businessService.updateLicense(user?.companyId, payload.id, payload);
            showToast({ heading: "Success", message: "License unarchived .", variant: "success" });
            getLicenses(true);
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    async function getLicense(licenseId: string) {
        setIsLoading(true);
        try {
            const res = await DI.businessService.getLicense(user?.companyId, licenseId);
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

            setIsLoading(false);
        } catch (error) {
        } finally {
            setIsLoading(false);
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

    // Pagination and search results

    function currentPageNumber() {
        if (isMobileDevice() || isTabletDevice() || listOrGrid.license === "grid") {
            return page;
        }
        return tablePage;
    }

    function increamentPage() {
        if (isMobileDevice() || isTabletDevice() || listOrGrid.license === "grid") {
            setPage(page + 1);
            return;
        }
        setTablePage(page + 1);
    }

    function resetPage() {
        setHasMore(true);
        setPage(1);
        setTablePage(1);
        setLicenses([]);
    }

    useEffect(() => {
        // if (searchResults) {

        resetPage();
        // }
    }, [searchResults]);

    useEffect(() => {
        if (!isMobileDevice() && !isTabletDevice() && listOrGrid.license === "list") {
            getLicenses();
        }
    }, [tablePage]);

    useEffect(() => {
        resetPage();
        (!currentPage(3) || currentPage(3) === "archived") && getLicenses(true);
    }, [listOrGrid.license]);

    useEffect(() => {
        if (!licenses.length && pageReady) {
            // getLicenses();
        }
    }, [licenses]);

    function onTablePageChange(page: number) {
        setTablePage(page);
    }

    //--------------------------------------------
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

        if (action === "edit") {
            updateLicenseFile({ callbackUrl: `/business/license/${licenseId}` });
        }

        if (file?.length) uploadLicenseFile();
    }

    async function updateLicenseFile(props?: { callbackUrl: string }) {
        const file = storageHook.storageFile;
        try {
            const res = await storageHook.updateFile({ id: file?.id, originalFileName: fileName });
            showToast({ heading: "Success", message: "File updated.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(`/business/license/${licenseId}`);
            }
        } catch (error) {
        } finally {
            setIsSubmitting(false);
        }
    }

    async function deleteLicenseFile() {
        try {
            const res = await storageHook.onDelete();
            // getInsurance(insuranceId);
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
            attachmentFilename: fileName, //file?.length && file[0].name,
            fileType: file?.length && file[0].type,
            file: file?.length && file[0],
        } as StartFileUploadPayload;

        try {
            const res: any = await DI.storageService.uploadFile(filePayload);
            setNewFile(res.file.id); // useEffect is listening to newFile to take action
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

            // if (!insurance.policy) insurance.policy = newFile;
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

    return {
        user,
        isLoading,
        setIsDeleting,
        isDeleting,
        licenses,
        setLicenses,
        licenseToDelete,
        setLicenseToDelete,
        showModal,
        setShowModal,
        deleteLicense,
        getLicenses,
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
        setIsLoading,
        listOrGrid,
        setPageReady,
        pageReady,
        searchResults,
        totalRows,
        onTablePageChange,
        hasMore,
        search,
        isSearching,
        resetPage,
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
    };
};

export default useLicense;
