export interface ApiResponse<T> {
    data: T;
    status: string;
}

export type ApiGetResponse<T> = {
    count: number;
    next: string;
    previous: string;
    results: T;
};

export type ListApiResponse<T> = {
    status: string;
    data: ApiGetResponse<T[]>;
};

export type OverviewCounts = {
    projects: OverviewCount;
    expirations: OverviewCount;
    reminders: OverviewCount;
};

export type OverviewCount = {
    count: number;
    title: string;
    icon: any;
};
