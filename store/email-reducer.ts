import { HasIntergrationResponseData } from "@/repositories/integration-repository";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface EmailIntegrationState {
    integrationData: HasIntergrationResponseData | null;
}

const initialState: EmailIntegrationState = {
    integrationData: null,
};

export const emailSlice = createSlice({
    name: "email",
    initialState,
    reducers: {
        setIntegratedEmail(state, action: PayloadAction<HasIntergrationResponseData | null>) {
            state.integrationData = action.payload;
        },
    },
});

export const emailActions = emailSlice.actions;
export type EmailActions = typeof emailSlice.actions;
export default emailSlice.reducer;
