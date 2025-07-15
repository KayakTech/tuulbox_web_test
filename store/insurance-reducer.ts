import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { InsuranceData } from "@/repositories/business-repository";

interface InsuranceState {
    userId: string | null;
    activeInsurances: {
        data: InsuranceData[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    archivedInsurances: {
        data: InsuranceData[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    insuranceDetails: {
        [insuranceId: string]: {
            data: InsuranceData;
            lastFetched: number;
        };
    };
    isSilentlyFetching: boolean;
}

const initialState: InsuranceState = {
    userId: null,
    activeInsurances: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    archivedInsurances: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    insuranceDetails: {},
    isSilentlyFetching: false,
};

export const insuranceSlice = createSlice({
    name: "insurances",
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string | null>) => {
            if (state.userId !== action.payload) {
                state.userId = action.payload;
                state.activeInsurances = initialState.activeInsurances;
                state.archivedInsurances = initialState.archivedInsurances;
                state.insuranceDetails = {};
            }
        },
        setInsurances: (
            state,
            action: PayloadAction<{
                status: string;
                data: InsuranceData[];
                count: number;
                next: string | null;
            }>,
        ) => {
            const { status, data, count, next } = action.payload;
            if (status === "active") {
                state.activeInsurances.data = data;
                state.activeInsurances.count = count;
                state.activeInsurances.next = next;
                state.activeInsurances.lastFetched = Date.now();
            } else {
                state.archivedInsurances.data = data;
                state.archivedInsurances.count = count;
                state.archivedInsurances.next = next;
                state.archivedInsurances.lastFetched = Date.now();
            }
        },
        appendInsurances: (
            state,
            action: PayloadAction<{
                status: string;
                data: InsuranceData[];
                next: string | null;
            }>,
        ) => {
            const { status, data, next } = action.payload;
            if (status === "active") {
                state.activeInsurances.data = [...state.activeInsurances.data, ...data];
                state.activeInsurances.next = next;
            } else {
                state.archivedInsurances.data = [...state.archivedInsurances.data, ...data];
                state.archivedInsurances.next = next;
            }
        },
        setInsurancesLoading: (state, action: PayloadAction<{ status: string; loading: boolean }>) => {
            const { status, loading } = action.payload;
            if (status === "active") {
                state.activeInsurances.loading = loading;
            } else {
                state.archivedInsurances.loading = loading;
            }
        },
        setSilentlyFetching: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetching = action.payload;
        },
        resetInsurances: state => {
            state.activeInsurances = initialState.activeInsurances;
            state.archivedInsurances = initialState.archivedInsurances;
        },
        updateInsurance: (state, action: PayloadAction<InsuranceData>) => {
            const updatedInsurance = action.payload;

            if (!updatedInsurance.id) return;

            const activeIndex = state.activeInsurances.data.findIndex(
                insurance => insurance.id === updatedInsurance.id,
            );
            if (activeIndex !== -1) {
                state.activeInsurances.data[activeIndex] = updatedInsurance;
            }

            const archivedIndex = state.archivedInsurances.data.findIndex(
                insurance => insurance.id === updatedInsurance.id,
            );
            if (archivedIndex !== -1) {
                state.archivedInsurances.data[archivedIndex] = updatedInsurance;
            }

            if (state.insuranceDetails[updatedInsurance.id]) {
                state.insuranceDetails[updatedInsurance.id] = {
                    data: updatedInsurance,
                    lastFetched: Date.now(),
                };
            }
        },
        deleteInsurance: (state, action: PayloadAction<string>) => {
            const insuranceId = action.payload;

            if (!insuranceId) return;

            state.activeInsurances.data = state.activeInsurances.data.filter(insurance => insurance.id !== insuranceId);
            if (state.activeInsurances.data.length < state.activeInsurances.count) {
                state.activeInsurances.count -= 1;
            }

            state.archivedInsurances.data = state.archivedInsurances.data.filter(
                insurance => insurance.id !== insuranceId,
            );
            if (state.archivedInsurances.data.length < state.archivedInsurances.count) {
                state.archivedInsurances.count -= 1;
            }

            delete state.insuranceDetails[insuranceId];
        },
        moveInsurance: (
            state,
            action: PayloadAction<{ insuranceId: string; fromStatus: string; toStatus: string }>,
        ) => {
            const { insuranceId, fromStatus, toStatus } = action.payload;

            if (!insuranceId) return;

            let insuranceToMove: InsuranceData | undefined;

            if (fromStatus === "active") {
                const index = state.activeInsurances.data.findIndex(insurance => insurance.id === insuranceId);
                if (index !== -1) {
                    insuranceToMove = { ...state.activeInsurances.data[index], status: toStatus };
                    state.activeInsurances.data.splice(index, 1);
                    state.activeInsurances.count -= 1;
                }
            } else {
                const index = state.archivedInsurances.data.findIndex(insurance => insurance.id === insuranceId);
                if (index !== -1) {
                    insuranceToMove = { ...state.archivedInsurances.data[index], status: toStatus };
                    state.archivedInsurances.data.splice(index, 1);
                    state.archivedInsurances.count -= 1;
                }
            }

            if (insuranceToMove) {
                if (toStatus === "active") {
                    state.activeInsurances.data.unshift(insuranceToMove);
                    state.activeInsurances.count += 1;
                } else {
                    state.archivedInsurances.data.unshift(insuranceToMove);
                    state.archivedInsurances.count += 1;
                }

                if (state.insuranceDetails[insuranceId]) {
                    state.insuranceDetails[insuranceId] = {
                        data: insuranceToMove,
                        lastFetched: Date.now(),
                    };
                }
            }
        },
        setInsuranceDetails: (state, action: PayloadAction<{ insuranceId: string; data: InsuranceData }>) => {
            const { insuranceId, data } = action.payload;

            if (!insuranceId) return;

            state.insuranceDetails[insuranceId] = {
                data,
                lastFetched: Date.now(),
            };
        },
        clearInsuranceDetails: (state, action: PayloadAction<string>) => {
            const insuranceId = action.payload;

            if (!insuranceId) return;

            delete state.insuranceDetails[insuranceId];
        },
        clearInsuranceStore: () => {
            return initialState;
        },
    },
});

export const {
    setUserId,
    setInsurances,
    appendInsurances,
    setInsurancesLoading,
    setSilentlyFetching,
    resetInsurances,
    updateInsurance,
    deleteInsurance,
    moveInsurance,
    setInsuranceDetails,
    clearInsuranceDetails,
    clearInsuranceStore,
} = insuranceSlice.actions;

export default insuranceSlice.reducer;
