import { Button, Col, Dropdown, Form, InputGroup, Row } from "react-bootstrap";
import FormLayout from "./FormLayout";
import Required from "./Required";
import { useEffect, useReducer, useState } from "react";
import FormErrorMessage from "./FormErrorMessage";
import useSubcontractors from "@/hooks/subContractors";
import ButtonLoader from "./ButtonLoader";
import { Plus, X } from "react-feather";
import MessageItem from "./MessageItem";
import CircleGrey from "./CircleGrey";
import Image from "next/image";
import Link from "next/link";
import { Contact } from "@/repositories/contact-repositories";
import FeedbackModal from "./FeedbackModal";
import { CheckCircle } from "react-feather";
import FeedbackModalInner from "./FeedbackModalInner";
import PhoneInput from "react-phone-input-2";
import { Subcontractor } from "@/repositories/subcontractor-repository";
import { Iconly } from "react-iconly";
import Dropzone from "react-dropzone";
import { ACCEPTED_FILES } from "@/helpers/constants";
import { DocumentText } from "iconsax-react";
import SelectedFileBox from "./SelectedFileBox";
import { Xrp } from "iconsax-react";
import { CloseCircle } from "iconsax-react";

type SubContractorFormProps = {
    projectId: string;
    viewSubcontractors: () => void;
};

export default function SubContractorForm(props: SubContractorFormProps) {
    const { projectId, viewSubcontractors } = props;
    const {
        isSubmitting,
        errorMessage,
        contacts,
        addSubcontractor,
        showModal,
        setShowModal,
        addOrRemoveProjectSubcontractor,
        getContacts,
        getSubcontractors,
        subContractors,
        selectedSubcontractor,
        setSelectedSubcontractor,
        searchResults,
        setSearchResults,
        showDropdown,
        setShowDropdown,
        searchTerm,
        setSearchTerm,
        filterSubcontractors,
        selectSubcontractor,
        handleFullNameChange,
        resetFields,
        handleSubmitSubcontractor,
        dropZoneErrorMessage,
        setDropZoneErrorMessage,
    } = useSubcontractors({
        projectId,
    });

    useEffect(() => {
        // getContacts();
        getSubcontractors();
    }, []);

    useEffect(() => {
        if (!searchTerm.length) {
            resetFields();
            setShowDropdown(false);
            setSearchResults([]);
            return;
        }
        filterSubcontractors();
    }, [searchTerm]);

    return (
        <>
            <FormLayout>
                <Form className="position-relative " onSubmit={handleSubmitSubcontractor} style={{ width: "" }}>
                    <Form.Group className="mb-4">
                        <Form.Label className="text-gray-600 tb-body-small-medium">
                            Name <Required />
                        </Form.Label>
                        <InputGroup>
                            <InputGroup.Text className="gap-2">
                                <Iconly set="light" name="Search" primaryColor="grey" size={20} />
                            </InputGroup.Text>
                            <Form.Control
                                type="search"
                                className="ps-40"
                                value={`${selectedSubcontractor?.contact?.firstName}`}
                                placeholder="Search contact"
                                onChange={handleFullNameChange}
                                required
                            />
                        </InputGroup>
                        {showDropdown && (
                            <Dropdown.Menu show className="w-100 subcontractor">
                                {searchResults.length > 0 ? (
                                    searchResults.map((subcontractor: Subcontractor, index: number) => (
                                        <Dropdown.Item
                                            className="p-1m"
                                            eventKey="2"
                                            key={subcontractor.id}
                                            onClick={() => selectSubcontractor(subcontractor)}
                                        >
                                            <div
                                                className="text-muted font-size-root d-flex align-items-center my-1 border-top-0 pointer"
                                                onClick={() => {}}
                                            >
                                                <CircleGrey>
                                                    <Image
                                                        src={`/images/svg/icons/contact.svg`}
                                                        width={16}
                                                        height={16}
                                                        alt=""
                                                    />
                                                </CircleGrey>
                                                <div className="truncate-1">
                                                    <span className={`fw-bold text-black`}>
                                                        {subcontractor.contact.firstName}{" "}
                                                        {subcontractor.contact.lastName}
                                                    </span>
                                                    <p className="truncate-1 mt-1 m-0 small sub-max-with">
                                                        {subcontractor?.contact?.email?.toLowerCase()}
                                                    </p>
                                                </div>
                                            </div>
                                        </Dropdown.Item>
                                    ))
                                ) : (
                                    <Dropdown.Header className="p-0 py-24">
                                        <p className="text-center mb-1 tb-title-body-medium">No contact found</p>
                                        <p className="text-center mb-4">
                                            <small className="text-muted tb-body-small-regular text-wrap">
                                                Click on the button below to add as new contact
                                            </small>
                                        </p>
                                        <Link
                                            href={`/contacts/add?subcontractor=true&projectId=${projectId}&action=form`}
                                            className="d-grid text-decoration-none"
                                        >
                                            <Button
                                                variant="outline-secondary d-flex gap-2 align-items-center justify-content-center tb-body-large-medium"
                                                className=""
                                            >
                                                <Plus size={20} /> New Contact
                                            </Button>
                                        </Link>
                                    </Dropdown.Header>
                                )}
                            </Dropdown.Menu>
                        )}
                    </Form.Group>

                    {selectedSubcontractor.contact?.lastName && (
                        <>
                            <Row className="d-flex">
                                <Col md={6} xs={6} xl={6} xxl={6} sm={6} className=" padding-start">
                                    <Form.Group className="mb-4 ">
                                        <Form.Label className="text-gray-600 tb-body-default-medium">
                                            First Name <Required />
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedSubcontractor?.contact?.firstName}
                                            placeholder="John"
                                            onChange={e =>
                                                setSelectedSubcontractor({
                                                    // @ts-ignore
                                                    contact: { firstName: e.target.value },
                                                })
                                            }
                                            required
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6} xs={6} xl={6} xxl={6} sm={6} className="padding-end">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-default-medium">
                                            Last Name <Required />
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedSubcontractor.contact?.lastName}
                                            placeholder="Doe"
                                            // @ts-ignore
                                            onChange={e =>
                                                setSelectedSubcontractor({ contact: { lastName: e.target.value } })
                                            }
                                            required
                                            readOnly
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                    Email <Required />
                                </Form.Label>
                                <Form.Control
                                    className="text-blue-900"
                                    type="email"
                                    value={selectedSubcontractor.contact?.email}
                                    placeholder="E.g Kitchen Plan"
                                    // @ts-ignore
                                    onChange={e => setSelectedSubcontractor({ contact: { email: e.target.value } })}
                                    required
                                    readOnly
                                />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-default-medium">Company</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedSubcontractor.contact?.company}
                                    // @ts-ignore
                                    onChange={e => setSelectedSubcontractor({ contact: { company: e.target.value } })}
                                    placeholder="E.g Kitchen Plan"
                                    readOnly
                                />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-default-medium">Contact</Form.Label>
                                <PhoneInput
                                    value={selectedSubcontractor.contact?.phoneNumber}
                                    // @ts-ignore
                                    onChange={value => setSelectedSubcontractor({ contact: { phoneNumber: value } })}
                                    placeholder="E.g +19256754433"
                                    specialLabel={""}
                                    inputClass="text-blue-900"
                                    countryCodeEditable={false}
                                />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-default-medium">Extension</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={selectedSubcontractor.contact?.zipCode}
                                    // @ts-ignore
                                    onChange={e => setSelectedSubcontractor({ contact: { zipCode: e.target.value } })}
                                    placeholder="9920"
                                    readOnly
                                />
                            </Form.Group>
                            {selectedSubcontractor?.taxDocuments?.length ? (
                                <>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-default-medium">
                                            Attachment <Required />
                                            {dropZoneErrorMessage.length > 0 && (
                                                <p className="m-0 text-danger small">{dropZoneErrorMessage}</p>
                                            )}
                                        </Form.Label>
                                        {selectedSubcontractor.taxDocuments?.length ? (
                                            <SelectedFileBox
                                                file={selectedSubcontractor.taxDocuments[0].certificate}
                                                onDelete={() => {}}
                                            />
                                        ) : (
                                            <Dropzone accept={ACCEPTED_FILES} multiple={false} onDrop={() => {}}>
                                                {({ getRootProps, getInputProps }) => (
                                                    <section
                                                        className={`dropzone-container border-radius-12 pointer`}
                                                        title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                                    >
                                                        <div {...getRootProps()}>
                                                            <input {...getInputProps()} />
                                                            <div className="text-muted text-center w-100 h-100">
                                                                <DocumentText
                                                                    size={40}
                                                                    variant="Bold"
                                                                    color="#D1D1D1"
                                                                />
                                                                {selectedSubcontractor.taxDocuments?.length ? (
                                                                    <div>
                                                                        {
                                                                            selectedSubcontractor.taxDocuments[0]
                                                                                .certificate.originalFileName
                                                                        }
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-gray-500 tb-body-default-medium">
                                                                        Drag and drop file, or
                                                                        <a className="text-primary offset tb-body-default-medium">
                                                                            {" "}
                                                                            Choose a file
                                                                        </a>
                                                                        <br />
                                                                        <small className="tb-body-small-regular">
                                                                            File types: .png, .jpg, .pdf
                                                                        </small>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </section>
                                                )}
                                            </Dropzone>
                                        )}
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-default-medium">
                                            File Name
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={selectedSubcontractor?.fileName}
                                            onChange={e =>
                                                setSelectedSubcontractor({
                                                    fileName: e.target.value,
                                                })
                                            }
                                            placeholder="File name 2234"
                                            readOnly
                                        />
                                    </Form.Group>
                                </>
                            ) : null}

                            <div className="mt-5">
                                {errorMessage && <FormErrorMessage message={errorMessage} />}
                                <div className="d-flex gap-20 w-100">
                                    <Button
                                        onClick={viewSubcontractors}
                                        className="w-140  px-3 py-2 tb-title-body-medium"
                                        variant="secondary"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        className="w-100 btn-240 px-3 py-2 tb-title-body-medium"
                                        variant="primary"
                                        size="lg"
                                        type="submit"
                                    >
                                        {isSubmitting ? <ButtonLoader buttonText={"Saving..."} /> : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Form>
            </FormLayout>
            <FeedbackModalInner
                icon={<CheckCircle color="green" size={50} />}
                showModal={showModal}
                setShowModal={value => setShowModal(value)}
                primaryButtonText={`View subcontractors`}
                secondaryButtonText={"Close"}
                feedbackMessage={"Subcontractor Added"}
                onPrimaryButtonClick={viewSubcontractors}
                onSecondaryButtonClick={() => {
                    setShowModal(false);
                }}
            />
        </>
    );
}
