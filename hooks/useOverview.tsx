import DI from "@/di-container";
import { OVERVIEW_COUNTS } from "@/helpers/constants";
import { Project } from "@/repositories/project-repository";
import { OverviewCounts } from "@/types";
import { useEffect, useMemo, useReducer } from "react";
import { RecentActivity, RecentActivityDestructuredObject } from "@/repositories/recent-repository";
import useFavorites from "./favorites";
import useNotifications from "./notifications";
import { NotificationObject } from "@/repositories/notifications-repository";
import useCalendar from "./calendar";
import moment from "moment";
import { CalendarEvent } from "@/repositories/calendar-repository";
import { useToast } from "@/context/ToastContext";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setRecentActivities, setRecentActivitiesLoading, setSilentlyFetchingRecents } from "@/store/recent-reducer";
import { isEmptyObject } from "@/helpers";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

interface OverviewLocalState {
    date: Value;
    showModal: boolean;
    overviewCounts: OverviewCounts;
    clickedEvents: Partial<CalendarEvent>[];
    clikedDate: string;
    isLoadingCounts: boolean;
    isLoadingProjects: boolean;
    overviewProjects: Project[];
    isInitialLoadingRecents: boolean;
}

const INITIAL_STATE: OverviewLocalState = {
    date: new Date(),
    showModal: false,
    overviewCounts: OVERVIEW_COUNTS,
    clickedEvents: [],
    clikedDate: "",
    isLoadingCounts: true,
    isLoadingProjects: true,
    overviewProjects: [],
    isInitialLoadingRecents: false,
};

const useOverview = () => {
    const dispatch = useDispatch();
    const {
        recentActivities: { data: recentActivitiesData, loading: isLoadingRecentsFromStore, lastFetched },
        isSilentlyFetchingRecents,
    } = useSelector((state: RootState) => state.recents);

    const [localState, setLocalState] = useReducer(
        (state: OverviewLocalState, newState: Partial<OverviewLocalState>) => ({ ...state, ...newState }),
        INITIAL_STATE,
    );

    const {
        getFavorites,
        favorites,
        triggerRemoveFromFavoritesModal,
        showRemoveFavoriteModal,
        setShowRemoveFavoriteModal,
        removeFavorite,
        isRemovingFavorite,
        isLoadingFavorites,
    } = useFavorites();

    const { notifications } = useNotifications();
    const { getCalendarEvents, calendarEvents, getCalendarEvent } = useCalendar({});
    const { showToast } = useToast();

    //  converts structured recent data to a flat array for the Overview component
    const recentActivities: RecentActivity[] = useMemo(() => {
        if (!recentActivitiesData) return [];

        const result: RecentActivity[] = [];

        // extract recents from each time period .. check if each property is an array before spreading
        if (recentActivitiesData.today && Array.isArray(recentActivitiesData.today)) {
            result.push(...recentActivitiesData.today);
        }
        if (recentActivitiesData.yesterday && Array.isArray(recentActivitiesData.yesterday)) {
            result.push(...recentActivitiesData.yesterday);
        }
        if (recentActivitiesData.thisWeek && Array.isArray(recentActivitiesData.thisWeek)) {
            result.push(...recentActivitiesData.thisWeek);
        }
        if (recentActivitiesData.lastWeek && Array.isArray(recentActivitiesData.lastWeek)) {
            result.push(...recentActivitiesData.lastWeek);
        }
        if (recentActivitiesData.thisMonth && Array.isArray(recentActivitiesData.thisMonth)) {
            result.push(...recentActivitiesData.thisMonth);
        }

        return result;
    }, [recentActivitiesData]);

    async function getCounts() {
        setLocalState({ isLoadingCounts: true, isLoadingProjects: true });
        const [projects, expirations, reminders] = await Promise.all([getProjects, getExpiredFiles, getNotifications]);
        const res1 = await projects();
        if (res1?.results.length) {
            setLocalState({ overviewProjects: res1.results, isLoadingProjects: false });
        }
        const res2 = await expirations();
        await reminders();

        const projectCount = res1?.count;
        const expirationCount = res2.data.count;
        const remindersCount =
            notifications?.filter((data: NotificationObject) => data.category.split("_")[1] === "reminders").length ??
            0;

        let counts = { ...localState.overviewCounts };
        counts.projects.count = projectCount ?? 0;
        counts.expirations.count = expirationCount;
        counts.reminders.count = remindersCount;
        setLocalState({ overviewCounts: counts, isLoadingCounts: false });
    }

    async function getProjects() {
        try {
            setLocalState({ isLoadingProjects: true });
            const res = await DI.projectService.getProjects(1);
            setLocalState({ overviewProjects: res.results });
            return res;
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to get projects.", variant: "danger" });
        } finally {
            setLocalState({ isLoadingProjects: false });
        }
    }

    async function getExpiredFiles() {
        return await DI.storageService.getExpiredFiles(1);
    }

    async function getNotifications() {
        return await DI.notificationsService.getNotifications();
    }

    function processRecentActivities(recents: any) {
        let newData: any = {};

        Object.keys(recents).forEach(async key => {
            const recent = recents[key];

            if (key.toLowerCase() === "today") {
                newData.today = recent;
            }
            if (key.toLowerCase() === "yesterday") {
                newData.yesterday = recent;
            }
            if (["this week", "thisweek"].includes(key.toLowerCase())) {
                newData.thisWeek = recent;
            }
            if (["last week", "lastweek"].includes(key.toLowerCase())) {
                newData.lastWeek = recent;
            }
            if (["this month", "thismonth"].includes(key.toLowerCase())) {
                newData.thisMonth = recent;
            }
            if (["this year", "thisyear"].includes(key.toLowerCase())) {
                newData.thisYear = recent;
            }
            if (["last year", "lastyear"].includes(key.toLowerCase())) {
                newData.lastYear = recent;
            }
            if (["older"].includes(key.toLowerCase())) {
                newData.older = recent;
            }
        });

        return isEmptyObject(newData) ? null : newData;
    }

    async function getRecentActivities(options: { resetData?: boolean } = {}) {
        const { resetData = false } = options;

        // if don't have data yet, show the initial loading state
        if (resetData || !recentActivitiesData) {
            setLocalState({ isInitialLoadingRecents: true });
            dispatch(setRecentActivitiesLoading(true));
        } else {
            // else do a silent background fetch
            dispatch(setSilentlyFetchingRecents(true));
        }

        try {
            const res = await DI.recentService.getRecentActivities(1);
            const processedResults = processRecentActivities(res.data);

            dispatch(
                setRecentActivities({
                    data: processedResults,
                }),
            );
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to get recent activities.", variant: "danger" });
        } finally {
            dispatch(setRecentActivitiesLoading(false));
            dispatch(setSilentlyFetchingRecents(false));
            setLocalState({ isInitialLoadingRecents: false });
        }
    }

    //  check if stale data and automatically refreshing
    useEffect(() => {
        // check if we have data
        if (recentActivitiesData) {
            setLocalState({ isInitialLoadingRecents: false });

            // check if data is stale and needs a refresh
            const isDataStale = lastFetched && Date.now() - lastFetched > CACHE_EXPIRATION;

            // if data is stale, do a background refresh
            if (isDataStale) {
                getRecentActivities({ resetData: true });
            }
        } else {
            // no data in store? Do a normal fetch with loading indicators
            setLocalState({ isInitialLoadingRecents: true });
            getRecentActivities({ resetData: true });
        }
    }, []);

    function getRecentObjectUrl(recent: RecentActivity) {
        if (recent.category.toLocaleLowerCase() === "calendar_events") {
            return `/calendar/events/edit/${recent.originalObject.id}`;
        }
        if (recent.category.toLocaleLowerCase() === "projects") {
            return `/projects/edit/${recent.originalObject.id}`;
        }
        if (recent.category.toLocaleLowerCase() === "insurances") {
            return `/business/insurance/edit/${recent.originalObject.id}`;
        }
        if (recent.category.toLocaleLowerCase() === "storages") {
            return `/storage/edit/${recent.originalObject.id}`;
        }
        if (recent.category.toLocaleLowerCase() === "contacts") {
            return `/contacts/edit/${recent.originalObject.id}`;
        }
        return "javascript:void(0)";
    }

    const tileClassName = (props: { date: any; view: string }) => {
        const today = moment();
        // Add class to tiles in month view only
        if (props.view === "month") {
            // Check if the date is in the list of event dates
            if (
                calendarEvents.some(
                    eventDate =>
                        moment(props.date).isSame(moment(eventDate.start), "day") &&
                        !moment(props.date).isSame(today, "day"),
                )
            ) {
                return `calendar-event-marker`;
            }
        }
    };

    function onCalendarDayClick(value: any) {
        setLocalState({
            clikedDate: value,
        });

        const clickedDate = moment(value);
        const filteredEvents = calendarEvents.filter(event => {
            const startDate = moment(event.start);
            return clickedDate.isSame(startDate, "day");
        });
        setLocalState({ clickedEvents: filteredEvents });

        if (filteredEvents.length) {
            // get event to add to recent viewed
            getCalendarEvent(`${filteredEvents[0].id}`);
            setLocalState({ showModal: true });
        }
    }

    return {
        setDate: (date: Value) => setLocalState({ date }),
        date: localState.date,
        showModal: localState.showModal,
        setShowModal: (showModal: boolean) => setLocalState({ showModal }),
        overviewCounts: localState.overviewCounts,
        setOverviewCounts: (overviewCounts: OverviewCounts) => setLocalState({ overviewCounts }),
        getProjects,
        getExpiredFiles,
        getNotifications,
        getCounts,
        getRecentActivities,
        recentActivities,
        getRecentObjectUrl,
        getFavorites,
        favorites,
        triggerRemoveFromFavoritesModal,
        showRemoveFavoriteModal,
        setShowRemoveFavoriteModal,
        removeFavorite,
        isRemovingFavorite,
        notifications,
        getCalendarEvents,
        calendarEvents,
        tileClassName,
        onCalendarDayClick,
        clickedEvents: localState.clickedEvents,
        clikedDate: localState.clikedDate,
        isLoadingCounts: localState.isLoadingCounts,
        isLoadingRecentActivities: isLoadingRecentsFromStore || localState.isInitialLoadingRecents,
        isLoadingFavorites,
        overviewProjects: localState.overviewProjects,
        isLoadingProjects: localState.isLoadingProjects,
        isSilentlyFetchingRecents,
    };
};

export default useOverview;
