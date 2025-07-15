import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface DeleteAccountModalProps {
    showModal: boolean;
}

const initialState: DeleteAccountModalProps = {
    showModal: false,
};

export const deleteAccountSlice = createSlice({
    name: "deleteAccountModal",
    initialState,
    reducers: {
        setShowDeleteAccountModal(state, action: PayloadAction<boolean>) {
            state.showModal = action.payload;
        },
    },
});

export const deleteAccountActions = deleteAccountSlice.actions;
export type DeleteAccountActions = typeof deleteAccountSlice.actions;
export default deleteAccountSlice.reducer;
