import { combineReducers, configureStore, Reducer, AnyAction } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

import authReducer from "./auth-reducer";
import accountReducer from "./account-reducer";
import resourceReducer from "./resource-reducer";
import businessReducer from "./business-reducer";
import emailReducer from "./email-reducer";
import dataDisplayLayoutReducer from "./data-display-layout";
import searchReducer from "./search-reducer";
import settingsReducer from "./settings-reducer";
import deleteAccountReducer from "./delete-account-reducer";
import notificationsReducer from "./notification-reducer";
import calendarReducer from "./calendar-reducer";
import projectReducer from "./project-reducer";
import recentReducer from "./recent-reducer";
import favoriteReducer from "./favorite-reducer";
import projectDetailReducer from "./project-detail-reducer";
import projectDocumentReducer from "./project-document-reducer";
import storageReducer from "./storage-reducer";
import licenseReducer from "./license-reducer";
import insuranceReducer from "./insurance-reducer";
import contactReducer from "./contact-reducer";
import officersReducer from "./officers-reducer";
import linksReducer from "./links-reducer";

const createNoopStorage = () => {
    return {
        getItem(_key: string) {
            return Promise.resolve(null);
        },
        setItem(_key: string, value: any) {
            return Promise.resolve(value);
        },
        removeItem(_key: string) {
            return Promise.resolve();
        },
    };
};

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

const persistAuthStoreConfig = {
    key: "auth",
    storage,
};

const persistAccountStoreConfig = {
    key: "account",
    storage,
};

const persistResourceStoreConfig = {
    key: "resource",
    storage,
};

const persistBusinessStoreConfig = {
    key: "business",
    storage,
};

const persistDataDisplayLayoutConfig = {
    key: "dataDisplayLayout",
    storage,
};

const persistEmailStoreConfig = {
    key: "email",
    storage,
};

const persistSearchStoreConfig = {
    key: "searchResults",
    storage,
};

const persistSettingsConfig = {
    key: "settings",
    storage,
};

const persistNotificationsConfig = {
    key: "notifications",
    storage,
};

const persistCalendarConfig = {
    key: "calendar",
    storage,
};

const persistProjectsConfig = {
    key: "projects",
    storage,
};

const persistRecentsConfig = {
    key: "recents",
    storage,
};

const persistFavoritesConfig = {
    key: "favorites",
    storage,
};

const persistProjectDetailsConfig = {
    key: "projectDetails",
    storage,
};

const persistProjectDocumentsConfig = {
    key: "projectDocuments",
    storage,
};

const persistStorageConfig = {
    key: "storage",
    storage,
};

const persistLicensesConfig = {
    key: "licenses",
    storage,
};

const persistInsuranceConfig = {
    key: "insurance",
    storage,
};

const persistContactsConfig = {
    key: "contacts",
    storage,
};

const persistOfficersConfig = {
    key: "officers",
    storage,
};

const persistLinksConfig = {
    key: "links",
    storage,
};

const appReducer = combineReducers({
    auth: persistReducer(persistAuthStoreConfig, authReducer),
    account: persistReducer(persistAccountStoreConfig, accountReducer),
    resource: persistReducer(persistResourceStoreConfig, resourceReducer),
    business: persistReducer(persistBusinessStoreConfig, businessReducer),
    email: persistReducer(persistEmailStoreConfig, emailReducer),
    dataDisplayLayout: persistReducer(persistDataDisplayLayoutConfig, dataDisplayLayoutReducer),
    searchResults: persistReducer(persistSearchStoreConfig, searchReducer),
    settings: persistReducer(persistSettingsConfig, settingsReducer),
    notifications: persistReducer(persistNotificationsConfig, notificationsReducer),
    deleteAccount: deleteAccountReducer,
    calendar: persistReducer(persistCalendarConfig, calendarReducer),
    // persistence for project data
    projects: persistReducer(persistProjectsConfig, projectReducer),
    // persistence for recent  data
    recents: persistReducer(persistRecentsConfig, recentReducer),
    favorites: persistReducer(persistFavoritesConfig, favoriteReducer),
    projectDetail: persistReducer(persistProjectDetailsConfig, projectDetailReducer),
    projectDocuments: persistReducer(persistProjectDocumentsConfig, projectDocumentReducer),
    storage: persistReducer(persistStorageConfig, storageReducer),
    // persistence for license data
    licenses: persistReducer(persistLicensesConfig, licenseReducer),
    insurances: persistReducer(persistInsuranceConfig, insuranceReducer),
    contacts: persistReducer(persistContactsConfig, contactReducer),
    officers: persistReducer(persistOfficersConfig, officersReducer),
    links: persistReducer(persistLinksConfig, linksReducer),
});

const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
    if (action.type === "auth/logout") {
        // When logout action is dispatched, reset the state
        return appReducer(undefined, action);
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: [thunk],
});

export const persistor = persistStore(store);

export const clearProjectsFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:projects");
    }
};

export const clearRecentsFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:recents");
    }
};

export const clearFavoritesFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:favorites");
    }
};

export const clearProjectDetailsFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:projectDetails");
    }
};

export const clearProjectDocumentsFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:projectDocuments");
    }
};

export const clearStorageFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:storage");
    }
};

export const clearLicensesFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:licenses");
    }
};

export const clearInsurancesFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:insurance");
    }
};

export const clearContactsFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:contacts");
    }
};

export const clearOfficersFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:officers");
    }
};

export const clearLinksFromLocalStorage = () => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("persist:links");
    }
};

export type RootState = ReturnType<typeof appReducer>;
export type AppDispatch = typeof store.dispatch;
