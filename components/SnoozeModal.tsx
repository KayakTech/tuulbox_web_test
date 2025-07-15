import { SNOOZE_OPTIONS } from "@/helpers/constants";
import { SnoozeOption } from "@/repositories/notifications-repository";
import { ArrowLeft, ArrowLeft2, ArrowRight2, Clock } from "iconsax-react";
import moment from "moment";
import { useState } from "react";
import { Button, ListGroup, ListGroupItem, Modal, ModalBody } from "react-bootstrap";
import Calendar from "react-calendar";

type SnoozeModalProps = {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    toSnooze: any;
};

export default function SnoozeModal(props: SnoozeModalProps) {
    const { showModal, setShowModal, toSnooze } = props;

    const [selectedDate, setSelectedDate] = useState<any>();
    const [showCalendar, setShowCalendar] = useState<boolean>(false);

    function snoozeDescription(snoozeOption: SnoozeOption) {
        const { name } = snoozeOption;

        if (name.toLowerCase() === "day time") return "Tomorrow";
        if (name.toLowerCase() === "week time") return moment().add(7, "days").format("MMM DD");
        if (name.toLowerCase() === "pick a date") return <ArrowRight2 size="20" color="#333333" />;

        return "";
    }

    function onPickDate(snoozeOpiton: SnoozeOption) {
        let option: SnoozeOption = { name: snoozeOpiton.name.toLowerCase() };

        if (option.name === "pick a date") {
            setShowCalendar(true);
        }

        if (option.name === "never") {
            option.date = null;
        }

        if (option.name === "day time") {
            // Tomorrow at this time
            option.date = moment().add(1, "days").format("YYYY-MM-DDTHH:mm:ss.SSS") + "000";
        }

        if (option.name === "week time") {
            // A week at this time
            option.date = moment().add(7, "days").format("YYYY-MM-DDTHH:mm:ss.SSS") + "000";
        }

        setSelectedDate(option);
    }

    function onCalendarDayClick(date: any) {
        let option = { ...selectedDate };
        option.date = moment(date).format("YYYY-MM-DDTHH:mm:ss.SSS000");
        setSelectedDate(option);
        setShowCalendar(false);
    }

    return (
        <Modal backdrop="static" centered show={showModal} onHide={() => setShowModal(false)}>
            <ModalBody className="p-1">
                <div className="w-100">
                    <h5 className="card-title p-24 tb-title-body-medium tb-gray-800">
                        {showCalendar ? (
                            <div className="d-flex gap-3">
                                <ArrowLeft2
                                    size="20"
                                    color="#333333"
                                    className="pointer"
                                    onClick={() => {
                                        setShowCalendar(false);
                                    }}
                                />{" "}
                                Pick a Date
                            </div>
                        ) : (
                            "Notify Me In A"
                        )}
                    </h5>
                    <div className="px-4">
                        {showCalendar ? (
                            <Calendar
                                className={`border-0 w-100 mb-3`}
                                minDate={moment().add(1, "days").toDate()}
                                onClickDay={onCalendarDayClick}
                                // maxDate={moment().endOf("year").toDate()}
                            />
                        ) : (
                            <ListGroup>
                                {SNOOZE_OPTIONS.map((snoozeOption: SnoozeOption, index: number) => (
                                    <ListGroupItem
                                        key={index}
                                        className={`p-3 d-flex align-items-center list-group-item-action pointer justify-content-between gap-2 tb-body-default-regular ${
                                            selectedDate?.name === snoozeOption?.name?.toLowerCase()
                                                ? "text-primary"
                                                : "text-gray-400"
                                        }`}
                                        onClick={() => onPickDate(snoozeOption)}
                                    >
                                        <span className="d-flex align-items-center gap-2">
                                            <Clock
                                                size="20"
                                                color={
                                                    selectedDate?.name === snoozeOption?.name?.toLowerCase()
                                                        ? "#102340"
                                                        : "#B0B0B0"
                                                }
                                            />{" "}
                                            <span className={"text-capitalize"}>{snoozeOption.name}</span>
                                        </span>
                                        {snoozeOption.name.toLowerCase() != "never" && (
                                            <div className="d-flex gap-3">
                                                {selectedDate?.name === "pick a date" &&
                                                    selectedDate?.name === snoozeOption?.name?.toLowerCase() &&
                                                    selectedDate?.date && (
                                                        <span>{moment(selectedDate.date).format("MMM DD Y")}</span>
                                                    )}{" "}
                                                <span>{snoozeDescription(snoozeOption)}</span>
                                            </div>
                                        )}
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        )}
                    </div>
                    {!showCalendar && (
                        <div className="d-flex gap-20 p-24">
                            <Button
                                className="w-240 button-btn px-3 py-2 tb-title-body-medium"
                                variant="outline-secondary"
                                onClick={() => setShowModal(false)}
                            >
                                {showCalendar ? "Back" : "Cancel"}
                            </Button>
                            <Button className="w-100 btn-240 px-3 py-2 tb-title-body-medium" variant="primary">
                                Apply
                            </Button>
                        </div>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
}
