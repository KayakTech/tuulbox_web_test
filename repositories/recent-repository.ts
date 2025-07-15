import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";
import { Contact } from "./contact-repositories";

export type RecentActivity = {
    id: string;
    originalObject: any;
    createdAt: string;
    updatedAt: string;
    itemId: string;
    category: string;
    createdBy: string;
};

export type RecentActivityResponse = {
    results: RecentActivity[];
};

export type RecentActivityDestructuredObject = {
    today: RecentActivityDay;
    yesterday: RecentActivityDay;
    thisWeek: RecentActivityDay;
    lastWeek: RecentActivityDay;
    thisMonth: RecentActivityDay;
};

export type RecentActivityDay = {
    contacts: RecentActivityResult;
    resources: RecentActivityResult;
    licenses: RecentActivityResult;
    insurances: RecentActivityResult;
    projects: RecentActivityResult;
    storages: RecentActivityResult;
    projectDocuments: RecentActivityResult;
    day: string;
    fieldName: string;
    label: string;
};

export type RecentActivityResult = { label: string; results: RecentActivity[] };

export default class RecentRepository {
    constructor(private client: AxiosClient) {}

    async getRecentActivities(page: number) {
        const res = await this.client.get<ApiResponse<RecentActivityResponse>>(`/recent-activity/`);
        return res.data;
    }

    async delteRecentActivity(recentActivityId: string | number) {
        const res = await this.client.delete<ApiResponse<any>>(`/recent-activity/${recentActivityId}/delete/`);
        return res.data;
    }
}
