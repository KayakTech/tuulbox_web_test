import { CheckCircle, XCircle } from "react-feather";
import { NotificationBing } from "iconsax-react";
import CircleBlue from "./NotificationDot";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import { formatDatetime } from "@/helpers";
import { ChatOriginalObject, NotificationObject } from "@/repositories/notifications-repository";
import BadgeTag from "./BadgeTag";
import { useRouter } from "next/router";
import useNotifications from "@/hooks/notifications";
import useProject from "@/hooks/project";
import FeedbackModal from "./FeedbackModal";
import React from "react";
import { ProjectInviteResponse } from "@/repositories/project-repository";
import { InsuranceData, LicenseData } from "@/repositories/business-repository";
import moment from "moment";
import { getSenderName } from "@/pages/invite/[inviteId]";

type NotificationTypeProps = {
    notification: NotificationObject;
};

function ReminderAndExpirationNotification({
    notification,
    type,
}: NotificationTypeProps & {
    type: "reminder" | "expiration";
}) {
    const router = useRouter();

    const { dismissNotification, isDeleting } = useNotifications();
    const { readNotification } = useNotifications();

    const originalObject = notification.originalObject as (LicenseData | InsuranceData) & { expireAt: string };
    const hasExpired = moment(originalObject.validTo).isBefore(moment());

    function generateDescriptionText() {
        const expiration_date = originalObject["validTo"] ?? originalObject["expireAt"];
        return hasExpired
            ? `Expired on ${formatDatetime(expiration_date)}`
            : `Expiring on ${formatDatetime(expiration_date)}`;
    }

    function generateHeaderText() {
        if (type === "expiration") {
            return `${notification.name} Expiration Reminder`;
        }

        return `${notification.name} Reminder`;
    }

    async function redirectURL() {
        const type = notification.category.split("_")[0];
        if (type === "document") {
            router.push(`/storage/edit/${notification.itemId}`);
        }
        if (type === "insurance") {
            router.push(`/business/insurance/edit/${notification.itemId}`);
        }
        if (type === "license") {
            router.push(`/business/license/edit/${notification.itemId}`);
        }

        readNotification(notification);
        return false;
    }

    return (
        <Row className="d-flex justify-content-between w-100 g-0">
            <Col className="d-flex flex-column justify-content-between">
                <h6 className={`text-gray-600 text-start text-truncate d-flex align-items-center`}>
                    <span title={generateHeaderText()} className={`tb-title-body-medium truncate-1 text-wrap`}>
                        {generateHeaderText()}
                    </span>
                    <BadgeTag
                        className="notification ms-2 py-1 text-gray-800"
                        tag={notification.category.split("_")[0]}
                    />
                </h6>

                <p
                    title={generateDescriptionText()}
                    className={`text-muted tb-body-default-regular truncate-1 sub-desc m-0 text-start ${
                        hasExpired && "text-red-600"
                    } `}
                >
                    {generateDescriptionText()}
                </p>

                <div className="pt-4 d-flex gap-3">
                    <Button variant="outline-secondary" className="btn-sm px-3 h-36 d-none tb-body-small-medium">
                        <span>Snooze</span>
                    </Button>

                    <Button
                        variant="outline-secondary"
                        className="btn-sm h-36 px-3 tb-body-small-medium"
                        onClick={() => {
                            redirectURL();
                        }}
                    >
                        <span>Update</span>
                    </Button>

                    <Button
                        variant="outline-secondary"
                        className="btn-sm h-36 px-3 tb-body-small-medium"
                        disabled={isDeleting}
                        onClick={e => {
                            e.preventDefault();
                            dismissNotification(notification.id);
                        }}
                    >
                        {isDeleting && <Spinner animation="border" size="sm" className="ms-2" />}
                        <span>Dismiss</span>
                    </Button>
                </div>
            </Col>
        </Row>
    );
}

function CommunicationNotification({ notification }: NotificationTypeProps) {
    return <div>communitaction</div>;
}

function PendingInviteNotification({ notification }: NotificationTypeProps) {
    const router = useRouter();

    const originalObject = notification.originalObject as ProjectInviteResponse;

    function firstButton(value: string) {
        if (value === "variant") {
            if (notification.category === "pending_invites") {
                return "primary";
            }
            return "outline-primary";
        }

        if (value === "text") {
            if (notification.category === "pending_invites") {
                return "Accept";
            }
            return "Snooze";
        }
        return "";
    }

    function secondButton(value: string) {
        if (value === "variant") {
            return "outline-primary";
        }
        if (value === "text") {
            if (notification.category === "pending_invites") {
                return "Decline";
            }
            return "Update";
        }
        return "";
    }

    function onSnooze(notification: NotificationObject) {}

    function onButtonClick(value: string) {
        if (value === "first") {
            if (notification.category === "pending_invites") {
                acceptOrDeclineInvite({
                    projectId: notification?.itemId,
                    status: "accepted",
                });
                return;
            }

            onSnooze && onSnooze(notification);
            return;
        }
        if (value === "second") {
            if (notification.category === "pending_invites") {
                acceptOrDeclineInvite({
                    projectId: notification?.itemId,
                    status: "rejected",
                });
            }
        }
    }

    const {
        acceptOrDeclineInvite,
        isAcceptingInvite,
        isRejectingInvite,
        inviteAccepted,
        showFeedbackModal,
        setShowFeedbackModal,
        feedbackMessage,
    } = useProject({});

    return (
        <div>
            <div className="d-flex flex-column justify-content-between">
                <div className="d-flex flex-column">
                    <h2 className="tb-title-body-medium">Accept Invitation</h2>

                    <p className="tb-body-default-regular truncate-1 text-muted">
                        {getSenderName(originalObject)} invited you to collaborate on{" "}
                        {originalObject?.projectObject?.name}
                    </p>
                </div>

                {
                    <div className="d-flex gap-3 pt-3">
                        <Button
                            variant={firstButton("variant")}
                            size="sm"
                            className="tb-body-small-medium h-36 px-3"
                            onClick={() => onButtonClick("first")}
                        >
                            <span>{firstButton("text")}</span>
                            {isAcceptingInvite && <Spinner animation="border" size="sm" className="ms-2" />}
                        </Button>

                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="btn-sm tb-body-small-medium h-36 px-3"
                            onClick={() => onButtonClick("second")}
                        >
                            <span>{secondButton("text")}</span>
                            {isRejectingInvite && <Spinner animation="border" size="sm" className="ms-2" />}
                        </Button>
                    </div>
                }
            </div>
            <FeedbackModal
                feedbacktitle={inviteAccepted ? "Accepted" : "Declined"}
                icon={inviteAccepted ? <CheckCircle color="green" size={50} /> : <XCircle color="red" size={50} />}
                showModal={showFeedbackModal}
                setShowModal={setShowFeedbackModal}
                primaryButtonText={inviteAccepted ? "Go to project" : "Ok"}
                secondaryButtonText={inviteAccepted ? "Close" : ""}
                onPrimaryButtonClick={() => {
                    if (inviteAccepted) {
                        router.push(`/projects/${originalObject?.project}`);
                    }
                    if (!inviteAccepted) {
                        router.reload();
                    }
                }}
                onSecondaryButtonClick={() => {
                    router.reload();
                }}
                feedbackMessage={feedbackMessage}
                backdrop="static"
            />
        </div>
    );
}

function ChatMessageNotification({ notification }: NotificationTypeProps) {
    const originalObject = notification.originalObject as ChatOriginalObject;

    const lastChat = originalObject?.room?.lastChat.length
        ? originalObject?.room?.lastChat[0]
        : {
              createdBy: {
                  name: "Unknown",
              },
              content: "Content not available (Backend did not return any data)",
          };

    return (
        <div>
            <h6>{lastChat?.createdBy?.name}</h6>
            <p>{lastChat?.content}</p>
        </div>
    );
}

export type NotificationPayload = {
    notification: NotificationObject;
    isSubmitting?: boolean;
    isDropdown?: boolean;
    onSnooze?: (data: any) => void;
    hideButton?: boolean;
    hideIsReadIndicator?: boolean;
    hideFirstDate?: boolean;
    hideBadge?: boolean;
};

export default function NotificationComponent(props: NotificationPayload) {
    const { notification } = props;

    const NOTIFICATION_TYPE_COMPONENT_MAP = {
        document_expirations: <ReminderAndExpirationNotification notification={notification} type="expiration" />,
        document_reminders: <ReminderAndExpirationNotification notification={notification} type="reminder" />,
        license_reminders: <ReminderAndExpirationNotification notification={notification} type="reminder" />,
        license_expirations: <ReminderAndExpirationNotification notification={notification} type="expiration" />,
        insurance_reminders: <ReminderAndExpirationNotification notification={notification} type="reminder" />,
        insurance_expirations: <ReminderAndExpirationNotification notification={notification} type="expiration" />,
        pending_invites: <PendingInviteNotification notification={notification} />,
        communications: <CommunicationNotification notification={notification} />,
        chat_messages: <ChatMessageNotification notification={notification} />,
    } as Record<string, JSX.Element>;

    return (
        <>
            <div className="d-flex px-0 gap-3 h-fit">
                {/* leading */}
                <div className="d-flex align-items-center flex-shrink-0 object-fit-cover h-fit">
                    <CircleBlue className={`me-3 notification-dot-small ${!notification.isRead ? "bg-primary" : ""}`} />

                    <div className="notification-user flex-shrink-0 object-fit-cover">
                        <NotificationBing size="24" color="#B0B0B0" />
                    </div>
                </div>

                {/* content */}
                <div className="d-flex flex-column align-items-start" style={{ flex: 1 }}>
                    {NOTIFICATION_TYPE_COMPONENT_MAP[notification.category] ?? (
                        <div>
                            <div className="d-flex flex-column align-items-start">
                                <h6 className="mb-2 text-gray-600 tb-body-default-medium text-start text-truncate">
                                    {notification.name}
                                </h6>
                                <p className="text-muted tb-body-small-regular sub-desc truncate-2 m-0 text-start">
                                    This notification type ({notification.category}) is not supported yet on the web.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* trailing */}

                <div>
                    <span
                        title={formatDatetime(notification.createdAt, true)}
                        className={`text-muted truncate-1 tb-body-small-regular `}
                    >
                        {formatDatetime(notification.createdAt, true)}
                    </span>
                </div>
            </div>
        </>
    );
}
