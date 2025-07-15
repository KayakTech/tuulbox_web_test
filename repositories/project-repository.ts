import { AxiosClient } from "@/utils/clients";
import { ApiGetResponse, ApiResponse, ListApiResponse } from "@/types";
import { User } from "./account-repository";
import { Tag } from "./resource-repository";
import { FileAttachment } from "@/components/FileCard";
import { Subcontractor } from "./subcontractor-repository";
import { Contact } from "./contact-repositories";

export type Project = {
    id?: string;
    name: string;
    owner: string;
    addressLine1?: string;
    addressLine2?: string;
    contact: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: User;
    country?: string;
    state?: string;
    zipCode?: string;
    city?: string;
    projectLogo: string;
    subcontractors: [];
    additionalContacts: Contact[];
    documentCategoryAccesses: ProjectDocumentAccessLevel[];
    documents: ProjectDocumentType[];
    status: string;
    sharedWith: string[];
    invitedUsers: string[];
    isShared: boolean;
    isInvited: boolean;
    extension: string;
    newAdditionalContacts: Contact[];
    chatRoomId?: string;
    inFavorite: boolean;
    favoriteId?: string;
};

export type ProjectDocumentAccessLevel = {
    documentCategory: string;
    accessLevel: string;
};

export type ProjectDocumentType = {
    id?: string;
    tags?: Tag[];
    tagNames?: string[];
    fileId?: string;
    file?: FileAttachment | null;
    createdAt?: string;
    updatedAt?: string;
    name: string;
    category: string;
    project: string;
    subcontractorObj: Subcontractor;
    subcontractor: string;
    visibility: string;
};

export enum ProjectDocumentCategories {
    communications = "communications",
    subContractors = "sub_contractors",
    planAndElevation = "plan_and_elevation",
    estimate = "estimate",
    contract = "contract",
    changeOrder = "change_order",
    paymentSchedule = "payment_schedule",
    performanceSchedule = "performance_schedule",
    specification = "specification",
    additionalDocuments = "additional_documents",
    gallery = "gallery",
    permit = "permit",
    projectDetails = "project_details",
}

export enum ProjectDocumentCategoriesPlural {
    communications = "communications",
    subContractors = "sub_contractors",
    planAndElevations = "plan_and_elevations",
    estimates = "estimates",
    contracts = "contracts",
    changeOrders = "change_orders",
    paymentSchedules = "payment_schedules",
    performanceSchedules = "performance_schedules",
    specifications = "specifications",
    additionalDocuments = "additional_documents",
    gallery = "galleries",
    permits = "permits",
}

export type ProjectImage = {
    id: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    project: string;
};

export type ProjectSharePayload = {
    documentCategoryAccesses: ProjectShareAccessLevel[];
    userEmails?: string[];
    inviteeEmails?: string[];
};

type ProjectShareAccessLevel = {
    documentCategory: string;
    accessLevel: string;
};

export type ProjectShareResponse = {
    id: string;
    project: string;
    permissionId: string;
    link: string;
    documentCategoryAccesses: ProjectShareAccessLevel[];
    userEmails: string[];
};

export type ProjectInviteResponse = {
    id: string;
    project: string;
    documentCategoryAccesses: ProjectShareAccessLevel[];
    user: User;
    status: string;
    projectObject: Project;
};

export default class ProjectRepository {
    constructor(private client: AxiosClient) {}

    async addProject(payload: Partial<Project>) {
        const res = await this.client.post<ApiResponse<Project>>(`/project/`, payload);
        return res.data;
    }

    async getProject(id: string | undefined) {
        const res = await this.client.get<ApiResponse<any>>(`/project/${id}/`);
        return res.data;
    }

    async updateProject(payload: Partial<Project>) {
        const res = await this.client.patch<ApiResponse<Project>>(`/project/${payload.id}/`, payload);
        return res.data;
    }

    async getProjects(page: number, status?: string) {
        const res = await this.client.get<ApiResponse<ApiGetResponse<Project[]>>>(
            `/project/?page=${page}&status=${status ?? "active"}`,
        );
        return res.data;
    }

    async deleteProject(id: string | undefined) {
        const res = await this.client.delete<ApiResponse<any>>(`/project/${id}/`);
        return res.data;
    }

    async addProjectDocument(projectId: string, payload: Partial<ProjectDocumentType>) {
        const res = await this.client.post<ApiResponse<Project>>(`/project/${projectId}/documents/`, payload);
        return res.data;
    }

    async addProjectGallery(projectId: string, payload: Partial<ProjectDocumentType>) {
        const res = await this.client.post<ApiResponse<Project>>(`/project/${projectId}/images/`, payload);
        return res.data;
    }

    async updateProjectDocument(projectId: string, payload: Partial<ProjectDocumentType>) {
        const res = await this.client.patch<ApiResponse<ProjectDocumentType>>(
            `/project/${projectId}/documents/${payload.id}/`,
            payload,
        );
        return res.data;
    }

    async getProjectDocuments(projectId: string, params?: Record<string, any>) {
        const res = await this.client.get<ListApiResponse<ProjectDocumentType>>(`/project/${projectId}/documents/`, {
            params,
        });
        return res.data;
    }

    async getProjectDocument(projectId: string, documentId?: string) {
        const res = await this.client.get<ApiResponse<ProjectDocumentType>>(
            `/project/${projectId}/documents/${documentId}/`,
        );
        return res.data;
    }

    async deleteProjectDocument(projectId: string, documentId?: string) {
        const res = await this.client.delete<ApiResponse<any>>(`/project/${projectId}/documents/${documentId}/`);
        return res.data;
    }

    async getProjectGalleries(page: number) {
        const res = await this.client.get<ApiResponse<ProjectImage[]>>(`/projects/all-documents?page=${page}/`);
        return res.data;
    }

    async getAllProjectDocuments(category: string, page: number) {
        const res = await this.client.get<ApiResponse<any>>(`/projects/all-documents/?category=${category}`);
        return res.data;
    }

    async getProjectByPermission(permissionId: string) {
        const res = await this.client.get<ApiResponse<any>>(`/project/project-by-permission/${permissionId}/`);
        return res.data;
    }

    async shareProject(projectId: string, payload: ProjectSharePayload, isSharing: boolean) {
        const res = await this.client.post<ApiResponse<ProjectShareResponse>>(
            `/project/${projectId}/${isSharing ? "share" : "invite"}/`,
            payload,
        );
        return res.data;
    }

    async updateProjectShareOrInvite(shareOrInviteId: string, payload: ProjectSharePayload, isSharing: boolean) {
        const res = await this.client.patch<ApiResponse<ProjectShareResponse>>(
            `/project/${isSharing ? "share" : "invitation"}/${shareOrInviteId}/`,
            payload,
        );
        return res.data;
    }

    async getProjectInvitationsSent(projectId: string) {
        const res = await this.client.get<ApiResponse<any>>(`/project/${projectId}/invitations/sent/`);
        return res.data;
    }

    async getProjectShareSent(projectId: string) {
        const res = await this.client.get<ApiResponse<any>>(`/project/${projectId}/share/sent/`);
        return res.data;
    }

    async revokeShareAccess(id: string) {
        const res = await this.client.delete<ApiResponse<any>>(`/project/share/${id}/`);
        return res.data;
    }

    async revokeInviteAccess(id: string) {
        const res = await this.client.delete<ApiResponse<any>>(`/project/invitation/${id}/`);
        return res.data;
    }

    async getInvtedaProject(inviteId: string) {
        const res = await this.client.get<ApiResponse<ProjectInviteResponse>>(`/project/invitation/${inviteId}/`);
        return res.data;
    }

    async acceptOrDeclineInvite(payload: { projectId?: string; status: string }) {
        const res = await this.client.put<ApiResponse<ProjectInviteResponse>>(`/project/status/${payload.projectId}/`, {
            status: payload.status,
        });
        return res.data;
    }
}
