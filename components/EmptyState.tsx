import { Row, Col, Card, Button } from "react-bootstrap";
import { Plus } from "react-feather";
import Link from "next/link";
import { ReactElement } from "react";
import ButtonLoader from "./ButtonLoader";
import { isMobileDevice } from "@/helpers";

type EmptyState = {
    buttonText?: string;
    buttonUrl?: string;
    icon?: ReactElement;
    headerText: string;
    descriptionText: string;
    iconComponent?: React.ComponentType;
    showButtonIcon?: boolean;
    buttonClass?: string;
    onButtonClick?: () => void;
    isLoading?: boolean;
    isLoadingButtonText?: string;
    buttonIcon?: ReactElement;
};
export default function EmptyState(props: EmptyState) {
    const {
        buttonText,
        buttonUrl,
        icon,
        headerText,
        descriptionText,
        iconComponent,
        showButtonIcon = true,
        buttonClass,
        onButtonClick,
        isLoading,
        isLoadingButtonText,
        buttonIcon,
    } = props;
    return (
        <Row className={"row d-flex justify-content-around align-items-center overflow-hidden"}>
            <Col md={"5"} sm={1}>
                <Card
                    className={`d-flex border-0 justify-content-center align-items-center ${
                        isMobileDevice() ? "" : "mt-5"
                    }`}
                >
                    <Card.Body
                        className="text-center p-1 d-flex align-items-center justify-content-center flex-column gap-40"
                        style={{ width: "450px", padding: "2px" }}
                    >
                        <div className="d-flex flex-column align-items-center gap-4 w-100" style={{ width: "px" }}>
                            <div className="">{icon && icon}</div>
                            <div className="d-flex flex-column gap-12">
                                <h6 className="m-0 text-gray-900  tb-title-section-medium">{headerText}</h6>
                                <small className="text-muted tb-body-large-regular">{descriptionText}</small>
                            </div>
                        </div>
                        {buttonText ? (
                            <Link
                                href={onButtonClick ? "javascript:void(0)" : `${buttonUrl}`}
                                className="text-decoration-none tb-title-body-medium"
                            >
                                <Button
                                    variant="primary"
                                    className={`d-flex align-items-center ${buttonClass} ${
                                        isMobileDevice() ? "w-100" : ""
                                    }`}
                                    onClick={onButtonClick}
                                >
                                    {showButtonIcon && (buttonIcon ?? <Plus size={24} className="me-2" />)}{" "}
                                    <span className="w-100">
                                        {isLoading ? (
                                            <ButtonLoader buttonText={isLoadingButtonText ?? ""} />
                                        ) : (
                                            buttonText
                                        )}
                                    </span>
                                </Button>
                            </Link>
                        ) : null}
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}
