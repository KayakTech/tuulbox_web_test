import { Row, Col, Card, Button } from "react-bootstrap";
import { Plus } from "react-feather";
import { ReactElement, ReactHTMLElement } from "react";
import { isMobileDevice } from "@/helpers";

type EmptyStateInnerPage = {
    buttonText?: string;
    buttonUrl?: string;
    icon?: ReactElement;
    buttonIcon?: ReactElement;
    headerText: string;
    descriptionText: string;
    onButtonClick?: () => void;
    col?: number;
    className?: string;
    fixedHieght?: boolean;
};
export default function EmptyStateInnerPage(props: EmptyStateInnerPage) {
    const {
        buttonText,
        buttonUrl,
        icon,
        buttonIcon,
        headerText,
        descriptionText,
        onButtonClick,
        col,
        className,
        fixedHieght = true,
    } = props;
    return (
        <Row
            className={`row d-flex justify-content-around align-items-center ${className} ${
                isMobileDevice() ? "mt-0" : " mt-5 "
            }`}
        >
            <Col md={col ?? 7}>
                <Card className="border-0">
                    <Card.Body
                        className={`text-center d-flex flex-column gap-40  ${isMobileDevice() ? "mt-0" : "mt-5"}`}
                    >
                        <div className="d-flex flex-column align-items-center gap-4">
                            {icon && icon}
                            <div className="d-flex flex-column gap-12">
                                <h6 className="tb-title-section-medium m-0 text-gray-900">{headerText}</h6>
                                <small className="text-muted tb-body-large-regular">{descriptionText}</small>
                            </div>
                        </div>
                        {buttonText && (
                            <Button
                                variant="primary"
                                onClick={onButtonClick}
                                className={`d-flex align-items-center justify-content-center mx-auto p-3 border-radius-12 tb-title-body-medium ${
                                    isMobileDevice() ? "w-100m d-flex align-items-center justify-content-center" : ""
                                }`}
                            >
                                {buttonIcon || <Plus size={24} />} <span className="ms-2">{buttonText}</span>
                            </Button>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}
