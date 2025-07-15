import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";
import { SettingsPreference } from "@/services/settings-service";

export type Settings = {
    id: string;
    createdAt: string;
    updatedAt: string;
    company: string;
    favorite: any;
    module: any;
    timezone: string;
    user: string;
    unreadNotificationsCount: number;
    autoLogoutTimeout: number;
};

export default class SettingsRepository {
    constructor(private client: AxiosClient) {}

    async getPreferences() {
        const res = await this.client.get<ApiResponse<any>>(`/notification/notification-preference/`);
        return res.data;
    }

    async getGeneralSettings() {
        const res = await this.client.get<ApiResponse<Settings>>(`/general/settings/`);
        return res.data;
    }

    async updateGeneralSettings(payload: Partial<Settings>) {
        const res = await this.client.patch<ApiResponse<Settings>>(`/general/settings/`, payload);
        return res.data;
    }

    async updatePreferences(payload: Partial<SettingsPreference>) {
        const res = await this.client.patch<ApiResponse<any>>(`/notification/notification-preference/`, payload);
        return res.data;
    }
}
