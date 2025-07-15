import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "@/repositories/project-repository";

interface DetailedProject extends Project {
    documentCategoryAccesses: Array<{
        documentCategory: string;
        accessLevel: string;
    }>;
    invitedUsers: any[];
    sharedWith: any[];
}

interface ProjectDetailState {
    projectDetails: {
        [projectId: string]: {
            data: DetailedProject | null;
            loading: boolean;
            error: string | null;
        };
    };
}

const initialState: ProjectDetailState = {
    projectDetails: {},
};

export const projectDetailSlice = createSlice({
    name: "projectDetail",
    initialState,
    reducers: {
        setProjectDetailLoading: (state, action: PayloadAction<{ projectId: string; loading: boolean }>) => {
            const { projectId, loading } = action.payload;
            if (!state.projectDetails[projectId]) {
                state.projectDetails[projectId] = {
                    data: null,
                    loading: false,
                    error: null,
                };
            }
            state.projectDetails[projectId].loading = loading;
        },
        setProjectDetail: (state, action: PayloadAction<{ projectId: string; data: DetailedProject }>) => {
            const { projectId, data } = action.payload;
            state.projectDetails[projectId] = {
                data,
                loading: false,
                error: null,
            };
        },
        setProjectDetailError: (state, action: PayloadAction<{ projectId: string; error: string }>) => {
            const { projectId, error } = action.payload;
            if (!state.projectDetails[projectId]) {
                state.projectDetails[projectId] = {
                    data: null,
                    loading: false,
                    error: null,
                };
            }
            state.projectDetails[projectId].error = error;
            state.projectDetails[projectId].loading = false;
        },
        updateProjectDetail: (state, action: PayloadAction<{ projectId: string; data: Partial<DetailedProject> }>) => {
            const { projectId, data } = action.payload;
            if (state.projectDetails[projectId]?.data) {
                state.projectDetails[projectId].data = {
                    ...state.projectDetails[projectId].data!,
                    ...data,
                };
            }
        },
        clearProjectDetail: (state, action: PayloadAction<string>) => {
            const projectId = action.payload;
            delete state.projectDetails[projectId];
        },
        clearAllProjectDetails: state => {
            state.projectDetails = {};
        },
    },
});

export const {
    setProjectDetailLoading,
    setProjectDetail,
    setProjectDetailError,
    updateProjectDetail,
    clearProjectDetail,
    clearAllProjectDetails,
} = projectDetailSlice.actions;

// selectors
export const selectProjectDetail = (state: any, projectId: string) => {
    return (
        state.projectDetail.projectDetails[projectId] || {
            data: null,
            loading: false,
            error: null,
        }
    );
};

export default projectDetailSlice.reducer;
