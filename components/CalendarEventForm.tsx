import { ArrowDown2, ArrowUp2, Calendar, Clock, InfoCircle, Microphone2, SearchNormal1 } from "iconsax-react";
import DashboardLayout from "./DashboardLayout";
import FormLayout from "./FormLayout";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import DatePicker from "react-date-picker";
import Required from "./Required";
import Link from "next/link";
import useCalendar from "@/hooks/calendar";
import ButtonLoader from "./ButtonLoader";
import FeedbackModal from "./FeedbackModal";
import { CheckCircle, X } from "react-feather";
import { useEffect, useRef, useState } from "react";
import PageLoader from "./PageLoader";
import CreatableSelect from "react-select/creatable";
import { DATE_PICKER_FORMAT } from "@/helpers/constants";

type CalendarEventForm = {
    action: string;
};

const durations = [
    { label: "15 Minutes", time: "20:00" },
    { label: "30 Minutes", time: "20:15" },
    { label: "45 Minutes", time: "20:30" },
    { label: "1 Hour", time: "20:45" },
];
export default function CalendarEventForm(props: CalendarEventForm) {
    const { action } = props;
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const {
        calendarEvent,
        setCalendarEvent,
        handleSubmit,
        errorMessage,
        isSaving,
        setShowFeedbackModal,
        showFeedbackModal,
        getCalendarEvent,
        isLoading,
        setCalendarEventId,
        contactSuggestions,
        handleTagsChange,
        getContacts,
        getAttendeesAsTags,
        getTimezones,
        timeZones,
        tagsSelector,
        errors,
        onChangeEndTime,
        onChangeStartTime,
        onDurationChange,
    } = useCalendar({ action });

    useEffect(() => {
        getTimezones();
        getContacts();
        if (action === "edit") {
            const eventId = location.href.split("/")[6];
            setCalendarEventId(eventId);
            getCalendarEvent(eventId);
        }
    }, []);

    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef(null);

    const filteredTimeZones = timeZones.filter(tz => tz.label.toLowerCase().includes(search.toLowerCase()));

    return (
        <DashboardLayout
            pageTitle="Add new event"
            breadCrumbs={[
                { name: "Calendar", url: "/calendar" },
                { name: action === "add" ? "New Event" : "Update Event" },
            ]}
        >
            <div className="container-fluid pb-5">
                {action === "edit" && isLoading ? (
                    <PageLoader />
                ) : (
                    <FormLayout
                        leftSideText={action === "add" ? "New Event" : "Edit Event"}
                        leftSideDescription={
                            action === "add"
                                ? "Fill in the correct details to add a new event"
                                : "Fill in the correct details to update event"
                        }
                        leftSideIcon={<Calendar size={24} color="gray" />}
                    >
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">
                                    Title <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={calendarEvent.title}
                                    onChange={e => setCalendarEvent({ title: e.target.value })}
                                    placeholder="E.g Living Room Remodel"
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Timezone</Form.Label>
                                <div className="position-relative ">
                                    <Form.Control
                                        type="text"
                                        placeholder="E.g Africa/Accra"
                                        value={calendarEvent.timezone}
                                        readOnly
                                        onClick={() => setShowModal(true)}
                                    />
                                    <Clock
                                        size="16"
                                        color="#B0B0B0"
                                        className="position-absolute me-3 timezone-select"
                                    />
                                </div>

                                <Modal show={showModal} onHide={() => setShowModal(false)} className="timezone-modal">
                                    <div className=" p-4">
                                        <div className="d-flex gap-3 flex-column">
                                            <Modal.Header className="p-0">
                                                <Modal.Title className="tb-title-body-medium text-gray-800">
                                                    Timezone
                                                </Modal.Title>
                                            </Modal.Header>
                                            <div className="position-relative">
                                                <SearchNormal1
                                                    size="16"
                                                    color="#888888"
                                                    className=" ms-3 position-absolute z-index"
                                                />

                                                <Form.Control
                                                    type="text"
                                                    placeholder="Search"
                                                    className="border rounded-5 ps-36"
                                                    value={search}
                                                    onChange={e => setSearch(e.target.value)}
                                                />
                                                <Microphone2
                                                    size="24"
                                                    variant="Bold"
                                                    color="#6D6D6D"
                                                    className="position-absolute me-3 microphone"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <Modal.Body className="pt-0 p-0m ps-4m">
                                        <div
                                            className="border border-gray-100 border-radius-12"
                                            style={{ maxHeight: "448px", overflowY: "auto" }}
                                        >
                                            {filteredTimeZones.length > 0 ? (
                                                filteredTimeZones.map((timezone, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-2 timezonelist border-bottom border-gray-100"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => {
                                                            setCalendarEvent({ timezone: timezone.value });
                                                            setShowModal(false);
                                                        }}
                                                    >
                                                        {timezone.label}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-muted text-center">No matching timezones</p>
                                            )}
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer className="d-flex align-items-center justify-content-center gap-20 w-100 border-top border-gray-100 m-0">
                                        <Button
                                            variant="outline-secondary"
                                            className="w-140 btn-140 px-3 py-2 tb-title-body-medium"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="w-50 btn-240 px-3 py-2 tb-title-body-medium"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Apply
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </Form.Group>

                            <Row>
                                <Col md={6} xs={6} xl={6} xxl={6} sm={6} className="padding-start">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Event Start Date <Required />
                                        </Form.Label>
                                        <DatePicker
                                            onChange={value => setCalendarEvent({ startDate: value ?? "" })}
                                            value={calendarEvent.startDate}
                                            dayPlaceholder="dd"
                                            monthPlaceholder="mm"
                                            yearPlaceholder="yyyy"
                                            format={DATE_PICKER_FORMAT}
                                            required
                                            className={`form-control`}
                                            calendarIcon={
                                                !calendarEvent.startDate ? <Calendar size={16} color="#B0B0B0" /> : null
                                            }
                                            clearIcon={calendarEvent.startDate ? <X size={16} color="#B0B0B0" /> : null}
                                            onTimeUpdate={() => {}}
                                            minDate={new Date()}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6} xs={6} xl={6} xxl={6} sm={6} className="padding-end">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Event End Date <Required />
                                        </Form.Label>
                                        <DatePicker
                                            onChange={value => setCalendarEvent({ endDate: value ?? "" })}
                                            value={calendarEvent.endDate}
                                            dayPlaceholder="dd"
                                            monthPlaceholder="mm"
                                            yearPlaceholder="yyyy"
                                            format={DATE_PICKER_FORMAT}
                                            required
                                            className={`form-control`}
                                            calendarIcon={
                                                !calendarEvent.endDate ? <Calendar size={16} color="#B0B0B0" /> : null
                                            }
                                            clearIcon={calendarEvent.endDate ? <X size={16} color="#B0B0B0" /> : null}
                                            // @ts-ignore

                                            minDate={
                                                action === "edit"
                                                    ? new Date(`${calendarEvent?.startDate}`)
                                                    : calendarEvent.startDate ?? new Date()
                                            }
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4 event-duration">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Duration</Form.Label>
                                <div className="custom-dropdown" ref={inputRef}>
                                    <div className="">
                                        <input
                                            type="text"
                                            placeholder="E.g 1 hour"
                                            value={calendarEvent.duration}
                                            readOnly
                                            className="form-control custom-input position-relative"
                                            onClick={e => {
                                                const target = e.target as HTMLInputElement;
                                                setShowDropdown(!showDropdown);
                                                onDurationChange(target.value);
                                            }}
                                        />
                                        <ArrowDown2
                                            size="16"
                                            color="#888888"
                                            variant="Bold"
                                            className="position-absolute dura-arrow"
                                        />
                                    </div>

                                    {showDropdown && (
                                        <div className="dropdown-options p-2 border border-gray-100">
                                            {durations.map(item => (
                                                <div
                                                    key={item.label}
                                                    className={`dropdown-item ${
                                                        calendarEvent.duration === item.label ? "selected" : ""
                                                    }`}
                                                    onClick={() => {
                                                        onDurationChange(item.label);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    <div className="d-flex gap-2">
                                                        <Clock size={16} className="icon" />
                                                        <span>{item.label}</span>
                                                    </div>
                                                    <span className="time">{item.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Form.Group>
                            <Row>
                                <Col md={6} xs={6} xl={6} xxl={6} sm={6} className="padding-start">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Event Start Time <Required />
                                        </Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={calendarEvent.startTime}
                                            onChange={e => onChangeStartTime(e.target.value)}
                                            placeholder="E.g Living Room Remodel"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6} xs={6} xl={6} xxl={6} sm={6} className="padding-end">
                                    {/* Event End Time */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Event End Time <Required />
                                        </Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={calendarEvent.endTime}
                                            onChange={e => onChangeEndTime(e.target.value)}
                                            placeholder="E.g Living Room Remodel"
                                            disabled={!calendarEvent.startTime}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Guest</Form.Label>
                                <CreatableSelect
                                    ref={tagsSelector}
                                    defaultValue={getAttendeesAsTags(calendarEvent?.attendees)}
                                    isMulti
                                    isClearable
                                    autoFocus={calendarEvent.autoFocus}
                                    options={contactSuggestions}
                                    onChange={handleTagsChange}
                                    openMenuOnFocus={true}
                                    noOptionsMessage={() => "No more tags"}
                                    placeholder=""
                                    className={`${errors?.attendees ? " border-danger border border-radius-6" : ""}`}
                                />
                                <small className={`${errors?.attendees ? "text-danger" : "text-muted"}`}>
                                    {errors?.attendees ? (
                                        errors?.attendees["0"][0]
                                    ) : (
                                        <>
                                            <div className="d-flex mt-2 gap-2 text-gray-500 tb-body-extra-small-regular">
                                                <InfoCircle variant="Bold" size={16} color="#4F4F4F" /> Add guests from
                                                contacts or with their email addresses
                                            </div>
                                        </>
                                    )}
                                </small>
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Description</Form.Label>
                                <Form.Control
                                    as={"textarea"}
                                    rows={5}
                                    value={calendarEvent.description}
                                    onChange={e => setCalendarEvent({ description: e.target.value })}
                                    placeholder="Input your short description here..."
                                />
                            </Form.Group>

                            <div className="mt-5">
                                <div className="d-flex gap-20 w-100">
                                    <Link
                                        href={isSaving ? "javascript:void(0)" : `/calendar`}
                                        className="text-decoration-none"
                                    >
                                        <Button
                                            className="w-140 btn-140 tb-title-body-medium"
                                            variant="secondary"
                                            size="lg"
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </Button>
                                    </Link>

                                    <Button
                                        className="w-100 btn-240 tb-title-body-medium"
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={
                                            isSaving ||
                                            !calendarEvent.title ||
                                            !calendarEvent.startDate ||
                                            !calendarEvent.endDate ||
                                            !calendarEvent.startTime ||
                                            !calendarEvent.endTime
                                        }
                                    >
                                        {isSaving ? <ButtonLoader buttonText="Saving..." /> : "Save"}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </FormLayout>
                )}
            </div>
            {/* Success modal */}
            <FeedbackModal
                icon={<CheckCircle color="green" size={50} />}
                showModal={showFeedbackModal}
                setShowModal={setShowFeedbackModal}
                primaryButtonText={"Go to calendar"}
                primaryButtonUrl={`/calendar`}
                secondaryButtonText={action === "edit" ? "Close" : "Add another event"}
                feedbackMessage={"Event added successfully"}
                onSecondaryButtonClick={() => location.reload()}
            />
        </DashboardLayout>
    );
}
