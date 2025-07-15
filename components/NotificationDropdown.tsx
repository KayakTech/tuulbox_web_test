import { Dropdown } from "react-bootstrap";
import Link from "next/link";
import NotificationBing from "./icons/NotificationBing";
import NotificationCountBadge from "./NotificationCountBadge";
import useNotifications from "@/hooks/notifications";
import NotificationComponent from "./NotificationComponent";
import NotificationEmptyState from "./NotificationEmptyState";
import SnoozeModal from "./SnoozeModal";
import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export default function NotificationDropdown() {
    const {
        markAllAsRead,
        notifications,
        showSnoozeModal,
        setShowSnoozeModal,
        triggerSnoozeModal,
        toSnooze,
        getNotifications,
    } = useNotifications();

    const { settings } = useSelector((state: RootState) => state.settings);

    useEffect(() => {
        getNotifications({
            page: 1,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Dropdown>
                <Dropdown.Toggle size="sm" variant="default" className="position-relative" id="dropdown-basic">
                    <NotificationBing />
                    {notifications.length
                        ? notifications?.filter(note => note.isRead === false).length > 0 && (
                              <NotificationCountBadge
                                  customClass="position-absolute top-0 right-2 bg-accent-blue-900 text-white"
                                  count={settings?.unreadNotificationsCount || 0}
                              />
                          )
                        : null}
                </Dropdown.Toggle>
                <Dropdown.Menu
                    className="px-0 py-0 dropdown-menu-notification overflowY-scroll overflowX-hidden"
                    align={`end`}
                >
                    <Dropdown.Header className="p-20 notification-space d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <h4 className="m-0 text-gray-900 tb-title-subsection-medium">Notifications</h4>
                            {notifications?.length && (
                                <NotificationCountBadge
                                    customClass="bg-gray-100 tb-body-extra-small-medium"
                                    count={settings?.unreadNotificationsCount || 0}
                                />
                            )}
                        </div>
                        <small
                            className="mark-as-read tb-body-small-medium pointer text-blue-900"
                            onClick={() => markAllAsRead()}
                        >
                            Mark all as read
                        </small>
                    </Dropdown.Header>

                    {notifications?.length ? (
                        <>
                            <div className=" overflow-scroll notification-scroll-height">
                                <ul className="list-unstyled">
                                    {notifications?.slice(0, 4)?.map((value, index) => (
                                        <li
                                            key={index}
                                            className={`py-20 px-20 notification-space ${
                                                index != 0 && "border-top"
                                            } border-gray-50 pointer hover-bg-blue-10`}
                                        >
                                            <NotificationComponent
                                                notification={value}
                                                isDropdown={true}
                                                onSnooze={triggerSnoozeModal}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="border-top p-20 border-gray-50">
                                <Link
                                    className="view-all-notificationm text-decoration-none text-blue-900 tb-body-default-medium m-0"
                                    href="/notifications"
                                >
                                    See all Notifications
                                </Link>
                            </div>
                        </>
                    ) : (
                        <NotificationEmptyState />
                    )}
                </Dropdown.Menu>
            </Dropdown>

            <SnoozeModal showModal={showSnoozeModal} setShowModal={setShowSnoozeModal} toSnooze={toSnooze} />
        </>
    );
}
