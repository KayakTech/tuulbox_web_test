import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { NotificationObject, Notifications } from "@/repositories/notifications-repository";

export interface NotificationsState {
    notifications: NotificationObject[];
    notificationCount: number;
}

const initialState: NotificationsState = {
    notifications: [],
    notificationCount: 0,
};

export const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setNotifications(state, action: PayloadAction<NotificationObject[]>) {
            state.notifications = action.payload;

            state.notificationCount = action.payload.length;

            // Object.keys(action.payload).map((key: any, index: number) => {
            //     if (Array.isArray(action.payload[key])) {
            //         state.notificationCount = state.notificationCount + action.payload[key]?.length;
            //     }

            //     if (typeof action.payload[key] === "object") {
            //         Object.keys(action.payload[key]).map((k, i: number) => {
            //             state.notificationCount =
            //                 state.notificationCount +
            //                 action?.payload[key][k]?.reminders?.length +
            //                 action?.payload[key][k]?.expirations?.length;
            //         });
            //     }
            // });
        },
    },
});

export const notificationActions = notificationSlice.actions;
export type NotificationsActions = typeof notificationSlice.actions;
export default notificationSlice.reducer;
