import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";
import { Subcontractor, SubcontractorCertificate, TaxDocument } from "./subcontractor-repository";
import { InsuranceData, LicenseData } from "./business-repository";

export type Contact = {
    id?: string;
    fullName?: string;
    phoneNumber?: string;
    countryCode?: string;
    email?: string;
    address?: string;
    company?: string;
    uploadedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    profilePicture?: string;
    taxDocumentName?: string;
    // For sub contractor
    isSubcontractor?: boolean;
    certificatesIds?: string[];
    hasTaxDocuments?: boolean;
    taxId?: string;
    taxDocuments?: TaxDocument[];
    certificates?: TaxDocument[];
    //New fields
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    country?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    subcontractorId?: string;
    contactId?: string;
    licenses?: LicenseData[];
    insurances?: InsuranceData[];
    extension?: string;
    status?: string;

    inFavorite?: boolean;
    favoriteId?: string;
};

type ContactsResponse = {
    count: number;
    next: any;
    previous: any;
    results: Contact[];
    status: string;
};

export type SubcontractorResponse = {
    id: string;
    certificates: string[];
    contact: Contact;
    contactId: string;
    taxDocuments: string[];
    licenses: LicenseData[];
    insurances: InsuranceData[];
    createdAt: string;
    updatedAt: string;
    hasTaxDocuments: boolean;
    taxId: string;
};

export default class ContactRepository {
    constructor(private client: AxiosClient) {}

    async getContacts(page: number) {
        const res = await this.client.get<ApiResponse<ContactsResponse>>(`/contacts/?page=${page}`);
        return res.data;
    }

    async getContact(contactId: string) {
        const res = await this.client.get<ApiResponse<Contact>>(`/contacts/${contactId}/`);
        return res.data;
    }

    async addSubcontractor(payload: Partial<Contact>) {
        const res = await this.client.post<ApiResponse<SubcontractorResponse>>(`/contacts/subcontractors/`, payload);
        return res.data;
    }

    async updateSubcontractor(payload: Partial<Subcontractor>) {
        const res = await this.client.patch<ApiResponse<ContactsResponse>>(
            `/contacts/subcontractors/${payload.contact?.subcontractorId}/`,
            payload,
        );
        return res.data;
    }
    async updateSubcontractorInsurance(subcontractorId: string, insuranceId: string, payload: Partial<InsuranceData>) {
        const res = await this.client.patch<ApiResponse<InsuranceData>>(
            `/contacts/${subcontractorId}/insurance/${insuranceId}/`,
            payload,
        );
        return res.data;
    }

    async addContact(payload: Partial<any>) {
        const res = await this.client.post<ApiResponse<any>>(`/contacts/`, payload);
        return res.data;
    }

    async updateContact(payload: Partial<Contact>, contactId: string) {
        const res = await this.client.patch<ApiResponse<any>>(`/contacts/${contactId}/`, payload);
        return res.data;
    }

    async deleteContact(contactId: string) {
        const res = await this.client.delete<ApiResponse<any>>(`/contacts/${contactId}/`);
        return res.data;
    }
}
