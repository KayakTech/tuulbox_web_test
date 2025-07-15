import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";
import { HOST } from "@/helpers/constants";

export type IntergrationResponseData = {
    redirectUrl: string;
} | null;

export type HasIntergrationResponseData = {
    createdAt: string;
    email: string;
    hasIntegration: true;
    id: string;
    updatedAt: string;
} | null;

export type HasIntergrationResponse = ApiResponse<HasIntergrationResponseData>;

export type IntergrationResponse = ApiResponse<IntergrationResponseData>;

export default class IntegrationRepository {
    constructor(private client: AxiosClient) {}

    async startGoogleIntegraions(projectId?: string) {
        let redirectUrl = "";
        if (projectId) {
            redirectUrl = `?redirect_url=${HOST}/projects/${projectId}`;
        }
        const res = await this.client.get<IntergrationResponse>(`integrations/start-google-integration/${redirectUrl}`);
        return res.data;
    }

    async hasActiveIntergration() {
        const res = await this.client.get<HasIntergrationResponse>(`integrations/`);
        return res.data;
    }

    async deleteGoogleIntergration() {
        const res = await this.client.delete<HasIntergrationResponse>(`integrations/`);
        return res.data;
    }
}
