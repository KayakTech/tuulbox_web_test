import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";
import { AxiosInstance } from "axios";
import { Value } from "react-date-picker/dist/cjs/shared/types";
import { TagInput } from "@/components/ResourceForm";
import { HOST } from "@/helpers/constants";

type SyncGoogleCalendarResponse = {
    redirectUrl: string;
    user: string;
};

type CalendarIntegrationResponse = {
    id: string;
    email: string;
    hasIntegration: boolean;
    createdAt: string;
    updatedAt: string;
};

type CalendarEventsResponse = {
    count: number;
    next: string | null;
    previous: string | null;
    results: CalendarEvent[];
};

export type CalendarEvent = {
    summary: string;
    description: string;
    timezone: string;
    duration: string;
    start: string;
    end: string;
    title: string;
    startDate: string | Value;
    endDate: string | Value;
    startTime: string;
    endTime: string;
    createdAt: string;
    createdBy: string;
    id: string;
    updatedAt: string;
    contacts: any[];
    autoFocus: boolean;
    contactSuggestions: TagInput[];
    googleEventId: string;
    originalData: CalendarEventOriginalData;
    attendees: any[];
    calendarId?: string;
};

export type CalendarEventOriginalData = {
    attendees: string[];
};

export type EventPayload = {
    id: string;
    summary: string;
    description: string;
    start: string;
    end: string;
    calendarId?: string;
};

export type TimeZone = {
    label: string;
    value: string;
};

export default class CalendarRepository {
    constructor(private client: AxiosClient) {}

    async getCalendarIntegration() {
        const res = await this.client.get<ApiResponse<CalendarIntegrationResponse>>(
            `/integrations/calendar-integration/`,
        );
        return res.data;
    }

    async syncGoogleCalendar() {
        const res = await this.client.get<ApiResponse<SyncGoogleCalendarResponse>>(
            `/integrations/start-google-calendar-integration/?redirect_url=${HOST}/calendar`,
        );
        return res.data;
    }

    async getCalendarEvents() {
        const res = await this.client.get<ApiResponse<CalendarEventsResponse>>(`/calendar/`);
        return res.data;
    }

    async getCalendarEvent(eventId: string) {
        const res = await this.client.get<ApiResponse<Partial<CalendarEvent>>>(`/calendar/events/${eventId}`);
        return res.data;
    }

    async addCalendarEvent(payload: EventPayload) {
        const res = await this.client.post<ApiResponse<CalendarEventsResponse>>(`/calendar/`, payload);
        return res.data;
    }

    async updateCalendarEvent(payload: EventPayload) {
        const res = await this.client.patch<ApiResponse<CalendarEventsResponse>>(
            `/calendar/events/${payload.id}/`,
            payload,
        );
        return res.data;
    }

    async deleteCalendarEvent(event: CalendarEvent) {
        const res = await this.client.delete<ApiResponse<CalendarEventsResponse>>(`/calendar/events/${event.id}/`, {
            calendarId: event.calendarId,
        });
        return res.data;
    }

    async disconnectCalendarIntegration() {
        const res = await this.client.delete<ApiResponse<CalendarEventsResponse>>(
            `/integrations/calendar-integration/`,
        );
        return res.data;
    }

    async getTimezones() {
        const res = await this.client.get<ApiResponse<{ timezones: TimeZone[] }>>(`/literals`);
        return res.data;
    }
}
