import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";
import { Contact } from "./contact-repositories";
import { Project } from "./project-repository";
import { StorageFile, Tag } from "./storage-repository";
import { User } from "./account-repository";
import { Value } from "react-date-picker/dist/cjs/shared/types";
import { InsuranceData, LicenseData } from "./business-repository";

export type SubcontractorsResponse = {
    count: 0;
    next: null;
    previous: null;
    results: [];
};

export type Subcontractor = {
    contact: Contact;
    contactId: string;
    certificatesIds: string[];
    hasTaxDocuments: boolean;
    taxId: string;
    certificates: TaxDocument[];
    id: string;
    taxDocuments: TaxDocument[];
    updatedAt?: string;
    createdAt?: string;
    fileName?: string;
    insurances: InsuranceData[];
    licenses: LicenseData[];
};

export type TaxDocument = {
    certificate: StorageFile;
    contractor: string;
    fileCategory: string;
    id: string;
    updatedAt: string;
    createdAt: string;
};

export type SubcontractorDocument = {
    tagName: string[];
    fileId: string;
    subcontractorObj: Subcontractor;
    name: string;
    category: string;
    subcontractor: string;
};

export enum SubcontractorDocumenCategory {
    planAndElevation = "plan_and_elevation",
    estimate = "estimate",
    contact = "contract",
    changeOrder = "change_order",
    paymentSchedule = "payment_schedule",
    performanceSchedule = "performance_schedule",
    specification = "specification",
    additionalDocuments = "additional_documents",
    gallery = "gallery",
}

export type SubcontractorCertificate = {
    id: string;
    tags: Tag[];
    uploadedBy: User;
    file: string;
    createdAt: Value | string;
    updatedAt: Value | string;
    originalFileName?: string;
    fileName: string;
    fileType: string;
    uploadFinishedAt?: string | null;
    expireAt: Value | string;
    reminder: Value | string;
    fileCategory?: string;
};

export type SubcontractorEstimate = {
    id: string;
    tags: [];
    file: any;
    subcontractorObj: Subcontractor;
    createdAt: string;
    updatedAt: string;
    name: string;
    category: string;
    project: string;
    subcontractor: string;
};

export type SubcontractorEstimateResponse = {
    count: number;
    next: number;
    previous: number;
    results: SubcontractorEstimate[];
};

export type ProjectSubcontractor = {
    projectId: string;
    projectName: string;
    subcontractors: Subcontractor[];
};

export default class SubcontractorRepository {
    constructor(private client: AxiosClient) {}

    async getProjectSubcontractors(payload: { projectId?: string; pageNumber: number }) {
        const res = await this.client.get<ApiResponse<any>>(`/project/${payload.projectId}/subcontractors/`);
        return res.data;
    }

    async getSubcontractors(payload: { pageNumber: number }) {
        const res = await this.client.get<ApiResponse<SubcontractorsResponse>>(`/contacts/subcontractors/`, {
            params: {
                page: payload.pageNumber,
            },
        });
        return res.data;
    }

    async getSubcontractor(payload: { subcontractorId: string }) {
        const res = await this.client.get<ApiResponse<Subcontractor>>(
            `/contacts/subcontractors/${payload.subcontractorId}/`,
        );
        return res.data;
    }

    async addSubcontractor(payload: { contact?: Partial<Contact>; contactId?: string }) {
        const res = await this.client.post<ApiResponse<Subcontractor>>(`/contacts/subcontractors/`, payload);
        return res.data;
    }

    async addOrRemoveProjectSubcontractor(payload: {
        projectId?: string;
        subcontractorIds?: string[];
        operation: string;
    }) {
        //operation:enum[add,remove]
        const res = await this.client.patch<ApiResponse<Subcontractor>>(
            `/project/${payload.projectId}/subcontractors/`,
            {
                subcontractorIds: payload.subcontractorIds,
                operation: payload.operation,
            },
        );
        return res.data;
    }

    async deleteSubcontractor(subcontractortId?: string) {
        const res = await this.client.delete<ApiResponse<Subcontractor>>(
            `/contacts/subcontractors/${subcontractortId}/`,
        );
        return res.data;
    }

    async deleteSubcontractorFromProject(projectId?: string) {
        const res = await this.client.delete<ApiResponse<Subcontractor>>(`/project/${projectId}/subcontractors/`);
        return res.data;
    }

    async deleteSubcontractorEstimate(payload: { subcontractorId?: string; estimateId?: string }) {
        const res = await this.client.delete<ApiResponse<Subcontractor>>(
            `/contacts/subcontractors/${payload.subcontractorId}/certificates/${payload.estimateId}/`,
        );
        return res.data;
    }

    async addSubcontractorDocument(payload: Partial<SubcontractorDocument>, projectId?: string) {
        const res = await this.client.post<ApiResponse<Subcontractor>>(`/project/${projectId}/documents/`, payload);
        return res.data;
    }

    async addSubcontractorCertificate(
        payload: { certificateId: string; fileCategory?: string },
        subcontractorId?: string,
    ) {
        const res = await this.client.post<ApiResponse<Subcontractor>>(
            `/contacts/subcontractors/${subcontractorId}/certificates/`,
            payload,
        );
        return res.data;
    }

    async updateSubcontractorCertificate(
        payload: { certificateId?: string; fileCategory?: string },
        subcontractorId?: string,
    ) {
        const res = await this.client.patch<ApiResponse<Subcontractor>>(
            `/contacts/subcontractors/${subcontractorId}/certificates/${payload.certificateId}/`,
            payload,
        );
        return res.data;
    }

    async getSubcontractorEstimates(payload: { projectId?: string; subcontractorId?: string }) {
        const res = await this.client.get<ApiResponse<SubcontractorEstimateResponse>>(
            `/project/${payload.projectId}/documents/`,
        );
        return res.data;
    }

    async getSubcontractorEstimate(payload: { certificateId?: string; subcontractorId?: string }) {
        const res = await this.client.get<ApiResponse<any>>(
            `/contacts/subcontractors/${payload.subcontractorId}/certificates/${payload.certificateId}/`,
        );
        return res.data;
    }

    async getAllProjectSubcontractors(page: number) {
        const res = await this.client.get<ApiResponse<ProjectSubcontractor[]>>(
            `/projects/subcontractors/?page=${page}`,
        );
        return res.data;
    }
}
