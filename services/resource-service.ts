import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import ResourceRepository, { Resource } from "@/repositories/resource-repository";
import { ResourceActions } from "@/store/resource-reducer";
import * as cheerio from "cheerio";

export default class ResourceService {
    constructor(
        private resourceRepository: ResourceRepository,
        private store: ToolkitStore,
        private resourceActions: ResourceActions,
    ) {}

    async addResource(payload: Partial<Resource>) {
        const res = await this.resourceRepository.addResource(payload);
        return res;
    }

    async updateResource(payload: Partial<Resource>) {
        const res = await this.resourceRepository.updateResource(payload);
        return res;
    }

    async getResources(page: number) {
        const res = await this.resourceRepository.getResources(page);
        return res.data;
    }

    async getResource(id: string) {
        const res = await this.resourceRepository.getResource(id);
        return res.data;
    }

    async deleteResource(id: string) {
        const res = await this.resourceRepository.deleteResource(id);
        return res;
    }

    async getTags(page: number) {
        const res = await this.resourceRepository.getTags(page);
        return res.data;
    }

    async getResourcePreview(url: string) {
        if (url) {
            const res = await this.resourceRepository.getResourcePreview(url);
            const html = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const metaImage = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
            const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
            return {
                metaImage,
                metaDescription,
            };
        }
        return null;
    }
}
