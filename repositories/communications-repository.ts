import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";
import { User } from "./account-repository";

export type Email = {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    content: string;
    to: string[];
    threadId: string;
    messageId?: string;
    cc: string[];
    subject?: string;
    project?: string;
    createdBy?: string;
    isRead: boolean;
    tags: string[];
};

export type TextMessage = {
    id: string;
    createdAt: string;
    updatedAt?: string;
    content: string;
    to: string;
    sender: string;
    isRead: boolean;
    tags: string[];
    threadId?: string;
    project?: string;
    createdBy?: string;
};

export type ThreadEmail = {
    historyId: string;
    id: string;
    internalDate: string;
    labelIds: string[];
    payload: {
        body: { data: string; filename: string; size: number };
        headers: { name: string; value: string }[];
        parts: EmailPart[];
    };
    sizeEstimate: number;
    snippet: string;
    threadId: string;
};

export type EmailPart = {
    body: { data: string; size: number };
    filename: string;
    headers: {}[];
    mimeType: string;
    partId: string;
};

export type ChatParticipant = {
    id: string;
    createdAt: string;
    updatedAt: string;
    name: string;
    email: string;
    data: User;
    timezone: string;
};

export type ChatMessage = {
    id: string;
    createdAt: string;
    updatedAt: string;
    content: string;
    roomId: string;
    createdBy: ChatParticipant;
    participantId: string;
    attachments: any[];
};

export type ChatRoom = {
    createdAt: string;
    id: string;
    name: string;
    updatedAt: string;
    isArchived: boolean;
    participants: ChatParticipant[];
    unreadCount: number;
    lastChat: ChatMessage[];
};

type EmailsResponse = {
    count: number;
    next: any;
    previous: null;
    results: Email[];
    status: string;
};

type EmailThreadResponse = {
    body: {
        historyId: string;
        id: string;
        messages: ThreadEmail[];
    };
    id: string;
};

type TextMessageThreadResponse = {
    body: TextMessage[];
    id: string;
    status: string;
};

type TextMessagesResponse = {
    count: number;
    next: string;
    previous: string;
    results: TextMessage[];
};

export default class CommunicationsRepository {
    constructor(private client: AxiosClient) {}

    async getEmails(payload: { projectId?: string; pageNumber: number }) {
        const res = await this.client.get<ApiResponse<EmailsResponse>>(
            `/communication/emails/?project=${payload?.projectId}&page=${payload?.pageNumber}`,
        );
        return res.data;
    }

    async getEmail(payload: { emailId: string }) {
        const res = await this.client.get<ApiResponse<EmailThreadResponse>>(
            `/communication/emails/${payload.emailId}/`,
        );
        return res.data;
    }

    async composeEmail(payload: Partial<Email>) {
        const res = await this.client.post<ApiResponse<Email>>(`/communication/emails/`, payload);
        return res.data;
    }

    async archiveEmail(payload: { emailId: string }) {
        const res = await this.client.delete<ApiResponse<Email>>(`/communication/emails/${payload.emailId}/`);
        return res.data;
    }

    async getTextMessages(payload: { projectId: string; pageNumber: number }) {
        const res = await this.client.get<ApiResponse<TextMessagesResponse>>(
            `/communication/sms/?project=${payload.projectId}&page=${payload.pageNumber}`,
        );
        return res.data;
    }

    async getTextMessageThread(textMessageId: string, projectId: string) {
        const res = await this.client.get<ApiResponse<TextMessageThreadResponse>>(
            `/communication/sms/${textMessageId}/`,
            {
                params: { project: projectId },
            },
        );
        return res.data;
    }

    async archiveTextMessage(textMessageId: string, projectId: string) {
        const res = await this.client.delete<ApiResponse<TextMessage>>(`/communication/sms/${textMessageId}/`, {
            params: { project: projectId },
        });
        return res.data;
    }
}
