import { InfoCircle, TickCircle } from "iconsax-react";
import { Alert } from "react-bootstrap";
import ErrorIcon from "./icons/ErrorIcon";

type FormAlertProps = {
    variant: string;
    show: boolean;
    onClose: () => void;
    dismissible?: boolean;
    message: string;
};

export default function FormAlert({ variant, show, onClose, dismissible, message }: FormAlertProps) {
    return (
        <Alert
            className={`w-100 px-3 py-2 d-flex align-items-center mb-4 rounded ${
                variant === "danger"
                    ? "bg-danger-subtle border-danger-subtle"
                    : variant === "info"
                    ? "bg-info-subtle border-info-subtle"
                    : "bg-success-subtle border-success-subtle"
            }`}
            variant={variant}
            show={show}
            onClose={() => onClose()}
            dismissible={dismissible}
        >
            {variant === "success" ? (
                <TickCircle variant="Bold" size={20} color="#099260" className="me-2 flex-shrink-0" />
            ) : variant === "info" ? (
                <InfoCircle variant="Bold" size={20} color="#0D6EFD" className="me-2 flex-shrink-0" />
            ) : (
                <ErrorIcon width={20} height={20} className="me-2 flex-shrink-0" />
            )}
            <span className="text-gray-900 tb-body-small-medium">{message}</span>
        </Alert>
    );
}
