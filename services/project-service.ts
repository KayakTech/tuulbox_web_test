import ProjectRepository, {
    Project,
    ProjectDocumentType,
    ProjectSharePayload,
} from "@/repositories/project-repository";

export default class ProjectService {
    constructor(private projectRepository: ProjectRepository) {}

    async addProject(payload: Partial<Project>) {
        const res = await this.projectRepository.addProject(payload);
        return res;
    }

    async getProject(id: string | undefined) {
        const res = await this.projectRepository.getProject(id);
        return res.data;
    }

    async updateProject(payload: Partial<Project>) {
        const res = await this.projectRepository.updateProject(payload);
        return res;
    }

    async getProjects(page: number, status?: string) {
        const res = await this.projectRepository.getProjects(page, status);
        return res.data;
    }

    async deleteProject(id: string | undefined) {
        const res = await this.projectRepository.deleteProject(id);
        return res;
    }

    async addProjectDocument(projectId: string, payload: Partial<ProjectDocumentType>) {
        const res = await this.projectRepository.addProjectDocument(projectId, payload);
        return res;
    }

    async addProjectGallery(projectId: string, payload: Partial<ProjectDocumentType>) {
        const res = await this.projectRepository.addProjectGallery(projectId, payload);
        return res;
    }

    async updateProjectDocument(projectId: string, payload: Partial<ProjectDocumentType>) {
        const res = await this.projectRepository.updateProjectDocument(projectId, payload);
        return res;
    }
    async getProjectDocuments(projectId: string, params: Record<string, unknown> = {}) {
        const res = await this.projectRepository.getProjectDocuments(projectId, params);
        return res.data;
    }
    async getProjectDocument(projectId: string, documentId?: string) {
        const res = await this.projectRepository.getProjectDocument(projectId, documentId);
        return res.data;
    }
    async getAllProjectDocuments(category: string, page: number) {
        const res = await this.projectRepository.getAllProjectDocuments(category, page);
        return res.data;
    }

    async deleteProjectDocument(projectId: string, documentId?: string) {
        const res = await this.projectRepository.deleteProjectDocument(projectId, documentId);
        return res;
    }

    async getProjectGalleries(page: number) {
        return await this.projectRepository.getProjectGalleries(page);
    }

    async getProjectByPermission(permissionId: string) {
        const res = await this.projectRepository.getProjectByPermission(permissionId);
        return res.data;
    }

    async shareProject(projectId: string, payload: ProjectSharePayload, isSharing: boolean) {
        const res = await this.projectRepository.shareProject(projectId, payload, isSharing);
        return res.data;
    }

    async updateProjectShareOrInvite(shareOrInviteId: string, payload: ProjectSharePayload, isSharing: boolean) {
        const res = await this.projectRepository.updateProjectShareOrInvite(shareOrInviteId, payload, isSharing);
        return res.data;
    }

    async getProjectInvitationsSent(projectId: string) {
        const res = await this.projectRepository.getProjectInvitationsSent(projectId);
        return res.data;
    }

    async getProjectShareSent(projectId: string) {
        const res = await this.projectRepository.getProjectShareSent(projectId);
        return res.data;
    }

    async revokeShareAccess(id: string) {
        const res = await this.projectRepository.revokeShareAccess(id);
        return res.data;
    }

    async revokeInviteAccess(id: string) {
        const res = await this.projectRepository.revokeInviteAccess(id);
        return res.data;
    }

    async getInvitedProject(inviteId: string) {
        const res = await this.projectRepository.getInvtedaProject(inviteId);
        return res.data;
    }

    async acceptOrDeclineInvite(payload: { projectId?: string; status: string }) {
        const res = await this.projectRepository.acceptOrDeclineInvite(payload);
        return res.data;
    }
}
