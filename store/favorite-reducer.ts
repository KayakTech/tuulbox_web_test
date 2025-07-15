import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Favorite } from "@/repositories/favorites-repository";

interface FavoritesState {
    userId: string | null;
    favorites: {
        data: Favorite[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    isSilentlyFetching: boolean;
}

const initialState: FavoritesState = {
    userId: null,
    favorites: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    isSilentlyFetching: false,
};

export const favoriteSlice = createSlice({
    name: "favorites",
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string | null>) => {
            // If user ID changes, reset all favorites data
            if (state.userId !== action.payload) {
                state.userId = action.payload;
                state.favorites = initialState.favorites;
            }
        },
        setFavorites: (
            state,
            action: PayloadAction<{
                data: Favorite[];
                count: number;
                next: string | null;
            }>,
        ) => {
            const { data, count, next } = action.payload;
            state.favorites.data = data;
            state.favorites.count = count;
            state.favorites.next = next;
            state.favorites.lastFetched = Date.now();
        },
        appendFavorites: (
            state,
            action: PayloadAction<{
                data: Favorite[];
                next: string | null;
            }>,
        ) => {
            const { data, next } = action.payload;
            state.favorites.data = [...state.favorites.data, ...data];
            state.favorites.next = next;
        },
        setFavoritesLoading: (state, action: PayloadAction<boolean>) => {
            state.favorites.loading = action.payload;
        },
        setSilentlyFetching: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetching = action.payload;
        },
        resetFavorites: state => {
            state.favorites = initialState.favorites;
        },
        updateFavorite: (state, action: PayloadAction<Favorite>) => {
            const updatedFavorite = action.payload;
            const index = state.favorites.data.findIndex(favorite => favorite.id === updatedFavorite.id);
            if (index !== -1) {
                state.favorites.data[index] = updatedFavorite;
            }
        },
        deleteFavorite: (state, action: PayloadAction<string>) => {
            const favoriteId = action.payload;
            state.favorites.data = state.favorites.data.filter(favorite => favorite.id !== favoriteId);
            if (state.favorites.data.length < state.favorites.count) {
                state.favorites.count -= 1;
            }
        },
        // Clear all favorites data on logout
        clearFavoriteStore: () => {
            return initialState;
        },
    },
});

export const {
    setUserId,
    setFavorites,
    appendFavorites,
    setFavoritesLoading,
    setSilentlyFetching,
    resetFavorites,
    updateFavorite,
    deleteFavorite,
    clearFavoriteStore,
} = favoriteSlice.actions;

export default favoriteSlice.reducer;
