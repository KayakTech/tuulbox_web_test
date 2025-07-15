import axios from "axios";
import { AxiosClient } from "./utils/clients";

import { store } from "./store";
import AuthRepository from "./repositories/auth-repository";
import AccountRepository from "./repositories/account-repository";
import ResourceRepository from "./repositories/resource-repository";
import BusinessRepository from "./repositories/business-repository";
import ProjectRepository from "./repositories/project-repository";
import SubcontractorRepository from "./repositories/subcontractor-repository";
import ContactRepository from "./repositories/contact-repositories";
import { authActions } from "./store/auth-reducer";
import { businessActions } from "./store/business-reducer";
import AuthService from "./services/auth-services";
import AccountServices from "./services/account-services";
import ResourceService from "./services/resource-service";
import BusinessService from "./services/business-service";
import ProjectService from "./services/project-service";
import SubcontractorService from "./services/subcontractor-service";
import ContactService from "./services/contact-service";
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { accountActions } from "./store/account-reducer";
import { resourceActions } from "./store/resource-reducer";
import StorageRepository from "./repositories/storage-repository";
import StorageService from "./services/storage-services";
import CommunicationsRepository from "./repositories/communications-repository";
import CommunicationsService from "./services/communications-service";
import IntegrationRepository from "./repositories/integration-repository";
import IntegrationServices from "./services/integration-services";
import SearchRepository from "./repositories/search-repository";
import SearchServices from "./services/search-services";
import SettingsService from "./services/settings-service";
import SettingsRepository from "./repositories/settings-reposiroty";
import { settingsActions } from "./store/settings-reducer";
import FeedbackRepository from "./repositories/feedback-repository";
import FeedbackService from "./services/feedback-service";
import FavoritesRepository from "./repositories/favorites-repository";
import FavoritesService from "./services/favorites-service";
import WebsiteRepository from "./repositories/website-repository";
import WebsiteService from "./services/website-service";
import CalendarRepository from "./repositories/calendar-repository";
import CalendarService from "./services/calendar-service";
import { calendarActions } from "./store/calendar-reducer";
import RecentRepository from "./repositories/recent-repository";
import RecentService from "./services/recent-service";
import NotificationsRepository from "./repositories/notifications-repository";
import NotificationsService from "./services/notifications-service";
import { notificationActions } from "./store/notification-reducer";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}

// client
const client = new AxiosClient(axios);

// firebase

const firebaseConfig = {
    apiKey: "AIzaSyCUO9yNFrEydRbJmBeYXEoF3qyrquy6-ZA",
    authDomain: "tuulbox-bf75a.firebaseapp.com",
    projectId: "tuulbox-bf75a",
    databaseURL: "https://tuulbox-bf75a.firebaseio.com",
    storageBucket: "tuulbox-bf75a.appspot.com",
    messagingSenderId: "1071166185668",
    appId: "1:1071166185668:web:1e32220f1aa5aeaba8e991",
    measurementId: "G-5S2K953LZ7",
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

const isDev = process.env.NODE_ENV === "development";
let analytics;
if (typeof window !== "undefined" && !isDev) {
    console.info("Initializing Firebase Analytics");
    analytics = getAnalytics(firebaseApp);
}

// Repositoris
const authRepository = new AuthRepository(client);
const accountRepository = new AccountRepository(client);
const resourceRepository = new ResourceRepository(client);
const storageRepository = new StorageRepository(client, axios);
const businessRepository = new BusinessRepository(client, axios);
const projectRepository = new ProjectRepository(client);
const contactRepository = new ContactRepository(client);
const communicationsRepository = new CommunicationsRepository(client);
const integrationRepository = new IntegrationRepository(client);
const subcontractorRepository = new SubcontractorRepository(client);
const searchRepository = new SearchRepository(client);
const settingsRepository = new SettingsRepository(client);
const feedbackRepository = new FeedbackRepository(client);
const favoritesRepository = new FavoritesRepository(client);
const websiteRepository = new WebsiteRepository(client);
const calendarRepository = new CalendarRepository(client);
const recentRepository = new RecentRepository(client);
const notificationsRepository = new NotificationsRepository(client);

// services
const authService = new AuthService(authRepository, store, authActions);
const accountService = new AccountServices(accountRepository, store, accountActions);
const resourceService = new ResourceService(resourceRepository, store, resourceActions);
const storageService = new StorageService(storageRepository, resourceRepository, store);
const businessService = new BusinessService(businessRepository, store, businessActions);
const projectService = new ProjectService(projectRepository);
const contactService = new ContactService(contactRepository);
const communicationsService = new CommunicationsService(communicationsRepository);
const integrationService = new IntegrationServices(integrationRepository, store);
const subcontractorService = new SubcontractorService(subcontractorRepository);
const searchService = new SearchServices(searchRepository, store, accountActions);
const settingsService = new SettingsService(settingsRepository, store, settingsActions);
const feedbackService = new FeedbackService(feedbackRepository);
const favoritesService = new FavoritesService(favoritesRepository);
const websiteService = new WebsiteService(websiteRepository);
const calendarService = new CalendarService(calendarRepository, store, calendarActions, settingsActions);
const recentService = new RecentService(recentRepository);
const notificationsService = new NotificationsService(notificationsRepository, store, notificationActions);

client.onLogout = () => {
    authService.logout();
    location.href = "/login";
};

const DI = {
    firebaseAuth,
    firebaseConfig,
    authService,
    accountService,
    resourceService,
    storageService,
    businessService,
    projectService,
    contactService,
    communicationsService,
    integrationService,
    subcontractorService,
    searchService,
    settingsService,
    feedbackService,
    favoritesService,
    websiteService,
    calendarService,
    recentService,
    notificationsService,
    analytics,
};

export default DI;
