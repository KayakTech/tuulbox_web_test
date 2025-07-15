import { isNumbersOnly, isValidEmail, validateMobileNumber } from "@/helpers";
import { Form, Row, Col, Button, FormLabel } from "react-bootstrap";
import ButtonLoader from "./ButtonLoader";
import DashboardLayout from "./DashboardLayout";
import FormErrorMessage from "./FormErrorMessage";
import Required from "./Required";
import React, { useEffect } from "react";
import Link from "next/link";
import FormLayout from "./FormLayout";
import PageLoader from "./PageLoader";
import FeedbackModal from "./FeedbackModal";
import { CheckCircle, X } from "react-feather";
import PhoneInput from "react-phone-input-2";
import useProject from "@/hooks/project";
import { DocumentText, GalleryAdd, UserAdd } from "iconsax-react";
import { COUNTRIES } from "@/helpers/countries";
import SelectedFileBox from "./SelectedFileBox";
import Dropzone from "react-dropzone";
import { ACCEPTED_IMAGE_FILES } from "@/helpers/constants";
import Image from "next/image";
import { toInteger } from "lodash";

type ProjectFormProps = {
    action: string;
};
export default function ProjectForm(props: ProjectFormProps) {
    const sizeInMB = toInteger((1024 * 1024).toFixed(2));

    const { action } = props;
    const {
        errorMessage,
        isSubmitting,
        isLoading,
        showModal,
        feedbackMessage,
        project,
        setProject,
        setProjectId,
        getProject,
        handleSubmit,
        handleAddAgain,
        setShowModal,
        attachment,
        setAttachment,
        dropZoneErrorMessage,
        setDropZoneErrorMessage,
        handleOnFileChange,
        toggleAdditionalContacts,
        showAdditionalContacts,
        newAdditionalContact,
        setNewAdditionalContact,
    } = useProject({ action });

    useEffect(() => {
        if (action === "edit") {
            const id = window.location.pathname.split("/")[3];
            setProject({ id: id });
            setProjectId(id);
            getProject(id);
        }
    }, [action]);
    return (
        <DashboardLayout
            pageTitle="Add Project"
            breadCrumbs={[
                { name: "Projects", url: "/projects" },
                { name: action === "add" ? "New Project" : "Update Project" },
            ]}
        >
            {action === "edit" && isLoading ? (
                <PageLoader />
            ) : (
                <FormLayout
                    leftSideText="New Project"
                    leftSideDescription="Fill in the correct details to add a new project"
                    leftSideIcon={<DocumentText size={24} color="#888888" />}
                >
                    <Form onSubmit={handleSubmit} className="mb-5">
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                Project Logo
                                {dropZoneErrorMessage.length > 0 && (
                                    <p className="m-0 text-danger small">{dropZoneErrorMessage}</p>
                                )}
                            </Form.Label>

                            {(project.projectLogo && action === "edit") || (attachment && attachment.length) ? (
                                <SelectedFileBox
                                    file={project.projectLogo ? "" : attachment}
                                    onDelete={() =>
                                        attachment ? setAttachment(undefined) : setProject({ projectLogo: "" })
                                    }
                                    icon={
                                        project.projectLogo ? (
                                            <Image
                                                src={project.projectLogo}
                                                width={40}
                                                height={40}
                                                alt="Project logo"
                                            />
                                        ) : (
                                            <GalleryAdd size={40} variant="Bold" color="#D1D1D1" className="me-2" />
                                        )
                                    }
                                />
                            ) : (
                                <Dropzone accept={ACCEPTED_IMAGE_FILES} multiple={false} onDrop={handleOnFileChange}>
                                    {({ getRootProps, getInputProps }) => (
                                        <section
                                            className={`dropzone-container border-radius-12 pointer`}
                                            title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                        >
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <div className="text-muted text-center d-flex flex-column align-items-center w-100 h-100">
                                                    <DocumentText
                                                        size={40}
                                                        variant="Bold"
                                                        color="#D1D1D1"
                                                        className="mb-3"
                                                    />
                                                    {attachment?.length ? (
                                                        <>
                                                            <div className=" ms-2 p-0 d-flex gap-2 flex-column border ">
                                                                <p className="truncate-1 m-0 border">
                                                                    {attachment[0].name}
                                                                </p>
                                                                <p className="m-0">
                                                                    {(attachment[0].size / sizeInMB).toFixed(2)}
                                                                    {"mb"}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-gray-500 tb-body-default-medium">
                                                            {action === "edit" && project.projectLogo ? (
                                                                <small>{project?.projectLogo}</small>
                                                            ) : (
                                                                <>
                                                                    Drag and drop file, or{" "}
                                                                    <a className="text-primary offset tb-body-default-medium">
                                                                        Choose a File
                                                                    </a>
                                                                    <br />
                                                                    <small className=" text-gray-500 tb-body-small-regular">
                                                                        File types: .png, .jpg, .pdf
                                                                    </small>
                                                                </>
                                                            )}
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

                        {/* Project Name */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                Project Name <Required />
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={project.name}
                                onChange={e => setProject({ name: e.target.value })}
                                placeholder="E.g Living Room Remodel"
                                required
                            />
                        </Form.Group>

                        {/* Owner */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                Owner <Required />
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={project.owner}
                                onChange={e => setProject({ owner: e.target.value })}
                                placeholder="E.g Fred Jackson"
                                required
                            />
                        </Form.Group>

                        {/* Address Line 1 */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Address Line 1</Form.Label>
                            <Form.Control
                                type="text"
                                value={project.addressLine1}
                                onChange={e => setProject({ addressLine1: e.target.value })}
                                placeholder="E.g 45 Main St. Ramon Ca 92117"
                            />
                        </Form.Group>

                        {/* Address Line 2 */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Address Line 2</Form.Label>
                            <Form.Control
                                type="text"
                                value={project.addressLine2}
                                onChange={e => setProject({ addressLine2: e.target.value })}
                                placeholder="E.g 45 Main St. Ramon Ca 92117"
                            />
                        </Form.Group>

                        {/* City */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">City</Form.Label>
                            <Form.Control
                                type="text"
                                value={project.city}
                                onChange={e => setProject({ city: e.target.value })}
                                placeholder="E.g Accra"
                            />
                        </Form.Group>

                        {/* State */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">State</Form.Label>
                            <Form.Control
                                type="text"
                                value={project.state}
                                onChange={e => setProject({ state: e.target.value })}
                                placeholder="E.g Accra"
                            />
                        </Form.Group>

                        {/* Zipcode */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Zip Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={project.zipCode}
                                onChange={e => setProject({ zipCode: e.target.value })}
                                placeholder="E.g 112789"
                            />
                        </Form.Group>

                        {/* Country */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Country</Form.Label>
                            <Form.Select
                                value={project.country}
                                onChange={e => setProject({ country: e.target.value })}
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

                        {/* Contact */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                Contact <Required />
                            </Form.Label>
                            <PhoneInput
                                country={"us"}
                                value={project.contact}
                                onChange={value => setProject({ contact: validateMobileNumber(value) })}
                                placeholder="E.g +233 552 534 233"
                                specialLabel=""
                                countryCodeEditable={false}
                            />
                        </Form.Group>

                        {/* Extension */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Extension</Form.Label>
                            <Form.Control
                                type="text"
                                value={project.extension}
                                onChange={e =>
                                    isNumbersOnly(e.target.value) && setProject({ extension: e.target.value })
                                }
                                placeholder="1545"
                                maxLength={5}
                            />
                        </Form.Group>

                        {/* Email */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                Email <Required />
                            </Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="E.g mike.sarp.ky@gmail.com"
                                value={project.email}
                                onChange={e => setProject({ email: e.target.value })}
                                required
                            />
                        </Form.Group>

                        {!showAdditionalContacts ? (
                            <div
                                className="d-flex gap-3 align-items-center border border-dashed border-radius-12 py-16 px-12 pointer mt-5"
                                onClick={toggleAdditionalContacts}
                            >
                                <UserAdd size={40} />
                                <div>
                                    <p className="tb-body-default-medium m-0 text-gray-900">Add contact</p>
                                    <p className="tb-body-small-regular text-muted m-0">
                                        Add another contact in addition to the primary contact
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="tb-title-body-medium text-gray-900">Secondary Contact</span>
                                        <X size={24} className="pointer" onClick={toggleAdditionalContacts} />
                                    </div>
                                    <p className="m-0 text-gray-500 tb-body-default-regular">
                                        Contacts other than the contact person or Primary contact
                                    </p>
                                </div>

                                {/* Name */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        Name <Required />
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Mike"
                                        value={newAdditionalContact.firstName}
                                        onChange={e => setNewAdditionalContact({ firstName: e.target.value })}
                                        required
                                    />
                                </Form.Group>

                                {/* Contact */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        Phone <Required />
                                    </Form.Label>
                                    <PhoneInput
                                        country={"us"}
                                        value={newAdditionalContact.phoneNumber}
                                        onChange={value =>
                                            setNewAdditionalContact({ phoneNumber: validateMobileNumber(value) })
                                        }
                                        placeholder="E.g +15103874545"
                                        specialLabel=""
                                        countryCodeEditable={false}
                                    />
                                </Form.Group>

                                {/* Extension */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Extension</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newAdditionalContact.extension}
                                        onChange={e =>
                                            isNumbersOnly(e.target.value) &&
                                            setNewAdditionalContact({ extension: e.target.value })
                                        }
                                        placeholder="2244"
                                        maxLength={5}
                                    />
                                </Form.Group>

                                {/* Email */}
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        Email <Required />
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="E.g fjackson@gmail.com"
                                        value={newAdditionalContact.email}
                                        onChange={e => setNewAdditionalContact({ email: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </>
                        )}

                        <div className="mt-5">
                            {errorMessage && <FormErrorMessage message={errorMessage} />}
                            <div className="d-flex gap-20 w-100">
                                <Link href={`/projects`} className="text-decoration-none">
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
                                        !project.name ||
                                        !project.owner ||
                                        !project.contact ||
                                        (project.concact && !validateMobileNumber(project.concact)) ||
                                        !project.email ||
                                        (project.email && !isValidEmail(project.email)) ||
                                        (showAdditionalContacts &&
                                            (!newAdditionalContact.firstName ||
                                                !newAdditionalContact.phoneNumber ||
                                                !newAdditionalContact.email ||
                                                (newAdditionalContact.email &&
                                                    !isValidEmail(newAdditionalContact.email))))
                                    }
                                >
                                    {isSubmitting ? <ButtonLoader buttonText={"Saving..."} /> : "Save"}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </FormLayout>
            )}

            <FeedbackModal
                icon={<CheckCircle color="green" size={50} />}
                showModal={showModal}
                setShowModal={setShowModal}
                primaryButtonText={"Go to projects"}
                primaryButtonUrl={"/projects"}
                secondaryButtonText={action === "edit" ? "Close" : "Add another project"}
                feedbackMessage={feedbackMessage}
                onSecondaryButtonClick={handleAddAgain}
            />
        </DashboardLayout>
    );
}
