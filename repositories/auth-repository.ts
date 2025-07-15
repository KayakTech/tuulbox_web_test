import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";

type AuthToken = {
    access: string;
    refresh: string;
};
type CountryCodeResponse = {
    ip: string;
    country: string;
    country_code: string;
    country_calling_code: string;
};
export default class AuthRepository {
    constructor(private client: AxiosClient) {}

    async getAuthToken(firebaseJwt: string) {
        const res = await this.client.post<ApiResponse<AuthToken>>(
            `/auth/gimme-jwt/`,
            {},
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Firebase ${firebaseJwt}`,
                },
            },
        );
        return res.data;
    }

    async getCountryCode() {
        const res = await this.client.get<CountryCodeResponse>(`https://ipapi.co/json/`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: null,
            },
        });
        return res.data;
    }
}
