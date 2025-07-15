import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Company } from "@/repositories/business-repository";

export interface BusinessState {
    company: Partial<Company> | null;
}

const initialState: BusinessState = {
    company: null,
};

export const businessSlice = createSlice({
    name: "business",
    initialState,
    reducers: {
        setCompanyDetails(state, action: PayloadAction<Partial<Company> | null>) {
            state.company = action.payload;
        },
    },
});

export const businessActions = businessSlice.actions;
export type BusinessActions = typeof businessSlice.actions;
export default businessSlice.reducer;
