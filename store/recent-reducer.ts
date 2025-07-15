import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RecentActivity, RecentActivityDestructuredObject } from "@/repositories/recent-repository";

interface RecentState {
    userId: string | null;
    recentActivities: {
        data: RecentActivityDestructuredObject | null;
        loading: boolean;
        lastFetched: number | null;
    };
    isSilentlyFetchingRecents: boolean;
}

const initialState: RecentState = {
    userId: null,
    recentActivities: {
        data: null,
        loading: false,
        lastFetched: null,
    },
    isSilentlyFetchingRecents: false,
};

export const recentSlice = createSlice({
    name: "recents",
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string | null>) => {
            // If user ID changes, reset all recent data
            if (state.userId !== action.payload) {
                state.userId = action.payload;
                state.recentActivities = initialState.recentActivities;
            }
        },
        setRecentActivities: (
            state,
            action: PayloadAction<{
                data: RecentActivityDestructuredObject | null;
            }>,
        ) => {
            const { data } = action.payload;
            state.recentActivities.data = data;
            state.recentActivities.lastFetched = Date.now();
        },
        setRecentActivitiesLoading: (state, action: PayloadAction<boolean>) => {
            state.recentActivities.loading = action.payload;
        },
        setSilentlyFetchingRecents: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetchingRecents = action.payload;
        },
        resetRecentActivities: state => {
            state.recentActivities = initialState.recentActivities;
        },
        // Clear all recent data on logout
        clearRecentStore: () => {
            return initialState;
        },
    },
});

export const {
    setUserId,
    setRecentActivities,
    setRecentActivitiesLoading,
    setSilentlyFetchingRecents,
    resetRecentActivities,
    clearRecentStore,
} = recentSlice.actions;

export default recentSlice.reducer;
