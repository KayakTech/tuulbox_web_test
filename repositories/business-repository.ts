import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";
import { AxiosInstance } from "axios";
import { User } from "./account-repository";
import { StorageFile } from "./storage-repository";

export type Company = {
    id?: string;
    logo?: string;
    name: string;
    address: string;
    taxId: string;
    website: string;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
    user?: Partial<User>;
    businessIds: NewBusinessId[];
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    email: string;
};

export type Officer = {
    id?: string;
    title: string;
    firstname: string;
    lastname: string;
    mobileNumber: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    company?: Company;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    jobPosition?: string;
    extension?: string;
};

export type LicenseData = {
    id?: string;
    licenseType: string;
    customLicenseType: string;
    name: string;
    firstName?: string;
    lastName?: string;
    licenseNumber: string;
    validFrom: any;
    validTo: any;
    reminder: any;
    company: Company;
    file: StorageFile | null;
    createdAt: string;
    updatedAt: string;
    createdBy: null;
    attachment?: string | null;
    status?: string;
};

export type CreateInsurancePayload = {
    id?: string;
    insuranceType: string;
    carrier: string;
    agent: string;
    contact: string;
    email: string;
    validFrom: any;
    validTo: any;
    reminder: any;
    policy: string;
    file: Partial<StorageFile> | null;
    broker: string;
    customInsuranceType: string;
    policyNumber: string;
    extension: string;
    allAttachments?: StorageFile[];
};

export type InsuranceData = {
    id?: string;
    insuranceType: string;
    carrier: string;
    agent: string;
    contact: string;
    email: string;
    validFrom: any;
    validTo: any;
    reminder: any;
    policy?: string;
    file?: Partial<StorageFile> | null;
    broker?: string;
    customInsuranceType?: string;
    company?: Company;
    createdAt: string;
    updatedAt: string;
    policyNumber: string;
    createdBy: string;
    extension: string;
    allAttachments: StorageFile[];
    additionalAttachments: any[];
    status: string;
};

export type CompanyNewId = {
    idNameLabel: string;
    idNamePlaceholder: string;
    idNameValue: string;
    idNumberLabel: string;
    idNumberPlaceholder: string;
    idNumberValue: string;
};

export type NewBusinessId = {
    typeId: string;
    numberId: string;
    company: string;
    createdAt: string;
    id: string;
    updatedAt: string;
};

export default class BusinessRepository {
    constructor(private client: AxiosClient, private $axios: AxiosInstance) {}

    async updateCompanyDetails(payload: Partial<Company>) {
        const res = await this.client.patch<ApiResponse<any>>(`/company/${payload.id}/`, payload);
        return res.data;
    }

    async getCompanyDetails(companyId: string) {
        const res = await this.client.get<ApiResponse<any>>(`/company/${companyId}/`);
        return res.data;
    }

    async addOfficer(companyId: string | undefined, payload: Officer) {
        const res = await this.client.post<ApiResponse<any>>(`/company/${companyId}/officers/`, payload);
        return res.data;
    }

    async getOfficer(companyId: string | undefined, officerId: string) {
        const res = await this.client.get<ApiResponse<any>>(`/company/${companyId}/officers/${officerId}/`);
        return res.data;
    }

    async getOfficers(companyId: string | undefined, page: number) {
        const res = await this.client.get<ApiResponse<any>>(`/company/${companyId}/officers/?page=${page}`);
        return res.data;
    }

    async updateOfficer(companyId: string | undefined, officerId: string, payload: Partial<Officer>) {
        const res = await this.client.patch<ApiResponse<any>>(`/company/${companyId}/officers/${officerId}/`, payload);
        return res.data;
    }

    async deleteOfficer(companyId: string | undefined, officerId: string | undefined) {
        const res = await this.client.delete<ApiResponse<any>>(`/company/${companyId}/officers/${officerId}/`);
        return res.data;
    }

    async addLicense(companyId: string | undefined, payload: LicenseData) {
        const res = await this.client.post<ApiResponse<any>>(`/company/${companyId}/licenses/`, payload);
        return res.data;
    }
    async getLicense(companyId: string | undefined, licenseId: string) {
        const res = await this.client.get<ApiResponse<any>>(`/company/${companyId}/licenses/${licenseId}/`);
        return res.data;
    }
    async updateLicense(companyId: string | undefined, licenseId: string | undefined, payload: Partial<LicenseData>) {
        const res = await this.client.patch<ApiResponse<any>>(`/company/${companyId}/licenses/${licenseId}/`, payload);
        return res.data;
    }
    async getLicenses(companyId: string | undefined, page: number, status?: string) {
        const res = await this.client.get<ApiResponse<any>>(
            `/company/${companyId}/licenses/?page=${page}&status=${status ?? "active"}`,
        );
        return res.data;
    }
    async deleteLicense(companyId: string | undefined, licenseId: string | undefined) {
        const res = await this.client.delete<ApiResponse<any>>(`/company/${companyId}/licenses/${licenseId}/`);
        return res.data;
    }
    async addInsurance(companyId: string | undefined, payload: Partial<InsuranceData>) {
        const res = await this.client.post<ApiResponse<any>>(`/company/${companyId}/insurance/`, payload);
        return res.data;
    }
    async getInsurance(companyId: string | undefined, insuranceId: string) {
        const res = await this.client.get<ApiResponse<any>>(`/company/${companyId}/insurance/${insuranceId}/`);
        return res.data;
    }
    async getInsurances(companyId: string | undefined, page: number, status?: string) {
        const res = await this.client.get<ApiResponse<any>>(
            `/company/${companyId}/insurance/?page=${page}&status=${status || "active"}`,
        );
        return res.data;
    }
    async updateInsurance(
        companyId: string | undefined,
        insuranceId: string | undefined,
        payload: Partial<InsuranceData>,
    ) {
        const res = await this.client.patch<ApiResponse<any>>(
            `/company/${companyId}/insurance/${insuranceId}/`,
            payload,
        );
        return res.data;
    }
    async deleteInsurance(companyId: string | undefined, insuranceId: string | undefined) {
        const res = await this.client.delete<ApiResponse<any>>(`/company/${companyId}/insurance/${insuranceId}/`);
        return res.data;
    }
}
