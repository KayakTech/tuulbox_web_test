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

export default function EventMiniCard(props: EventCardProps) {
    const { event, onDelete, onUpdate, onAddToFavorites, isViewOnly, onViewDetails } = props;
    return (
        <Card className="d-flex gap-12 flex-row align-items-center w-100 p-12 border border-gray-100 rounded-3 shadow-sm">
            <div
                className="d-flex align-items-center object-fit-cover flex-shrink-0 justify-content-center bg-gray-50 rounded me-2m"
                style={{ width: "40px", height: "40px" }}
            >
                <div className="icon-box">
                    <Calendar1 size={24} color="#4F4F4F" variant="Outline" />
                </div>
            </div>
            <div className="w-100 h-46 d-flex align-items-center justify-content-between">
                <div className="d-flex flex-column gap-1m align-items-centerm">
                    <p title={event.description} className="truncate-1 m-0 text-gray-700 tb-tilte-body-medium">
                        {event.description}
                    </p>

                    <div className=" mb-0 d-flex align-items-start justify-content-centerm gap-1">
                        <div className="tb-body-default-regular truncate-2 text-gray-400">
                            <span>{formatDatetime(event.start)}</span> at <span>{formatDatetime(event.startTime)}</span>{" "}
                            - <span>{formatDatetime(event.endTime)}</span>
                        </div>
                    </div>
                </div>
                <div className="d-flex gap-3 ">
                    <div className="ms-auto">
                        <Dropdown className="w-100 text-end">
                            <Dropdown.Toggle
                                variant="secondary"
                                className="d-flex align-items-center justify-content-center border-0  bg-gray-50 h-24 w-24 p-0"
                            >
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
            </div>
        </Card>
    );
}
