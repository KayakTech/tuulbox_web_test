import { Spinner } from "react-bootstrap";

type Loader = {
    buttonText?: string;
};
export default function ButtonLoader(props: Loader) {
    return (
        <>
            <div className="d-flex align-items-center justify-content-center">
                <Spinner animation="border" variant="light" size="sm" className="me-2" />
                <span className="ms-2">{props.buttonText}</span>
            </div>
        </>
    );
}
