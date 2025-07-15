import Link from "next/link";
import { Alert, Col, FormGroup, FormLabel, InputGroup, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { CloseCircle, TickCircle } from "iconsax-react";
import WebsiteTopNav from "@/components/WebsiteTopNav";
import WebsiteFooter from "@/components/WebsiteFooter";
import Image from "next/image";
import useWebsite from "@/hooks/website";
import ButtonLoader from "@/components/ButtonLoader";
import Head from "next/head";

export default function LandingPage() {
    const { handleSubmit, email, setEmail, isSubmitting, showAlert, setShowAlert, alertMessage, successful } =
        useWebsite();
    const PAGE_TITLE = "Manage Construction Projects, Tasks, Contacts & Files on the Go - tuulbox";
    const PAGE_DESCRIPTION = "Manage Construction Projects, Tasks, Contacts & Files on the Go";
    const PAGE_THUMBNAIL = "/Tuulbox-logo-Icon.png";

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
            <WebsiteTopNav />
            <section className="website-hero home d-flex pt-md-5 pt-lg-0">
                <div className="transparent-dark d-flex w-100">
                    <Container className="d-flex flex-column">
                        <span className="text-center text-white m-auto pt-5 px-0 px-md-5 d-flex flex-column">
                            <h1 className="fw-600 fs-40 fs-md-60 mb-4">
                                Manage Construction Projects, Tasks, Contacts & Files on the Go
                            </h1>
                            <p className="fw-normal fs-20 mb-5 col-md-7 align-self-center">
                                Designed by a general contractor for fellow construction company owners, tuulbox has
                                what you need without the needless features of other construction softwares. Easy to use
                                and exactly what you need
                            </p>
                            <Alert
                                className="w-fit mx-auto alert-success"
                                variant={successful ? "success" : "danger"}
                                show={showAlert}
                                onClose={() => setShowAlert(false)}
                            >
                                {successful ? (
                                    <TickCircle variant="Bold" size={20} color="#099260" />
                                ) : (
                                    <CloseCircle variant="Bold" size={20} color="#D42E37" />
                                )}{" "}
                                {alertMessage}
                            </Alert>

                            {!showAlert && (
                                <Form
                                    className="waitlist-form col-md-7 col-12 align-self-center mb-4 p-1"
                                    onSubmit={handleSubmit}
                                >
                                    <FormGroup className="text-start">
                                        <FormLabel>Get latest update in your inbox</FormLabel>
                                        <div className="d-flex flex-column flex-md-row gap-2">
                                            <Form.Control
                                                className="border-2 bg-transparent text-white"
                                                placeholder="Enter your email address"
                                                aria-label="Enter your email address"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                type="email"
                                                required
                                            />
                                            <Button
                                                variant="secondary"
                                                type="submit"
                                                className="px-5 bg-white text-nowrap"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? <ButtonLoader buttonText="Subscribe" /> : "Subscribe"}
                                            </Button>
                                        </div>
                                    </FormGroup>
                                </Form>
                            )}
                        </span>
                    </Container>
                </div>
            </section>

            <div className="spacer"></div>

            <Container>
                <Row className="justify-content-around">
                    <Col sm={12} md={6} className="text-center text-md-start">
                        <h1 className="fw-600 fs-40 mb-0 mt-md-5 pt-md-5">Download for both iOS and Android</h1>
                        <p className="fs-20 text-muted my-3">
                            Now small construction business owners can better juggle running their company and managing
                            projects right from their phone or laptop
                        </p>
                        <div className="d-flex gap-4 mt-4 justify-content-center justify-content-md-start">
                            <Link href={`${process.env.NEXT_PUBLIC_APP_STORE_APP_URL}`} target="_blank">
                                <Image src={`/images/svg/applestore-download.svg`} width={165} height={46} alt="" />
                            </Link>
                            <Link href={`${process.env.NEXT_PUBLIC_PLAY_STORE_APP_URL}`} target="_blank">
                                <Image src={`/images/svg/playstore-download.svg`} width={165} height={46} alt="" />
                            </Link>
                        </div>
                    </Col>
                    <Col sm={12} md={6}>
                        <Image
                            src={`/images/website/download-app-phone.svg`}
                            className="w-100"
                            height={446}
                            width={520}
                            alt=""
                        />
                    </Col>
                </Row>
            </Container>
            <div className="spacer"></div>
            <WebsiteFooter />
        </>
    );
}
