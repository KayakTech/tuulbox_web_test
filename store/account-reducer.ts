import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/repositories/account-repository";

export interface AccountState {
    user: User | null | undefined;
}

const initialState: AccountState = {
    user: null,
};

export const accountSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserProfile(state, action: PayloadAction<User | null | undefined>) {
            state.user = action.payload;
        },
    },
});

export const accountActions = accountSlice.actions;
export type AccountActions = typeof accountSlice.actions;
export default accountSlice.reducer;
