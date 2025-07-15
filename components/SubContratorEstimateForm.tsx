import { Button, Col, Form, Row } from "react-bootstrap";
import FormLayout from "./FormLayout";
import Dropzone, { Accept } from "react-dropzone";
import ButtonLoader from "./ButtonLoader";
import FormErrorMessage from "./FormErrorMessage";
import Required from "./Required";
import Image from "next/image";
import { useEffect, useState } from "react";
import useSubcontractors from "@/hooks/subContractors";
import { DocumentText } from "iconsax-react";
import { ACCEPTED_FILES } from "@/helpers/constants";
import { Subcontractor } from "@/repositories/subcontractor-repository";

type SubContractorEstimateFormProps = {
    projectId: string;
    onCancel: () => void;
    subContractor?: Subcontractor;
};

export default function SubContractorEstimateForm(props: SubContractorEstimateFormProps) {
    const { projectId, onCancel, subContractor } = props;
    const {
        errorMessage,
        isSubmitting,
        documentName,
        setDocumentName,
        submitSubcontractorDocuments,
        attachment,
        setAttachment,
        dropZoneErrorMessage,
        setDropZoneErrorMessage,
        handleOnFileChange,
        handleSubmitEstimate,
        viewSubcontractorDetails,
        hasAddedEstimate,
    } = useSubcontractors({ projectId });

    useEffect(() => {
        if (hasAddedEstimate) {
            onCancel();
        }
    }, [hasAddedEstimate]);

    return (
        <>
            <Row className="mt-4">
                <Col sm={12} className="mb-4">
                    <FormLayout center={true}>
                        <Form onSubmit={e => handleSubmitEstimate(e, subContractor)}>
                            {/* Attachment */}
                            <Form.Group className="mb-4">
                                <Form.Label>
                                    Attachment <Required />
                                    {dropZoneErrorMessage.length > 0 && (
                                        <p className="m-0 text-danger small">{dropZoneErrorMessage}</p>
                                    )}
                                </Form.Label>

                                <Dropzone accept={ACCEPTED_FILES} multiple={false} onDrop={handleOnFileChange}>
                                    {({ getRootProps, getInputProps }) => (
                                        <section
                                            className={`dropzone-container border-radius-12 pointer`}
                                            title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                        >
                                            <div {...getRootProps()}>
                                                <input {...getInputProps()} />
                                                <div className="text-muted text-center w-100 h-100">
                                                    <DocumentText size={33} variant="Bold" color="#D1D1D1" />
                                                    {attachment?.length ? (
                                                        <div>{attachment[0].name}</div>
                                                    ) : (
                                                        <div>
                                                            Drag and drop file, or{" "}
                                                            <a className="javascript:void(0)">Choose a Fil</a>
                                                            <br />
                                                            <small>File types: .png, .jpg, .pdf</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </section>
                                    )}
                                </Dropzone>
                            </Form.Group>

                            {/* File Name  */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-capitalize">
                                    File Name <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={documentName}
                                    placeholder="E.g Tax Document 2023"
                                    onChange={e => setDocumentName(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <div className="mt-4">
                                {errorMessage && <FormErrorMessage message={errorMessage} />}
                                <Row className="g-2">
                                    <Col md={5}>
                                        <Button
                                            onClick={onCancel}
                                            className="w-100"
                                            variant="outline-secondary"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                    </Col>
                                    <Col md={7}>
                                        <Button className="w-100" type="submit">
                                            {isSubmitting ? <ButtonLoader buttonText={"Saving..."} /> : "Save Estimate"}
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    </FormLayout>
                </Col>
            </Row>
        </>
    );
}
