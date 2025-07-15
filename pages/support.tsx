import { Accordion, Button, Col, Container, Form, Row } from "react-bootstrap";
import Link from "next/link";
import Required from "@/components/Required";
import FeedbackModal from "@/components/FeedbackModal";
import useSupport from "@/hooks/feedback";
import HandHoldingCheck from "@/components/icons/HandHoldingCheck";
import SupportPageHeader from "@/components/SupportPageHeader";
import { FeedbackPayload } from "@/repositories/feedback-repository";
import { SetStateAction, useState } from "react";
import FormErrorMessage from "@/components/FormErrorMessage";
import ButtonLoader from "@/components/ButtonLoader";
import { HOMEPAGE_FAQS } from "@/helpers/constants";
import FormLayout from "@/components/FormLayout";
import Head from "next/head";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { AddCircle, MinusCirlce } from "iconsax-react";

export default function Support() {
    const { handleSubmit, setShowModal, showModal, feedback, setFeedback, isSubmitting, errorMessage } = useSupport();
    const PAGE_TITLE = "Support - tuulbox";
    const PAGE_DESCRIPTION = "Manage Construction Projects, Tasks, Contacts & Files on the Go";
    const PAGE_THUMBNAIL = "/Tuulbox-logo-Icon.png";
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <>
            <Head>
                <title>{PAGE_TITLE}</title>
                <meta name="description" content={PAGE_DESCRIPTION} />
                <meta property="og:title" content={PAGE_TITLE} />
                <meta property="og:description" content={PAGE_DESCRIPTION} />
                <meta property="og:image" content={PAGE_THUMBNAIL} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={PAGE_TITLE} />
                <meta name="twitter:description" content={PAGE_DESCRIPTION} />
                <meta name="twitter:image" content={PAGE_THUMBNAIL} />
            </Head>
            <SupportPageHeader width={105.5} height={28.4} isNav={true} />
            <Container className="d-flex flex-column justify-content-center">
                <Form onSubmit={handleSubmit} className="m-auto form-width" style={{ width: "400px" }}>
                    <div className="text-center mb-5">
                        <h4 className="text-gray-900 tb-title-subsection-medium">Feedback and Support</h4>
                        <p className="text-gray-600 tb-body-large-regular">Please let us know how we can help you</p>
                    </div>
                    <Row>
                        <Col className="mb-4">
                            <Form.Group>
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    First Name <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ike"
                                    value={feedback.firstName}
                                    onChange={e => setFeedback({ firstName: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group>
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Last Name <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Brain"
                                    value={feedback.lastName}
                                    onChange={e => setFeedback({ lastName: e.target.value })}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-4">
                        <Form.Label className="text-gray-600 tb-body-small-medium">
                            Email <Required />
                        </Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="E.g brian@gmail.com"
                            value={feedback.email}
                            onChange={e => setFeedback({ email: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="text-gray-600 tb-body-small-medium">
                            Feedback <Required />
                        </Form.Label>
                        <Form.Control
                            as={"textarea"}
                            rows={7}
                            placeholder="App refuses to load, please check it out"
                            value={feedback.message}
                            onChange={e => setFeedback({ message: e.target.value })}
                            required
                        />
                    </Form.Group>
                    <div className="mt-5">
                        {errorMessage && <FormErrorMessage message={errorMessage} />}
                        <Row className="g-2 gap-20 d-flex">
                            <Col className="w-140 p-0">
                                <Link
                                    href={`${isSubmitting ? "javascript:void(0)" : "/"}`}
                                    className="text-decoration-none"
                                >
                                    <Button
                                        className="w-100 px-3 py-2 tb-title-body-medium"
                                        variant="outline-secondary"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                            </Col>
                            <Col className="p-0">
                                <Button
                                    type="submit"
                                    className="w-240 px-3 py-2 tb-title-body-medium"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ButtonLoader buttonText={"Submitting..."} /> : "Submit"}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Form>

                <div className="spacer"></div>
                <Row>
                    <Col sm={12} md={6}>
                        <p className=" text-gray-600 tb-body-title-caps">Faq</p>
                        <h1 className="fw-600 fs-40 ">Have Questions?</h1>
                        <p className="text-gray-500 tb-subtitle-regular">
                            Everything you need to know about tuulbox- <br /> Your All-in-One construction management
                            solution{" "}
                        </p>
                    </Col>
                    <Col sm={12} md={6}>
                        <div className="contact-faq">
                            <Accordion defaultActiveKey="0">
                                {HOMEPAGE_FAQS.map((faq, index) => (
                                    <Accordion.Item eventKey={`${index}`} key={index} className="p-20">
                                        <Accordion.Header
                                            onClick={() => handleToggle(index)}
                                            className="text-gray-800 tb-title-body-medium d-flex align-items-center"
                                        >
                                            <span> {faq.header}</span>

                                            <span className="ms-auto">
                                                {index === activeIndex ? <MinusCirlce /> : <AddCircle />}
                                            </span>
                                        </Accordion.Header>
                                        <Accordion.Body className="text-gray-500 tb-body-default-regular">
                                            {faq.content}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </div>
                    </Col>
                </Row>
            </Container>
            <div className="spacer"></div>
            <FeedbackModal
                showModal={showModal}
                setShowModal={setShowModal}
                primaryButtonText={"Go back to App"}
                primaryButtonUrl={"/overview"}
                secondaryButtonText={""}
                feedbacktitle="Submitted Successfully"
                icon={<HandHoldingCheck />}
                feedbackMessage={"Your feedback has been submitted successfully, you can now return back to the App."}
            />
        </>
    );
}
