import { InfoCircle } from "iconsax-react";
import { ToastContainer, Toast } from "react-bootstrap";
import { X } from "react-feather";

type MyToastProps = {
    showToast: boolean;
    setShowToast: (value: boolean) => void;
    heading?: string;
    message: string;
    variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "dark" | "light";
};

export function MyToast({ showToast, setShowToast, heading, message, variant = "light" }: MyToastProps) {
    function borderColor() {
        switch (variant) {
            case "success":
                return "#48BB78";
            case "info":
                return "#4299E1";
            case "danger":
                return "#F56565";
            case "warning":
                return "#ED8936";
            default:
                return "#E0E0E0";
        }
    }

    function iconBg() {
        switch (variant) {
            case "success":
                return "#2F855A";
            case "info":
                return "#2B6CB0";
            case "danger":
                return "#C53030";
            case "warning":
                return "#C05621";
            default:
                return "#F5F5F5";
        }
    }

    return (
        <ToastContainer
            className="p-3 border-0 position-fixed bottom-20 right-20 z-index-9999"
            position={"bottom-center"}
        >
            <Toast
                onClose={() => setShowToast(false)}
                show={showToast}
                delay={5000}
                autohide={true}
                bg={variant || "light"}
                className="max-w-412 border-radius-12 overflow-hidden shadow-sm"
                style={{ borderColor: borderColor() }}
            >
                <Toast.Body className="d-flex border-radius-12 gap-12 h-100 align-items-center w-100">
                    <span
                        className="h-40 w-40 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ background: iconBg(), minWidth: "40px", minHeight: "40px" }}
                    >
                        <InfoCircle size={24} className="m-auto" color={variant != "light" ? "white" : "#7A7A7A"} />
                    </span>

                    <div className="d-flex justify-content-between w-100">
                        <div className="d-flex flex-column text-break">
                            <span className="m-0 overflow-hidden truncate-1 tb-body-default-regular text-muted">
                                {message}
                            </span>
                        </div>

                        <span className="ms-auto d-flex flex-shrink-0 my-auto">
                            <X size={16} className="my-auto pointer" onClick={() => setShowToast(false)} />
                        </span>
                    </div>
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
}
