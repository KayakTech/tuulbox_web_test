import { Button, Col, Row } from "react-bootstrap";

export default function ErrorPage() {
    return (
        <div className="h-80vh w-100 d-flex">
            <Row className="justify-content-center align-items-center g-0 w-100">
                <Col className="d-flex flex-column" md={6}>
                    <h4 className="fs-24 fw-500 text-center">Error!</h4>
                    <p className="m-0 fs-16 fw-300 text-muted text-center">
                        Oops, we encountered an issue while loading your data. <br /> Please check your connection and
                        try again.
                    </p>
                    <div className="d-flex gap-3 justify-content-center mt-5">
                        <Button className="px-5" size="sm" onClick={() => location.reload()}>
                            Try again
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
