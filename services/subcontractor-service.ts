import { Contact } from "@/repositories/contact-repositories";
import { Project } from "@/repositories/project-repository";
import SubcontractorRepository, { SubcontractorDocument } from "@/repositories/subcontractor-repository";

export default class SubcontractorService {
    constructor(private subcontractorRepository: SubcontractorRepository) {}

    async getProjectSubcontractors(payload: { projectId?: string; pageNumber: number }) {
        const res = await this.subcontractorRepository.getProjectSubcontractors(payload);
        return res;
    }

    async getSubcontractors(payload: { pageNumber: number }) {
        const res = await this.subcontractorRepository.getSubcontractors(payload);
        return res;
    }

    async getSubcontractor(payload: { subcontractorId: string }) {
        const res = await this.subcontractorRepository.getSubcontractor(payload);
        return res;
    }

    async addSubcontractor(payload: { contact?: Partial<Contact>; contactId?: string }) {
        const res = await this.subcontractorRepository.addSubcontractor(payload);
        return res;
    }

    async deleteSubcontractor(subcontractorId: string) {
        const res = await this.subcontractorRepository.deleteSubcontractor(subcontractorId);
        return res;
    }

    async deleteSubcontractorEstimate(payload: { subcontractorId?: string; estimateId?: string }) {
        const res = await this.subcontractorRepository.deleteSubcontractorEstimate(payload);
        return res;
    }

    async addOrRemoveProjectSubcontractor(payload: {
        projectId?: string;
        subcontractorIds?: string[];
        operation: string;
    }) {
        const res = await this.subcontractorRepository.addOrRemoveProjectSubcontractor(payload);
        return res;
    }

    async addSubcontractorDocument(payload: Partial<SubcontractorDocument>, projectId?: string) {
        const res = await this.subcontractorRepository.addSubcontractorDocument(payload, projectId);
        return res;
    }

    async addSubcontractorCertificate(
        payload: { certificateId: string; fileCategory?: string },
        subcontractorId?: string,
    ) {
        const res = await this.subcontractorRepository.addSubcontractorCertificate(payload, subcontractorId);
        return res;
    }

    async updateSubcontractorCertificate(
        payload: { certificateId?: string; fileCategory?: string },
        subcontractorId?: string,
    ) {
        const res = await this.subcontractorRepository.updateSubcontractorCertificate(payload, subcontractorId);
        return res;
    }

    async getSubcontractorEstimates(payload: { projectId?: string; subcontractorId?: string }) {
        const res = await this.subcontractorRepository.getSubcontractorEstimates(payload);
        return res;
    }

    async getSubcontractorEstimate(payload: { certificateId?: string; subcontractorId?: string }) {
        const res = await this.subcontractorRepository.getSubcontractorEstimate(payload);
        return res;
    }

    async getAllProjectSubcontractors(page: number) {
        const res = await this.subcontractorRepository.getAllProjectSubcontractors(page);
        return res.data;
    }
}
