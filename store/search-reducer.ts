import { SearchResult } from "@/repositories/search-repository";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface SearchState {
    searchResults: SearchResult | null;
    showDropdown: boolean;
    showModal: boolean;
}

const initialState: SearchState = {
    searchResults: null,
    showDropdown: false,
    showModal: false,
};

export const searchSlice = createSlice({
    name: "searchResults",
    initialState,
    reducers: {
        setSearchResults(state, action: PayloadAction<SearchResult | null>) {
            state.searchResults = action.payload;
        },
        resetSearchResults(state) {
            state.searchResults = null;
        },
        setShowDropdown(state, action: PayloadAction<boolean>) {
            state.showDropdown = action.payload;
        },
        setShowModal(state, action: PayloadAction<boolean>) {
            state.showModal = action.payload;
        },
    },
});

export const searchActions = searchSlice.actions;
export type SearchActions = typeof searchSlice.actions;
export default searchSlice.reducer;
