import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Resource } from "@/repositories/resource-repository";

export interface ResourcesState {
    data: Resource[];
    count: number;
    next: string | null;
    loading: boolean;
    lastFetched: number | null;
}

export interface LinksState {
    resources: ResourcesState;
    isSilentlyFetching: boolean;
}

const initialResourcesState: ResourcesState = {
    data: [],
    count: 0,
    next: null,
    loading: false,
    lastFetched: null,
};

const initialState: LinksState = {
    resources: initialResourcesState,
    isSilentlyFetching: false,
};

const linksSlice = createSlice({
    name: "links",
    initialState,
    reducers: {
        setResources: (
            state,
            action: PayloadAction<{
                data: Resource[];
                count: number;
                next: string | null;
            }>,
        ) => {
            state.resources.data = action.payload.data;
            state.resources.count = action.payload.count;
            state.resources.next = action.payload.next;
            state.resources.lastFetched = Date.now();
        },

        appendResources: (
            state,
            action: PayloadAction<{
                data: Resource[];
                next: string | null;
            }>,
        ) => {
            state.resources.data = [...state.resources.data, ...action.payload.data];
            state.resources.next = action.payload.next;
            state.resources.lastFetched = Date.now();
        },

        setResourcesLoading: (state, action: PayloadAction<boolean>) => {
            state.resources.loading = action.payload;
        },

        setSilentlyFetching: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetching = action.payload;
        },

        updateResource: (state, action: PayloadAction<Resource>) => {
            const index = state.resources.data.findIndex(resource => resource.id === action.payload.id);
            if (index !== -1) {
                state.resources.data[index] = action.payload;
            }
        },

        removeResource: (state, action: PayloadAction<string | number>) => {
            state.resources.data = state.resources.data.filter(resource => resource.id !== action.payload);
            state.resources.count = Math.max(0, state.resources.count - 1);
        },

        addResource: (state, action: PayloadAction<Resource>) => {
            state.resources.data.unshift(action.payload);
            state.resources.count += 1;
        },

        clearResources: state => {
            state.resources = initialResourcesState;
        },
    },
});

export const {
    setResources,
    appendResources,
    setResourcesLoading,
    setSilentlyFetching,
    updateResource,
    removeResource,
    addResource,
    clearResources,
} = linksSlice.actions;

export default linksSlice.reducer;
