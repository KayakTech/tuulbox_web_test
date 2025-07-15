import { Contact } from "@/repositories/contact-repositories";
import { useEffect, useState, useReducer, useRef } from "react";
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
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import useFavorites from "./favorites";
import { useToast } from "@/context/ToastContext";

const useContact = (props: { action?: string }) => {
    const { user } = useSelector((state: RootState) => state.account);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { addToFavorites } = useFavorites();

    const { action } = props;
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [theContact, setTheContact] = useState<Contact>();
    const [isLoading, setIsLoading] = useState(true);
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
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
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
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(15);
    const [pageReady, setPageReady] = useState<boolean>(false);
    const { showToast } = useToast();

    const [tablePage, setTablePage] = useState<number>(1);

    const filteredContacts = contacts.filter((contact: Contact) => {
        const email = contact?.email;
        const matchesEmailSearch = email ? email.includes(searchTerm.toLocaleLowerCase()) : false;
        return matchesEmailSearch;
    });

    // Insurance
    const [selectedInsuranceTime, setSelectedInsuraceTime] = useState<string>("");
    const [insuranceTime, setInsuranceTime] = useState<string>("");
    const [insurancePickedTime, setInsurancePickedTime] = useState<SelectTimetype>({
        timeString: "Pick a Time",
        timeValue: 0,
        isPickingtime: true,
    });

    // License
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
            id: "",
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

    async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
        event && event.preventDefault();

        let redirect = getUrlQuery("redirect");
        redirect = redirect ? `${redirect}&activeMenu=${getUrlQuery("activeMenu")}` : null;

        setErrorMessage("");

        const validForm = isValidForm() as boolean;
        if (!validForm) return;

        setIsSubmitting(true);

        let fileUploads = [];

        if (addSubcontractorInformation) {
            setInsurance({
                reminder: insurance.reminder ? convertDateStringToIsoString(insurance.reminder) : null,
                validTo: insurance.validTo ? convertDateStringToIsoString(insurance.validTo) : null,
            });
            setLicense({
                reminder: license.reminder ? convertDateStringToIsoString(license.reminder) : null,
                validTo: license.validTo ? convertDateStringToIsoString(license.validTo) : null,
            });

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
            addContact({ callbackUrl: redirect ?? `/contacts` });
            return;
        }

        if (action === "edit") {
            if (contact.isSubcontractor && contact.subcontractorId) {
                updateSubcontractor({ callbackUrl: redirect ?? `/contacts` });
                return;
            }
            updateContact({ callbackUrl: redirect ?? `/contacts` });
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
            setContact({ certificatesIds: [res.file.id] }); // useEffect is listening to contact.certificatesIds to take action
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
            setInsurance({ policy: res.file.id }); // useEffect is listening to contact.certificatesIds to take action
            return res;
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        }
    }

    async function addContact(props?: { callbackUrl: string }) {
        let payload = contact;

        if (addLicenseAndInsurance) {
            payload = {
                ...payload,
                // @ts-ignore
                licenses: [license],
                // @ts-ignore
                insurances: [insurance],
            };
        }

        // @ts-ignore
        addLicenseAndInsurance && delete payload.insurances[0].file;
        delete payload.profilePicture;

        try {
            const res = await DI.contactService.addContact(payload);
            showToast({ heading: "Success", message: "Contact added.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
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

    async function updateContact(props?: { callbackUrl: string }) {
        delete contact?.profilePicture;

        let payload: any = {
            ...contact,
        };

        if (addLicenseAndInsurance) {
            payload = {
                ...payload,
                insurances: [insurance],
                licenses: [license],
            };
        }

        try {
            const res = await DI.contactService.updateContact(payload, contactId);
            showToast({ heading: "Success", message: "Contact updated.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
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

        console.log(payload, contact, subcontractor);

        debugger;

        try {
            const res = await DI.contactService.updateSubcontractor(payload);
            showToast({ heading: "Success", message: "Subcontractor updated.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function getContact(contactId: any) {
        setIsLoading(true);
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

            setContact(theContact);
            setTheContact(response.data);
            setIsLoading(false);
        } catch (error) {
            // router.push("/contacts");
        }
    }

    function removeUploadedFiles(data: string) {
        setUploadedFileTypeToRemove(data);
        setShowDeleteModal(true);
    }

    async function getContacts() {
        setIsLoading(true);

        try {
            const response = await DI.contactService.getContacts(currentPageNumber());
            setTotalRows(response.data.count);
            let theContacts: Contact[];

            if (listOrGrid.contact === "grid") {
                setHasMore(response.data.next != null);
                theContacts = [...contacts, ...response.data.results];

                if (response.data.next) {
                    increamentPage();
                }
            } else {
                theContacts = response.data.results;
            }
            setContacts(theContacts);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    let theContacts: Contact[] = [];
    async function getAllContacts(pageNumber: number) {
        try {
            const response = await DI.contactService.getContacts(pageNumber);
            response.data.results.map(contact => {
                if (!theContacts.some(cont => cont.email === contact.email)) theContacts.push(contact);
            });

            if (response.data.next) {
                getAllContacts(pageNumber + 1);
            } else {
                theContacts.sort((a, b) => (a?.email ?? "").localeCompare(b?.email ?? ""));
                setContacts(theContacts);
            }
        } catch (error) {
        } finally {
        }
    }

    async function getDocuments() {
        setIsLoading(true);
        try {
            const response = await DI.contactService.getContacts(page);
            setDocuments([FILE_MOCK, FILE_MOCK, FILE_MOCK, FILE_MOCK]);
        } catch (error) {
        } finally {
            setIsLoading(false);
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

    //delete contact function
    async function handleDelete(contactId: string) {
        setIsDeleting(true);
        try {
            const response = await DI.contactService.deleteContact(contactId);

            if (currentPage() !== "contacts") {
                router.push("/contacts");
                return;
            }

            setPage(1);
            setContacts([]);
            getContacts();
            setShowModal(false);
            setShowDeleteModal(false);
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsDeleting(false);
        }
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

    function deleteContact(contactId?: any) {
        setContactToDelete(contactId);
        setShowModal(true);
        setShowDeleteModal(true);
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

    // Pagination and search results

    function currentPageNumber() {
        if (listOrGrid.contact === "list") {
            return tablePage;
        }
        return page;
    }

    function increamentPage() {
        if (listOrGrid.contact === "list") {
            setTablePage(page + 1);
            return;
        }
        setPage(page + 1);
    }

    function resetPage() {
        setHasMore(true);
        setPage(1);
        setTablePage(1);
        setContacts([]);
    }

    useEffect(() => {
        if (searchResults) {
            setContacts([]);
            setPage(1);
        }
    }, [searchResults]);

    useEffect(() => {
        if (listOrGrid.contact === "list" && !currentPage(2)) {
            getContacts();
            return;
        }
    }, [tablePage]);

    useEffect(() => {
        resetPage();
        if (listOrGrid.contact === "list" && !currentPage(2)) {
            getContacts();
            return;
        }
    }, [listOrGrid.contact]);

    useEffect(() => {
        if (!contacts.length && pageReady) {
            getContacts();
        }
    }, [contacts]);

    function onTablePageChange(page: number) {
        setTablePage(page);
    }

    return {
        handleDelete,
        handleSubmit,
        contactsTable,
        contacts,
        setContact,
        getContacts,
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
        // setPage,
        page,
        onTablePageChange,
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
        setIsLoading,
        pageReady,
        setPageReady,
        searchResults,
        onAddtoFavorites,
        showToast,
        setTaxDocument,
        composeGmail,
        subcontractor,
    };
};

export default useContact;
