import { useState } from "react";
import DI from "@/di-container";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { NotificationObject, NotificationQuery } from "@/repositories/notifications-repository";
import { ApiGetResponse } from "@/types";
import { notificationActions } from "@/store/notification-reducer";
import { useToast } from "@/context/ToastContext";

const useNotifications = () => {
    const { showToast } = useToast();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const { notifications, notificationCount } = useSelector((state: RootState) => state.notifications);
    const [showSnoozeModal, setShowSnoozeModal] = useState<boolean>(false);
    const [toSnooze, setToSnooze] = useState<any>();
    const [notificationResponse, setNotificationResponse] = useState<ApiGetResponse<NotificationObject[]>>({
        count: 0,
        next: "",
        previous: "",
        results: [] as NotificationObject[],
    });
    const [notificatinQuery, setNoficationQuery] = useState<NotificationQuery>({
        page: 1,
    });

    async function getNotifications(query: NotificationQuery) {
        setIsLoading(true);
        setNoficationQuery(query);
        try {
            const res = await DI.notificationsService.getNotifications(query);
            setNotificationResponse(res);
            if (query.page === 1) {
                dispatch(notificationActions.setNotifications(res.results));
                return res;
            }

            dispatch(notificationActions.setNotifications([...notifications, ...res.results]));
            return res;
        } catch (error) {
            return {
                count: 0,
                next: "",
                previous: "",
                results: [] as NotificationObject[],
            };
        } finally {
            setIsLoading(false);
        }
    }

    function filteredNotifications(notifications: NotificationObject[]) {
        const path = location.pathname.split("/")[2];

        if (path === "expirations") {
            return notifications?.filter(notification => notification.category.split("_")[1] === "expirations");
        }
        if (path === "communications") {
            return notifications?.filter(notification => notification.category.split("_")[0] === "communications");
        }
        if (path === "reminders") {
            return notifications?.filter(notification => notification.category.split("_")[1] === "reminders");
        }
        if (path === "licenses") {
            return notifications?.filter(notification => notification.category.split("_")[0] === "license");
        }
        if (path === "insurances") {
            return notifications?.filter(notification => notification.category.split("_")[0] === "insurance");
        }
        return notifications;
    }
    async function readNotification(notification: NotificationObject) {
        const payload = {
            category: notification.category,
            itemId: notification.itemId,
            isRead: true,
            id: notification.id,
        };
        try {
            const res = await DI.notificationsService.readNotification(payload);
            return res;
        } catch (error) {}
    }

    async function markAllAsRead() {
        try {
            const responses = await Promise.all(notifications?.slice(0, 4).map(readNotification));
            getNotifications({
                page: 1,
            });
        } catch (err) {}
    }

    function triggerSnoozeModal(data: any) {
        setToSnooze(data);
        setShowSnoozeModal(true);
    }

    async function dismissNotification(id: string) {
        try {
            setIsDeleting(true);
            await DI.notificationsService.deleteNotification(id);
            await getNotifications({
                ...notificatinQuery,
                page: 1,
            });
            showToast({
                message: "Notification dismissed",
                heading: "Success",
            });
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    }

    return {
        getNotifications,
        isLoading,
        isDeleting,
        setIsLoading,
        notifications,
        filteredNotifications,
        readNotification,
        markAllAsRead,
        notificationCount,
        showSnoozeModal,
        setShowSnoozeModal,
        triggerSnoozeModal,
        toSnooze,
        setToSnooze,
        setNoficationQuery,
        notificatinQuery,
        notificationResponse,
        dismissNotification,
    };
};

export default useNotifications;
