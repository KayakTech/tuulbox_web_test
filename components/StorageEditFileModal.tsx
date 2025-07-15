import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { TagInput } from "./ResourceForm";
import { InfoCircle, Calendar } from "iconsax-react";
import DatePicker from "react-date-picker";
import { DATE_PICKER_FORMAT, PREDEFINED_TIMES } from "@/helpers/constants";
import TimeSelector, { SelectTimetype } from "./TimeSelector";
import TimePickerModal from "./TimePickerModal";
import Required from "./Required";
import { X } from "react-feather";

export type FileEditData = {
    id: string;
    fileName: string;
    originalName: string;
    tags: TagInput[];
    expiryDate?: string | Date;
    reminder?: string | Date;
    selectedTime?: string;
};

type StorageFileEditModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    fileData: FileEditData | null;
    tagSuggestions: TagInput[];
    onSave: (
        fileId: string,
        fileName: string,
        tags: TagInput[],
        expiryDate?: string | Date,
        reminder?: string | Date,
        selectedTime?: string,
    ) => void;
};

export default function StorageFileEditModal({
    showModal,
    setShowModal,
    fileData,
    tagSuggestions,
    onSave,
}: StorageFileEditModalProps) {
    const [fileName, setFileName] = useState("");
    const [selectedTags, setSelectedTags] = useState<TagInput[]>([]);
    const [expiryDate, setExpiryDate] = useState<string | Date>("");
    const [reminder, setReminder] = useState<string | Date>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [isPickingTime, setIsPickingTime] = useState<boolean>(false);
    const [showTimePickerModal, setShowTimePickerModal] = useState<boolean>(false);
    const [pickedTime, setPickedTime] = useState<SelectTimetype>({
        timeString: "Pick a time",
        time: "",
        active: false,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (fileData && showModal) {
            setFileName(fileData.fileName);
            setSelectedTags(fileData.tags || []);
            setExpiryDate(fileData.expiryDate || "");
            setReminder(fileData.reminder || "");
            setSelectedTime(fileData.selectedTime || "");

            const isPredefinedTime = PREDEFINED_TIMES.some(time => time.timeString === (fileData.selectedTime || ""));
            setIsPickingTime(!isPredefinedTime && !!fileData.selectedTime);

            if (!isPredefinedTime && fileData.selectedTime) {
                setPickedTime({
                    timeString: fileData.selectedTime,
                    time: fileData.selectedTime,
                    active: true,
                });
            } else {
                setPickedTime({
                    timeString: "Pick a time",
                    time: "",
                    active: false,
                });
            }

            setErrors({});
        }
    }, [fileData, showModal]);

    useEffect(() => {
        const isPredefinedTime = PREDEFINED_TIMES.some(time => time.timeString === selectedTime);

        if (selectedTime && !isPredefinedTime) {
            setPickedTime({
                timeString: selectedTime,
                time: selectedTime,
                active: true,
            });
            setIsPickingTime(true);
        } else {
            setIsPickingTime(false);
            setPickedTime({
                timeString: "Pick a time",
                time: "",
                active: false,
            });
        }
    }, [selectedTime]);

    const handleTimeSelection = (payload: SelectTimetype) => {
        const timeString = payload.timeString;

        if (timeString === "Pick a time") {
            setShowTimePickerModal(true);
            return;
        }

        setSelectedTime(timeString);
        setIsPickingTime(false);
        setShowTimePickerModal(false);
    };

    const handleCustomTimeClick = () => {
        setShowTimePickerModal(true);
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!fileName.trim()) {
            newErrors.fileName = "File name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateForm() && fileData) {
            onSave(fileData.id, fileName.trim(), selectedTags, expiryDate, reminder, selectedTime);
            handleClose();
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setFileName("");
        setSelectedTags([]);
        setExpiryDate("");
        setReminder("");
        setSelectedTime("");
        setIsPickingTime(false);
        setPickedTime({
            timeString: "Pick a time",
            time: "",
            active: false,
        });
        setErrors({});
    };

    const displayName = fileName || fileData?.fileName || fileData?.originalName || "attachment";

    return (
        <>
            <Modal centered show={showModal} onHide={handleClose} className="file-edit-modal" size="lg">
                <Modal.Header closeButton className="pb-2">
                    <Modal.Title className="tb-title-subsection-medium">Edit {displayName}</Modal.Title>
                </Modal.Header>

                <Modal.Body className="pt-2">
                    <p className="text-muted tb-body-small-regular mb-4">Please enter relevant details for this file</p>

                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                File Name <Required />
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={fileName}
                                onChange={e => setFileName(e.target.value)}
                                placeholder="Enter file name"
                                className={`form-control ${errors.fileName ? "border-danger" : ""}`}
                            />
                            {errors.fileName && <small className="text-danger">{errors.fileName}</small>}
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Expiration Date</Form.Label>
                            <DatePicker
                                onChange={value => setExpiryDate((value as string | Date) || "")}
                                value={expiryDate}
                                dayPlaceholder="dd"
                                monthPlaceholder="mm"
                                yearPlaceholder="yyyy"
                                format={DATE_PICKER_FORMAT}
                                className={`form-control ${errors.expiryDate ? "border-danger" : ""}`}
                                calendarIcon={!expiryDate ? <Calendar size={16} color="#B0B0B0" /> : null}
                                clearIcon={expiryDate ? <X size={16} color="#B0B0B0" /> : null}
                                required
                            />
                            {errors.expiryDate && <small className="text-danger">{errors.expiryDate}</small>}
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Reminder</Form.Label>
                            <DatePicker
                                onChange={value => setReminder((value as string | Date) || "")}
                                value={reminder}
                                dayPlaceholder="dd"
                                monthPlaceholder="mm"
                                yearPlaceholder="yyyy"
                                format={DATE_PICKER_FORMAT}
                                className={`form-control border ${errors.reminder ? "border-danger" : ""}`}
                                calendarIcon={!reminder ? <Calendar size={16} color="#B0B0B0" /> : null}
                                clearIcon={reminder ? <X size={16} color="#B0B0B0" /> : null}
                                required
                                disabled={!expiryDate}
                                minDate={new Date()}
                            />
                            {errors.reminder && <small className="text-danger">{errors.reminder}</small>}
                        </Form.Group>

                        {reminder && (
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Notify me</Form.Label>
                                <div className="d-flex flex-wrap gap-2">
                                    {PREDEFINED_TIMES.map((time: SelectTimetype) => (
                                        <TimeSelector
                                            key={time.timeString}
                                            time={time}
                                            onSelectedTime={handleTimeSelection}
                                            selectedTime={selectedTime}
                                            active={selectedTime === time.timeString}
                                        />
                                    ))}
                                    <TimeSelector
                                        time={pickedTime}
                                        onSelectedTime={handleCustomTimeClick}
                                        selectedTime={selectedTime}
                                        active={isPickingTime}
                                    />
                                </div>
                            </Form.Group>
                        )}

                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Tag</Form.Label>
                            <CreatableSelect
                                value={selectedTags}
                                isMulti
                                isClearable
                                options={tagSuggestions}
                                onChange={value => setSelectedTags(value as TagInput[])}
                                openMenuOnFocus={true}
                                noOptionsMessage={() => "No more tags"}
                                placeholder="Add keywords to your resource"
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                            <small className="text-gray-500 tb-body-extra-small-regular d-flex align-items-center gap-2 mt-2">
                                <InfoCircle variant="Bold" size={16} color="#4F4F4F" />
                                Keyword for ease of search
                            </small>
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer className="pt-3 border-top">
                    <div className="d-flex gap-3 w-100">
                        <Button
                            variant="outline-secondary"
                            onClick={handleClose}
                            className="flex-fill tb-body-default-medium"
                        >
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave} className="flex-fill tb-body-default-medium">
                            Save
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            <TimePickerModal
                showModal={showTimePickerModal}
                setShowModal={setShowTimePickerModal}
                onSelectedTime={selectedTimeData => {
                    const customTime = selectedTimeData.time || selectedTimeData.timeString;
                    setSelectedTime(customTime);
                    setIsPickingTime(true);
                    setShowTimePickerModal(false);

                    setPickedTime({
                        timeString: customTime,
                        time: customTime,
                        active: true,
                    });
                }}
                selectedTime={selectedTime}
            />
        </>
    );
}
