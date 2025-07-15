import WebsiteRepository from "@/repositories/website-repository";

export default class WebsiteService {
    constructor(private websiteRepository: WebsiteRepository) {}

    async addToWaitingList(payload: { email: string }) {
        const res = await this.websiteRepository.addToWaitingList(payload);
        return res;
    }
}
