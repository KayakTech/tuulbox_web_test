import { Contact } from "@/repositories/contact-repositories";
import { useEffect, useState, useReducer, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
    setUserId,
    setContacts,
    setContactsLoading,
    setSilentlyFetching,
    setContactDetails,
    updateContact as updateContactInStore,
    addContact as addContactToStore,
    deleteContact as deleteContactFromStore,
    resetContacts,
} from "@/store/contact-reducer";
import DI from "@/di-container";
import { Button, Dropdown } from "react-bootstrap";
import { MoreHorizontal, MoreVertical } from "react-feather";
import { Iconly } from "react-iconly";
import Link from "next/link";
import { FILE_MOCK } from "@/mock/projectDocument";
import { Accept } from "react-dropzone";
import {
    addSelectedTimeToDateTime,
    apiErrorMessage,
    convertDateStringToIsoString,
    currentPage,
    formatPhoneNumber,
    formatPhoneNumberWithSpace,
    getUrlQuery,
} from "@/helpers";
import { useRouter } from "next/router";
import { StartFileUploadPayload, StorageFile } from "@/repositories/storage-repository";
import { ArrowRight2, Edit2, Message, Star1, User } from "iconsax-react";
import { Trash } from "iconsax-react";
import { Subcontractor } from "@/repositories/subcontractor-repository";
import { InsuranceData, LicenseData } from "@/repositories/business-repository";
import { SelectTimetype } from "@/components/TimeSelector";
import useFavorites from "./favorites";
import { useToast } from "@/context/ToastContext";

const CACHE_EXPIRATION = 5 * 1000;

interface ContactsLocalState {
    isInitialLoading: boolean;
    hasMore: boolean;
}

interface FetchContactsOptions {
    resetData?: boolean;
    pageNumber?: number;
    append?: boolean;
}

const INITIAL_STATE: ContactsLocalState = {
    isInitialLoading: false,
    hasMore: true,
};

const useContact = (props: { action?: string }) => {
    const { user } = useSelector((state: RootState) => state.account);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const {
        contacts: contactsData,
        contactDetails,
        isSilentlyFetching,
    } = useSelector((state: RootState) => state.contacts);
    const { addToFavorites } = useFavorites();

    const reduxDispatch = useDispatch();
    const { action } = props;
    const router = useRouter();
    const { showToast } = useToast();

    const [localState, setLocalState] = useReducer(
        (state: ContactsLocalState, newState: Partial<ContactsLocalState>) => ({ ...state, ...newState }),
        INITIAL_STATE,
    );

    const [theContact, setTheContact] = useState<Contact>();
    const [taxDocument, setTaxDocument] = useState<File[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showFeedbackModal, setFeedbackModal] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [feedbackMessage, setFeedbackMessage] = useState<string>("");
    const [addSubcontractorInformation, setAddSubcontractorInformation] = useState<boolean>(false);
    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");
    const [attachment, setAttachment] = useState<File[]>([]);
    const [contactToDelete, setContactToDelete] = useState<string>("");
    const [contactId, setContactId] = useState<string>("");
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [addLicenseAndInsurance, setAddLicenseAndInsurance] = useState<boolean>(false);
    const [isPickingtime, setIsPickingtime] = useState<boolean>(false);
    const [insuranceFile, setInsuranceFile] = useState<File[]>();
    const [fileToDelete, setFileToDelete] = useState<Partial<StorageFile>>();
    const [showDeleteFileModal, setShowDeleteFileModal] = useState<boolean>(false);
    const [showInsuranceTimePickerModal, setShowInsuranceTimePickerModal] = useState<boolean>(false);
    const [showLicenseTimePickerModal, setShowlicenseTimePickerModal] = useState<boolean>(false);
    const [filesUploaded, setFilesUploaded] = useState<number>(0);
    const [uploadedFileTypeToRemove, setUploadedFileTypeToRemove] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState("");
    const [hasDeleted, setHasDeleted] = useState<number>(0);
    const [perPage, setPerPage] = useState(15);
    const [pageReady, setPageReady] = useState<boolean>(false);

    const [selectedInsuranceTime, setSelectedInsuraceTime] = useState<string>("");
    const [insuranceTime, setInsuranceTime] = useState<string>("");
    const [insurancePickedTime, setInsurancePickedTime] = useState<SelectTimetype>({
        timeString: "Pick a Time",
        timeValue: 0,
        isPickingtime: true,
    });

    const [selectedLicenseTime, setSelectedLicenseTime] = useState<string>("");
    const [licenseTime, setlicenseTime] = useState<string>("");
    const [licensePickedTime, setlicensePickedTime] = useState<SelectTimetype>({
        timeString: "Pick a Time",
        timeValue: 0,
        isPickingtime: true,
    });

    const [contactDocument, setContactDocument] = useReducer(
        (state: any, newState: any) => ({ ...state, ...newState }),
        {
            fileName: "",
            category: "",
            validityStartDate: "",
            validityEndDate: "",
            reminder: "",
            file: "",
        },
    );

    const [contact, setContact] = useReducer(
        (state: Partial<Contact>, newState: Partial<Contact>) => ({ ...state, ...newState }),
        {
            firstName: "",
            lastName: "",
            countryCode: "",
            phoneNumber: "",
            email: "",
            address: "",
            company: "",
            hasTaxDocuments: false,
            certificatesIds: [],
            taxId: "",
            taxDocuments: [],
            isSubcontractor: false,
            addressLine1: "",
            addressLine2: "",
            country: "",
            state: "",
            city: "",
            zipCode: "",
            certificates: [],
            taxDocumentName: "",
            extension: "",
        },
    );

    const [subcontractor, setSubcontractor] = useState<Subcontractor>();

    const [insurance, setInsurance] = useReducer(
        (state: Partial<InsuranceData>, newState: Partial<InsuranceData>) => ({ ...state, ...newState }),
        {
            // id: "",
            insuranceType: "",
            carrier: "",
            agent: "",
            contact: "",
            email: "",
            validFrom: "",
            validTo: "",
            reminder: "",
            policy: "",
            file: {},
            broker: "",
            customInsuranceType: "",
            policyNumber: "",
            extension: "",
        },
    );

    const [license, setLicense] = useReducer(
        (state: Partial<LicenseData & { files: File[] }>, newState: Partial<LicenseData & { files: File[] }>) => ({
            ...state,
            ...newState,
        }),
        {
            // id: "",
            name: "",
            licenseType: "",
            licenseNumber: "",
            validFrom: "",
            validTo: "",
            reminder: "",
            customLicenseType: "",
            files: [],
        },
    );

    useEffect(() => {
        if (user?.id) {
            //@ts-ignore
            reduxDispatch(setUserId(user.id));
        }
    }, [user?.id, reduxDispatch]);

    const fetchContacts = async (options: FetchContactsOptions = {}) => {
        const { resetData = false, pageNumber, append = false } = options;
        const currentPageNumber = pageNumber !== undefined ? pageNumber : resetData ? 1 : contactsData.currentPage;

        if ((resetData || !contactsData.data.length) && !contactsData.lastFetched) {
            reduxDispatch(setContactsLoading(true));
            setLocalState({ isInitialLoading: true });
        } else {
            reduxDispatch(setSilentlyFetching(true));
        }

        try {
            const response = await DI.contactService.getContacts(currentPageNumber);

            const isGridView = listOrGrid.contact === "grid";
            const shouldAppend = append && isGridView && currentPageNumber > 1;

            reduxDispatch(
                setContacts({
                    data: response.data.results,
                    count: response.data.count,
                    next: response.data.next,
                    page: currentPageNumber,
                    append: shouldAppend,
                }),
            );

            setLocalState({
                hasMore: response.data.next !== null,
                isInitialLoading: false,
            });
        } catch (error) {
            showToast({ heading: "Error", message: "Error fetching contacts", variant: "danger" });
        } finally {
            reduxDispatch(setContactsLoading(false));
            reduxDispatch(setSilentlyFetching(false));
            setLocalState({ isInitialLoading: false });
        }
    };

    const loadMoreContacts = async () => {
        if (!localState.hasMore || contactsData.loading || isSilentlyFetching) return;

        await fetchContacts({
            resetData: false,
            pageNumber: contactsData.currentPage + 1,
            append: true,
        });
    };

    async function getContact(contactId: any) {
        const cachedContact = contactDetails[contactId];
        if (cachedContact && Date.now() - cachedContact.lastFetched < CACHE_EXPIRATION) {
            setTheContact(cachedContact.contact);
            setContact(cachedContact.contact);
            fetchContactInBackground(contactId);
            return;
        }

        setLocalState({ isInitialLoading: true });
        await fetchContactDetails(contactId);
    }
    async function fetchContactInBackground(contactId: string) {
        try {
            const response = await DI.contactService.getContact(contactId);
            reduxDispatch(setContactDetails({ contactId, contact: response.data }));
            setTheContact(response.data);
            setContact(response.data);
        } catch (error) {}
    }

    async function fetchContactDetails(contactId: string) {
        try {
            let theContact: Contact;
            let subcontractor: Subcontractor;

            const response = await DI.contactService.getContact(contactId);
            theContact = response.data;

            if (response.data.isSubcontractor && response.data.subcontractorId) {
                const res = await DI.subcontractorService.getSubcontractor({
                    subcontractorId: response.data.subcontractorId,
                });
                subcontractor = res.data;
                setSubcontractor(subcontractor);

                setAddSubcontractorInformation(theContact?.isSubcontractor ?? false);
                if (res.data.insurances.length > 0 || res.data.licenses.length > 0) {
                    res.data.licenses.length &&
                        setLicense({
                            id: res.data.licenses[0].id,
                            licenseType: res.data.licenses[0].licenseType,
                            name: res.data.licenses[0].name,
                            customLicenseType: res.data.licenses[0].customLicenseType,
                            licenseNumber: res.data.licenses[0].licenseNumber,
                            validFrom: res.data.licenses[0].validFrom,
                            validTo: res.data.licenses[0].validTo,
                            reminder: res.data.licenses[0].reminder,
                        });
                    res.data.insurances.length &&
                        setInsurance({
                            id: res.data.insurances[0].id,
                            insuranceType: res.data.insurances[0].insuranceType,
                            customInsuranceType: res.data.insurances[0].customInsuranceType,
                            carrier: res.data.insurances[0].carrier,
                            agent: res.data.insurances[0].agent,
                            contact: res.data.insurances[0].contact,
                            email: res.data.insurances[0].email,
                            validFrom: res.data.insurances[0].validFrom,
                            validTo: res.data.insurances[0].validTo,
                            reminder: res.data.insurances[0].reminder,
                            policy: res.data.insurances[0].policy,
                            broker: res.data.insurances[0].broker,
                            policyNumber: res.data.insurances[0].policyNumber,
                            extension: res.data.insurances[0].extension,
                            file: res.data.insurances[0].file,
                        });
                    setAddLicenseAndInsurance(true);
                }

                theContact = {
                    ...theContact,
                    taxDocuments: subcontractor?.taxDocuments,
                    certificatesIds: subcontractor?.certificatesIds,
                    hasTaxDocuments: subcontractor?.hasTaxDocuments,
                    taxId: subcontractor?.taxId,
                    certificates: subcontractor?.certificates,
                    taxDocumentName: subcontractor?.certificates[0]?.certificate?.originalFileName,
                };
            }

            reduxDispatch(setContactDetails({ contactId, contact: theContact }));
            setContact(theContact);
            setTheContact(response.data);
        } catch (error) {
        } finally {
            setLocalState({ isInitialLoading: false });
        }
    }

    async function addContact(props?: { callbackUrl: string; updatedInsurance?: any; updatedLicense?: any }) {
        let payload = contact;

        if (addLicenseAndInsurance) {
            const licenseToUse = props?.updatedLicense || license;
            const insuranceToUse = props?.updatedInsurance || insurance;

            const cleanLicense = { ...licenseToUse };
            const cleanInsurance = { ...insuranceToUse };

            if (!cleanLicense.id) {
                delete cleanLicense.id;
            }
            if (!cleanInsurance.id) {
                delete cleanInsurance.id;
            }

            payload = {
                ...payload,
                licenses: [cleanLicense],
                insurances: [cleanInsurance],
            };
        }

        // @ts-ignore
        addLicenseAndInsurance && delete payload.insurances[0].file;
        delete payload.profilePicture;

        try {
            const res = await DI.contactService.addContact(payload);

            reduxDispatch(addContactToStore(res.data));

            showToast({ heading: "Success", message: "Contact added.", variant: "success" });

            router.push("/contacts");
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function updateContact(props?: { callbackUrl: string; updatedInsurance?: any; updatedLicense?: any }) {
        delete contact?.profilePicture;

        let payload: any = {
            ...contact,
        };

        if (addLicenseAndInsurance) {
            const licenseToUse = props?.updatedLicense || license;
            const insuranceToUse = props?.updatedInsurance || insurance;

            const cleanLicense = { ...licenseToUse };
            const cleanInsurance = { ...insuranceToUse };

            if (!cleanLicense.id) {
                delete cleanLicense.id;
            }
            if (!cleanInsurance.id) {
                delete cleanInsurance.id;
            }

            payload = {
                ...payload,
                insurances: [cleanInsurance],
                licenses: [cleanLicense],
            };
        }

        try {
            const res = await DI.contactService.updateContact(payload, contactId);

            reduxDispatch(updateContactInStore(res.data));

            showToast({ heading: "Success", message: "Contact updated.", variant: "success" });

            router.push("/contacts");
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(contactId: string) {
        setIsDeleting(true);
        try {
            const response = await DI.contactService.deleteContact(contactId);

            reduxDispatch(deleteContactFromStore(contactId));

            if (currentPage() !== "contacts") {
                router.push("/contacts");
                return;
            }

            setShowModal(false);
            setShowDeleteModal(false);
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsDeleting(false);
        }
    }

    useEffect(() => {
        if (contactsData.data.length > 0) {
            setLocalState({ isInitialLoading: false });

            const isDataStale = contactsData.lastFetched && Date.now() - contactsData.lastFetched > CACHE_EXPIRATION;

            if (isDataStale) {
                fetchContacts({ resetData: true });
            }
        } else {
            setLocalState({ isInitialLoading: true });
            fetchContacts({ resetData: true });
        }
    }, []);

    useEffect(() => {
        if (listOrGrid.contact === "list" && !currentPage(2)) {
            fetchContacts({ resetData: true });
        }
    }, [listOrGrid.contact]);

    useEffect(() => {
        if (searchResults) {
            reduxDispatch(resetContacts());
        }
    }, [searchResults]);

    const filteredContacts = contactsData.data.filter((contact: Contact) => {
        const email = contact?.email;
        const matchesEmailSearch = email ? email.includes(searchTerm.toLowerCase()) : false;
        return matchesEmailSearch;
    });

    async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
        event && event.preventDefault();

        let redirect = getUrlQuery("redirect");
        redirect = redirect ? `${redirect}&activeMenu=${getUrlQuery("activeMenu")}` : null;

        setErrorMessage("");

        const validForm = isValidForm() as boolean;
        if (!validForm) return;

        setIsSubmitting(true);

        let fileUploads = [];

        let updatedInsurance = { ...insurance };
        let updatedLicense = { ...license };

        if (addSubcontractorInformation) {
            updatedInsurance = {
                ...insurance,
                reminder: insurance.reminder ? convertDateStringToIsoString(insurance.reminder) : null,
                validTo: insurance.validTo ? convertDateStringToIsoString(insurance.validTo) : null,
            };

            updatedLicense = {
                ...license,
                reminder: license.reminder ? convertDateStringToIsoString(license.reminder) : null,
                validTo: license.validTo ? convertDateStringToIsoString(license.validTo) : null,
            };

            if (contact.hasTaxDocuments && taxDocument.length) {
                fileUploads.push(uploadContactFile);
            }
            if (insuranceFile?.length) {
                fileUploads.push(uploadInsuranceFile);
            }
        }

        if (action === "edit" && contact.isSubcontractor && !contact.subcontractorId) {
            const payload = {
                contactId: contact.id,
                certificatesIds: contact.certificatesIds,
                hasTaxDocuments: contact.hasTaxDocuments,
                taxId: contact.taxId,
            };

            Promise.all([addSubcontractor(payload)]);
            setTimeout(() => {
                handleSubmit();
            }, 2000);
            return;
        }

        if (fileUploads.length) {
            try {
                await Promise.all(fileUploads.map(uploadFunc => uploadFunc()));
                setFilesUploaded(filesUploaded + 1);
            } catch (error) {}
            return;
        }

        if (action === "add") {
            addContact({
                callbackUrl: "/contacts",
                updatedInsurance,
                updatedLicense,
            });
            return;
        }

        if (action === "edit") {
            if (contact.isSubcontractor && contact.subcontractorId) {
                updateSubcontractor({ callbackUrl: "/contacts" });
                return;
            }
            updateContact({
                callbackUrl: "/contacts",
                updatedInsurance,
                updatedLicense,
            });
        }
    }

    async function uploadContactFile() {
        const filePayload = {
            fileName: contact.taxDocumentName,
            fileType: taxDocument?.length && taxDocument[0].type,
            file: taxDocument?.length && taxDocument[0],
        } as StartFileUploadPayload;

        try {
            const res: any = await DI.storageService.uploadFile(filePayload);
            setContact({ certificatesIds: [res.file.id] });
            return res;
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    useEffect(() => {
        if (action === "add" && (contact.certificatesIds?.length || insurance.policy?.length)) addContact();
        if (action === "edit" && (contact.certificatesIds?.length || insurance.policy?.length)) {
            if (contact.isSubcontractor && contact.subcontractorId) {
                updateSubcontractor();
                return;
            }
            updateContact();
        }
    }, [filesUploaded]);

    async function uploadInsuranceFile() {
        const filePayload = {
            fileName: insuranceFile?.length && insuranceFile[0].name,
            fileType: insuranceFile?.length && insuranceFile[0].type,
            file: insuranceFile?.length && insuranceFile[0],
        } as StartFileUploadPayload;

        try {
            const res = await DI.storageService.uploadFile(filePayload);
            setInsurance({ policy: res.file.id });
            return res;
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    async function addSubcontractor(payload: any, props?: { callbackUrl: string }) {
        try {
            const res = await DI.contactService.addSubcontractor(payload);
            showToast({ heading: "Success", message: "Subcontractor added.", variant: "success" });

            let cont = contact;
            Object.assign(cont, res.data.contact);

            setContact({ subcontractorId: cont.subcontractorId });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
        }
    }

    function isValidForm() {
        if (!contact.firstName) {
            setErrorMessage("Please add a first name.");
            return false;
        }

        if (addSubcontractorInformation) {
            if (contact.hasTaxDocuments) {
                if (action === "add" && !taxDocument.length) {
                    setErrorMessage("Please upload a tax document.");
                    return false;
                }
                if (!contact.taxDocuments) {
                    setErrorMessage("Please a tax document name.");
                    return false;
                }
            }
        }
        return true;
    }

    function handleAddAgain() {
        if (action === "add") {
            window.location.reload();
        }
        if (action === "edit") {
            setShowModal(false);
        }
    }

    async function updateSubcontractor(props?: { callbackUrl: string }) {
        delete contact?.profilePicture;

        let payload: any = {
            ...contact,
        };
        if (addLicenseAndInsurance) {
            payload = {
                ...payload,
                insurances: [
                    {
                        id: contact.insurances?.[0]?.id,
                        ...insurance,
                    },
                ],
                licenses: [
                    {
                        id: contact.licenses?.[0]?.id,
                        ...license,
                    },
                ],
            };
        }

        try {
            const res = await DI.contactService.updateSubcontractor(payload);
            showToast({ heading: "Success", message: "Subcontractor updated.", variant: "success" });

            router.push("/contacts");
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }
    function removeUploadedFiles(data: string) {
        setUploadedFileTypeToRemove(data);
        setShowDeleteModal(true);
    }

    async function getDocuments() {
        setLocalState({ isInitialLoading: true });
        try {
            const response = await DI.contactService.getContacts(contactsData.currentPage);
            setDocuments([FILE_MOCK, FILE_MOCK, FILE_MOCK, FILE_MOCK]);
        } catch (error) {
        } finally {
            setLocalState({ isInitialLoading: false });
        }
    }

    function handleSubcontractorToggle(event: React.ChangeEvent<HTMLInputElement>) {
        setAddSubcontractorInformation(event.target.checked);
        setContact({ isSubcontractor: event.target.checked });
    }

    function handleTaxDocumentToggle(event: React.ChangeEvent<HTMLInputElement>) {
        setContact({ hasTaxDocuments: event.target.checked });
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
        setTaxDocument(file);
    }

    function handleOnInsuranceFileChange(file: File[]) {
        setDropZoneErrorMessage("");
        if (!file?.length) {
            setDropZoneErrorMessage("Only (png, jpg and pdf) files are accepted");
            return;
        }
        setInsuranceFile(file);
    }

    function handleOnLicenseFileChange(file: File[]) {
        setDropZoneErrorMessage("");
        if (!file?.length) {
            setDropZoneErrorMessage("Only (png, jpg and pdf) files are accepted");
            return;
        }
        setLicense({ files: file });
    }

    function deleteContact(contactId?: any) {
        setContactToDelete(contactId);
        setShowModal(true);
        setShowDeleteModal(true);
    }

    function onAddtoFavorites(contact: Contact) {
        let payload = {
            objectId: contact.id,
            createdBy: user?.id,
            company: user?.companyId,
            objectType: "contact",
        } as any;

        addToFavorites(payload);
    }

    function composeGmail(recipient: string) {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${recipient}`;
        window.open(gmailUrl, "_blank");
    }

    const handleTimeSelection = (params: { selectedTime: SelectTimetype; module: string }) => {
        if (params.module === "insurance") {
            handlePickedInsuranceTime(params.selectedTime);
        }
        if (params.module === "license") {
            handlePickedLicenseTime(params.selectedTime);
        }
    };

    function handlePickedInsuranceTime(params: SelectTimetype) {
        setIsPickingtime(params?.isPickingtime || false);
        let pickedT = { ...insurancePickedTime };
        const { timeString } = params;
        setSelectedInsuraceTime(timeString);
        const newTime = addSelectedTimeToDateTime(params, insurance.validTo);
        setInsuranceTime(newTime.chosenTime);
        setInsurance({ validTo: newTime.newDateTime });
        if (params.isPickingtime) {
            pickedT.timeString = newTime.chosenTime;
        } else {
            pickedT.timeString = "Pick a Time";
        }
        setInsurancePickedTime(pickedT);
    }

    function handlePickedLicenseTime(params: SelectTimetype) {
        setIsPickingtime(params?.isPickingtime || false);
        let pickedT = { ...licensePickedTime };
        const { timeString } = params;
        setSelectedLicenseTime(timeString);
        const newTime = addSelectedTimeToDateTime(params, license.validTo);
        setlicenseTime(newTime.chosenTime);
        setLicense({ validTo: newTime.newDateTime });
        if (params.isPickingtime) {
            pickedT.timeString = newTime.chosenTime;
        } else {
            pickedT.timeString = "Pick a Time";
        }
        setlicensePickedTime(pickedT);
    }

    async function onDeleteInsuranceFile(file: Partial<StorageFile> | undefined) {
        setFileToDelete(file);
        setShowDeleteFileModal(true);
    }

    function currentPageNumber() {
        return contactsData.currentPage;
    }

    function resetPagination() {
        reduxDispatch(resetContacts());
        setLocalState({ hasMore: true });
    }

    async function getAllContacts() {
        // Check if we already have all contacts in store
        if (contactsData.data.length > 0 && !contactsData.next) {
            return;
        }

        let allContacts: Contact[] = [];
        let currentPage = 1;
        let hasNextPage = true;

        try {
            reduxDispatch(setSilentlyFetching(true));

            while (hasNextPage) {
                const response = await DI.contactService.getContacts(currentPage);

                response.data.results.forEach(contact => {
                    if (!allContacts.some(cont => cont.email === contact.email)) {
                        allContacts.push(contact);
                    }
                });

                hasNextPage = response.data.next !== null;
                currentPage++;
            }

            allContacts.sort((a, b) => (a?.email ?? "").localeCompare(b?.email ?? ""));

            reduxDispatch(
                setContacts({
                    data: allContacts,
                    count: allContacts.length,
                    next: null,
                    page: 1,
                    append: false,
                }),
            );
        } catch (error) {
            showToast({ heading: "Error", message: "Error fetching all contacts", variant: "danger" });
        } finally {
            reduxDispatch(setSilentlyFetching(false));
        }
    }

    function onTablePageChange(page: number) {
        fetchContacts({ resetData: false, pageNumber: page });
    }

    const contacts = contactsData.data;
    const isLoading = localState.isInitialLoading;
    const hasMore = localState.hasMore;
    const totalRows = contactsData.count;
    const page = contactsData.currentPage;

    const contactsTable = (params: { isSingleContact?: boolean; isSearch?: boolean; hideDropdown?: boolean }) => {
        function openGmail() {
            window.open("https://mail.google.com/", "_blank");
        }
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Full Name</span>,
                cell: (row: any) => (
                    <div className="text-muted tb-body-default-medium text-capitalize d-flex align-items-center">
                        <span
                            className="bg-gray-50 rounded-circle d-flex me-2 justify-content-center align-items-center"
                            style={{ width: "40px", height: "40px" }}
                        >
                            <User size={16} color="#B0B0B0" />
                        </span>
                        <span className="d-flex flex-column">
                            <span className="">{`${row?.firstName} ${row?.lastName}`}</span>
                        </span>
                    </div>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Contact</span>,
                cell: (row: any) => (
                    <span className="text-muted tb-body-default-medium d-flex flex-column gap-2">
                        {row.phoneNumber && (
                            <a className="text-blue-900 text-decoration-none" href={`tel:${row.phoneNumber}`}>
                                {row.phoneNumber}
                            </a>
                        )}
                        {row.email && (
                            <a
                                title={row.email.toLowerCase()}
                                className="text-blue-900 text-decoration-none"
                                href={`mailto:${row.email}`}
                            >
                                {row.email.toLowerCase()}
                            </a>
                        )}
                    </span>
                ),
                grow: 3,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Address</span>,
                cell: (row: any) => (
                    <span className="text-muted tb-body-default-medium d-flex flex-column gap-2">
                        {row.addressLine1 && (
                            <span className="text-muted tb-body-default-medium">{row.addressLine1}</span>
                        )}
                        {row.addressLine2 && (
                            <span className="text-muted tb-body-default-medium">
                                {row.addressLine2} {row.city}
                            </span>
                        )}
                    </span>
                ),
                grow: 3,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize ms-auto">Action</span>,
                omit: params?.isSearch,
                cell: (row: Contact, index: number) => (
                    <span className="ms-auto">
                        <Dropdown className="w-100 bg-transparent" drop={contacts.length <= 2 ? "start" : "down"}>
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square border-0"
                                id="dropdown-basic"
                            >
                                <MoreVertical size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <Dropdown.Item href={""} onClick={() => composeGmail(row.email ?? "")}>
                                    <Message size={16} /> <span className="tb-body-default-regular">Send Email</span>
                                </Dropdown.Item>
                                <Dropdown.Item href={`/contacts/edit/${row.id}`}>
                                    <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                </Dropdown.Item>
                                {!params?.isSingleContact && (
                                    <Dropdown.Item onClick={() => onAddtoFavorites(row)}>
                                        <Star1 size={16} color="#888888" />{" "}
                                        <span className="tb-body-default-regular">Add to Favorites </span>
                                    </Dropdown.Item>
                                )}
                                <Dropdown.Item onClick={() => deleteContact(row?.id)} className="text-danger">
                                    <Trash size={16} className="" color="#E70000" />
                                    <span className="tb-body-default-regular text-danger">Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </span>
                ),
            },
        ];
    };

    return {
        handleDelete,
        handleSubmit,
        contactsTable,
        contacts,
        setContact,
        getContacts: () => fetchContacts({ resetData: true }),
        isLoading,
        getContact,
        updateContact,
        contact,
        taxDocument,
        documents,
        getDocuments,
        isDeleting,
        isSubmitting,
        setShowModal,
        showModal,
        setFeedbackModal,
        showFeedbackModal,
        errorMessage,

        handleSubcontractorToggle,
        handleTaxDocumentToggle,
        addSubcontractorInformation,
        acceptedFiles,
        dropZoneErrorMessage,
        handleOnFileChange,
        feedbackMessage,
        handleAddAgain,
        setAddSubcontractorInformation,
        isSubcontractor: contact.isSubcontractor,
        attachment,
        contactDocument,
        setContactDocument,
        theContact,
        contactToDelete,
        setContactToDelete,
        setContactId,
        showDeleteModal,
        setShowDeleteModal,
        deleteContact,

        hasMore,
        page,
        onTablePageChange,
        loadMoreContacts,

        addLicenseAndInsurance,
        setAddLicenseAndInsurance,
        insurance,
        setInsurance,
        handleTimeSelection,
        selectedInsuranceTime,
        insurancePickedTime,
        isPickingtime,
        insuranceFile,
        setInsuranceFile,
        onDeleteInsuranceFile,
        showDeleteFileModal,
        setShowDeleteFileModal,
        showInsuranceTimePickerModal,
        setShowInsuranceTimePickerModal,
        showLicenseTimePickerModal,
        setShowlicenseTimePickerModal,
        license,
        setLicense,
        licensePickedTime,
        selectedLicenseTime,
        handleOnInsuranceFileChange,
        handleOnLicenseFileChange,
        removeUploadedFiles,
        uploadedFileTypeToRemove,

        getAllContacts,
        filteredContacts,
        searchTerm,
        setSearchTerm,
        totalRows,
        perPage,
        listOrGrid,
        setIsLoading: (loading: boolean) => setLocalState({ isInitialLoading: loading }),
        pageReady,
        setPageReady,
        searchResults,
        onAddtoFavorites,
        showToast,
        setTaxDocument,
        composeGmail,
        subcontractor,

        isSilentlyFetching,
        contactsData,
    };
};

export default useContact;
