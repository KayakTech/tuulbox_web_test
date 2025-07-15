import { Button, Form, Modal } from "react-bootstrap";
import Required from "./Required";
import { useEffect, useRef, useState } from "react";
import { SelectTimetype } from "./TimeSelector";
import { getTimeFromTimestamp } from "@/helpers";

type TimePickerModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    onSelectedTime: (payload: SelectTimetype) => void;
    selectedTime?: string;
};
export default function TimePickerModal(props: TimePickerModalProps) {
    const { showModal, setShowModal, onSelectedTime, selectedTime } = props;
    const [time, setTime] = useState<any>("");
    const timePickerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedTime) {
            setTime(getTimeFromTimestamp(selectedTime));
        }
    }, [selectedTime]);

    useEffect(() => {
        const timePicker = timePickerRef.current;

        const handleFocus = () => {
            if (timePicker) {
                timePicker.showPicker();
            }
        };

        if (timePicker) {
            timePicker.addEventListener("focus", handleFocus);
        }

        return () => {
            if (timePicker) {
                timePicker.removeEventListener("focus", handleFocus);
            }
        };
    }, []);

    function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        onSelectedTime({ timeValue: time, timeString: time, isPickingtime: true });
        setShowModal(false);
    }

    return (
        <Modal centered size="sm" show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Body className="p-4 border-0" style={{ width: "336px" }}>
                <h4 className="tb-title-subsection-medium text-gray-900">Pick a time</h4>
                <p className="text-gray-600 tb-body-small-regular">
                    Select a suitable time you would like to receive reminders at
                </p>

                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label className="tb-body-small-medium text-gray-600">
                            Select time <Required />
                        </Form.Label>

                        <Form.Control
                            type="time"
                            ref={timePickerRef}
                            required
                            value={time}
                            onChange={e => setTime(e.target.value)}
                        />

                        <div className="d-flex gap-3 mt-4">
                            <Button
                                className="flex-fill"
                                variant="outline-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit" className="flex-fill" onClick={() => {}}>
                                Done
                            </Button>
                        </div>
                    </Form.Group>
                </Form>
            </Modal.Body>
        </Modal>
    );
}
