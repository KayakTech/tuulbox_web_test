import { formatDatetime } from "@/helpers";
import { CalendarEvent } from "@/repositories/calendar-repository";
import { ArrowRight } from "iconsax-react";
import Link from "next/link";
import { Modal } from "react-bootstrap";
import CalendarEventComponent from "./CalendarEventComponent";

type EventModalProps = {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    clickedEvents: Partial<CalendarEvent>[];
    clikedDate: string;
    viewMoreEvents?: boolean;
};

export default function EventModal({
    showModal,
    setShowModal,
    clickedEvents,
    clikedDate,
    viewMoreEvents,
}: EventModalProps) {
    return (
        <Modal centered show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Body className="p-5">
                {clickedEvents?.length > 0 && (
                    <>
                        <div className="text-center w-100 mb-5">
                            <h4 className="text-gray-800 tb-title-subsection-medium">Upcoming events</h4>
                            <h6 className="text-muted tb-body-default-regular m-0">{formatDatetime(clikedDate)}</h6>
                        </div>
                        <ul className="list-unstyled">
                            {clickedEvents?.slice(0, 3)?.map((event: Partial<CalendarEvent>, index: number) => (
                                <li key={event.id}>
                                    <CalendarEventComponent event={event} />
                                </li>
                            ))}
                        </ul>
                    </>
                )}
                {viewMoreEvents && (
                    <p className="m-0 mt-5 text-center">
                        <Link
                            href="/calendar"
                            className="text-blue-900 d-flex align-items-center gap-12 justify-content-center tb-title-body-medium text-decoration-none"
                        >
                            View more events <ArrowRight size={16} color="#0848A0" />
                        </Link>
                    </p>
                )}
            </Modal.Body>
        </Modal>
    );
}
