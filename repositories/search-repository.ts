import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";
import { Contact } from "./contact-repositories";
import { Resource } from "./resource-repository";
import { StorageFile } from "./storage-repository";
import { Project, ProjectDocumentType } from "./project-repository";
import { InsuranceData, LicenseData, Officer } from "./business-repository";
import { CalendarEvent } from "./calendar-repository";
import { Favorite } from "./favorites-repository";
import { RecentActivity } from "./recent-repository";

export type SearchResult = {
    resources: {
        results: Resource[];
        count: number;
    };
    storages: {
        results: StorageFile[];
        count: number;
    };
    contacts: {
        results: Contact[];
        count: number;
    };
    projects: {
        results: Project[];
        count: number;
    };
    planAndElevations: {
        results: ProjectDocumentType[];
        count: number;
    };
    estimates: {
        results: ProjectDocumentType[];
        count: number;
    };
    contracts: {
        results: ProjectDocumentType[];
        count: number;
    };
    changeOrders: {
        results: ProjectDocumentType[];
        count: number;
    };
    Invoice: {
        results: ProjectDocumentType[];
        count: number;
    };
    performanceSchedules: {
        results: ProjectDocumentType[];
        count: number;
    };
    specifications: {
        results: ProjectDocumentType[];
        count: number;
    };
    permits: {
        results: ProjectDocumentType[];
        count: number;
    };
    additionalDocuments: {
        results: ProjectDocumentType[];
        count: number;
    };
    licenses: {
        results: LicenseData[];
        count: number;
    };
    insurances: {
        results: InsuranceData[];
        count: number;
    };
    calendarEvents: {
        results: CalendarEvent[];
        count: number;
    };
    officers: {
        results: Officer[];
        count: number;
    };
    favorites: {
        results: Favorite[];
        count: number;
    };
    recents: {
        results: RecentActivity[];
        count: number;
    };
    gallery: {
        results: RecentActivity[];
        count: number;
    };
    chat: {
        results: RecentActivity[];
        count: number;
    };
    subcontractors: {
        results: RecentActivity[];
        count: number;
    };
    projectDetails: {
        results: RecentActivity[];
        count: number;
    };
    emails: {
        results: RecentActivity[];
        count: number;
    };
};

export type SearchKey = keyof SearchResult;

export type SearchApiResponse = {
    data: SearchResult;
};

export default class SearchRepository {
    constructor(private client: AxiosClient) {}

    async search(payload: { query: string; categories?: string[] }) {
        const { query, categories } = payload;

        const res = await this.client.get<ApiResponse<SearchResult>>(`/search/`, {
            params: {
                query,
                categories: categories?.length ? categories.join(",") : "",
            },
        });
        return res.data;
    }
}
