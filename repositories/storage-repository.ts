import { AxiosClient } from "@/utils/clients";
import { ApiGetResponse, ApiResponse } from "@/types";
import { AxiosInstance } from "axios";
import { User } from "./account-repository";

export type StorageFile = {
    id: string;
    tags: Tag[];
    createdAt: string;
    updatedAt: string;
    file: string;
    originalFileName: string;
    fileName: string;
    fileType: string;
    uploadFinishedAt: string | null;
    expireAt: string;
    reminder: string;
    uploadedBy: User;
    thumbnail: string;
    status: string;
    favoriteId?: string;
    inFavorite: boolean;
    downloadUrl: string;
    fileSize: number;
    progress: number;
    name?: string;
    size?: number;
    error?: string;
};

export type StartFileUploadPayload = {
    id?: string;
    tagNames?: string[];
    fileName: string;
    fileType: string;
    reminder?: string;
    expireAt?: any;
    validityStartDate?: string;
    file: File;
    originalFileName?: string;
    status?: string;
    attachmentFilename?: string;
};

export type FinishFileUploadReponseData = {
    fileId: string;
};

export type StartFileUploadReponseData = {
    file: StorageFile;
    presignedData: Record<string, any> & {
        url: string;
    };
};

export type FinishedFileUploadReponseData = {
    file: StorageFile;
    fileId: string;
};

export type uploadFileToS3Payload = { data: Record<string, any>; file: File };

export type Tag = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export default class StorageRepository {
    constructor(private client: AxiosClient, private $axios: AxiosInstance) {}

    async startFileUpload(payload: StartFileUploadPayload) {
        const res = await this.client.post<ApiResponse<StartFileUploadReponseData>>(
            `/storage/upload/direct/start/`,
            payload,
        );
        return res.data;
    }

    async finishFileUpload(payload: FinishFileUploadReponseData) {
        const res = await this.client.post<ApiResponse<FinishedFileUploadReponseData>>(
            `/storage/upload/direct/finish/`,
            payload,
        );
        return res.data;
    }

    async uploadFileToS3(payload: uploadFileToS3Payload) {
        const { file, data } = payload;

        const postData = new FormData();

        for (const key in data?.fields) {
            postData.append(key, data.fields[key]);
        }

        postData.append("file", file);

        let postParams = {};
        const res = await this.$axios.postForm(data.url, postData);
        return res;
    }

    async getFiles(page: number) {
        const res = await this.client.get<ApiResponse<ApiGetResponse<StorageFile[]>>>(`/storage/all/?page=${page}`);
        return res.data;
    }

    async getFile(fileId: string) {
        const res = await this.client.get<ApiResponse<any>>(`/storage/files/${fileId}/`);
        return res.data;
    }

    async updateFileData(payload: Partial<StartFileUploadPayload>) {
        const res = await this.client.patch<ApiResponse<any>>(`/storage/files/${payload.id}/`, payload);
        return res.data;
    }

    async updateFile(payload: Partial<StartFileUploadPayload>) {
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (key === "file" && value instanceof File) {
                formData.append("file", value);
            } else if (key === "id" && value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        const res = await this.client.patch(`/storage/files/${payload.id}/update/`, formData);
        return res.data;
    }

    async deleteFile(fileId: string | undefined) {
        const res = await this.client.delete<ApiResponse<any>>(`/storage/files/${fileId}/`);
        return res.data;
    }

    async getExpiredFiles(page: number) {
        const res = await this.client.get<ApiResponse<any>>(`/storage/expired-files/?page=${page}`);
        return res.data;
    }
}
