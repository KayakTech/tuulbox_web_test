import { Accordion, Button, Col, Form, Row } from "react-bootstrap";
import DashboardLayout from "./DashboardLayout";
import FormLayout from "./FormLayout";
import Required from "./Required";
import Dropzone from "react-dropzone";
import { useEffect, useState } from "react";
import FormErrorMessage from "./FormErrorMessage";
import Link from "next/link";
import ButtonLoader from "./ButtonLoader";
import useContact from "@/hooks/useContact";
import {
    convertDateStringToIsoString,
    getFullUrlQueryValue,
    getUrlQuery,
    isAlphabetic,
    isEmptyObject,
    isNumbersOnly,
    isValidEmail,
    validateMobileNumber,
} from "@/helpers";
import FeedbackModal from "./FeedbackModal";
import { Calendar, CheckCircle, X } from "react-feather";
import { useRouter } from "next/router";
import PageLoader from "./PageLoader";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { People, DocumentText, CloseCircle, Gallery } from "iconsax-react";
import { COUNTRIES } from "@/helpers/countries";
import SelectedFileBox from "./SelectedFileBox";
import DeleteModal from "./DeleteModal";
import { DATE_PICKER_FORMAT, HOST, INSURANCE_TYPES, LICENSE_TYPES, PREDEFINED_TIMES } from "@/helpers/constants";
import DatePicker from "react-date-picker";
import TimeSelector, { SelectTimetype } from "./TimeSelector";
import TimePickerModal from "./TimePickerModal";
import { toInteger } from "lodash";

type ContactFormState = {
    action: string;
};
export default function ContactForm(props: ContactFormState) {
    const { action } = props;
    const [useAsSubcontractor, setUseAsSubcontractor] = useState<boolean>(false);

    const {
        subcontractor,
        contact,
        setContact,
        isLoading,
        errorMessage,
        isSubmitting,
        handleSubcontractorToggle,
        handleTaxDocumentToggle,
        taxDocument,
        acceptedFiles,
        dropZoneErrorMessage,
        handleOnFileChange,
        handleSubmit,
        showModal,
        setShowModal,
        feedbackMessage,
        handleAddAgain,
        setAddSubcontractorInformation,
        isSubcontractor,
        setContactId,
        getContact,
        showDeleteModal,
        setShowDeleteModal,
        addLicenseAndInsurance,
        setAddLicenseAndInsurance,
        insurance,
        setInsurance,
        handleTimeSelection,

        insuranceFile,
        setInsuranceFile,
        showInsuranceTimePickerModal,
        setShowInsuranceTimePickerModal,
        showLicenseTimePickerModal,
        setShowlicenseTimePickerModal,
        license,
        setLicense,
        handleOnInsuranceFileChange,
        handleOnLicenseFileChange,
        removeUploadedFiles,
        uploadedFileTypeToRemove,
        setTaxDocument,
    } = useContact({ action });

    useEffect(() => {
        if (action === "edit") {
            const id = window.location.pathname.split("/")[3];
            setContactId(id);
            getContact(id);
        }

        const url = new URL(location.href);
        const searchParams = url.searchParams;
        const subcontractor = searchParams.get("subcontractor");
        if (subcontractor === "true") {
            setUseAsSubcontractor(true);
            setContact({ isSubcontractor: true });
            setAddSubcontractorInformation(true);
        }
    }, [action]);
    const sizeInMB = toInteger((1024 * 1024).toFixed(2));

    const isFormValid = () => {
        if (isSubmitting || !contact.company || !contact.firstName || !isAlphabetic(contact.firstName)) {
            return false;
        }

        if (contact.email && !isValidEmail(contact.email)) {
            return false;
        }

        if (contact.isSubcontractor) {
            if (!contact.taxId) {
                return false;
            }

            if (contact.hasTaxDocuments) {
                if (!contact.taxDocumentName) {
                    return false;
                }

                if (action === "add" && !taxDocument.length) {
                    return false;
                }

                if (action === "edit" && !contact.certificates?.length && (!taxDocument || !taxDocument.length)) {
                    return false;
                }

                if (addLicenseAndInsurance) {
                    // License validations
                    if (
                        !license.licenseType ||
                        !license.name ||
                        !license.licenseNumber ||
                        !license.validFrom ||
                        !license.validTo ||
                        !license.reminder
                    ) {
                        return false;
                    }

                    // Insurance validations
                    if (
                        !insurance.insuranceType ||
                        !insurance.carrier ||
                        !insurance.validFrom ||
                        !insurance.validTo ||
                        !insurance.reminder
                    ) {
                        return false;
                    }
                }
            }
        }

        return true;
    };

    return (
        <DashboardLayout
            pageTitle="Add Contact"
            breadCrumbs={[
                { name: "Contact", url: "/contacts" },
                { name: action === "add" ? "New Contact" : "Update Contact" },
            ]}
        >
            {isLoading && action === "edit" ? (
                <PageLoader />
            ) : (
                <div className="my-5">
                    <FormLayout
                        leftSideIcon={<People size={24} color="#888888" />}
                        leftSideText={action === "add" ? "New Contact" : "Update Contact"}
                        leftSideDescription={
                            action === "add"
                                ? "Fill in the correct details to add a new contact"
                                : "Fill in the correct details to update a new contact"
                        }
                    >
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6} sm={6} xs={6} xl={6} xxl={6} className="padding-start">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            First Name <Required />
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={contact.firstName}
                                            onChange={e => {
                                                if (isAlphabetic(e.target.value) || !e.target.value) {
                                                    setContact({ firstName: e.target.value });
                                                }
                                            }}
                                            placeholder="Mike"
                                            required
                                            className={`${
                                                contact.firstName && !isAlphabetic(contact.firstName)
                                                    ? "border-danger"
                                                    : ""
                                            }`}
                                        />
                                        {contact.firstName && !isAlphabetic(contact.firstName) && (
                                            <small className="text-danger">Please enter a valid name</small>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6} sm={6} xs={6} xl={6} xxl={6} className="padding-end">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Last Name{" "}
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={contact.lastName}
                                            onChange={e => {
                                                if (isAlphabetic(e.target.value) || !e.target.value) {
                                                    setContact({ lastName: e.target.value });
                                                }
                                            }}
                                            placeholder="Jones"
                                            className={`${
                                                contact?.lastName && !isAlphabetic(contact?.lastName)
                                                    ? "border-danger"
                                                    : ""
                                            }`}
                                        />
                                        {contact.lastName && !isAlphabetic(contact.lastName) && (
                                            <small className="text-danger">Please enter a valid name</small>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={contact.email}
                                    onChange={e => setContact({ email: e.target.value })}
                                    placeholder="E.g mjones3@mail.com"
                                    className={`${
                                        contact.email && !isValidEmail(contact.email) ? "border-danger" : ""
                                    }`}
                                />
                                {contact.email && !isValidEmail(contact.email) && (
                                    <small className="text-danger">Please enter a valid email</small>
                                )}
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Phone</Form.Label>

                                <PhoneInput
                                    country={"us"}
                                    value={contact.phoneNumber}
                                    onChange={value => setContact({ phoneNumber: validateMobileNumber(value) })}
                                    placeholder="E.g +233 552 534 233"
                                    specialLabel=""
                                    countryCodeEditable={false}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Extension</Form.Label>

                                <Form.Control
                                    type="text"
                                    value={contact.extension}
                                    onChange={e =>
                                        isNumbersOnly(e.target.value) && setContact({ extension: e.target.value })
                                    }
                                    placeholder="E.g 1234"
                                    maxLength={5}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Company <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={contact.company}
                                    onChange={e => setContact({ company: e.target.value })}
                                    placeholder="E.g Kayak Tech Group"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Address Line 1</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={contact.addressLine1}
                                    onChange={e => setContact({ addressLine1: e.target.value })}
                                    placeholder="E.g 35 Ezra Road, Lashibi Comm. 18. Tema"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Address Line 2</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={contact.addressLine2}
                                    onChange={e => setContact({ addressLine2: e.target.value })}
                                    placeholder="E.g 35 Ezra Road, Lashibi Comm. 18. Tema"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">City</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={contact.city}
                                    onChange={e => setContact({ city: e.target.value })}
                                    placeholder="E.g Accra"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">State</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={contact.state}
                                    onChange={e => setContact({ state: e.target.value })}
                                    placeholder="E.g Accra"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Zip Code</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={contact.zipCode}
                                    onChange={e => {
                                        if (isNumbersOnly(e.target.value) || "") {
                                            setContact({ zipCode: e.target.value });
                                        }
                                    }}
                                    placeholder="E.g 112789"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Country</Form.Label>
                                <Form.Select
                                    value={contact.country}
                                    onChange={e => setContact({ country: e.target.value })}
                                    placeholder="E.g Ghana"
                                >
                                    <option value="" disabled hidden></option>
                                    {COUNTRIES.map(country => (
                                        <option key={country.name} value={country.name}>
                                            {country.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            {(action === "add" || (action === "edit" && !contact.subcontractorId)) && (
                                <Row>
                                    <Col className="d-flex align-items-center m-0 ">
                                        <Form.Check
                                            id="addSubcontractor"
                                            type="checkbox"
                                            label="Add subcontractor information"
                                            className="d-flex gap-12 align-items-center text-gray-600 tb-body-small-medium"
                                            onChange={handleSubcontractorToggle}
                                            checked={contact?.isSubcontractor || useAsSubcontractor ? true : false}
                                        />
                                    </Col>
                                </Row>
                            )}

                            {isSubcontractor || useAsSubcontractor ? (
                                <div className="">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Tax ID <Required />
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={contact.taxId}
                                            onChange={e => {
                                                setContact({ taxId: e.target.value });
                                            }}
                                            placeholder="E.g *** ** 8465"
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-4 d-flex justify-content-between">
                                        <Form.Label
                                            htmlFor="tax-document"
                                            className="d-flex align-items-center m-0 pointer text-gray-600 tb-body-small-medium"
                                        >
                                            Do you have tax document?
                                        </Form.Label>

                                        <Form.Check
                                            id="tax-document"
                                            type="switch"
                                            className="d-flex justify-content-end big"
                                            defaultChecked={contact.hasTaxDocuments}
                                            onChange={handleTaxDocumentToggle}
                                        />
                                    </Form.Group>
                                    {contact.hasTaxDocuments ? (
                                        <>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                                    Tax Document <Required />
                                                </Form.Label>
                                                {contact.certificates?.length ? (
                                                    <div className="mb-4">
                                                        <SelectedFileBox
                                                            file={contact.certificates[0]}
                                                            onDelete={file => {
                                                                removeUploadedFiles("subcontractor");
                                                            }}
                                                            isEditing={true}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Dropzone
                                                        accept={acceptedFiles}
                                                        multiple={false}
                                                        onDrop={handleOnFileChange}
                                                        disabled={false}
                                                    >
                                                        {({ getRootProps, getInputProps }) => (
                                                            <section
                                                                className={`dropzone-container ${
                                                                    taxDocument?.length
                                                                        ? "dropzone-container-selected gap-4"
                                                                        : ""
                                                                } pointer border-radius-12`}
                                                                title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                                            >
                                                                <div
                                                                    {...getRootProps()}
                                                                    className={`${
                                                                        taxDocument?.length
                                                                            ? "p-0 d-flex align-items-center gap-4 justify-content-between"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <input {...getInputProps()} />

                                                                    <div
                                                                        className={`text-muted d-flex align-items-center ${
                                                                            taxDocument?.length
                                                                                ? ""
                                                                                : "flex-column text-center"
                                                                        } text-centerm ${
                                                                            taxDocument?.length ? "gap-12" : "gap-3"
                                                                        } w-100 h-100`}
                                                                    >
                                                                        {taxDocument?.length ? (
                                                                            <Gallery size="32" color="#888888" />
                                                                        ) : (
                                                                            <DocumentText
                                                                                variant="Bold"
                                                                                size={40}
                                                                                color="#D1D1D1"
                                                                            />
                                                                        )}
                                                                        {taxDocument?.length ? (
                                                                            <>
                                                                                <div className=" m-0 p-0 d-flex flex-column ">
                                                                                    <p className="truncate-1 m-0">
                                                                                        {taxDocument[0].name}
                                                                                    </p>
                                                                                    <p className="m-0">
                                                                                        {(
                                                                                            taxDocument[0].size /
                                                                                            sizeInMB
                                                                                        ).toFixed(2)}
                                                                                        {"mb"}
                                                                                    </p>
                                                                                </div>
                                                                            </>
                                                                        ) : (
                                                                            <div className="tb-body-default-medium text-gray-500">
                                                                                Drag and drop or{" "}
                                                                                <a className="text-primary tb-body-default-medium offset">
                                                                                    Choose a File
                                                                                </a>
                                                                                <br />
                                                                                <small className="tb-body-small-regular text-gray-500">
                                                                                    File types: .png, .jpg, .pdf
                                                                                </small>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {taxDocument.length ? (
                                                                    <div
                                                                        className="d-flex cancel-dropzone align-items-center justify-content-center rounded-circle bg-grey"
                                                                        onClick={e => {
                                                                            e.stopPropagation();
                                                                            setTaxDocument([]);
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
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M6 18 18 6M6 6l12 12"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </section>
                                                        )}
                                                    </Dropzone>
                                                )}
                                            </Form.Group>
                                            <Form.Group className="mb-4">
                                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                                    Tax Document Name <Required />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={contact.taxDocumentName}
                                                    onChange={e => setContact({ taxDocumentName: e.target.value })}
                                                    placeholder="E.g Tax Document 2023"
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-4 d-flex justify-content-between">
                                                <Form.Label
                                                    htmlFor="add-license-and-insurance"
                                                    className="d-flex align-items-center m-0 pointer text-gray-600 tb-body-small-medium"
                                                >
                                                    Do you want to add Insurance/License?
                                                </Form.Label>

                                                <Form.Check
                                                    id="add-license-and-insurance"
                                                    type="switch"
                                                    className="d-flex justify-content-end big"
                                                    defaultChecked={addLicenseAndInsurance}
                                                    onChange={() => setAddLicenseAndInsurance(!addLicenseAndInsurance)}
                                                />
                                            </Form.Group>

                                            {addLicenseAndInsurance && (
                                                <>
                                                    <Accordion
                                                        defaultActiveKey={["0", "1"]}
                                                        alwaysOpen
                                                        className="p-0 m-0 border-0 form"
                                                    >
                                                        <Accordion.Item eventKey="0" className="p-0 border-0 mb-4">
                                                            <Accordion.Header className="p-0 mb-3 tb-title-body-medium text-gray-900">
                                                                License
                                                            </Accordion.Header>
                                                            <Accordion.Body className="p-0">
                                                                <p className="w-75">
                                                                    <small className="text-gray-500 tb-body-default-regular mb-3">
                                                                        Please fill in the right details to add license
                                                                        to subcontractor details
                                                                    </small>
                                                                </p>
                                                                <div>
                                                                    {/* Type of License */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Type of License <Required />
                                                                        </Form.Label>
                                                                        <Form.Select
                                                                            value={license.licenseType}
                                                                            onChange={e =>
                                                                                setLicense({
                                                                                    licenseType: e.target.value,
                                                                                })
                                                                            }
                                                                            required
                                                                        >
                                                                            <option
                                                                                value=""
                                                                                hidden
                                                                                disabled
                                                                                className="text-muted"
                                                                            >
                                                                                Select license type
                                                                            </option>
                                                                            {LICENSE_TYPES.map(
                                                                                (license: any, index: number) => (
                                                                                    <option
                                                                                        key={license.value + index}
                                                                                        value={license.value}
                                                                                    >
                                                                                        {license.label}
                                                                                    </option>
                                                                                ),
                                                                            )}
                                                                        </Form.Select>
                                                                    </Form.Group>

                                                                    {/* Other */}
                                                                    {license?.licenseType?.toLowerCase() ===
                                                                        "other" && (
                                                                        <Form.Group className="mb-4">
                                                                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                                Other (Type of license) <Required />
                                                                            </Form.Label>
                                                                            <Form.Control
                                                                                type="text"
                                                                                value={license.customLicenseType}
                                                                                onChange={e =>
                                                                                    setLicense({
                                                                                        customLicenseType:
                                                                                            e.target.value,
                                                                                    })
                                                                                }
                                                                                placeholder="Please input other type of license here"
                                                                                required
                                                                            />
                                                                        </Form.Group>
                                                                    )}

                                                                    {/* License Name */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            License <Required />
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={license.name}
                                                                            onChange={e =>
                                                                                setLicense({
                                                                                    name: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder="Mike"
                                                                            required
                                                                        />
                                                                    </Form.Group>

                                                                    {/* License Number */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            License Number <Required />
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            placeholder="E.g 83668"
                                                                            value={license.licenseNumber}
                                                                            onChange={e =>
                                                                                setLicense({
                                                                                    licenseNumber: e.target.value,
                                                                                })
                                                                            }
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                    <Row>
                                                                        <Col
                                                                            md={6}
                                                                            xs={6}
                                                                            xl={6}
                                                                            xxl={6}
                                                                            sm={6}
                                                                            className="padding padding-start"
                                                                        >
                                                                            {/* Validity Start Date*/}
                                                                            <Form.Group className="mb-4">
                                                                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                                    Validity Start Date <Required />
                                                                                </Form.Label>
                                                                                <DatePicker
                                                                                    onChange={value =>
                                                                                        setLicense({
                                                                                            validFrom: value
                                                                                                ? convertDateStringToIsoString(
                                                                                                      value as Date,
                                                                                                  )
                                                                                                : "",
                                                                                        })
                                                                                    }
                                                                                    value={license.validFrom}
                                                                                    dayPlaceholder="dd"
                                                                                    monthPlaceholder="mm"
                                                                                    yearPlaceholder="yyyy"
                                                                                    format={DATE_PICKER_FORMAT}
                                                                                    required
                                                                                    className={`form-control`}
                                                                                    calendarIcon={
                                                                                        !license.validFrom ? (
                                                                                            <Calendar
                                                                                                size={16}
                                                                                                color="#B0B0B0"
                                                                                            />
                                                                                        ) : null
                                                                                    }
                                                                                    clearIcon={
                                                                                        license.validFrom ? (
                                                                                            <X
                                                                                                size={16}
                                                                                                color="#B0B0B0"
                                                                                            />
                                                                                        ) : null
                                                                                    }
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col
                                                                            md={6}
                                                                            xs={6}
                                                                            xl={6}
                                                                            xxl={6}
                                                                            sm={6}
                                                                            className=" padding padding-end"
                                                                        >
                                                                            {/* Validity End Date */}
                                                                            <Form.Group className="mb-4">
                                                                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                                    Validity End Date <Required />
                                                                                </Form.Label>
                                                                                <DatePicker
                                                                                    onChange={value =>
                                                                                        value
                                                                                            ? setLicense({
                                                                                                  validTo: value
                                                                                                      ? convertDateStringToIsoString(
                                                                                                            value as Date,
                                                                                                        )
                                                                                                      : "",
                                                                                              })
                                                                                            : ""
                                                                                    }
                                                                                    value={license.validTo}
                                                                                    dayPlaceholder="dd"
                                                                                    monthPlaceholder="mm"
                                                                                    yearPlaceholder="yyyy"
                                                                                    format={DATE_PICKER_FORMAT}
                                                                                    required
                                                                                    className={`form-control`}
                                                                                    calendarIcon={
                                                                                        !license.validTo ? (
                                                                                            <Calendar
                                                                                                size={16}
                                                                                                color="#B0B0B0"
                                                                                            />
                                                                                        ) : null
                                                                                    }
                                                                                    clearIcon={
                                                                                        license.validTo ? (
                                                                                            <X
                                                                                                size={16}
                                                                                                color="#B0B0B0"
                                                                                            />
                                                                                        ) : null
                                                                                    }
                                                                                    minDate={
                                                                                        new Date(license.validFrom)
                                                                                    }
                                                                                    disabled={!license.validFrom}
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                    </Row>

                                                                    {/* Reminder */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Reminder <Required />
                                                                        </Form.Label>
                                                                        <input
                                                                            type="datetime-local"
                                                                            className={`form-control`}
                                                                            onChange={e =>
                                                                                setLicense({
                                                                                    reminder: e.target.value,
                                                                                })
                                                                            }
                                                                            value={license.reminder}
                                                                        />
                                                                    </Form.Group>
                                                                </div>
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                        <Accordion.Item eventKey="1" className="border-0 mb-3">
                                                            <Accordion.Header className="mb-3 align-items-start text-gray-900 tb-title-body-medium">
                                                                Insurance
                                                            </Accordion.Header>
                                                            <Accordion.Body className="p-0">
                                                                <p className="w-75">
                                                                    <small className="text-gray-500 tb-body-default-regular mb-3">
                                                                        Please fill in the right details to add
                                                                        insurance to subcontractor details
                                                                    </small>
                                                                </p>
                                                                <div>
                                                                    {/* Type of Insurancne */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Type of Insurancne <Required />
                                                                        </Form.Label>
                                                                        <Form.Select
                                                                            value={insurance.insuranceType}
                                                                            onChange={e =>
                                                                                setInsurance({
                                                                                    insuranceType: e.target.value,
                                                                                })
                                                                            }
                                                                            required
                                                                        >
                                                                            <option value="" hidden disabled>
                                                                                Select insurance type
                                                                            </option>
                                                                            {INSURANCE_TYPES.map(
                                                                                (insuranceType: any, index: number) => (
                                                                                    <option
                                                                                        key={
                                                                                            insuranceType.value + index
                                                                                        }
                                                                                        value={insuranceType.value}
                                                                                    >
                                                                                        {insuranceType.label}
                                                                                    </option>
                                                                                ),
                                                                            )}
                                                                        </Form.Select>
                                                                    </Form.Group>
                                                                    {/* Other */}
                                                                    {insurance?.insuranceType?.toLowerCase() ===
                                                                        "other" && (
                                                                        <Form.Group className="mb-4">
                                                                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                                Other (Type of insurance) <Required />
                                                                            </Form.Label>
                                                                            <Form.Control
                                                                                type="text"
                                                                                value={insurance?.customInsuranceType}
                                                                                onChange={e =>
                                                                                    setInsurance({
                                                                                        customInsuranceType:
                                                                                            e.target.value,
                                                                                    })
                                                                                }
                                                                                placeholder="Please input the other insurance type here"
                                                                                required
                                                                            />
                                                                        </Form.Group>
                                                                    )}
                                                                    {/* Carrier */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Carrier <Required />
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={insurance.carrier}
                                                                            onChange={e =>
                                                                                setInsurance({
                                                                                    carrier: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder="E.g State Farm"
                                                                            required
                                                                        />
                                                                    </Form.Group>
                                                                    {/* Broker */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Broker
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={insurance?.broker}
                                                                            onChange={e =>
                                                                                setInsurance({ broker: e.target.value })
                                                                            }
                                                                            placeholder="Broker here"
                                                                        />
                                                                    </Form.Group>
                                                                    {/* Agent */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Agent
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            placeholder="E.g Mary Rich"
                                                                            value={insurance.agent}
                                                                            onChange={e =>
                                                                                setInsurance({ agent: e.target.value })
                                                                            }
                                                                        />
                                                                    </Form.Group>
                                                                    {/* Contact*/}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Contact
                                                                        </Form.Label>
                                                                        <PhoneInput
                                                                            value={insurance.contact}
                                                                            onChange={value =>
                                                                                setInsurance({
                                                                                    contact:
                                                                                        validateMobileNumber(value),
                                                                                })
                                                                            }
                                                                            placeholder="E.g +19256754433"
                                                                            specialLabel=""
                                                                            countryCodeEditable={false}
                                                                            country={"us"}
                                                                        />
                                                                    </Form.Group>

                                                                    {/* Extension */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Extension
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={insurance?.extension}
                                                                            onChange={e =>
                                                                                setInsurance({
                                                                                    extension: e.target.value,
                                                                                })
                                                                            }
                                                                            maxLength={5}
                                                                            placeholder="4433"
                                                                        />
                                                                    </Form.Group>

                                                                    {/* Email */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Email
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="email"
                                                                            value={insurance.email}
                                                                            placeholder="E.g mrich@gmail.com"
                                                                            onChange={e =>
                                                                                setInsurance({ email: e.target.value })
                                                                            }
                                                                        />
                                                                    </Form.Group>

                                                                    <Row>
                                                                        <Col
                                                                            md={6}
                                                                            xs={6}
                                                                            xl={6}
                                                                            xxl={6}
                                                                            sm={6}
                                                                            className="padding-start"
                                                                        >
                                                                            {/* Validity Start Date*/}
                                                                            <Form.Group className="mb-4">
                                                                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                                    Validity Start Date <Required />
                                                                                </Form.Label>
                                                                                <DatePicker
                                                                                    onChange={value =>
                                                                                        setInsurance({
                                                                                            validFrom: value
                                                                                                ? convertDateStringToIsoString(
                                                                                                      value as Date,
                                                                                                  )
                                                                                                : "",
                                                                                        })
                                                                                    }
                                                                                    value={insurance.validFrom}
                                                                                    dayPlaceholder="dd"
                                                                                    monthPlaceholder="mm"
                                                                                    yearPlaceholder="yyyy"
                                                                                    format={DATE_PICKER_FORMAT}
                                                                                    required
                                                                                    className={`form-control`}
                                                                                    calendarIcon={
                                                                                        !insurance.validFrom ? (
                                                                                            <Calendar
                                                                                                size={16}
                                                                                                color="#B0B0B0"
                                                                                            />
                                                                                        ) : null
                                                                                    }
                                                                                    clearIcon={
                                                                                        insurance.validFrom ? (
                                                                                            <X
                                                                                                size={16}
                                                                                                color="#B0B0B0"
                                                                                            />
                                                                                        ) : null
                                                                                    }
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col
                                                                            md={6}
                                                                            xs={6}
                                                                            xl={6}
                                                                            xxl={6}
                                                                            sm={6}
                                                                            className="padding-end"
                                                                        >
                                                                            {/* Validity End Date */}
                                                                            <Form.Group className="mb-4">
                                                                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                                    Validity End Date <Required />
                                                                                </Form.Label>
                                                                                <DatePicker
                                                                                    onChange={value =>
                                                                                        setInsurance({
                                                                                            validTo: value
                                                                                                ? convertDateStringToIsoString(
                                                                                                      value as Date,
                                                                                                  )
                                                                                                : "",
                                                                                        })
                                                                                    }
                                                                                    value={insurance.validTo}
                                                                                    dayPlaceholder="dd"
                                                                                    monthPlaceholder="mm"
                                                                                    yearPlaceholder="yyyy"
                                                                                    format={DATE_PICKER_FORMAT}
                                                                                    required
                                                                                    className={`form-control`}
                                                                                    calendarIcon={
                                                                                        !insurance.validTo ? (
                                                                                            <Calendar
                                                                                                size={16}
                                                                                                color="#B0B0B0"
                                                                                            />
                                                                                        ) : null
                                                                                    }
                                                                                    clearIcon={
                                                                                        insurance.validTo ? (
                                                                                            <X
                                                                                                size={16}
                                                                                                color="#B0B0B0"
                                                                                            />
                                                                                        ) : null
                                                                                    }
                                                                                    minDate={
                                                                                        new Date(insurance.validFrom)
                                                                                    }
                                                                                    disabled={!insurance.validFrom}
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                    </Row>

                                                                    {/* Reminder */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Reminder <Required />
                                                                        </Form.Label>

                                                                        <input
                                                                            type="datetime-local"
                                                                            className={`form-control`}
                                                                            onChange={e =>
                                                                                setInsurance({
                                                                                    reminder: e.target.value,
                                                                                })
                                                                            }
                                                                            value={insurance.reminder}
                                                                        />
                                                                    </Form.Group>

                                                                    {/* Attachment */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Policy
                                                                            {dropZoneErrorMessage && (
                                                                                <p className="m-0 text-danger small">
                                                                                    {dropZoneErrorMessage}
                                                                                </p>
                                                                            )}{" "}
                                                                        </Form.Label>

                                                                        {insurance.file != null &&
                                                                        !isEmptyObject(insurance.file) ? (
                                                                            <div className="mb-4">
                                                                                <SelectedFileBox
                                                                                    file={insurance.file}
                                                                                    onDelete={file =>
                                                                                        removeUploadedFiles("insurance")
                                                                                    }
                                                                                    isEditing={true}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <Dropzone
                                                                                accept={acceptedFiles}
                                                                                multiple={false}
                                                                                onDrop={handleOnInsuranceFileChange}
                                                                                disabled={false}
                                                                            >
                                                                                {({ getRootProps, getInputProps }) => (
                                                                                    <section
                                                                                        className={`dropzone-container ${
                                                                                            insuranceFile?.length
                                                                                                ? "dropzone-container-selected gap-4"
                                                                                                : ""
                                                                                        } pointer border-radius-12`}
                                                                                        title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                                                                    >
                                                                                        <div
                                                                                            {...getRootProps()}
                                                                                            className={`${
                                                                                                insuranceFile?.length
                                                                                                    ? "p-0 d-flex align-items-center gap-4 justify-content-between"
                                                                                                    : ""
                                                                                            }`}
                                                                                        >
                                                                                            <input
                                                                                                {...getInputProps()}
                                                                                            />
                                                                                            <div
                                                                                                className={`text-muted d-flex align-items-center ${
                                                                                                    insuranceFile?.length
                                                                                                        ? ""
                                                                                                        : "flex-column text-center"
                                                                                                } text-centerm ${
                                                                                                    insuranceFile?.length
                                                                                                        ? "gap-12"
                                                                                                        : "gap-3"
                                                                                                } w-100 h-100`}
                                                                                            >
                                                                                                {insuranceFile?.length ? (
                                                                                                    <Gallery
                                                                                                        size="32"
                                                                                                        color="#888888"
                                                                                                    />
                                                                                                ) : (
                                                                                                    <DocumentText
                                                                                                        variant="Bold"
                                                                                                        size={40}
                                                                                                        color="#D1D1D1"
                                                                                                    />
                                                                                                )}
                                                                                                {insuranceFile?.length ? (
                                                                                                    <>
                                                                                                        <div className=" m-0 p-0 d-flex flex-column ">
                                                                                                            <p className="truncate-1 m-0">
                                                                                                                {
                                                                                                                    insuranceFile[0]
                                                                                                                        .name
                                                                                                                }
                                                                                                            </p>
                                                                                                            <p className="m-0">
                                                                                                                {(
                                                                                                                    insuranceFile[0]
                                                                                                                        .size /
                                                                                                                    sizeInMB
                                                                                                                ).toFixed(
                                                                                                                    2,
                                                                                                                )}
                                                                                                                {"mb"}
                                                                                                            </p>
                                                                                                        </div>
                                                                                                    </>
                                                                                                ) : (
                                                                                                    <div className="tb-body-default-medium text-gray-500">
                                                                                                        Drag and drop
                                                                                                        file, or{" "}
                                                                                                        <a className="text-primary offset tb-body-default-medium">
                                                                                                            Choose a
                                                                                                            File
                                                                                                        </a>
                                                                                                        <br />
                                                                                                        <small className="tb-body-small-regular text-gray-500">
                                                                                                            File types:
                                                                                                            .png, .jpg,
                                                                                                            .pdf
                                                                                                        </small>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                        {insuranceFile?.length ? (
                                                                                            <div
                                                                                                className="d-flex cancel-dropzone align-items-center justify-content-center rounded-circle bg-grey"
                                                                                                onClick={e => {
                                                                                                    e.stopPropagation();
                                                                                                    setInsuranceFile(
                                                                                                        [],
                                                                                                    );
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
                                                                                                    <path
                                                                                                        strokeLinecap="round"
                                                                                                        strokeLinejoin="round"
                                                                                                        d="M6 18 18 6M6 6l12 12"
                                                                                                    />
                                                                                                </svg>
                                                                                            </div>
                                                                                        ) : (
                                                                                            ""
                                                                                        )}
                                                                                    </section>
                                                                                )}
                                                                            </Dropzone>
                                                                        )}
                                                                    </Form.Group>

                                                                    {/* Policy Number */}
                                                                    <Form.Group className="mb-4">
                                                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                            Policy Number
                                                                        </Form.Label>
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={insurance?.policyNumber}
                                                                            onChange={e =>
                                                                                setInsurance({
                                                                                    policyNumber: e.target.value,
                                                                                })
                                                                            }
                                                                            placeholder="129*7389"
                                                                        />
                                                                    </Form.Group>
                                                                </div>
                                                            </Accordion.Body>
                                                        </Accordion.Item>
                                                    </Accordion>
                                                </>
                                            )}
                                        </>
                                    ) : null}
                                </div>
                            ) : null}

                            <div className="mt-5">
                                {errorMessage && <FormErrorMessage message={errorMessage} />}
                                <div className="d-flex gap-20 w-100">
                                    <Link
                                        href={
                                            getFullUrlQueryValue("redirect")
                                                ? getFullUrlQueryValue("redirect")
                                                : "/contacts"
                                        }
                                        className="text-decoration-none"
                                    >
                                        <Button
                                            className="w-140 btn-140 px-3 py-2 tb-title-body-medium"
                                            variant="outline-secondary"
                                            size="lg"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>

                                    <Button
                                        className="w-100 tb-title-body-medium"
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={!isFormValid()}
                                    >
                                        {isSubmitting ? <ButtonLoader buttonText={"Saving"} /> : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </FormLayout>

                    {/* Delete File Modal */}
                    <DeleteModal
                        showModal={showDeleteModal}
                        setShowModal={(value: boolean) => setShowDeleteModal(value)}
                        dataToDeleteName={"document"}
                        message="Are you sure you want to delete document?"
                        onYesDelete={() => {
                            if (uploadedFileTypeToRemove === "subcontractor") {
                                setContact({ certificates: [] });
                            }
                            if (uploadedFileTypeToRemove === "insurance") {
                                setInsurance({ policy: "", file: {}, policyNumber: "" });
                            }
                            setShowDeleteModal(false);
                        }}
                    />

                    {/* Success modal */}
                    <FeedbackModal
                        icon={<CheckCircle color="green" size={50} />}
                        showModal={showModal}
                        setShowModal={setShowModal}
                        primaryButtonText={`${getUrlQuery("projectId") ? "Go Back" : "Go to contacts"}`}
                        primaryButtonUrl={`${
                            getFullUrlQueryValue("redirect") ? getFullUrlQueryValue("redirect") : "/contacts"
                        }`}
                        secondaryButtonText={action === "edit" ? "Close" : "Add another contact"}
                        feedbackMessage={feedbackMessage}
                        onSecondaryButtonClick={handleAddAgain}
                    />

                    <TimePickerModal
                        showModal={showInsuranceTimePickerModal}
                        setShowModal={setShowInsuranceTimePickerModal}
                        onSelectedTime={(value: SelectTimetype) =>
                            handleTimeSelection({ selectedTime: value, module: "insurance" })
                        }
                    />
                    <TimePickerModal
                        showModal={showLicenseTimePickerModal}
                        setShowModal={setShowlicenseTimePickerModal}
                        onSelectedTime={(value: SelectTimetype) =>
                            handleTimeSelection({ selectedTime: value, module: "license" })
                        }
                    />
                </div>
            )}
        </DashboardLayout>
    );
}
