import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface DataDisplayLayoutState {
    dataDisplayLayout: string;
    listOrGrid: {
        storage: string;
        project: string;
        projectDocument: string;
        projectShare: string;
        subcontractor: string;
        contact: string;
        link: string;
        favorite: string;
        expiration: string;
        license: string;
        insurance: string;
        officer: string;
        event: string;
        contactDocument: string;
    };
}

const initialState: DataDisplayLayoutState = {
    dataDisplayLayout: "grid",
    listOrGrid: {
        storage: "grid",
        project: "grid",
        projectDocument: "grid",
        projectShare: "grid",
        subcontractor: "grid",
        contact: "grid",
        link: "grid",
        favorite: "grid",
        expiration: "grid",
        license: "grid",
        insurance: "grid",
        officer: "grid",
        event: "list",
        contactDocument: "grid",
    },
};

export const dataDisplayLayoutSlice = createSlice({
    name: "dataDisplayLayout",
    initialState,
    reducers: {
        setDataDisplayLayout(state, action: PayloadAction<string>) {
            state.dataDisplayLayout = action.payload;
        },
        setListOrGrid(state, action: PayloadAction<{ layoutKey: any; value: string }>) {
            state.listOrGrid = {
                ...state.listOrGrid,
                [action.payload.layoutKey]: action.payload.value,
            };
        },
    },
});

export const dataDisplayLayoutActions = dataDisplayLayoutSlice.actions;
export type DataDisplayLayout = typeof dataDisplayLayoutSlice.actions;
export default dataDisplayLayoutSlice.reducer;
