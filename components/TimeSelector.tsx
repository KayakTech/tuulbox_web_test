import { ClockIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Badge } from "react-bootstrap";

export type SelectTimetype = {
    timeValue?: any;
    timeString: string;
    isPickingtime?: boolean;
    time?: string;
    active?: boolean;
};

type TimeSelectorProps = {
    time: SelectTimetype;
    selectedTime: string;
    onSelectedTime: (payload: SelectTimetype) => void;
    active: boolean;
};

export default function TimeSelector(props: TimeSelectorProps) {
    const { time, selectedTime, onSelectedTime, active } = props;
    return (
        <Badge
            className={`${
                active ? "bg-primary text-white" : "bg-white text-gray-600"
            } border-gray-200 border-radius-6 fs-12 p-4px pr-6px pointer d-flex align-items-center ${
                time.isPickingtime && !active ? "border-gray-200 border border-dashed" : "border"
            }`}
            onClick={() => props.onSelectedTime({ timeString: time.timeString, timeValue: time.timeValue })}
        >
            {time.timeString.toLowerCase() === "pick a time" ? (
                <PlusIcon color={`${selectedTime === time.timeString ? "white" : "#888888"}`} width={16} height={16} />
            ) : (
                <ClockIcon width={16} height={16} color={`${selectedTime === time.timeString ? "white" : "#888888"}`} />
            )}
            <span className="ms-1">{time.timeString}</span>
        </Badge>
    );
}
