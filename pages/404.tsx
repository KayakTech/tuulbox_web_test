import Image from "next/image";
import Link from "next/link";
import { Button, Col, Container, Row } from "react-bootstrap";

export default function PageNotFound() {
    return (
        <>
            <Container className="h-100vh w-100 d-flex">
                <Row className="justify-content-center align-items-center g-0 w-100">
                    <Col className="d-flex flex-column" md={8}>
                        <Image
                            src={`/images/svg/404.svg`}
                            className="mx-auto mb-3"
                            alt="Page Not Found"
                            width={170}
                            height={113}
                        />

                        <h4 className="tb-title-section-medium text-center">Error!</h4>
                        <div className="d-flex justify-content-center flex-column align-items-center">
                            <p className="m-0 tb-body-large-regular text-muted text-wrap text-center">
                                Oops, we encountered an issue while loading your data. Please check your connection and
                                try again.
                            </p>
                            <p className="m-0 tb-body-large-regular text-muted">
                                If the problem persists,{" "}
                                <Link href="" className="offset">
                                    Contact Our support team.
                                </Link>
                            </p>
                        </div>
                        <div className="d-flex gap-3 justify-content-center mt-5">
                            <Button
                                variant="outline-primary"
                                className="px-5m border-radius-12"
                                size="lg"
                                onClick={() => (location.href = `/overview`)}
                            >
                                Got it
                            </Button>
                            {window.history.length > 0 && (
                                <Button
                                    variant="primary"
                                    className="px-5m border-radius-12"
                                    size="lg"
                                    onClick={() => window.history.back()}
                                >
                                    Try again
                                </Button>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
