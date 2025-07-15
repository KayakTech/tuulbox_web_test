import { Row, Col, Card } from "react-bootstrap";

type FormLayoutProps = {
    children?: React.ReactNode;
    colSize?: number;
    center?: boolean;
    leftSideText?: string;
    leftSideDescription?: string;
    leftSideIcon?: React.ReactElement;
    className?: string;
};

export default function FormLayout({
    children,
    colSize = 4,
    center = true,
    leftSideText,
    leftSideDescription,
    leftSideIcon,
    className,
}: FormLayoutProps) {
    return (
        <div className="container-fluid">
            <Row className={`${center && "mt-4"} g-3 ${className}`}>
                {leftSideText && (
                    <Col sm={4} md={4} xl={4} xxl={4}>
                        <div className=" d-flex flex-column gap-2 margin-left">
                            <div className="d-flex gap-2">
                                {leftSideIcon ?? null}
                                <p className="mb-0 text-muted tb-title-body-medium">{leftSideText}</p>
                            </div>
                            <div className="ms-2 margin-left">
                                {leftSideDescription && (
                                    <p className="m-0 w-260 form-width margin-left ms-4 text-gray-400 tb-body-default-regular text-muted">
                                        {leftSideDescription}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Col>
                )}
                <Col sm={6} md={6} xl={colSize || 4} xxl={colSize || 4} className="d-flex">
                    <div className="w-100">{children}</div>
                </Col>
            </Row>
        </div>
    );
}
