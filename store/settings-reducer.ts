import { TimeZone } from "@/repositories/calendar-repository";
import { Settings } from "@/repositories/settings-reposiroty";
import { SettingsPreference } from "@/services/settings-service";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: SettingsPreference = {
    emails: false,
    insurance: false,
    license: false,
    document: false,
    documentExpirations: false,
    documentReminders: false,
    user: "",
    id: 0,
    settings: null,
    timeZones: null,
};

export const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setSettings(state, action: PayloadAction<SettingsPreference>) {
            state = Object.assign(state, action.payload);
        },
        updateSettings(state, action: PayloadAction<Settings>) {
            state.settings = action.payload;
        },
        updateTimeZones(state, action: PayloadAction<TimeZone[]>) {
            state.timeZones = action.payload;
        },
        updateAutoLogoutTimeout(state, action: PayloadAction<number>) {
            if (state.settings) {
                state.settings.autoLogoutTimeout = action.payload;
            } else {
                //@ts-ignore
                state.settings = {
                    autoLogoutTimeout: action.payload,
                };
            }
        },
    },
});

export const settingsActions = settingsSlice.actions;
export type SettingsActions = typeof settingsSlice.actions;
export default settingsSlice.reducer;
