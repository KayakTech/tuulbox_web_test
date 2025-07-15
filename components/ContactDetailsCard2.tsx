import { Contact } from "@/repositories/contact-repositories";
import { ArrowDown2, ArrowUp2, DocumentText, Edit2, Message, Star1, Trash, User } from "iconsax-react";
import Image from "next/image";
import { Accordion, Button, Card, Col, Dropdown, Form, Row } from "react-bootstrap";
import { Subcontractor } from "@/repositories/subcontractor-repository";
import useStorage from "@/hooks/storage";
import { MoreVertical } from "react-feather";
import contacts from "@/pages/contacts";
import { useReducer, useState } from "react";
import { formatDatetime, convertIsoToFriendlyTime, snakeCaseToSentenceCase } from "@/helpers";
import Required from "./Required";
import Dropzone from "react-dropzone";
import { ACCEPTED_FILES, SIZE_IN_MB } from "@/helpers/constants";
import _ from "lodash";
import DI from "@/di-container";
import { useToast } from "@/context/ToastContext";
import { Plus } from "react-feather";
import UserAndBag from "./icons/UserAndBag";
import ContactDocument from "./ContactDocument";
import { currentPage, getUrlQuery, updateUrlQuery } from "@/helpers";

import ContactDocumentsComponent from "@/components/ContactDocumentsComponent";
import CertificateForm from "@/components/CertificateForm";
import Header from "@/components/Header";
import useSubcontractors from "@/hooks/subContractors";
import ButtonLoader from "./ButtonLoader";
import { StorageFile } from "@/repositories/storage-repository";
import DeleteModal from "./DeleteModal";
import useContact from "@/hooks/useContact";

type ContactDetailsCard2Props = {
    contact?: Contact;
    subContractor?: Subcontractor;
    onUpdate?: () => void;
};

export default function ContactDetailsCard2(props: ContactDetailsCard2Props) {
    const { subContractor } = props;
    const contact = props.contact ?? subContractor?.contact;
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenAccordion(openAccordion === index ? null : index);
    };

    const { viewDocumentFile } = useStorage({});

    const {
        documentsTable,
        subcontractorId,
        contactDocumentAction,
        triggerDeleteSubcontractorDocumentModal,
        storageHook,
        search,
        isSearching,
        getSubcontractor,
        setContactDocumentAction,
    } = useSubcontractors({});
    const { composeGmail } = useContact({});

    return (
        <>
            <div className=" d-flex flex-column gap-32">
                {/* Contact details */}

                <Card className="overflow-hidden">
                    <Card.Header className="p-16 d-flex justify-content-between">
                        <div className="d-flex justify-content-between tb-body-default-medium text-gray-800 align-items-center">
                            Contact details
                        </div>
                        <span className="ms-auto">
                            <Dropdown className="w-100" drop={contacts.length <= 2 ? "start" : "down"}>
                                <Dropdown.Toggle
                                    size="sm"
                                    variant="default"
                                    className="btn-square border-0"
                                    id="dropdown-basic"
                                >
                                    <MoreVertical size={24} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu align={`end`}>
                                    <Dropdown.Item
                                        href={""}
                                        onClick={() => {
                                            composeGmail(contact?.email ?? "");
                                        }}
                                    >
                                        <Message size={16} />{" "}
                                        <span className="tb-body-default-regular">Send Email</span>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        href={`/contacts/edit/${contact?.id}?redirect=${
                                            location.pathname + location.search
                                        }`}
                                    >
                                        <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                                    </Dropdown.Item>

                                    <Dropdown.Item>
                                        <Star1 size={16} color="#888888" />{" "}
                                        <span className="tb-body-default-regular">Add to Favorites </span>
                                    </Dropdown.Item>

                                    <Dropdown.Item className="text-danger">
                                        <Trash size={16} className="" color="#E70000" />
                                        <span className="tb-body-default-regular text-danger">Delete</span>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </span>
                    </Card.Header>
                    <Card.Body className="p-16">
                        <div className="d-flex flex-column gap-4">
                            <Row className="g-0">
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">First Name</p>
                                    <span className="d-flex gap-2">
                                        {contact?.profilePicture && (
                                            <Image
                                                src={contact?.profilePicture ?? ""}
                                                alt=""
                                                width={44}
                                                height={44}
                                                className="border-radius-4 object-fit-cover"
                                            />
                                        )}
                                        <span>
                                            <p className="tb-body-default-medium m-0 text-gray-800">
                                                {contact?.firstName}
                                            </p>
                                        </span>
                                    </span>
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Last Name</p>
                                    <p className="tb-body-default-medium text-gray-800 m-0">{contact?.lastName}</p>
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Company</p>
                                    {contact?.company ? (
                                        <p className="tb-body-default-medium text-gray-800 m-0">{contact?.company}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                            </Row>
                            <Row className="g-0">
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Email</p>
                                    {contact?.email ? (
                                        <a
                                            title={contact?.email}
                                            href={`mailto:${contact?.email}`}
                                            className="tb-body-default-medium truncat-1 m-0 text-blue-900 text-decoration-none"
                                        >
                                            {contact?.email}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Phone</p>
                                    {contact?.phoneNumber ? (
                                        <a
                                            href={`tel:${contact?.phoneNumber}`}
                                            className="tb-body-default-medium m-0 text-blue-900 text-decoration-none"
                                        >
                                            {contact?.phoneNumber}
                                        </a>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Extension</p>
                                    {contact?.extension ? (
                                        <p className="tb-body-default-medium m-0">{contact?.extension}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                            </Row>

                            <Row className="g-0">
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Address Line 1</p>
                                    {contact?.addressLine1 ? (
                                        <p className="tb-body-default-medium m-0">{contact?.addressLine1}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Address Line 2</p>
                                    {contact?.addressLine2 ? (
                                        <p className="tb-body-default-medium text-gray-800 m-0">
                                            {contact?.addressLine2}
                                        </p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">City</p>
                                    {contact?.city ? (
                                        <p className="tb-body-default-medium text-gray-800 m-0">{contact?.city}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                            </Row>

                            <Row className="g-0">
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">State</p>
                                    {contact?.state ? (
                                        <p className="tb-body-default-medium text-gray-800 m-0">{contact?.state}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Zip code</p>
                                    {contact?.zipCode ? (
                                        <p className="tb-body-default-medium text-gray-800 m-0">{contact?.zipCode}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                                <Col md={4}>
                                    <p className="tb-body-small-medium text-gray-400 m-0">Country</p>
                                    {contact?.country ? (
                                        <p className="tb-body-default-medium text-gray-800 m-0">{contact?.country}</p>
                                    ) : (
                                        "-"
                                    )}
                                </Col>
                            </Row>
                        </div>
                    </Card.Body>
                </Card>

                {/* Subcontractor information */}
                {subContractor && (
                    <div className=" d-flex flex-column gap-20">
                        <Accordion defaultActiveKey="0" className="mt-3m border-radius-12 mb-3">
                            <Accordion.Item eventKey="0" className="border-gray-100 rounded-4">
                                <Accordion.Header
                                    as={"div"}
                                    className="px-3 py-12 pb-0"
                                    onClick={() => toggleAccordion(0)}
                                >
                                    <div className="w-100 d-flex flex-column py-3m">
                                        <p className="m-0 tb-body-default-medium text-gray-800">Tax ID</p>
                                        <p className="text-muted tb-body-small-regular m-0">
                                            <small>Tax ID, Tax Document...</small>
                                        </p>
                                    </div>
                                    {openAccordion === 0 ? (
                                        <ArrowUp2 size="16" color="#454545" />
                                    ) : (
                                        <ArrowDown2 size="16" color="#454545" />
                                    )}
                                </Accordion.Header>
                                <Accordion.Body className="pb-3 border-top border-gray-100">
                                    <Row>
                                        <Col md={4}>
                                            <p className="m-0 tb-body-small-medium text-muted">
                                                <small>Tax ID</small>
                                            </p>
                                            <p className="m-0 tb-body-default-medium">{subContractor?.taxId ?? "-"}</p>
                                        </Col>
                                    </Row>

                                    <Row>
                                        {subContractor.taxDocuments.map(taxDocument => (
                                            <Col md={3} key={taxDocument.id}>
                                                <ContactDocument
                                                    file={taxDocument.certificate}
                                                    onDelete={() => {}}
                                                    fileType="storage"
                                                    onItemClick={(document: any) => {
                                                        viewDocumentFile(taxDocument.certificate);
                                                    }}
                                                />
                                            </Col>
                                        ))}
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>

                        {/* License Details */}
                        <Accordion defaultActiveKey="0" className="mt-3m border-radius-12 mb-3">
                            <Accordion.Item eventKey="0" className="border-gray-100 rounded-4">
                                <Accordion.Header
                                    as={"div"}
                                    className="px-3 py-12 pb-0"
                                    onClick={() => toggleAccordion(1)}
                                >
                                    <div className="w-100 py-3m">
                                        <p className="m-0 tb-body-default-medium text-gray-800">License Details</p>
                                        <p className="text-muted tb-body-small-regular m-0">
                                            <small>License, License type, License number...</small>
                                        </p>
                                    </div>
                                    {openAccordion === 1 ? (
                                        <ArrowUp2 size="16" color="#454545" />
                                    ) : (
                                        <ArrowDown2 size="16" color="#454545" />
                                    )}
                                </Accordion.Header>
                                <Accordion.Body className="pb-3 pt-4 border-top d-flex flex-column gap-3 border-gray-100">
                                    <Row className="d-flex pt-4m justify-content-between gap-3m">
                                        <Col md={4} className="">
                                            <p className="m-0 tb-body-small-medium text-muted">
                                                <small>License Type</small>
                                            </p>

                                            <div className="d-flex gap-2">
                                                {subContractor?.licenses[0]?.file && (
                                                    <div className="rounded-1 border border-gray-100 flex-shrink-0 w-24 h-24">
                                                        <Image
                                                            src={`${subContractor.licenses[0]?.file.thumbnail}`}
                                                            loading="lazy"
                                                            alt=""
                                                            className="rounded-1 flex-shrink-0 object-fit-cover h-100"
                                                            width={24}
                                                            height={24}
                                                        />
                                                    </div>
                                                )}
                                                <p className="m-0 tb-body-default-medium">
                                                    {subContractor?.licenses[0]?.licenseType
                                                        ? snakeCaseToSentenceCase(
                                                              subContractor?.licenses[0]?.licenseType,
                                                          )
                                                        : "-"}
                                                </p>
                                            </div>
                                        </Col>
                                        <Col md={4}>
                                            <p className="m-0 tb-body-small-medium text-muted">
                                                <small>Name</small>
                                            </p>
                                            <p className="m-0 tb-body-default-medium">
                                                {subContractor?.licenses[0]?.name ?? "-"}
                                            </p>
                                        </Col>
                                        <Col md={4}>
                                            <p className="m-0 tb-body-small-medium text-muted">
                                                <small>License Number</small>
                                            </p>
                                            <p className="m-0 tb-body-default-medium">
                                                {subContractor?.licenses[0]?.licenseNumber ?? "-"}
                                            </p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={4}>
                                            <p className="m-0 tb-body-small-medium text-muted">
                                                <small>Validity Start Date</small>
                                            </p>
                                            <p className="m-0 tb-body-default-medium">
                                                {subContractor?.licenses[0]?.validFrom
                                                    ? formatDatetime(subContractor?.licenses[0]?.validFrom)
                                                    : "-"}
                                            </p>
                                        </Col>
                                        <Col md={4}>
                                            <p className="m-0 tb-body-small-medium text-muted">
                                                <small>Validity End Date</small>
                                            </p>
                                            <p className="m-0 tb-body-default-medium">
                                                {subContractor?.licenses[0]?.validTo
                                                    ? formatDatetime(subContractor?.licenses[0]?.validTo)
                                                    : "-"}
                                            </p>
                                        </Col>
                                        <Col md={4}>
                                            <p className="m-0 tb-body-small-medium text-muted">
                                                <small>Reminder</small>
                                            </p>
                                            <p className="m-0 tb-body-default-medium">
                                                {subContractor?.licenses[0]?.reminder
                                                    ? formatDatetime(subContractor?.licenses[0]?.reminder)
                                                    : "-"}
                                            </p>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={4}>
                                            <p className="m-0 tb-body-small-medium text-muted">
                                                <small>Notify Me</small>
                                            </p>
                                            <p className="m-0 tb-body-default-medium">
                                                {subContractor?.licenses[0]?.reminder
                                                    ? formatDatetime(subContractor?.licenses[0]?.reminder)
                                                    : "-"}
                                            </p>
                                        </Col>
                                    </Row>

                                    <Row className="d-flex gap-3">
                                        {subContractor.licenses.map(
                                            license =>
                                                license.file && (
                                                    <Col md={3} key={license.id} className="p-0">
                                                        <ContactDocument
                                                            file={license.file}
                                                            onDelete={() => {}}
                                                            fileType="storage"
                                                            onItemClick={(document: any) => {
                                                                viewDocumentFile(license.file);
                                                            }}
                                                        />
                                                    </Col>
                                                ),
                                        )}
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>

                        {/* Insurance Details */}
                        <Accordion defaultActiveKey="0" className="mt-3m border-radius-12 mb-3">
                            <Accordion.Item eventKey="0" className="border-gray-100 rounded-4">
                                <Accordion.Header
                                    as={"div"}
                                    className="px-3 py-12 pb-0"
                                    onClick={() => toggleAccordion(2)}
                                >
                                    <div className="w-100 py-3m">
                                        <p className="m-0 tb-body-default-medium text-gray-800">Insurance Details</p>
                                        <p className="text-muted tb-body-small-regular m-0">
                                            <small>Carrier, Broker, Insurance type...</small>
                                        </p>
                                    </div>
                                    {openAccordion === 2 ? (
                                        <ArrowUp2 size="16" color="#454545" />
                                    ) : (
                                        <ArrowDown2 size="16" color="#454545" />
                                    )}
                                </Accordion.Header>
                                <Accordion.Body className="pb-3 pt-4 border-top d-flex flex-column gap-3 border-gray-100">
                                    <>
                                        <SubcontractorInsuranceCard subContractor={subContractor} {...props} />
                                    </>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>

                        {/* Project documents       */}

                        <Accordion defaultActiveKey="0" className="mt-4">
                            <Accordion.Item eventKey="0" className="border-gray-100 rounded-4">
                                <Accordion.Header
                                    className="p-3 py-12 pb-0"
                                    as={"div"}
                                    onClick={() => toggleAccordion(3)}
                                >
                                    <div className=" w-100">
                                        <p className="m-0 tb-body-default-medium text-gray-900">
                                            {currentPage() === "projects" ? "Estimates" : "Documents"}
                                        </p>
                                        {currentPage() === "contacts" && (
                                            <p className="text-muted m-0 ">
                                                <small className="tb-body-small-regular text-gray-400">
                                                    Other documents...
                                                </small>
                                            </p>
                                        )}
                                    </div>
                                    {openAccordion === 3 ? (
                                        <ArrowUp2 size="16" color="#454545" />
                                    ) : (
                                        <ArrowDown2 size="16" color="#454545" />
                                    )}
                                </Accordion.Header>

                                {(!["add", "edit"].includes(`${contactDocumentAction}`) || !getUrlQuery("action")) &&
                                subContractor?.certificates.length ? (
                                    <Accordion.Body className="py-0 text-muted border-top border-gray-100">
                                        {subContractor?.certificates.length && (
                                            <Header
                                                className=" px-0"
                                                searchPlaceholder="Search document"
                                                buttonText="New document"
                                                onButtonClick={() => {
                                                    updateUrlQuery({ key: "action", value: "add" });
                                                    setContactDocumentAction("add");
                                                }}
                                                hideContainerClass
                                                showBottomBorder={false}
                                                listOrGridKey="contactDocument"
                                                onSearch={(searchTerm: string) =>
                                                    search({ query: searchTerm, categories: ["favorites"] })
                                                }
                                                isSearching={isSearching}
                                                onClearSearch={() => getSubcontractor({ subcontractorId })}
                                                showSearchForm={false}
                                            />
                                        )}
                                    </Accordion.Body>
                                ) : null}

                                <Accordion.Body className="pb-3  text-muted border-top border-gray-100">
                                    {(!["add", "edit"].includes(`${contactDocumentAction}`) ||
                                        !getUrlQuery("action")) && (
                                        <div className="borderm d-flex gap-3">
                                            <ContactDocumentsComponent
                                                subContractor={subContractor}
                                                documentsTable={documentsTable}
                                                onEdit={() => {
                                                    setContactDocumentAction("edit");
                                                }}
                                                onDelete={triggerDeleteSubcontractorDocumentModal}
                                                onAddToFavorites={storageHook.addToFavorites}
                                                onAddDocument={() => setContactDocumentAction("add")}
                                            />
                                        </div>
                                    )}

                                    {["add", "edit"].includes(`${contactDocumentAction || getUrlQuery("action")}`) && (
                                        <div className="borderm d-flex gap-3">
                                            <CertificateForm
                                                action={`${contactDocumentAction}`}
                                                onCancel={() => {
                                                    updateUrlQuery({ key: "action", value: "" });
                                                    updateUrlQuery({ key: "certId", value: "" });
                                                    setContactDocumentAction("list");
                                                }}
                                            />
                                        </div>
                                    )}
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </div>
                )}
            </div>
        </>
    );
}

type SelectFileComponentState = {
    files: File[];
    dropZoneErrorMessage: string;
    filename: string;
    fileType: string;
};

type SelectFileComponentProps = {
    onFileChange: (file: SelectFileComponentState) => void;
    onRemoveFile: () => void;
};

function SelectFileComponent(props: SelectFileComponentProps) {
    const { onFileChange, onRemoveFile } = props;

    const [state, setState] = useReducer(
        (state: SelectFileComponentState, newState: Partial<SelectFileComponentState>) => ({ ...state, ...newState }),
        {
            files: [],
            dropZoneErrorMessage: "",
            filename: "",
            fileType: "",
        },
    );

    function handleOnFileChange(files: File[]) {
        const data = {
            files,
            dropZoneErrorMessage: "",
            filename: files[0].name,
            fileType: files[0].type,
        };
        setState(data);
        onFileChange(data);
    }

    const isFileSelected = state.files.length > 0;

    return (
        <>
            <Dropzone accept={ACCEPTED_FILES} multiple={false} onDrop={handleOnFileChange}>
                {({ getRootProps, getInputProps }) => (
                    <section
                        className={`dropzone-container ${
                            isFileSelected ? "dropzone-container-selected gap-4" : ""
                        } pointer border-radius-12`}
                        title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                    >
                        <div
                            {...getRootProps()}
                            className={`${
                                isFileSelected ? "p-0 d-flex align-items-center gap-4 justify-content-between" : ""
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div
                                className={`text-muted d-flex align-items-center ${
                                    isFileSelected ? "" : "flex-column text-center"
                                } text-centerm ${isFileSelected ? "gap-12" : "gap-3"} w-100 h-100`}
                            >
                                <DocumentText variant="Bold" size={40} color="#D1D1D1" />

                                {isFileSelected ? (
                                    <>
                                        <div className=" m-0 p-0 d-flex flex-column ">
                                            <p className="truncate-1 m-0">{state.files[0].name}</p>
                                            <p className="m-0">
                                                {(state.files[0].size / SIZE_IN_MB).toFixed(2)}
                                                {"mb"}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        Drag and drop file, or
                                        <a className="text-primary tb-body-default-medium offset"> Choose a file</a>
                                        <br />
                                        <small className="tb-body-small-regular text-gray-500">
                                            File types: .png, .jpg, .pdf
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                        {isFileSelected ? (
                            <div
                                className="d-flex cancel-dropzone align-items-center justify-content-center rounded-circle bg-grey"
                                onClick={e => {
                                    e.stopPropagation();
                                    onRemoveFile();
                                }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="size-6"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </div>
                        ) : (
                            ""
                        )}
                    </section>
                )}
            </Dropzone>
            <div>
                <Form.Group className="mb-4 mt-4">
                    <Form.Label>
                        File name <Required />
                    </Form.Label>

                    <Form.Control
                        type="text"
                        value={state.filename}
                        onChange={e => {
                            setState({ filename: e.target.value });
                        }}
                        required
                        placeholder="E.g Living Room Remodel"
                    />
                </Form.Group>
            </div>
        </>
    );
}

export function SubcontractorInsuranceCard(props: ContactDetailsCard2Props) {
    type CreateAttachmentModel = {
        id: string;
        files: File[];
        filename: string;
        fileType: string;
    };
    type ComponentState = {
        attachments: CreateAttachmentModel[];
        isAddingAdditionalFile: boolean;
        isLoading: boolean;
    };

    const { subContractor, onUpdate } = props;

    const { showToast } = useToast();

    const initialState: ComponentState = {
        attachments: [],
        isAddingAdditionalFile: false,
        isLoading: false,
    };

    const [state, setState] = useReducer(
        (state: ComponentState, newState: Partial<ComponentState>) => ({ ...state, ...newState }),
        initialState,
    );

    const hasInsurance = subContractor?.insurances?.length;
    const allAttachments = subContractor?.insurances[0]?.allAttachments;
    const hasAdditionalFiles = allAttachments?.length;

    function onAddAttachment() {
        const id = _.uniqueId("attachment_");
        setState({
            isAddingAdditionalFile: true,
            attachments: [
                ...state.attachments,
                {
                    id,
                    files: [],
                    filename: "",
                    fileType: "",
                },
            ],
        });
    }

    function onRemoveAttachment(id: string) {
        const filteredAttachments = state.attachments.filter(attachment => attachment.id !== id);
        setState({
            attachments: filteredAttachments,
            isAddingAdditionalFile: filteredAttachments.length > 0,
        });
    }

    function onFileChange(data: SelectFileComponentState, id: string) {
        const updatedAttachments = state.attachments.map(attachment => {
            if (attachment.id === id) {
                return {
                    ...attachment,
                    ...data,
                };
            }
            return attachment;
        });

        setState({
            attachments: updatedAttachments,
        });
    }

    async function uploadAttachment() {
        const insurance = subContractor?.insurances[0];
        console.assert(insurance !== undefined, "Insurance is not available.");
        if (!insurance) return;

        setState({ isLoading: true });

        const uploadPromises = state.attachments.map(async attachment => {
            const payload = {
                fileName: attachment.filename,
                fileType: attachment.fileType,
                originalFileName: attachment.filename,
                file: attachment.files[0],
            };

            try {
                const res = await DI.storageService.uploadFile(payload);
                return res;
            } catch (error) {
                showToast({
                    heading: "Error",
                    message: `File (${attachment.filename}) upload failed.`,
                    variant: "danger",
                });
            }
        });

        const uploadedFiles = await Promise.all(uploadPromises);

        if (!uploadedFiles.length) return;

        const filenames = {} as Record<string, string>;
        uploadedFiles.forEach(res => {
            if (!res?.file) return;
            filenames[res.file.id] = res?.file.originalFileName;
        });

        const payload = {
            additionalAttachments: [
                {
                    operation: "add",
                    files: uploadedFiles.map(res => res?.file.id),
                    filenames,
                },
            ],
        };

        try {
            await DI.contactService.updateSubcontractorInsurance(subContractor!.id, insurance.id!, payload);
            showToast({
                heading: "Success",
                message: "Insurance file has been uploaded.",
                variant: "success",
            });
            onUpdate?.();
        } catch {
            showToast({
                heading: "Error",
                message: "Insurance file upload failed.",
                variant: "danger",
            });
        } finally {
            setState(initialState);
        }
    }

    function reset() {
        setState(initialState);
    }

    function canAddAttachment() {
        return state.attachments.every(attachment => attachment.files.length && attachment.filename);
    }

    function canSaveChanges() {
        return state.attachments.length > 0 && canAddAttachment() && !state.isLoading;
    }

    async function onDeleteAttachment(file: StorageFile) {
        try {
            await DI.storageService.deleteFile(file.id);
            onUpdate?.();
        } catch {
            showToast({
                heading: "Error",
                message: `File ${file.originalFileName} deletion failed.`,
                variant: "danger",
            });
        }
    }

    return (
        <>
            <Row className="d-flex pt-4m justify-content-between gap-3m">
                <Col md={4} className="">
                    <p className="m-0 tb-body-small-medium text-muted">
                        <small>Carrier</small>
                    </p>

                    <div className="d-flex gap-2">
                        {subContractor?.insurances[0]?.file && (
                            <div className="rounded-1 border border-gray-100 flex-shrink-0 w-24 h-24">
                                <Image
                                    src={`${subContractor.insurances[0]?.file.thumbnail}`}
                                    loading="lazy"
                                    alt=""
                                    className="rounded-1 flex-shrink-0 object-fit-cover h-100"
                                    width={24}
                                    height={24}
                                />
                            </div>
                        )}

                        <p className="m-0 tb-body-default-medium">{subContractor?.insurances[0]?.carrier ?? "-"}</p>
                    </div>
                </Col>
                <Col md={4}>
                    <p className="m-0 tb-body-small-medium text-muted">
                        <small>Broker</small>
                    </p>
                    <p className="m-0 tb-body-default-medium">{subContractor?.insurances[0]?.broker ?? "-"}</p>
                </Col>
                <Col md={4}>
                    <p className="m-0 tb-body-small-medium text-muted">
                        <small>Insurance Type</small>
                    </p>
                    <p className="m-0 tb-body-default-medium">
                        {subContractor?.insurances[0]?.insuranceType
                            ? snakeCaseToSentenceCase(subContractor?.insurances[0]?.insuranceType)
                            : "-"}
                    </p>
                </Col>
            </Row>
            <Row>
                <Col md={4}>
                    <p className="m-0 tb-body-small-medium text-muted">
                        <small>Policy Number</small>
                    </p>
                    <p className="m-0 tb-body-default-medium">{subContractor?.insurances[0]?.policyNumber ?? "-"}</p>
                </Col>
                <Col md={4}>
                    <p className="m-0 tb-body-small-medium text-muted">
                        <small>Validity Start Date</small>
                    </p>
                    <p className="m-0 tb-body-default-medium">
                        {subContractor?.insurances[0]?.validFrom
                            ? formatDatetime(subContractor?.insurances[0]?.validFrom)
                            : "-"}
                    </p>
                </Col>
                <Col md={4}>
                    <p className="m-0 tb-body-small-medium text-muted">
                        <small>Validity End Date</small>
                    </p>
                    <p className="m-0 tb-body-default-medium">
                        {subContractor?.insurances[0]?.validTo
                            ? formatDatetime(subContractor?.insurances[0]?.validTo)
                            : "-"}
                    </p>
                </Col>
            </Row>
            <Row>
                <Col md={4}>
                    <p className="m-0 tb-body-small-medium text-muted">
                        <small>Reminder</small>
                    </p>
                    <p className="m-0 tb-body-default-medium">
                        {subContractor?.insurances[0]?.reminder
                            ? formatDatetime(subContractor?.insurances[0]?.reminder)
                            : "-"}
                    </p>
                </Col>
                <Col md={4}>
                    <p className="m-0 tb-body-small-medium text-muted">
                        <small>Notify Me</small>
                    </p>
                    <p className="m-0 tb-body-default-medium">
                        {subContractor?.insurances[0]?.reminder
                            ? convertIsoToFriendlyTime(subContractor?.insurances[0]?.reminder)
                            : "-"}
                    </p>
                </Col>
            </Row>

            {/* When insurance is not attached */}
            {!hasInsurance ? (
                <Row className="justify-content-center">
                    <Col>attach an insurance before uploading additional files</Col>
                </Row>
            ) : (
                <>
                    {/* When additional files are being added */}
                    {state.isAddingAdditionalFile && (
                        <Row className="justify-content-center">
                            <Col md={12}>
                                <header className="tb-body-default-medium">File {">"} new file</header>
                            </Col>

                            <Col className="d-flex flex-column gap-3" md={6}>
                                <Form.Group className="mb-4">
                                    <Form.Label>
                                        Attachment <Required />
                                    </Form.Label>

                                    {state.attachments.map((attachment, index) => (
                                        <SelectFileComponent
                                            key={index}
                                            onRemoveFile={() => {
                                                onRemoveAttachment(attachment.id);
                                            }}
                                            onFileChange={data => {
                                                onFileChange(data, attachment.id);
                                            }}
                                        />
                                    ))}
                                </Form.Group>

                                <div className="d-flex justify-content-center">
                                    <Button
                                        variant="secondary"
                                        className="px-12 py-12 d-flex gap-2 align-items-center text-primary tb-title-body-medium"
                                        disabled={!canAddAttachment()}
                                        onClick={() => onAddAttachment()}
                                    >
                                        <Plus size={20} /> New File
                                    </Button>
                                </div>

                                <div className="d-flex justify-content-center gap-3 mt-3">
                                    <Button variant="outline-secondary" onClick={reset} style={{ flex: 1 }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={uploadAttachment}
                                        style={{ flex: 2 }}
                                        disabled={!canSaveChanges()}
                                    >
                                        {state.isLoading ? <ButtonLoader buttonText={"Saving..."} /> : "Save"}
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    )}

                    {/* When additional files are not being added  and there are no additional files */}
                    {!state.isAddingAdditionalFile && !hasAdditionalFiles && (
                        <>
                            <Col className="d-flex flex-column gap-3 align-items-center justify-content-center p-3">
                                <UserAndBag />
                                <div className="d-flex flex-column gap-12 align-items-center justify-content-center">
                                    <h6 className="m-0 tb-title-body-medium text-gray-900">No File</h6>
                                    <p className="text-muted m-0 tb-body-default-regular">
                                        Files added can be managed here
                                    </p>
                                </div>
                                <Button
                                    variant="outline-secondary"
                                    size="lg"
                                    className="px-3 py-2 d-flex gap-2 align-items-center text-primary tb-title-body-medium"
                                    onClick={onAddAttachment}
                                >
                                    <Plus size={20} /> Add File
                                </Button>
                            </Col>
                        </>
                    )}

                    {/* When additional files are not being added  and there are additional files */}

                    {!state.isAddingAdditionalFile && !!hasAdditionalFiles && (
                        <>
                            <Row>
                                <Col md={6}>
                                    <h6 className="tb-body-default-medium">Files</h6>
                                </Col>
                                <Col md={6} className="d-flex justify-content-end">
                                    <Button
                                        variant="outline-secondary"
                                        className="px-12 py-12 d-flex gap-2 align-items-center text-primary tb-title-body-medium"
                                        onClick={() => onAddAttachment()}
                                    >
                                        <Plus size={20} /> Add file
                                    </Button>
                                </Col>
                            </Row>
                            <Row className="d-flex gap-3">
                                {allAttachments.map(file => (
                                    <Col md={3} key={file.id} className="borderm p-0">
                                        <ContactDocument
                                            file={file}
                                            onDelete={() => {
                                                onDeleteAttachment(file);
                                            }}
                                            fileType="storage"
                                            onItemClick={(document: any) => {}}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </>
            )}
        </>
    );
}
