import { Button, Card, Dropdown } from "react-bootstrap";
import { MoreHorizontal } from "react-feather";
import Link from "next/link";
import { ArrowRight2, Calendar, Calendar1, Edit2, ExportSquare, Star1, Trash, User } from "iconsax-react";
import { CalendarEvent } from "@/repositories/calendar-repository";
import { formatDatetime } from "@/helpers";

type EventCardProps = {
    event: CalendarEvent;
    onDelete?: () => void;
    onUpdate?: () => void;
    onAddToFavorites?: () => void;
    isViewOnly?: boolean;
    onViewDetails?: () => void;
};

export default function EventCard(props: EventCardProps) {
    const { event, onDelete, onUpdate, onAddToFavorites, isViewOnly, onViewDetails } = props;
    return (
        <Card
            className="pointer h-100 w-100m "
            onClick={() => (window.location.href = `/calendar/events/edit/${event.id}`)}
        >
            <div className="text-center d-flex flex-column align-items-center justify-content-between gap-12m  pb-0 border-0">
                <div className="d-flex flex-column px-12 pt-20 align-items-center event-card">
                    <div className="icon-box mb-2m">
                        <Calendar1 size={40} color="#4F4F4F" variant="Outline" />
                    </div>
                </div>
                <div className="px-0 pt-0 pe-0 w-100 pb-12">
                    <div className="d-flex px-12 pt-3 gap-1m flex-column align-items-center justify-content-center">
                        <div className="h-46 d-flex flex-column gap-1">
                            <p title={event.description} className="truncate-1 m-0 text-gray-700 tb-tilte-body-medium">
                                {event.description}
                            </p>

                            <div className="mt-2m mb-0 d-flex align-items-start justify-content-center  gap-1">
                                <Calendar size={16} variant="Linear" color="#888888" />

                                <div className="tb-body-small-regular truncate-2 text-gray-400">
                                    <span>{formatDatetime(event.start)}</span> at{" "}
                                    <span>{formatDatetime(event.startTime)}</span> -{" "}
                                    <span>{formatDatetime(event.endTime)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-flex gap-3 ">
                <div className="ms-auto position-absolute top-0 right-0 me-2 mt-2">
                    <Dropdown className="w-100 text-end">
                        <Dropdown.Toggle className="h-44 w-44 border-radius-40 p-0 bg-gray-50 border-0 d-flex justify-content-center align-items-center">
                            <MoreHorizontal size={16} color="#454545" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu align={`end`}>
                            <Dropdown.Item href={`/calendar/events/edit/${event.id}`}>
                                <Edit2 size={16} /> <span className="tb-body-default-regular">Update</span>
                            </Dropdown.Item>
                            {!isViewOnly && (
                                <>
                                    <Dropdown.Item onClick={onDelete} className="text-danger">
                                        <Trash size={16} className="" color="#E70000" />{" "}
                                        <span className="tb-body-default-regular text-danger">Delete</span>
                                    </Dropdown.Item>
                                </>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </Card>
    );
}
