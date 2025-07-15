import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import StorageRepository, { StartFileUploadPayload, uploadFileToS3Payload } from "@/repositories/storage-repository";
import ResourceRepository from "@/repositories/resource-repository";

export default class StorageService {
    constructor(
        private storageRepository: StorageRepository,
        private resourceRepository: ResourceRepository,
        private store: ToolkitStore,
    ) {}

    async uploadFile(payload: StartFileUploadPayload) {
        try {
            const startRes = await this.storageRepository.startFileUpload(payload);
            const uploadToS3Res = await this.storageRepository.uploadFileToS3({
                file: payload.file,
                data: startRes.data.presignedData,
            });
            const finishRes = await this.storageRepository.finishFileUpload({ fileId: startRes.data.file.id });
            return finishRes.data;
        } catch (error) {
            throw error;
        }
    }

    getFiles(page: number) {
        return this.storageRepository.getFiles(page);
    }

    getFile(fileId: string) {
        return this.storageRepository.getFile(fileId);
    }

    updateFile(payload: Partial<StartFileUploadPayload>) {
        return this.storageRepository.updateFile(payload);
    }

    updateFileMetadata(payload: Partial<StartFileUploadPayload>) {
        return this.storageRepository.updateFileData(payload);
    }

    deleteFile(fileId: string | undefined) {
        return this.storageRepository.deleteFile(fileId);
    }

    getExpiredFiles(page: number) {
        return this.storageRepository.getExpiredFiles(page);
    }
}
