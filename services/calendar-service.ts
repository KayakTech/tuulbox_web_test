import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import CalendarRepository, { CalendarEvent, EventPayload } from "@/repositories/calendar-repository";
import { CalendarActions } from "@/store/calendar-reducer";
import { SettingsActions } from "@/store/settings-reducer";

export default class CalendarService {
    constructor(
        private calendarRepository: CalendarRepository,
        private store: ToolkitStore,
        private calendarActions: CalendarActions,
        private settingsActions: SettingsActions,
    ) {}

    async getCalendarIntegration() {
        const res = await this.calendarRepository.getCalendarIntegration();
        return res;
    }

    async syncGoogleCalendar() {
        const res = await this.calendarRepository.syncGoogleCalendar();
        return res;
    }

    async getCalendarEvents() {
        const res = await this.calendarRepository.getCalendarEvents();
        return res;
    }

    async getCalendarEvent(eventId: string) {
        const res = await this.calendarRepository.getCalendarEvent(eventId);
        return res;
    }

    async addCalendarEvent(payload: EventPayload) {
        const res = await this.calendarRepository.addCalendarEvent(payload);
        return res;
    }

    async updateCalendarEvent(payload: EventPayload) {
        const res = await this.calendarRepository.updateCalendarEvent(payload);
        return res;
    }

    async deleteCalendarEvent(event: CalendarEvent) {
        const res = await this.calendarRepository.deleteCalendarEvent(event);
        return res;
    }

    async disconnectCalendarIntegration() {
        const res = await this.calendarRepository.disconnectCalendarIntegration();
        return res;
    }

    async getTimezones() {
        const res = await this.calendarRepository.getTimezones();
        this.store.dispatch(this.settingsActions.updateTimeZones(res.data.timezones));
        return res;
    }
}
