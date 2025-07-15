import ButtonLoader from "@/components/ButtonLoader";
import FormErrorMessage from "@/components/FormErrorMessage";
import Required from "@/components/Required";
import { useRouter } from "next/router";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import Dropzone from "react-dropzone";
import useContact from "@/hooks/contact";
import DatePicker from "react-date-picker";
import { Calendar, DocumentText, FolderAdd, Gallery } from "iconsax-react";
import useSubcontractors from "@/hooks/subContractors";
import { useEffect } from "react";
import PageLoader from "./PageLoader";
import FormLayout from "./FormLayout";
import SelectedFileBox from "./SelectedFileBox";
import { ACCEPTED_FILES, CERTIFICATE_CATEGORIES, DATE_PICKER_FORMAT } from "@/helpers/constants";
import DeleteModal from "./DeleteModal";
import FeedbackModal from "./FeedbackModal";
import { CheckCircle, X } from "react-feather";
import { currentPage, getUrlQuery } from "@/helpers";
import { toInteger } from "lodash";

type CertificateFormProps = {
    action: string;
    onCancel?: () => void;
};

export default function CertificateForm({ action, onCancel }: CertificateFormProps) {
    const router = useRouter();
    const { contactId } = router.query;
    const { contactsTable, showDeleteModal, setShowDeleteModal, handleDelete, contactToDelete, isDeleting } =
        useContact({});

    const {
        getSubcontractor,
        subContractor,
        isLoading,
        documentsTable,
        subcontractorId,
        setSubcontractorId,
        certificate,
        setCertificate,
        attachment,
        setAttachment,
        handleOnFileChange,
        dropZoneErrorMessage,
        isSubmitting,
        errorMessage,
        handleCertificateSubmit,
        showFeedbackModal,
        setShowFeedbackModal,
        feedbackMessage,
        setFeedbackMessage,
    } = useSubcontractors({ action });

    useEffect(() => {
        const subcontractorId = currentPage() === "contacts" ? location.pathname.split("/")[2] : getUrlQuery("id");
        const certificateId = `${getUrlQuery("certId")}`; //location.pathname.split("/")[5];
        subcontractorId && setSubcontractorId(subcontractorId);
        subcontractorId && getSubcontractor({ subcontractorId, certificateId });
    }, []);
    const sizeInMB = toInteger((1024 * 1024).toFixed(2));

    return (
        <div>
            {isLoading ? (
                <PageLoader />
            ) : (
                <div className="d-flex flex-column">
                    <div>
                        <FormLayout
                            colSize={currentPage() === "contacts" ? 6 : 6}
                            leftSideText={
                                currentPage() === "contacts"
                                    ? action === "add"
                                        ? "New document"
                                        : "Update document"
                                    : undefined
                            }
                            leftSideDescription={`Fill in the correct details to ${
                                action === "add" ? "add a new document" : "update the document"
                            }`}
                            leftSideIcon={<FolderAdd size={24} color="#888888" />}
                            center
                        >
                            <Card className="border-0">
                                <Card.Body>
                                    <Form onSubmit={handleCertificateSubmit}>
                                        {/* Attachment */}
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                Attachment <Required />
                                                {dropZoneErrorMessage.length > 0 && (
                                                    <p className="m-0 text-danger small">{dropZoneErrorMessage}</p>
                                                )}
                                            </Form.Label>

                                            {certificate?.file ? (
                                                <SelectedFileBox
                                                    file={certificate}
                                                    onDelete={() => {
                                                        setCertificate({ file: "" });
                                                        setShowDeleteModal(false);
                                                    }}
                                                />
                                            ) : (
                                                <Dropzone
                                                    accept={ACCEPTED_FILES}
                                                    multiple={false}
                                                    onDrop={handleOnFileChange}
                                                >
                                                    {({ getRootProps, getInputProps }) => (
                                                        <section
                                                            className={`dropzone-container ${
                                                                attachment?.length
                                                                    ? "dropzone-container-selected gap-4"
                                                                    : ""
                                                            } pointer border-radius-12`}
                                                            title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                                        >
                                                            <div
                                                                {...getRootProps()}
                                                                className={`${
                                                                    attachment?.length
                                                                        ? "p-0 d-flex align-items-center gap-4 justify-content-between"
                                                                        : ""
                                                                }`}
                                                            >
                                                                <input {...getInputProps()} />
                                                                <div
                                                                    className={`text-muted d-flex align-items-center ${
                                                                        attachment?.length
                                                                            ? ""
                                                                            : "flex-column text-center"
                                                                    } text-centerm ${
                                                                        attachment?.length ? "gap-12" : "gap-3"
                                                                    } w-100 h-100`}
                                                                >
                                                                    {attachment?.length ? (
                                                                        <Gallery size="32" color="#888888" />
                                                                    ) : (
                                                                        <DocumentText
                                                                            variant="Bold"
                                                                            size={40}
                                                                            color="#D1D1D1"
                                                                        />
                                                                    )}
                                                                    {attachment?.length ? (
                                                                        <>
                                                                            <div className=" m-0 p-0 d-flex flex-column ">
                                                                                <p className="truncate-1 m-0">
                                                                                    {attachment[0].name}
                                                                                </p>
                                                                                <p className="m-0">
                                                                                    {(
                                                                                        attachment[0].size / sizeInMB
                                                                                    ).toFixed(2)}
                                                                                    {"mb"}
                                                                                </p>
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <div>
                                                                            Drag and drop file, or
                                                                            <a className="text-primary tb-body-default-medium offset">
                                                                                {" "}
                                                                                Choose a file
                                                                            </a>
                                                                            <br />
                                                                            <small className="tb-body-small-regular text-gray-500">
                                                                                File types: .png, .jpg, .pdf
                                                                            </small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {attachment?.length ? (
                                                                <div
                                                                    className="d-flex cancel-dropzone align-items-center justify-content-center rounded-circle bg-grey"
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        setAttachment([]);
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

                                        {/*Short Description  */}
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                File Name <Required />
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ex. Liability Insurance Certificate"
                                                value={certificate.originalFileName || ""}
                                                onChange={e => setCertificate({ originalFileName: e.target.value })}
                                                required
                                            />
                                        </Form.Group>

                                        {/* Category */}
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                Category <Required />{" "}
                                            </Form.Label>
                                            <Form.Select
                                                value={certificate?.fileCategory || ""}
                                                onChange={e => setCertificate({ fileCategory: e.target.value })}
                                                placeholder="Select category"
                                                required
                                            >
                                                <option value="" hidden disabled></option>
                                                {CERTIFICATE_CATEGORIES.map((cert, index) => (
                                                    <option key={index} value={cert.value}>
                                                        {cert.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>

                                        <Row>
                                            <Col md={6}>
                                                {/* Validity Start Date */}
                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        Validity Start Date <Required />{" "}
                                                    </Form.Label>
                                                    <DatePicker
                                                        onChange={value => setCertificate({ createdAt: value ?? "" })}
                                                        value={certificate?.createdAt || ""}
                                                        dayPlaceholder="dd"
                                                        monthPlaceholder="mm"
                                                        yearPlaceholder="yyyy"
                                                        format={DATE_PICKER_FORMAT}
                                                        required
                                                        className={`form-control`}
                                                        calendarIcon={
                                                            !certificate?.createdAt ? (
                                                                <Calendar size={16} color="#B0B0B0" />
                                                            ) : null
                                                        }
                                                        clearIcon={
                                                            certificate?.createdAt ? (
                                                                <X size={16} color="#B0B0B0" />
                                                            ) : null
                                                        }
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                {/* Validity End Date */}
                                                <Form.Group className="mb-4">
                                                    <Form.Label>
                                                        Validity End Date <Required />{" "}
                                                    </Form.Label>
                                                    <DatePicker
                                                        onChange={value => setCertificate({ expireAt: value ?? "" })}
                                                        value={certificate?.expireAt || ""}
                                                        dayPlaceholder="dd"
                                                        monthPlaceholder="mm"
                                                        yearPlaceholder="yyyy"
                                                        format={DATE_PICKER_FORMAT}
                                                        required
                                                        className={`form-control`}
                                                        calendarIcon={
                                                            !certificate?.expireAt ? (
                                                                <Calendar size={16} color="#B0B0B0" />
                                                            ) : null
                                                        }
                                                        clearIcon={
                                                            certificate?.expireAt ? (
                                                                <X size={16} color="#B0B0B0" />
                                                            ) : null
                                                        }
                                                        minDate={new Date(`${certificate?.createdAt}`)}
                                                        disabled={!certificate?.createdAt}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Reminder */}
                                        <Form.Group className="mb-4">
                                            <Form.Label>
                                                Reminder <Required />{" "}
                                            </Form.Label>
                                            <DatePicker
                                                onChange={value => setCertificate({ reminder: value ?? "" })}
                                                value={certificate?.reminder || ""}
                                                dayPlaceholder="dd"
                                                monthPlaceholder="mm"
                                                format={DATE_PICKER_FORMAT}
                                                yearPlaceholder="yyyy"
                                                required
                                                className={`form-control`}
                                                calendarIcon={
                                                    !certificate?.reminder ? (
                                                        <Calendar size={16} color="#B0B0B0" />
                                                    ) : null
                                                }
                                                clearIcon={
                                                    certificate?.reminder ? <X size={16} color="#B0B0B0" /> : null
                                                }
                                                disabled={!certificate.createdAt || !certificate.expireAt}
                                                minDate={new Date()}
                                            />
                                        </Form.Group>

                                        <div className="mt-5">
                                            {errorMessage && <FormErrorMessage message={errorMessage} />}
                                            <Row className="g-2">
                                                <Col md={5}>
                                                    <Button
                                                        className="w-140 btn-140"
                                                        variant="outline-secondary"
                                                        disabled={isSubmitting}
                                                        onClick={onCancel}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </Col>
                                                <Col md={7}>
                                                    <Button className="w-100" type="submit">
                                                        {isSubmitting ? (
                                                            <ButtonLoader buttonText={"Saving..."} />
                                                        ) : (
                                                            "Save"
                                                        )}
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </FormLayout>

                        {/* Success modal */}
                        <FeedbackModal
                            icon={<CheckCircle color="green" size={50} />}
                            showModal={showFeedbackModal}
                            setShowModal={setShowFeedbackModal}
                            primaryButtonText={"Go to documents"}
                            onPrimaryButtonClick={() => {
                                if (currentPage() === "projects") {
                                    router.push(
                                        `/projects/${
                                            location.pathname.split("/")[2]
                                        }?action=details&activeMenu=sub-contractors&id=${subcontractorId}`,
                                    );
                                } else {
                                    router.push(`/contacts/${subcontractorId}`);
                                }
                                setShowFeedbackModal(false);
                            }}
                            secondaryButtonText={action === "edit" ? "Close" : "Add another document"}
                            feedbackMessage={feedbackMessage}
                            onSecondaryButtonClick={() => location.reload()}
                        />

                        <DeleteModal
                            showModal={showDeleteModal}
                            setShowModal={(value: boolean) => setShowDeleteModal(value)}
                            dataToDeleteName={"contact"}
                            message="Are you sure you want to delete contact?"
                            isDeleting={isDeleting}
                            onYesDelete={() => handleDelete(contactToDelete)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
