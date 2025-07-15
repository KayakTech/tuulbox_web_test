import { AxiosClient } from "@/utils/clients";
import { ApiGetResponse, ApiResponse } from "@/types";

export type Resource = {
    id: string;
    tags: any;
    tagsName: string[];
    createdAt: string;
    updatedAt: string;
    url: string;
    description: string;
    user: string;
    metaImage?: string;
    metaDescription?: string;
    thumbnail: string;
    thumbnailStatus: string;
};

export type Tag = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export default class ResourceRepository {
    constructor(private client: AxiosClient) {}

    async addResource(payload: Partial<Resource>) {
        const res = await this.client.post<ApiResponse<Resource>>(`/resources/`, payload);
        return res.data;
    }

    async updateResource(payload: Partial<Resource>) {
        const res = await this.client.patch<ApiResponse<Resource>>(`/resources/${payload.id}/`, payload);
        return res.data;
    }

    async getResources(page: number) {
        const res = await this.client.get<ApiResponse<ApiGetResponse<Resource[]>>>(`/resources/?page=${page}`);
        return res.data;
    }

    async getResource(id: string) {
        const res = await this.client.get<ApiResponse<any>>(`/resources/${id}/`);
        return res.data;
    }

    async deleteResource(id: string) {
        const res = await this.client.delete<ApiResponse<any>>(`/resources/${id}/`);
        return res.data;
    }

    async getTags(page: number) {
        const res = await this.client.get<ApiResponse<any>>(`/resources/tags/`);
        return res.data;
    }

    async getResourcePreview(url: string) {
        const CORSProxy = "https://thingproxy.freeboard.io/fetch/"; //"https://corsproxy.io/?";
        const res = await fetch(`${CORSProxy}${encodeURIComponent(url)}`, {
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        });
        return res;
    }
}
