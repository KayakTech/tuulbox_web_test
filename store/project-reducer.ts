import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Project } from "@/repositories/project-repository";

interface ProjectState {
    userId: string | null;
    activeProjects: {
        data: Project[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    archivedProjects: {
        data: Project[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    isSilentlyFetching: boolean;
}

const initialState: ProjectState = {
    userId: null,
    activeProjects: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    archivedProjects: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    isSilentlyFetching: false,
};

export const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string | null>) => {
            // If user ID changes, reset all project data
            if (state.userId !== action.payload) {
                state.userId = action.payload;
                state.activeProjects = initialState.activeProjects;
                state.archivedProjects = initialState.archivedProjects;
            }
        },
        setProjects: (
            state,
            action: PayloadAction<{
                status: string;
                data: Project[];
                count: number;
                next: string | null;
            }>,
        ) => {
            const { status, data, count, next } = action.payload;
            if (status === "active") {
                state.activeProjects.data = data;
                state.activeProjects.count = count;
                state.activeProjects.next = next;
                state.activeProjects.lastFetched = Date.now();
            } else {
                state.archivedProjects.data = data;
                state.archivedProjects.count = count;
                state.archivedProjects.next = next;
                state.archivedProjects.lastFetched = Date.now();
            }
        },
        appendProjects: (
            state,
            action: PayloadAction<{
                status: string;
                data: Project[];
                next: string | null;
            }>,
        ) => {
            const { status, data, next } = action.payload;
            if (status === "active") {
                state.activeProjects.data = [...state.activeProjects.data, ...data];
                state.activeProjects.next = next;
            } else {
                state.archivedProjects.data = [...state.archivedProjects.data, ...data];
                state.archivedProjects.next = next;
            }
        },
        setProjectsLoading: (state, action: PayloadAction<{ status: string; loading: boolean }>) => {
            const { status, loading } = action.payload;
            if (status === "active") {
                state.activeProjects.loading = loading;
            } else {
                state.archivedProjects.loading = loading;
            }
        },
        setSilentlyFetching: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetching = action.payload;
        },
        resetProjects: state => {
            state.activeProjects = initialState.activeProjects;
            state.archivedProjects = initialState.archivedProjects;
        },
        updateProject: (state, action: PayloadAction<Project>) => {
            const updatedProject = action.payload;

            // Update in active projects
            const activeIndex = state.activeProjects.data.findIndex(project => project.id === updatedProject.id);
            if (activeIndex !== -1) {
                state.activeProjects.data[activeIndex] = updatedProject;
            }

            // Update in archived projects
            const archivedIndex = state.archivedProjects.data.findIndex(project => project.id === updatedProject.id);
            if (archivedIndex !== -1) {
                state.archivedProjects.data[archivedIndex] = updatedProject;
            }
        },
        deleteProject: (state, action: PayloadAction<string>) => {
            const projectId = action.payload;

            // Remove from active projects
            state.activeProjects.data = state.activeProjects.data.filter(project => project.id !== projectId);
            if (state.activeProjects.data.length < state.activeProjects.count) {
                state.activeProjects.count -= 1;
            }

            // Remove from archived projects
            state.archivedProjects.data = state.archivedProjects.data.filter(project => project.id !== projectId);
            if (state.archivedProjects.data.length < state.archivedProjects.count) {
                state.archivedProjects.count -= 1;
            }
        },
        // Clear all project data on logout
        clearProjectStore: () => {
            return initialState;
        },
    },
});

export const {
    setUserId,
    setProjects,
    appendProjects,
    setProjectsLoading,
    setSilentlyFetching,
    resetProjects,
    updateProject,
    deleteProject,
    clearProjectStore,
} = projectSlice.actions;

export default projectSlice.reducer;
