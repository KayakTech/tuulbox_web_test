import DashboardLayout from "./DashboardLayout";
import FormLayout from "./FormLayout";
import PageLoader from "./PageLoader";
import { Form, Row, Col, Button } from "react-bootstrap";
import ButtonLoader from "./ButtonLoader";
import FormErrorMessage from "./FormErrorMessage";
import Link from "next/link";
import Dropzone from "react-dropzone";
import { isEmptyObject, isNumbersOnly, convertDateStringToIsoString, validateMobileNumber } from "@/helpers";
import { CheckCircle, X } from "react-feather";
import FeedbackModal from "./FeedbackModal";
import DeleteModal from "./DeleteModal";
import Required from "./Required";
import { ShieldTick, Calendar, Trash, DocumentText, Gallery } from "iconsax-react";
import useInsurance from "@/hooks/insurance";
import PhoneInput from "react-phone-input-2";
import DatePicker from "react-date-picker";
import SelectedFileBox from "./SelectedFileBox";
import { DATE_PICKER_FORMAT, INSURANCE_TYPES, PREDEFINED_TIMES } from "@/helpers/constants";
import TimeSelector, { SelectTimetype } from "./TimeSelector";
import TimePickerModal from "./TimePickerModal";
import { toInteger } from "lodash";

type InsruanceFormProps = {
    action: string;
};

export default function InsuranceForm(props: InsruanceFormProps) {
    const { action } = props;
    const sizeInMB = toInteger((1024 * 1024).toFixed(2));
    const {
        isLoading,
        isSubmitting,
        isDeleting,
        showModal,
        setShowModal,
        errorMessage,
        feedbackMessage,
        dropZoneErrorMessage,
        file,
        showDeleteFileModal,
        setShowDeleteFileModal,
        insurance,
        setInsurance,
        acceptedFiles,
        onDeleteFile,
        // deleteFile,
        handleOnFileChange,
        handleSubmit,
        addFileAgain,
        handleTimeSelection,
        selectedTime,
        pickedTime,
        isPickingtime,
        setShowTimePickerModal,
        showTimePickerModal,
        setFile,
        setFileName,
        storageHook,
        fileName,
    } = useInsurance(action);

    return (
        <DashboardLayout
            pageTitle="Add new Insurance"
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "Insurance", url: "/business/insurance" },
                { name: action === "add" ? "New Insurance" : "Update Insurance" },
            ]}
        >
            <div className="my-5">
                <FormLayout
                    leftSideText={`${action === "add" ? "New" : "Update"} Insurance`}
                    leftSideIcon={<ShieldTick size={24} color="gray" />}
                    leftSideDescription={`Please fill in the right details to ${
                        action === "add" ? "add new" : "update your "
                    } insurance`}
                >
                    {action === "edit" && isLoading ? (
                        <PageLoader />
                    ) : (
                        <Form onSubmit={handleSubmit} className="mb-5">
                            {/* Type of Insurancne */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Type of Insurance <Required />
                                </Form.Label>
                                <Form.Select
                                    value={insurance.insuranceType}
                                    onChange={e => setInsurance({ insuranceType: e.target.value })}
                                    required
                                >
                                    <option value="" hidden disabled>
                                        Select insurance type
                                    </option>
                                    {INSURANCE_TYPES.map((insuranceType: any, index: number) => (
                                        <option key={insuranceType.value + index} value={insuranceType.value}>
                                            {insuranceType.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                            {/* Other */}
                            {insurance.insuranceType.toLowerCase() === "other" && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        Other (Type of insurance) <Required />
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={insurance?.customInsuranceType}
                                        onChange={e => setInsurance({ customInsuranceType: e.target.value })}
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
                                    onChange={e => setInsurance({ carrier: e.target.value })}
                                    placeholder="E.g State Farm"
                                    required
                                />
                            </Form.Group>
                            {/* Broker */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Broker</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={insurance?.broker}
                                    onChange={e => setInsurance({ broker: e.target.value })}
                                    placeholder="Broker here"
                                />
                            </Form.Group>
                            {/* Agent */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Agent</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="E.g Mary Rich"
                                    value={insurance.agent}
                                    onChange={e => setInsurance({ agent: e.target.value })}
                                />
                            </Form.Group>
                            {/* Contact*/}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Contact</Form.Label>
                                <PhoneInput
                                    value={insurance.contact}
                                    onChange={value => setInsurance({ contact: validateMobileNumber(value) })}
                                    placeholder="E.g +19256754433"
                                    specialLabel=""
                                    countryCodeEditable={false}
                                    country={"us"}
                                />
                            </Form.Group>

                            {/* Extension */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Extension</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={insurance?.extension}
                                    onChange={e => {
                                        if (isNumbersOnly(e.target.value)) {
                                            setInsurance({ extension: e.target.value });
                                        }
                                    }}
                                    placeholder="4433"
                                    maxLength={5}
                                />
                            </Form.Group>

                            {/* Email */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={insurance.email}
                                    placeholder="E.g mrich@gmail.com"
                                    onChange={e => setInsurance({ email: e.target.value })}
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
                                                setInsurance({
                                                    validFrom: value ? convertDateStringToIsoString(value as Date) : "",
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
                                                !insurance.validFrom ? <Calendar size={16} color="#B0B0B0" /> : null
                                            }
                                            clearIcon={insurance.validFrom ? <X size={16} color="#B0B0B0" /> : null}
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
                                                setInsurance({
                                                    validTo: value ? convertDateStringToIsoString(value as Date) : "",
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
                                                !insurance.validTo ? <Calendar size={16} color="#B0B0B0" /> : null
                                            }
                                            clearIcon={insurance.validTo ? <X size={16} color="#B0B0B0" /> : null}
                                            minDate={new Date(insurance.validFrom)}
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
                                <DatePicker
                                    onChange={value =>
                                        setInsurance({
                                            reminder: value ? convertDateStringToIsoString(value as Date) : "",
                                        })
                                    }
                                    value={insurance.reminder}
                                    dayPlaceholder="dd"
                                    monthPlaceholder="mm"
                                    yearPlaceholder="yyyy"
                                    format={DATE_PICKER_FORMAT}
                                    required
                                    className={`form-control`}
                                    calendarIcon={!insurance.reminder && <Calendar size={16} color="#B0B0B0" />}
                                    clearIcon={insurance.reminder ? <X size={16} color="#B0B0B0" /> : null}
                                    minDate={new Date()}
                                    disabled={!insurance.validFrom || !insurance.validTo}
                                />
                            </Form.Group>
                            {insurance.validTo && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
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
                            {/* Attachment */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Policy
                                    {dropZoneErrorMessage && (
                                        <p className="m-0 text-danger small">{dropZoneErrorMessage}</p>
                                    )}{" "}
                                </Form.Label>

                                {insurance.file != null && !isEmptyObject(insurance.file) ? (
                                    <div className="mb-4">
                                        <SelectedFileBox
                                            file={insurance.file}
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

                            {file?.length || (action === "edit" && insurance.file) ? (
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
                            ) : null}

                            {/* Policy Number */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Policy Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={insurance?.policyNumber}
                                    onChange={e => {
                                        setInsurance({ policyNumber: e.target.value });
                                    }}
                                    placeholder="129*7389"
                                />
                            </Form.Group>

                            <div className="mt-4">
                                {errorMessage && <FormErrorMessage message={errorMessage} />}
                                <div className="d-flex gap-20 w-100">
                                    <Link href={`/business/insurance`} className="text-decoration-none">
                                        <Button
                                            className="w-140 btn-140 tb-title-body-medium"
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
                                            !insurance.insuranceType ||
                                            !insurance.carrier ||
                                            !insurance.validFrom ||
                                            !insurance.validTo ||
                                            !insurance.reminder ||
                                            !selectedTime ||
                                            (insurance.insuranceType.toLowerCase() === "other" &&
                                                !insurance.customInsuranceType)
                                        }
                                    >
                                        {isSubmitting ? <ButtonLoader buttonText={"Saving"} /> : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    )}
                </FormLayout>

                {/* Success modal */}
                <FeedbackModal
                    icon={<CheckCircle color="green" size={50} />}
                    showModal={showModal}
                    setShowModal={value => setShowModal(value)}
                    primaryButtonText={"View insurance"}
                    primaryButtonUrl={`/business/insurance`}
                    secondaryButtonText={action === "edit" ? "Close" : "Add another insurance"}
                    feedbackMessage={feedbackMessage}
                    onSecondaryButtonClick={addFileAgain}
                />
                {/* Delete File Modal */}
                <DeleteModal
                    showModal={showDeleteFileModal}
                    setShowModal={(value: boolean) => setShowDeleteFileModal(value)}
                    dataToDeleteName={"File"}
                    isDeleting={storageHook.isDeleting}
                    onYesDelete={storageHook.onDelete}
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
