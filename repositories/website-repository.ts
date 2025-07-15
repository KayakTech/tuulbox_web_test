import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";

export default class WebsiteRepository {
    constructor(private client: AxiosClient) {}
    async addToWaitingList(payload: { email: string }) {
        const res = await this.client.post<ApiResponse<any>>(`/general/waiting-list`, payload);
        return res.data;
    }
}
