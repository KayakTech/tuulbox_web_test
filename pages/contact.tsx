import Link from "next/link";
import { Accordion, Card, Col, Row } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import { ShareIcon } from "@heroicons/react/24/outline";
import PhoneRing from "@/components/icons/PhoneRing";
import { HOMEPAGE_CONTACT_CARDS, HOMEPAGE_FAQS } from "@/helpers/constants";
import { Facebook, Instagram, Message, Share, Whatsapp } from "iconsax-react";
import WebsiteTopNav from "@/components/WebsiteTopNav";
import WebsiteFooter from "@/components/WebsiteFooter";

export default function ContactPage() {
    return (
        <>
            <WebsiteTopNav />
            {/* Hero */}
            <section className="website-hero contact d-flex pt-5 pt-lg-0">
                <Container fluid className="d-flex">
                    <span className="text-center text-white m-auto pt-5 col-md-8">
                        <h1 className="fw-600 fs-40 fs-md-60 mb-4">Contact Us</h1>
                        <p className="fw-500 fs-20">Let us know how we can help you by contacting us</p>
                    </span>
                </Container>
            </section>

            <div className="spacer"></div>

            {/* Contact */}
            <Container>
                <section>
                    <p className="mb-4">You can contact us through any of the following;</p>
                    <Row className="g-4">
                        {HOMEPAGE_CONTACT_CARDS.map((card, index) => (
                            <Col sm={12} md={4} key={index}>
                                <Card className="website-contact-card">
                                    <Card.Body className="d-flex flex-column p-23">
                                        <div className="icon-box">
                                            {card.title.toLowerCase() === "call us" && <PhoneRing />}
                                            {card.title.toLowerCase() === "feedback & support" && (
                                                <Message size={24} color="#5D5D5D" />
                                            )}
                                            {card.title.toLowerCase() === "connect with us" && (
                                                <ShareIcon width={24} color="#5D5D5D" />
                                            )}
                                        </div>

                                        <h3 className="mt-4 fw-500 fs-20">{card.title}</h3>
                                        <p className="text-muted">{card.subTitle}</p>
                                        <div className="mt-auto">
                                            {card.title.toLowerCase() === "call us" && (
                                                <a href={`tel:${card.contact}`} className=" text-blue-900">
                                                    {card.contact}
                                                </a>
                                            )}
                                            {card.title.toLowerCase() === "feedback & support" && (
                                                <a href={`#!`} className="text-blue-900">
                                                    {card.contact}
                                                </a>
                                            )}
                                            {card.title.toLowerCase() === "connect with us" && (
                                                <div className="d-flex gap-3">
                                                    <Link href={`#!`}>
                                                        <Facebook size={20} variant="Bold" color="#888888" />
                                                    </Link>
                                                    <Link href={`#!`}>
                                                        <Whatsapp size={20} variant="Bold" color="#888888" />
                                                    </Link>
                                                    <Link href={`#!`}>
                                                        <Instagram size={20} variant="Bold" color="#888888" />
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>

                <div className="spacer"></div>

                <Row>
                    <Col sm={12} md={6}>
                        <p className="text-uppercase text-muted">Faq</p>
                        <h1 className="fw-600 fs-40 ">Have Questions?</h1>
                        <p>
                            Everything you need to know about tuulbox- <br /> Your All-in-One construction management
                            solution{" "}
                        </p>
                    </Col>
                    <Col sm={12} md={6}>
                        <div className="contact-faq">
                            <Accordion defaultActiveKey="0" className="">
                                {HOMEPAGE_FAQS.map((faq, index) => (
                                    <Accordion.Item eventKey={`${index}`} key={index}>
                                        <Accordion.Header>{faq.header}</Accordion.Header>
                                        <Accordion.Body className="text-muted">{faq.content}</Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </div>
                    </Col>
                </Row>
            </Container>
            <div className="spacer"></div>
            <WebsiteFooter />
        </>
    );
}
