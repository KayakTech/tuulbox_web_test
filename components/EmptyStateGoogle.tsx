import { Row, Col, Card, Button } from "react-bootstrap";
import Image from "next/image";
import Folder from "./icons/Folder";

type EmptyStateGoogleState = {
    onButtonClick: () => void;
    isLoading: boolean;
};

export default function EmptyStateGoogle(props: EmptyStateGoogleState) {
    const { onButtonClick, isLoading } = props;

    function openGmail() {
        window.open("https://mail.google.com/", "_blank");
    }

    return (
        <Row className="row d-flex justify-content-around align-items-center">
            <div>
                <Card className="border-0">
                    <Col className="text-center d-flex gap-40 flex-column align-items-center">
                        <Folder />
                        <div className="d-flex flex-column gap-24">
                            <div className="d-flex gap-12 flex-column">
                                <div>
                                    <p className="tb-title-section-medium m-0">Coming soon!</p>
                                    <p className="tb-title-section-medium m-0">
                                        Connect your google account to tuulbox
                                    </p>
                                </div>
                                <p className="text-muted tb-body-large-regular">
                                    This would allow you to send and receive emails within tuulbox
                                </p>
                            </div>
                            <div className="text-center mx-auto connect-google google-card-shadow">
                                <div className="d-flex justify-content-between gap-56 align-items-center">
                                    <span className="d-flex justify-content-center align-items-center">
                                        <span
                                            className="bg-light rounded-circle d-flex me-2"
                                            style={{ width: "48px", height: "48px" }}
                                        >
                                            <Image
                                                className="m-auto"
                                                src={`/images/svg/icons/google.svg`}
                                                alt=""
                                                width={24}
                                                height={24}
                                            />
                                        </span>
                                        <span style={{ fontSize: "14px" }} className="text-start">
                                            <p className="m-0 tb-body-default-medium">Google account</p>
                                            <small className="text-muted tb-body-extra-small-regular">
                                                Google sign-in
                                            </small>
                                        </span>
                                    </span>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="rounded-pillm px-3m p-0 w-112 h-36"
                                        onClick={openGmail}
                                    >
                                        {isLoading ? "connecting..." : "Open Email"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Card>
            </div>
        </Row>
    );
}
