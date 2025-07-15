import { ChangeEvent, ChangeEventHandler } from "react";
import { Form } from "react-bootstrap";

type SettingsTogglerProps = {
    title: string;
    description: string;
    preference?: boolean;
    onToggle: (value: ChangeEvent<HTMLInputElement>) => void;
    index: number;
    toggles: any[];
    id: string;
    allChecked: boolean;
};

export default function SettingsToggler({
    title,
    description,
    preference,
    onToggle,
    index,
    toggles,
    id,
    allChecked,
}: SettingsTogglerProps) {
    return (
        <div>
            <div
                className={`d-flex pt-3 pb-3 align-items-end ${
                    index < toggles.length - 1 && "border-bottom-gray-50"
                } user-notification-list`}
            >
                <div className="d-flex flex-column gap-2">
                    <h1 className="m-0 tb-title-body-medium">{preference}</h1>
                    <h6 className="m-0 text-gray-800 tb-title-body-medium">{title}</h6>
                    <p className="m-0 text-muted tb-body-default-regular mt-2">{description}</p>
                </div>
                <Form.Check id={id} type="switch" defaultChecked={allChecked || preference} onChange={onToggle} />
            </div>
        </div>
    );
}
