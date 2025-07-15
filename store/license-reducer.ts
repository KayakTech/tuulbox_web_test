import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LicenseData } from "@/repositories/business-repository";

interface LicenseState {
    userId: string | null;
    activeLicenses: {
        data: LicenseData[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    archivedLicenses: {
        data: LicenseData[];
        count: number;
        next: string | null;
        loading: boolean;
        lastFetched: number | null;
    };
    licenseDetails: {
        [licenseId: string]: {
            data: LicenseData;
            lastFetched: number;
        };
    };
    isSilentlyFetching: boolean;
}

const initialState: LicenseState = {
    userId: null,
    activeLicenses: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    archivedLicenses: {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    },
    licenseDetails: {},
    isSilentlyFetching: false,
};

export const licenseSlice = createSlice({
    name: "licenses",
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string | null>) => {
            // If user ID changes, reset all license data
            if (state.userId !== action.payload) {
                state.userId = action.payload;
                state.activeLicenses = initialState.activeLicenses;
                state.archivedLicenses = initialState.archivedLicenses;
                state.licenseDetails = {};
            }
        },
        setLicenses: (
            state,
            action: PayloadAction<{
                status: string;
                data: LicenseData[];
                count: number;
                next: string | null;
            }>,
        ) => {
            const { status, data, count, next } = action.payload;
            if (status === "active") {
                state.activeLicenses.data = data;
                state.activeLicenses.count = count;
                state.activeLicenses.next = next;
                state.activeLicenses.lastFetched = Date.now();
            } else {
                state.archivedLicenses.data = data;
                state.archivedLicenses.count = count;
                state.archivedLicenses.next = next;
                state.archivedLicenses.lastFetched = Date.now();
            }
        },
        appendLicenses: (
            state,
            action: PayloadAction<{
                status: string;
                data: LicenseData[];
                next: string | null;
            }>,
        ) => {
            const { status, data, next } = action.payload;
            if (status === "active") {
                state.activeLicenses.data = [...state.activeLicenses.data, ...data];
                state.activeLicenses.next = next;
            } else {
                state.archivedLicenses.data = [...state.archivedLicenses.data, ...data];
                state.archivedLicenses.next = next;
            }
        },
        setLicensesLoading: (state, action: PayloadAction<{ status: string; loading: boolean }>) => {
            const { status, loading } = action.payload;
            if (status === "active") {
                state.activeLicenses.loading = loading;
            } else {
                state.archivedLicenses.loading = loading;
            }
        },
        setSilentlyFetching: (state, action: PayloadAction<boolean>) => {
            state.isSilentlyFetching = action.payload;
        },
        resetLicenses: state => {
            state.activeLicenses = initialState.activeLicenses;
            state.archivedLicenses = initialState.archivedLicenses;
        },
        updateLicense: (state, action: PayloadAction<LicenseData>) => {
            const updatedLicense = action.payload;

            // Update in active licenses
            const activeIndex = state.activeLicenses.data.findIndex(license => license.id === updatedLicense.id);
            if (activeIndex !== -1) {
                state.activeLicenses.data[activeIndex] = updatedLicense;
            }

            // Update in archived licenses
            const archivedIndex = state.archivedLicenses.data.findIndex(license => license.id === updatedLicense.id);
            if (archivedIndex !== -1) {
                state.archivedLicenses.data[archivedIndex] = updatedLicense;
            }

            //@ts-ignore
            if (state.licenseDetails[updatedLicense.id]) {
                //@ts-ignore
                state.licenseDetails[updatedLicense.id] = {
                    data: updatedLicense,
                    lastFetched: Date.now(),
                };
            }
        },
        deleteLicense: (state, action: PayloadAction<string>) => {
            const licenseId = action.payload;

            // Remove from active licenses
            state.activeLicenses.data = state.activeLicenses.data.filter(license => license.id !== licenseId);
            if (state.activeLicenses.data.length < state.activeLicenses.count) {
                state.activeLicenses.count -= 1;
            }

            // Remove from archived licenses
            state.archivedLicenses.data = state.archivedLicenses.data.filter(license => license.id !== licenseId);
            if (state.archivedLicenses.data.length < state.archivedLicenses.count) {
                state.archivedLicenses.count -= 1;
            }

            // Remove from license details cache
            delete state.licenseDetails[licenseId];
        },
        moveLicense: (state, action: PayloadAction<{ licenseId: string; fromStatus: string; toStatus: string }>) => {
            const { licenseId, fromStatus, toStatus } = action.payload;

            let licenseToMove: LicenseData | undefined;

            if (fromStatus === "active") {
                const index = state.activeLicenses.data.findIndex(license => license.id === licenseId);
                if (index !== -1) {
                    licenseToMove = { ...state.activeLicenses.data[index], status: toStatus };
                    state.activeLicenses.data.splice(index, 1);
                    state.activeLicenses.count -= 1;
                }
            } else {
                const index = state.archivedLicenses.data.findIndex(license => license.id === licenseId);
                if (index !== -1) {
                    licenseToMove = { ...state.archivedLicenses.data[index], status: toStatus };
                    state.archivedLicenses.data.splice(index, 1);
                    state.archivedLicenses.count -= 1;
                }
            }

            if (licenseToMove) {
                if (toStatus === "active") {
                    state.activeLicenses.data.unshift(licenseToMove);
                    state.activeLicenses.count += 1;
                } else {
                    state.archivedLicenses.data.unshift(licenseToMove);
                    state.archivedLicenses.count += 1;
                }

                if (state.licenseDetails[licenseId]) {
                    state.licenseDetails[licenseId] = {
                        data: licenseToMove,
                        lastFetched: Date.now(),
                    };
                }
            }
        },
        setLicenseDetails: (state, action: PayloadAction<{ licenseId: string; data: LicenseData }>) => {
            const { licenseId, data } = action.payload;
            state.licenseDetails[licenseId] = {
                data,
                lastFetched: Date.now(),
            };
        },
        clearLicenseDetails: (state, action: PayloadAction<string>) => {
            const licenseId = action.payload;
            delete state.licenseDetails[licenseId];
        },
        // Clear all license data on logout
        clearLicenseStore: () => {
            return initialState;
        },
    },
});

export const {
    setUserId,
    setLicenses,
    appendLicenses,
    setLicensesLoading,
    setSilentlyFetching,
    resetLicenses,
    updateLicense,
    deleteLicense,
    moveLicense,
    setLicenseDetails,
    clearLicenseDetails,
    clearLicenseStore,
} = licenseSlice.actions;

export default licenseSlice.reducer;
