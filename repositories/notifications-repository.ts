import { AxiosClient } from "@/utils/clients";
import { ApiGetResponse, ApiResponse, ListApiResponse } from "@/types";
import { SubcontractorCertificate } from "./subcontractor-repository";
import { InsuranceData, LicenseData } from "./business-repository";
import { ChatRoom, Email } from "./communications-repository";
import { Project, ProjectInviteResponse } from "./project-repository";

export type Notifications = {
    emails: Email[];
    license: { reminders: LicenseData[]; expirations: LicenseData[] };
    insurance: { reminders: InsuranceData[]; expirations: InsuranceData[] };
    document: { reminders: any[]; expirations: any[] };
};

export type NotificationType =
    | Email[]
    | LicenseData[]
    | InsuranceData[]
    | SubcontractorCertificate[]
    | SubcontractorCertificate[];

export type ChatOriginalObject = {
    room: ChatRoom;
};

export type NotificationObject = {
    id: string;
    name: string;
    expirationDate: string;
    createdAt: string;
    updatedAt: string;
    category: string;
    itemId: string;
    isRead: boolean;
    user: string;
    originalObject:
        | Email
        | LicenseData
        | InsuranceData
        | SubcontractorCertificate
        | ProjectInviteResponse
        | ChatOriginalObject;
};

export type ReadNotificationPayload = {
    category: string;
    itemId: string;
    isRead: boolean;
    id: string;
};

export type SnoozeOption = {
    name: string;
    date?: string | null;
};

export type NotificationQuery = {
    filter_by?: string;
    page?: number;
};

export default class NotificationsRepository {
    constructor(private client: AxiosClient) {}

    async getNotifications(params?: NotificationQuery) {
        const res = await this.client.get<ListApiResponse<NotificationObject>>(`/notification/notifications/`, {
            params,
        });
        return res.data.data;
    }

    // delete
    async deleteNotification(notificationId: string) {
        const res = await this.client.delete<ApiResponse<Notifications>>(
            `/notification/notifications/${notificationId}/`,
        );
        return res.data;
    }

    async readNotification(payload: ReadNotificationPayload) {
        const res = await this.client.patch<ApiResponse<Notifications>>(
            `/notification/notifications/${payload.id}/`,
            payload,
        );
        return res.data;
    }
}
