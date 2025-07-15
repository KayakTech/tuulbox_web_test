import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import { SettingsActions } from "@/store/settings-reducer";
import SettingsRepository, { Settings } from "@/repositories/settings-reposiroty";
import { TimeZone } from "@/repositories/calendar-repository";

export type SettingsPreference = {
    id?: number;
    emails: boolean;
    insurance: boolean;
    license: boolean;
    document: boolean;
    documentExpirations: boolean;
    documentReminders: boolean;
    user: string;
    settings: Settings | null;
    timeZones: TimeZone[] | null;
};

export default class SettingsService {
    constructor(
        private settingsRepository: SettingsRepository,
        private store: ToolkitStore,
        private settingsActions: SettingsActions,
    ) {}

    async getPreferences() {
        const res = await this.settingsRepository.getPreferences();
        this.store.dispatch(this.settingsActions.setSettings(res.data));
        return res;
    }

    async getGeneralSettings() {
        const res = await this.settingsRepository.getGeneralSettings();
        this.store.dispatch(this.settingsActions.updateSettings(res.data));
        return res;
    }

    async updateGeneralSettings(payload: Partial<Settings>) {
        const res = await this.settingsRepository.updateGeneralSettings(payload);
        this.store.dispatch(this.settingsActions.updateSettings(res.data));
        return res;
    }

    async updatePreferences(payload: Partial<SettingsPreference>) {
        const res = await this.settingsRepository.updatePreferences(payload);
        this.store.dispatch(this.settingsActions.setSettings(res.data));
        return res;
    }
}
