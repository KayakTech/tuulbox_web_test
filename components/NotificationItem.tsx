import { User } from "react-feather";
import { NotificationBing } from "iconsax-react";
import CircleBlue from "./NotificationDot";
import { Col, Row } from "react-bootstrap";
import { formatDatetime, daysLeft } from "@/helpers";

export type NotificationPayload = {
    notificationType?: string;
    data: any;
};

export default function NotificationItem(props: NotificationPayload) {
    return (
        <Row className="notification-item g-5">
            <Col md={6}>
                <div className="d-flex gap-3">
                    <div className="d-flex align-items-center flex-shrink-0 object-fit-cover">
                        <CircleBlue className={`me-3 notification-dot-small bg-blue-primary`} />
                        <div className="notification-user">
                            {props?.notificationType?.toLowerCase() === "emails" ? (
                                <User size="24" color="#B0B0B0" />
                            ) : (
                                <NotificationBing size="24" color="#B0B0B0" />
                            )}
                        </div>
                    </div>
                    {props?.notificationType && (
                        <div className="d-flex flex-column align-items-start w-100">
                            <h6 className="mb-2 text-start tb-title-body-medium text-truncate w-100">
                                {props?.notificationType === "emails" && props.data.subject}

                                {["license reminders"].includes(props?.notificationType) &&
                                    `${props.data.name} Reminder`}
                                {["license expirations"].includes(props?.notificationType) &&
                                    `${props.data.name} Expiring Soon`}

                                {["insurance reminders"].includes(props?.notificationType) &&
                                    `${props.data.insuranceType} Reminder`}
                                {["insurance expirations"].includes(props?.notificationType) &&
                                    `${props.data.insuranceType} Expiring Soon`}

                                {["document reminders"].includes(props?.notificationType) &&
                                    `${props.data.originalFileName} Reminder`}
                                {["document expirations"].includes(props?.notificationType) &&
                                    `${props.data.originalFileName} Expiring Soon`}
                            </h6>
                            <p className="w-100 text-muted tb-body-default-regular text-truncate m-0">
                                {props?.notificationType === "emails" && props.data.content}

                                {["license reminders"].includes(props?.notificationType) &&
                                    `${props.data.name} is due in ${daysLeft(props.data.reminder)} days`}

                                {["license expirations"].includes(props?.notificationType) &&
                                    `${props.data.name} is expiring in ${daysLeft(props?.data?.validTo)} days`}

                                {["insurance reminders"].includes(props?.notificationType) &&
                                    `${props.data.insuranceType} is due in ${daysLeft(props?.data?.reminder)} days`}

                                {["insurance expirations"].includes(props?.notificationType) &&
                                    `${props.data.insuranceType} is expiring in ${daysLeft(props?.data?.validTo)} days`}

                                {["document reminders"].includes(props?.notificationType) &&
                                    `${props.data.originalFileName} is due in ${daysLeft(props?.data?.reminder)} days`}

                                {["document expirations"].includes(props?.notificationType) &&
                                    `${props.data.originalFileName} is expiring in ${daysLeft(
                                        props?.data?.expireAt,
                                    )} days`}
                            </p>
                        </div>
                    )}
                </div>
            </Col>
            <Col md={6} className="text-end">
                <small className="text-muted tb-body-small-regular">{formatDatetime(props.data.createdAt)}</small>{" "}
            </Col>
        </Row>
    );
}
