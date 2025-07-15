import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Resource } from "@/repositories/resource-repository";

interface ResourcesState {
    resources: Resource[] | null;
}

const initialState: ResourcesState = {
    resources: null,
};

export const resourceSlice = createSlice({
    name: "resources",
    initialState,
    reducers: {
        setResources(state, action: PayloadAction<Resource[] | null>) {
            state.resources = action.payload;
        },
    },
});

export const resourceActions = resourceSlice.actions;
export type ResourceActions = typeof resourceSlice.actions;
export default resourceSlice.reducer;
