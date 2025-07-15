import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";

export type User = {
    id: number | string;
    companyId: string;
    lastLogin: string;
    firstName: string;
    lastName: string;
    isStaff: boolean;
    isActive: boolean;
    dateJoined: string;
    email: string;
    mobile: string;
    isRegistrationCompleted: boolean;
    gender: string;
    address: string;
    profilePicture: string;
    extension: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    source: string;
};

export type DeleteAcccountPayload = {
    reason: string;
    notes: string;
};

export type SignupPayload = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
};

export default class AccountRepository {
    constructor(private client: AxiosClient) {}

    async getUser() {
        const res = await this.client.get<ApiResponse<User>>(`/accounts/user/`);
        return res.data;
    }

    async deleteAccount(payload: DeleteAcccountPayload) {
        const res = await this.client.delete<ApiResponse<User>>(`/accounts/user/`, payload);
        return res.data;
    }

    async updateUser(payload: Partial<User>) {
        // @ts-ignore
        const res = await this.client.patch<ApiResponse<User>>(`/accounts/user/`, payload);
        return res.data;
    }

    async signup(payload: SignupPayload) {
        const res = await this.client.post<ApiResponse<User>>(`/auth/signup/`, payload);
        return res.data;
    }
}
