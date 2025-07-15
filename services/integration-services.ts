import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import IntegrationRepository from "@/repositories/integration-repository";

export default class IntegrationServices {
    constructor(private integrationRepository: IntegrationRepository, private store: ToolkitStore) {}

    async startGoogleIntegraions(projectId?: string) {
        return this.integrationRepository.startGoogleIntegraions(projectId);
    }

    async hasActiveIntegration() {
        return this.integrationRepository.hasActiveIntergration();
    }
    async deleteGoogleIntegration() {
        return this.integrationRepository.deleteGoogleIntergration();
    }
}
