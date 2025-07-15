import CommunicationsRepository, { Email } from "@/repositories/communications-repository";
export default class CommunicationsService {
    constructor(private communicationRepository: CommunicationsRepository) {}

    async getEmails(payload: { projectId?: string; pageNumber: number }) {
        const res = await this.communicationRepository.getEmails(payload);
        return res;
    }
    async getEmail(payload: { emailId: string }) {
        const res = await this.communicationRepository.getEmail(payload);
        return res;
    }
    async composeEmail(payload: Partial<Email>) {
        const res = await this.communicationRepository.composeEmail(payload);
        return res;
    }
    async archiveEmail(payload: { emailId: string }) {
        const res = await this.communicationRepository.archiveEmail(payload);
        return res;
    }
    async getTextMessages(payload: { projectId: string; pageNumber: number }) {
        const res = await this.communicationRepository.getTextMessages(payload);
        return res;
    }
    async getTextMessageThread(textMessageId: string, projectId: string) {
        const res = await this.communicationRepository.getTextMessageThread(textMessageId, projectId);
        return res;
    }
    async archiveTextMessage(textMessageId: string, projectId: string) {
        const res = await this.communicationRepository.archiveTextMessage(textMessageId, projectId);
        return res;
    }
}
