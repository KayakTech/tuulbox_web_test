import NotificationsRepository, {
    NotificationObject,
    NotificationQuery,
    ReadNotificationPayload,
} from "@/repositories/notifications-repository";
import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import { NotificationsActions } from "@/store/notification-reducer";

export default class NotificationsService {
    constructor(
        private notificationsRepository: NotificationsRepository,
        private store: ToolkitStore,
        private notificationActions: NotificationsActions,
    ) {}

    async getNotifications(
        params: NotificationQuery = {
            page: 1,
        },
    ) {
        const res = await this.notificationsRepository.getNotifications(params);
        return res;
    }

    async readNotification(payload: ReadNotificationPayload) {
        const res = await this.notificationsRepository.readNotification(payload);
        return res;
    }

    async deleteNotification(notificationId: string) {
        const res = await this.notificationsRepository.deleteNotification(notificationId);
        return res;
    }
}
