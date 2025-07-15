import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    isAuthenticated: boolean;
    currentUserId: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    currentUserId: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload;
        },
        setCurrentUserId: (state, action: PayloadAction<string | null>) => {
            state.currentUserId = action.payload;
        },
        logout: state => {
            state.isAuthenticated = false;
            state.currentUserId = null;
        },
        login: (state, action: PayloadAction<string>) => {
            state.isAuthenticated = true;
            state.currentUserId = action.payload;
        },
    },
});

export const authActions = authSlice.actions;
export type AuthActions = typeof authSlice.actions;
export default authSlice.reducer;
