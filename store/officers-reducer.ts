import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Officer } from "@/repositories/business-repository";

interface OfficerState {
    userId: string | null;
    companyId: string | null;
    officers: {
        data: Partial<Officer>[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    officerDetails: {
        [officerId: string]: {
            data: Officer;
            loading: boolean;
            lastFetched: number | null;
        };
    };
    isSilentlyFetching: boolean;
    currentPage: number;
    tablePage: number;
    hasMore: boolean;
}

const initialState: OfficerState = {
    userId: null,
    companyId: null,
    officers: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    officerDetails: {},
    isSilentlyFetching: false,
    currentPage: 1,
    tablePage: 1,
    hasMore: true,
};

export const officerSlice = createSlice({
    name: "officers",
    initialState,
    reducers: {
        setUserAndCompany: (state, action: PayloadAction<{ userId: string | null; companyId: string | null }>) => {
            const { userId, companyId } = action.payload;
            if (state.userId !== userId || state.companyId !== companyId) {
                state.userId = userId;
                state.companyId = companyId;
                state.officers = initialState.officers;
                state.officerDetails = {};
                state.currentPage = 1;
                state.tablePage = 1;
                state.hasMore = true;
            }
        },
        setOfficers: (
            state,
            action: PayloadAction<{
                data: Partial<Officer>[];
                count: number;
                next: string | null;
                page: number;
                isTableView?: boolean;
            }>,
        ) => {
            const { data, count, next, page, isTableView = false } = action.payload;

            if (page === 1 || isTableView) {
                state.officers.data = data;
            } else {
                state.officers.data = [...state.officers.data, ...data];
            }

            state.officers.count = count;
            state.officers.next = next;
            state.officers.lastFetched = Date.now();
            state.hasMore = next !== null;
        },
        appendOfficers: (
            state,
            action: PayloadAction<{
                data: Partial<Officer>[];
                next: string | null;
            }>,
        ) => {
            const { data, next } = action.payload;
            state.officers.data = [...state.officers.data, ...data];
            state.officers.next = next;
            state.hasMore = next !== null;
        },
        setOfficersLoading: (state, action: PayloadAction<boolean>) => {
            state.officers.loading = action.payload;
        },
        setSilentlyFetching: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetching = action.payload;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setTablePage: (state, action: PayloadAction<number>) => {
            state.tablePage = action.payload;
        },
        setHasMore: (state, action: PayloadAction<boolean>) => {
            state.hasMore = action.payload;
        },
        resetPagination: state => {
            state.currentPage = 1;
            state.tablePage = 1;
            state.hasMore = true;
            state.officers.data = [];
        },
        resetOfficers: state => {
            state.officers = initialState.officers;
            state.currentPage = 1;
            state.tablePage = 1;
            state.hasMore = true;
        },
        setOfficerDetails: (state, action: PayloadAction<{ officerId: string; data: Officer }>) => {
            const { officerId, data } = action.payload;
            state.officerDetails[officerId] = {
                data,
                loading: false,
                lastFetched: Date.now(),
            };
        },
        setOfficerDetailsLoading: (state, action: PayloadAction<{ officerId: string; loading: boolean }>) => {
            const { officerId, loading } = action.payload;
            if (!state.officerDetails[officerId]) {
                state.officerDetails[officerId] = {
                    data: {} as Officer,
                    loading,
                    lastFetched: null,
                };
            } else {
                state.officerDetails[officerId].loading = loading;
            }
        },
        addOfficer: (state, action: PayloadAction<Partial<Officer>>) => {
            const newOfficer = action.payload;
            state.officers.data = [newOfficer, ...state.officers.data];
            state.officers.count += 1;
        },
        updateOfficer: (state, action: PayloadAction<Partial<Officer>>) => {
            const updatedOfficer = action.payload;

            const officerIndex = state.officers.data.findIndex(officer => officer.id === updatedOfficer.id);
            if (officerIndex !== -1) {
                state.officers.data[officerIndex] = {
                    ...state.officers.data[officerIndex],
                    ...updatedOfficer,
                };
            }

            if (updatedOfficer.id && state.officerDetails[updatedOfficer.id]) {
                state.officerDetails[updatedOfficer.id].data = {
                    ...state.officerDetails[updatedOfficer.id].data,
                    ...updatedOfficer,
                } as Officer;
                state.officerDetails[updatedOfficer.id].lastFetched = Date.now();
            }
        },
        deleteOfficer: (state, action: PayloadAction<string>) => {
            const officerId = action.payload;

            state.officers.data = state.officers.data.filter(officer => officer.id !== officerId);
            state.officers.count = Math.max(0, state.officers.count - 1);

            delete state.officerDetails[officerId];
        },
        clearOfficerStore: () => {
            return initialState;
        },
    },
});

export const {
    setUserAndCompany,
    setOfficers,
    appendOfficers,
    setOfficersLoading,
    setSilentlyFetching,
    setCurrentPage,
    setTablePage,
    setHasMore,
    resetPagination,
    resetOfficers,
    setOfficerDetails,
    setOfficerDetailsLoading,
    addOfficer,
    updateOfficer,
    deleteOfficer,
    clearOfficerStore,
} = officerSlice.actions;

export default officerSlice.reducer;
