import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";

export type FeedbackPayload = {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
};

export default class FeedbackRepository {
    constructor(private client: AxiosClient) {}
    async sendFeedback(payload: Partial<FeedbackPayload>) {
        const res = await this.client.post<ApiResponse<FeedbackPayload>>(`/general/support`, payload);
        return res.data;
    }
}
