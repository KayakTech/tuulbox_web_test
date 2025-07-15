import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface CalendarState {
    hasIntegratedCalendar: boolean;
}

const initialState: CalendarState = {
    hasIntegratedCalendar: false,
};

export const calendarSlice = createSlice({
    name: "calendar",
    initialState,
    reducers: {
        setHasIntegration(state, action: PayloadAction<boolean>) {
            state.hasIntegratedCalendar = action.payload;
        },
    },
});

export const calendarActions = calendarSlice.actions;
export type CalendarActions = typeof calendarSlice.actions;
export default calendarSlice.reducer;
