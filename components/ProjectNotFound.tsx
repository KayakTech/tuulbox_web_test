import { Col, Row } from "react-bootstrap";
import { CloseCircle } from "iconsax-react";

export default function ProjectNotFound() {
    return (
        <div className="h-80vh w-100 d-flex">
            <Row className="justify-content-center align-items-center g-0 w-100">
                <Col className="d-flex flex-column align-items-center" md={6}>
                    <div className="mb-3">
                        <CloseCircle size={32} variant="Outline" color="#F87171" />
                    </div>
                    <h4 className="fs-24 fw-500 text-center">Project Not Found</h4>
                    <p className="m-0 fs-12 fw-300 text-muted text-center">
                        Your access to this project was revoked. If you need access again, you can <br />
                        always reach out to the project owner to request a new invite.
                    </p>
                </Col>
            </Row>
        </div>
    );
}
