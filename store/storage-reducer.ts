import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StorageFile } from "@/repositories/storage-repository";

interface StorageState {
    userId: string | null;
    files: {
        data: StorageFile[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    expiredFiles: {
        data: StorageFile[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    isSilentlyFetching: boolean;
}

const initialState: StorageState = {
    userId: null,
    files: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    expiredFiles: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    isSilentlyFetching: false,
};

export const storageSlice = createSlice({
    name: "storage",
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string | null>) => {
            // If user ID changes, reset all storage data
            if (state.userId !== action.payload) {
                state.userId = action.payload;
                state.files = initialState.files;
                state.expiredFiles = initialState.expiredFiles;
            }
        },
        setFiles: (
            state,
            action: PayloadAction<{
                type: "files" | "expired";
                data: StorageFile[];
                count: number;
                next: string | null;
            }>,
        ) => {
            const { type, data, count, next } = action.payload;
            if (type === "files") {
                state.files.data = data;
                state.files.count = count;
                state.files.next = next;
                state.files.lastFetched = Date.now();
            } else {
                state.expiredFiles.data = data;
                state.expiredFiles.count = count;
                state.expiredFiles.next = next;
                state.expiredFiles.lastFetched = Date.now();
            }
        },
        appendFiles: (
            state,
            action: PayloadAction<{
                type: "files" | "expired";
                data: StorageFile[];
                next: string | null;
            }>,
        ) => {
            const { type, data, next } = action.payload;
            if (type === "files") {
                state.files.data = [...state.files.data, ...data];
                state.files.next = next;
            } else {
                state.expiredFiles.data = [...state.expiredFiles.data, ...data];
                state.expiredFiles.next = next;
            }
        },
        setFilesLoading: (state, action: PayloadAction<{ type: "files" | "expired"; loading: boolean }>) => {
            const { type, loading } = action.payload;
            if (type === "files") {
                state.files.loading = loading;
            } else {
                state.expiredFiles.loading = loading;
            }
        },
        setSilentlyFetching: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetching = action.payload;
        },
        resetFiles: (state, action: PayloadAction<{ type?: "files" | "expired" | "all" }>) => {
            const { type = "all" } = action.payload || {};
            if (type === "files" || type === "all") {
                state.files = initialState.files;
            }
            if (type === "expired" || type === "all") {
                state.expiredFiles = initialState.expiredFiles;
            }
        },
        updateFile: (state, action: PayloadAction<StorageFile>) => {
            const updatedFile = action.payload;

            const fileIndex = state.files.data.findIndex(file => file.id === updatedFile.id);
            if (fileIndex !== -1) {
                state.files.data[fileIndex] = updatedFile;
            }

            const expiredIndex = state.expiredFiles.data.findIndex(file => file.id === updatedFile.id);
            if (expiredIndex !== -1) {
                state.expiredFiles.data[expiredIndex] = updatedFile;
            }
        },
        deleteFile: (state, action: PayloadAction<string>) => {
            const fileId = action.payload;

            state.files.data = state.files.data.filter(file => file.id !== fileId);
            if (state.files.data.length < state.files.count) {
                state.files.count -= 1;
            }

            state.expiredFiles.data = state.expiredFiles.data.filter(file => file.id !== fileId);
            if (state.expiredFiles.data.length < state.expiredFiles.count) {
                state.expiredFiles.count -= 1;
            }
        },
        addFile: (state, action: PayloadAction<StorageFile>) => {
            const newFile = action.payload;
            state.files.data.unshift(newFile);
            state.files.count += 1;
        },
        // Clear all storage data on logout
        clearStorageStore: () => {
            return initialState;
        },
    },
});

export const {
    setUserId,
    setFiles,
    appendFiles,
    setFilesLoading,
    setSilentlyFetching,
    resetFiles,
    updateFile,
    deleteFile,
    addFile,
    clearStorageStore,
} = storageSlice.actions;

export default storageSlice.reducer;
