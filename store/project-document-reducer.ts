import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProjectDocumentType } from "@/repositories/project-repository";

interface ProjectDocumentState {
    projectId: string | null;
    documentCategories: {
        [category: string]: {
            data: ProjectDocumentType[];
            count: number;
            next: string | null;
            loading: boolean;
            lastFetched: number | null;
        };
    };
    isSilentlyFetching: boolean;
}

const initialCategoryState = {
    data: [],
    count: 0,
    next: null,
    loading: false,
    lastFetched: null,
};

const initialState: ProjectDocumentState = {
    projectId: null,
    documentCategories: {},
    isSilentlyFetching: false,
};

export const projectDocumentSlice = createSlice({
    name: "projectDocuments",
    initialState,
    reducers: {
        setProjectId: (state, action: PayloadAction<string | null>) => {
            // If project ID changes, reset all document data
            if (state.projectId !== action.payload) {
                state.projectId = action.payload;
                state.documentCategories = {};
            }
        },
        setProjectDocuments: (
            state,
            action: PayloadAction<{
                category: string;
                data: ProjectDocumentType[];
                count: number;
                next: string | null;
            }>,
        ) => {
            const { category, data, count, next } = action.payload;
            if (!state.documentCategories[category]) {
                state.documentCategories[category] = { ...initialCategoryState };
            }
            state.documentCategories[category].data = data;
            state.documentCategories[category].count = count;
            state.documentCategories[category].next = next;
            state.documentCategories[category].lastFetched = Date.now();
        },
        appendProjectDocuments: (
            state,
            action: PayloadAction<{
                category: string;
                data: ProjectDocumentType[];
                next: string | null;
            }>,
        ) => {
            const { category, data, next } = action.payload;
            if (!state.documentCategories[category]) {
                state.documentCategories[category] = { ...initialCategoryState };
            }
            state.documentCategories[category].data = [...state.documentCategories[category].data, ...data];
            state.documentCategories[category].next = next;
        },
        setProjectDocumentsLoading: (state, action: PayloadAction<{ category: string; loading: boolean }>) => {
            const { category, loading } = action.payload;
            if (!state.documentCategories[category]) {
                state.documentCategories[category] = { ...initialCategoryState };
            }
            state.documentCategories[category].loading = loading;
        },
        setSilentlyFetching: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetching = action.payload;
        },
        resetProjectDocuments: (state, action: PayloadAction<string>) => {
            const category = action.payload;
            if (state.documentCategories[category]) {
                state.documentCategories[category] = { ...initialCategoryState };
            }
        },
        updateProjectDocument: (state, action: PayloadAction<{ category: string; document: ProjectDocumentType }>) => {
            const { category, document } = action.payload;
            if (state.documentCategories[category]) {
                const index = state.documentCategories[category].data.findIndex(doc => doc.id === document.id);
                if (index !== -1) {
                    state.documentCategories[category].data[index] = document;
                }
            }
        },
        deleteProjectDocument: (state, action: PayloadAction<{ category: string; documentId: string }>) => {
            const { category, documentId } = action.payload;
            if (state.documentCategories[category]) {
                state.documentCategories[category].data = state.documentCategories[category].data.filter(
                    doc => doc.id !== documentId,
                );
                if (state.documentCategories[category].data.length < state.documentCategories[category].count) {
                    state.documentCategories[category].count -= 1;
                }
            }
        },
        // clear all project document data on logout
        clearProjectDocumentStore: () => {
            return initialState;
        },
    },
});

export const {
    setProjectId,
    setProjectDocuments,
    appendProjectDocuments,
    setProjectDocumentsLoading,
    setSilentlyFetching,
    resetProjectDocuments,
    updateProjectDocument,
    deleteProjectDocument,
    clearProjectDocumentStore,
} = projectDocumentSlice.actions;

export default projectDocumentSlice.reducer;
