import DI from "@/di-container";
import { OVERVIEW_COUNTS } from "@/helpers/constants";
import { Project } from "@/repositories/project-repository";
import { OverviewCounts } from "@/types";
import { useState } from "react";
import { RecentActivity } from "@/repositories/recent-repository";
import useFavorites from "./favorites";
import useNotifications from "./notifications";
import { NotificationObject, Notifications } from "@/repositories/notifications-repository";
import useCalendar from "./calendar";
import moment from "moment";
import { CalendarEvent } from "@/repositories/calendar-repository";
import { useToast } from "@/context/ToastContext";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const useOverview = () => {
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
    const [date, setDate] = useState<Value>(new Date());
    const [showModal, setShowModal] = useState<boolean>(false);
    const [overviewCounts, setOverviewCounts] = useState<OverviewCounts>(OVERVIEW_COUNTS);
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [clickedEvents, setClickedEvents] = useState<Partial<CalendarEvent>[]>([]);
    const [clikedDate, setClickedDate] = useState<string>("");
    const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(true);
    const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);
    const [isLoadingRecentActivities, setIsLoadingRecentActivities] = useState<boolean>(true);
    const [overviewProjects, setOverviewProjects] = useState<Project[]>([]);

    const { showToast } = useToast();

    async function getCounts() {
        setIsLoadingCounts(true);
        setIsLoadingProjects(true);
        const [projects, expirations, reminders] = await Promise.all([getProjects, getExpiredFiles, getNotifications]);
        const res1 = await projects();
        if (res1?.results.length) {
            setOverviewProjects(res1.results);
            setIsLoadingProjects(false);
        }
        const res2 = await expirations();
        await reminders();

        const projectCount = res1?.count;
        const expirationCount = res2.data.count;
        const remindersCount =
            notifications?.filter((data: NotificationObject) => data.category.split("_")[1] === "reminders").length ??
            0;

        let counts = { ...overviewCounts };
        counts.projects.count = projectCount ?? 0;
        counts.expirations.count = expirationCount;
        counts.reminders.count = remindersCount;
        setOverviewCounts(counts);
        setIsLoadingCounts(false);
    }
    async function getProjects() {
        try {
            setIsLoadingProjects(true);
            const res = await DI.projectService.getProjects(1);
            setOverviewProjects(res.results);
            return res;
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to get projects.", variant: "danger" });
        } finally {
            setIsLoadingProjects(false);
        }
    }

    async function getExpiredFiles() {
        return await DI.storageService.getExpiredFiles(1);
    }

    async function getNotifications() {
        return await DI.notificationsService.getNotifications();
    }

    async function getRecentActivities() {
        setIsLoadingRecentActivities(true);
        try {
            const res = await DI.recentService.getRecentActivities(1);

            let recents: any = res.data;
            let newData: RecentActivity[] = [];

            Object.keys(recents).forEach(key => {
                const innerObject: any = recents[key];

                if (key.toLowerCase() === "today" && recents[key].length) {
                    newData.push(...innerObject);
                }
                if (key.toLowerCase() === "yesterday" && recents[key].length) {
                    newData.push(...innerObject);
                }
                if (key.toLowerCase() === "this week" && recents[key].length) {
                    newData.push(...innerObject);
                }
                if (key.toLowerCase() === "last week" && recents[key].length) {
                    newData.push(...innerObject);
                }
                if (key.toLowerCase() === "this month" && recents[key].length) {
                    newData.push(...innerObject);
                }
            });

            setRecentActivities(newData);
        } catch (error) {
        } finally {
            setIsLoadingRecentActivities(false);
        }
    }

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
        setClickedDate(value);

        const clickedDate = moment(value);
        const filteredEvents = calendarEvents.filter(event => {
            const startDate = moment(event.start);
            return clickedDate.isSame(startDate, "day");
        });
        setClickedEvents(filteredEvents);

        if (filteredEvents.length) {
            // get event to add to recent viewed
            getCalendarEvent(`${filteredEvents[0].id}`);
            setShowModal(true);
        }
    }

    return {
        setDate,
        date,
        showModal,
        setShowModal,
        overviewCounts,
        setOverviewCounts,
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
        clickedEvents,
        clikedDate,
        isLoadingCounts,
        isLoadingRecentActivities,
        isLoadingFavorites,
        overviewProjects,
        isLoadingProjects,
    };
};

export default useOverview;
