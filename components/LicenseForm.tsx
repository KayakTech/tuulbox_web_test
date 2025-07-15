import { useEffect } from "react";
import PageLoader from "./PageLoader";
import DashboardLayout from "./DashboardLayout";
import { Row, Col, Button, Form } from "react-bootstrap";
import FormLayout from "./FormLayout";
import ButtonLoader from "./ButtonLoader";
import FormErrorMessage from "./FormErrorMessage";
import Link from "next/link";
import { CheckCircle, X } from "react-feather";
import FeedbackModal from "./FeedbackModal";
import Required from "./Required";
import { Calendar, DocumentText, Gallery, Personalcard } from "iconsax-react";
import DatePicker from "react-date-picker";
import useLicense from "@/hooks/license";
import { convertDateStringToIsoString, isEmptyObject } from "@/helpers";
import { DATE_PICKER_FORMAT, LICENSE_TYPES, PREDEFINED_TIMES } from "@/helpers/constants";
import TimeSelector, { SelectTimetype } from "./TimeSelector";
import TimePickerModal from "./TimePickerModal";
import SelectedFileBox from "./SelectedFileBox";
import Dropzone from "react-dropzone";
import { toInteger } from "lodash";

type LicenseFormProps = {
    action: string;
};

export default function LicenseForm(props: LicenseFormProps) {
    const { action } = props;
    const sizeInMB = toInteger((1024 * 1024).toFixed(2));
    const {
        setLicense,
        getLicense,
        isLoading,
        handleSubmit,
        handleAddAgain,
        license,
        errorMessage,
        isSubmitting,
        showModal,
        setShowModal,
        feedbackMessage,
        handleTimeSelection,
        selectedTime,
        showTimePickerModal,
        setShowTimePickerModal,
        pickedTime,
        isPickingtime,
        dropZoneErrorMessage,
        onDeleteFile,
        acceptedFiles,
        handleOnFileChange,
        setFile,
        file,
        fileName,
        setFileName,
    } = useLicense(action);

    useEffect(() => {
        if (action === "edit") {
            const id = window.location.pathname.split("/")[4];
            setLicense({ id: id });
            getLicense(id);
        }
    }, [action]);
    return (
        <DashboardLayout
            pageTitle={action === "add" ? "New License" : "Update License"}
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "License", url: "/business/license" },
                { name: action === "add" ? "New License" : "Update License" },
            ]}
        >
            <div className="">
                {action === "edit" && isLoading ? (
                    <PageLoader />
                ) : (
                    <FormLayout
                        leftSideText={action === "add" ? "New License" : "Update License"}
                        leftSideIcon={<Personalcard width={24} height={24} color="#888888" />}
                        leftSideDescription={`Please fill in the right details to ${
                            action === "add" ? "add new" : "update your "
                        } license`}
                    >
                        <Form onSubmit={handleSubmit} className="pb-5">
                            {/* Type of License */}
                            <Form.Group className="mb-4">
                                <Form.Label className="tb-body-small-medium text-gray-600">
                                    Type of License <Required />
                                </Form.Label>
                                <Form.Select
                                    className="py-2"
                                    value={license.licenseType}
                                    onChange={e => setLicense({ licenseType: e.target.value })}
                                    disabled={action === "edit"}
                                    required
                                >
                                    <option value="" hidden disabled className="text-muted">
                                        Select license type
                                    </option>
                                    {LICENSE_TYPES.map((license: any, index: number) => (
                                        <option className="px-3 py-2" key={license.value + index} value={license.value}>
                                            {license.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            {/* Other */}
                            {license.licenseType.toLowerCase() === "other" && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="tb-body-small-medium text-gray-600">
                                        Other (Type of license) <Required />
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={license.customLicenseType}
                                        onChange={e => setLicense({ customLicenseType: e.target.value })}
                                        placeholder="Please input other type of license here"
                                        required
                                    />
                                </Form.Group>
                            )}
                            {/* License */}
                            <Form.Group className="mb-4">
                                <Form.Label className="tb-body-small-medium text-gray-600">
                                    Name <Required />
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
                                <Form.Label className="tb-body-small-medium text-gray-600">
                                    License Number <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="E.g 83668"
                                    value={license.licenseNumber}
                                    onChange={e => setLicense({ licenseNumber: e.target.value })}
                                    required
                                />
                            </Form.Group>
                            <Row>
                                <Col md={6} xs={6} xl={6} xxl={6} sm={6} className="padding-start">
                                    {/* Validity Start Date*/}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Validity Start Date <Required />
                                        </Form.Label>
                                        <DatePicker
                                            onChange={value =>
                                                setLicense({
                                                    validFrom: value ? convertDateStringToIsoString(value as Date) : "",
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
                                                !license.validFrom ? <Calendar size={16} color="#B0B0B0" /> : null
                                            }
                                            clearIcon={license.validFrom ? <X size={16} color="#B0B0B0" /> : null}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} xs={6} xl={6} xxl={6} sm={6} className="padding-end">
                                    {/* Validity End Date */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Validity End Date <Required />
                                        </Form.Label>
                                        <DatePicker
                                            onChange={value =>
                                                setLicense({
                                                    validTo: value ? convertDateStringToIsoString(value as Date) : "",
                                                })
                                            }
                                            value={license.validTo}
                                            dayPlaceholder="dd"
                                            monthPlaceholder="mm"
                                            yearPlaceholder="yyyy"
                                            format={DATE_PICKER_FORMAT}
                                            required
                                            className={`form-control`}
                                            calendarIcon={
                                                !license.validTo ? <Calendar size={16} color="#B0B0B0" /> : null
                                            }
                                            clearIcon={license.validTo ? <X size={16} color="#B0B0B0" /> : null}
                                            minDate={new Date(license.validFrom)}
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
                                <DatePicker
                                    onChange={value =>
                                        setLicense({
                                            reminder: value ? convertDateStringToIsoString(value as Date) : "",
                                        })
                                    }
                                    value={license.reminder}
                                    dayPlaceholder="dd"
                                    monthPlaceholder="mm"
                                    yearPlaceholder="yyyy"
                                    format={DATE_PICKER_FORMAT}
                                    required
                                    className={`form-control`}
                                    calendarIcon={!license.reminder ? <Calendar size={16} color="#B0B0B0" /> : null}
                                    clearIcon={license.reminder ? <X size={16} color="#B0B0B0" /> : null}
                                    minDate={new Date()}
                                    disabled={!license.validFrom || !license.validTo}
                                />
                            </Form.Group>{" "}
                            <Row className="g-0">
                                <Col>
                                    {license.reminder && (
                                        <Form.Group className="mb-4">
                                            <Form.Label className="tb-body-small-medium text-gray-600">
                                                Notify me <Required />
                                            </Form.Label>
                                            <div className="d-flex flex-wrap gap-2">
                                                {PREDEFINED_TIMES.map((time: SelectTimetype) => (
                                                    <TimeSelector
                                                        key={time.timeString}
                                                        time={time}
                                                        onSelectedTime={handleTimeSelection}
                                                        selectedTime={selectedTime}
                                                        active={selectedTime === time.timeString}
                                                    />
                                                ))}
                                                <TimeSelector
                                                    time={pickedTime}
                                                    onSelectedTime={value => setShowTimePickerModal(true)}
                                                    selectedTime={selectedTime}
                                                    active={isPickingtime}
                                                />
                                            </div>
                                        </Form.Group>
                                    )}
                                </Col>
                            </Row>
                            {/* Attachment */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Attachment
                                    {dropZoneErrorMessage && (
                                        <p className="m-0 text-danger small">{dropZoneErrorMessage}</p>
                                    )}{" "}
                                </Form.Label>

                                {license?.file != null && !isEmptyObject(license?.file) ? (
                                    <div className="mb-4">
                                        <SelectedFileBox
                                            file={license?.file}
                                            onDelete={file => onDeleteFile(file)}
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
                                                    file?.length ? "dropzone-container-selected gap-4" : ""
                                                } pointer border-radius-12`}
                                                title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                            >
                                                <div
                                                    {...getRootProps()}
                                                    className={`${
                                                        file?.length
                                                            ? "p-0 d-flex align-items-center gap-4 justify-content-between"
                                                            : ""
                                                    }`}
                                                >
                                                    <input {...getInputProps()} />
                                                    <div
                                                        className={`text-muted d-flex align-items-center ${
                                                            file?.length ? "" : "flex-column text-center"
                                                        } text-centerm ${
                                                            file?.length ? "gap-12" : "gap-3"
                                                        } w-100 h-100`}
                                                    >
                                                        {file?.length ? (
                                                            <Gallery size="32" color="#888888" />
                                                        ) : (
                                                            <DocumentText variant="Bold" size={40} color="#D1D1D1" />
                                                        )}
                                                        {file?.length ? (
                                                            <>
                                                                <div className=" m-0 p-0 d-flex flex-column ">
                                                                    <p className="truncate-1 m-0">{file[0].name}</p>
                                                                    <p className="m-0">
                                                                        {(file[0].size / sizeInMB).toFixed(2)}
                                                                        {"mb"}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <div className="tb-body-default-medium text-gray-500">
                                                                Drag and drop file, or{" "}
                                                                <a className="text-primary offset tb-body-default-medium">
                                                                    Choose a File
                                                                </a>
                                                                <br />
                                                                <small className="text-gray-500 tb-body-small-regular">
                                                                    File types: .png, .jpg, .pdf
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {file?.length ? (
                                                    <div
                                                        className="d-flex cancel-dropzone align-items-center justify-content-center rounded-circle bg-grey"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setFile([]);
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
                            {(file?.length || (action === "edit" && license.file)) && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">File Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Eg. license"
                                        value={fileName}
                                        onChange={e => {
                                            setFileName(e.target.value);
                                        }}
                                    />
                                </Form.Group>
                            )}
                            <div className="mt-4">
                                {errorMessage && <FormErrorMessage message={errorMessage} />}
                                <div className="d-flex gap-20 w-100 m-0">
                                    <Link href={`/business/license`} className="text-decoration-none">
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
                                        size="lg"
                                        disabled={
                                            isSubmitting ||
                                            !license.licenseType ||
                                            (license.licenseType === "other" && !license.customLicenseType) ||
                                            !license.name ||
                                            !license.licenseNumber ||
                                            !license.validFrom ||
                                            !license.validTo ||
                                            !license.reminder ||
                                            !selectedTime
                                            // (action === "add" && !file?.length) ||
                                            // (action === "edit" && !license.file && !file?.length)
                                        }
                                    >
                                        {isSubmitting ? <ButtonLoader buttonText={"Saving"} /> : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </FormLayout>
                )}
                {/* Success modal */}
                <FeedbackModal
                    icon={<CheckCircle color="green" size={50} />}
                    showModal={showModal}
                    setShowModal={setShowModal}
                    primaryButtonText={"Go to licenses"}
                    primaryButtonUrl={"/business/license"}
                    secondaryButtonText={action === "edit" ? "Close" : "Add another license"}
                    feedbackMessage={feedbackMessage}
                    onSecondaryButtonClick={handleAddAgain}
                />
                <TimePickerModal
                    showModal={showTimePickerModal}
                    setShowModal={setShowTimePickerModal}
                    onSelectedTime={handleTimeSelection}
                />
            </div>
        </DashboardLayout>
    );
}
