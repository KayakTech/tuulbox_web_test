import { formatDatetime, convertIsoToFriendlyTime, getRandomString } from "@/helpers";
import { CALENDAR_BORDER_CLASSES } from "@/helpers/constants";
import { CalendarEvent } from "@/repositories/calendar-repository";

type CalendarEventProps = {
    event: Partial<CalendarEvent>;
    onClick?: () => void;
};

export default function CalendarEventComponent(props: CalendarEventProps) {
    const { event, onClick } = props;
    return (
        <div
            className={`border-left border-end-0 border-top-0 border-bottom-0 py-2 px-2 border-width-2  ${getRandomString(
                CALENDAR_BORDER_CLASSES,
            )} mb-4 ${onClick ? "pointer" : ""}`}
            onClick={() => onClick && onClick()}
        >
            <h6 className="text-gray-600 tb-body-default-medium">{event.title}</h6>
            {event.description && (
                <p className="text-truncate tb-body-small-regular mb-2 text-gray-600">{event.description}</p>
            )}
            {event.start && (
                <p className="text-muted tb-body-extra-small-regular m-0">
                    <small className="text-muted tb-body-extra-small-regular">
                        {convertIsoToFriendlyTime(event.start)} - {convertIsoToFriendlyTime(event.end)} &#8226;
                        {formatDatetime(event.start)}
                    </small>
                </p>
            )}
        </div>
    );
}
