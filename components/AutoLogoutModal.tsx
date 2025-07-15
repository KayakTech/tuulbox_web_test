import { Button, Form, FormCheck, Modal, ModalBody, Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";
import ButtonLoader from "@/components/ButtonLoader";

interface AutoLogoutModalProps {
    show: boolean;
    onHide: () => void;
    currentDuration: number;
    onSave: (duration: number) => void;
    isSubmitting?: boolean;
}

const AUTO_LOGOUT_OPTIONS = [
    { value: 30, label: "30 minutes" },
    { value: 60, label: "60 minutes" },
    { value: 90, label: "90 minutes" },
    { value: 120, label: "120 minutes" },
    { value: -1, label: "Never" },
];

export default function AutoLogoutModal({
    show,
    onHide,
    currentDuration,
    onSave,
    isSubmitting = false,
}: AutoLogoutModalProps) {
    const [selectedDuration, setSelectedDuration] = useState<number>(currentDuration);

    useEffect(() => {
        setSelectedDuration(currentDuration);
    }, [currentDuration, show]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSave(selectedDuration);
    };

    const handleOptionChange = (value: number) => {
        setSelectedDuration(value);
    };

    return (
        <Modal centered size="sm" show={show} onHide={onHide} backdrop="static">
            <Form onSubmit={handleSubmit}>
                <ModalBody style={{ width: "444px" }} className="px-0">
                    <div className="px-24">
                        <h5 className="mb-2">Auto Logout</h5>
                        <p className="text-gray-400 fs-14 mb-4">Automatically log me out after :</p>

                        <div
                            className="border border-gray-100 rounded"
                            style={{
                                borderColor: "#F3F4F6",
                                opacity: 1,
                                borderRadius: "8px",
                                padding: "15px",
                            }}
                        >
                            {AUTO_LOGOUT_OPTIONS.map((option, index) => (
                                <div key={option.value}>
                                    <div
                                        className={`d-flex justify-content-between align-items-center px-3 py-2 cursor-pointer`}
                                        onClick={() => handleOptionChange(option.value)}
                                    >
                                        <span style={{ fontSize: "14px" }}>{option.label}</span>
                                        <div className="form-check form-switch m-0">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                style={{
                                                    cursor: "pointer",
                                                    borderColor: "transparent",
                                                    backgroundColor:
                                                        selectedDuration === option.value
                                                            ? "var(--bs-primary)"
                                                            : "#E5E7EB",
                                                }}
                                                checked={selectedDuration === option.value}
                                                onChange={() => handleOptionChange(option.value)}
                                            />
                                        </div>
                                    </div>
                                    {index < AUTO_LOGOUT_OPTIONS.length - 1 && (
                                        <hr
                                            className="m-0"
                                            style={{
                                                borderColor: "#F3F4F6",
                                                opacity: 1,
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <hr className="my-24 border-gray-300" />

                    <Row className="g-3 px-24 d-flex justify-content-end">
                        <Col sm={3}>
                            <Button
                                className="w-100"
                                variant="secondary"
                                size="sm"
                                onClick={onHide}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </Col>
                        <Col sm={4}>
                            <Button className="w-100" size="sm" type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? <ButtonLoader buttonText="Saving..." /> : "Save changes"}
                            </Button>
                        </Col>
                    </Row>
                </ModalBody>
            </Form>
        </Modal>
    );
}
