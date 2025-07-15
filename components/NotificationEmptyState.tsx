import { NotificationBing } from "iconsax-react";

export default function NotificationEmptyState() {
    return (
        <div className="no-notification">
            <div className="d-flex flex-column justify-content-center align-items-center gap-4 notification-text-wrapper">
                <NotificationBing size={48} color="#B0B0B0" />
                <div className="d-flex flex-column gap-2">
                    <h4 className="tb-title-body-medium m-0">There are no notifications at this time</h4>
                    <small className="text-muted tb-body-small-regular">
                        Be sure to turn on notifications in your account settings
                    </small>
                </div>
            </div>
        </div>
    );
}
