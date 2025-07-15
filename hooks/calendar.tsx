import DI from "@/di-container";
import {
    apiErrorMessage,
    convertIsoTo24HourTime,
    getTimeDifference,
    getUrlQuery,
    isEmptyObject,
    isObjectArray,
    isStartTimeBeforeEndTime,
} from "@/helpers";
import { CalendarEvent, EventPayload } from "@/repositories/calendar-repository";
import { useReducer, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { calendarActions } from "@/store/calendar-reducer";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { TagInput } from "@/components/ResourceForm";
import useContact from "./useContact";
import { Contact } from "@/repositories/contact-repositories";
import moment from "moment";
import _, { round } from "lodash";
import useSearchForm from "./searchForm";
import { AxiosError } from "axios";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/router";

type UseCalendarProps = {
    action?: string;
};

const useCalendar = ({ action }: UseCalendarProps) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { searchResults } = useSelector((state: RootState) => state.searchResults);
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { search, isSearching, setIsSearching, searchTerm } = useSearchForm();

    const { hasIntegratedCalendar } = useSelector((state: RootState) => state.calendar);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showDisconnectCalendarModal, setShowDisconnectCalendarModal] = useState<boolean>(false);
    const [hasSyncedGoogleCalendar, setHasSyncedGoogleCalendar] = useState<boolean>(false);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [calendarEventId, setCalendarEventId] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [eventToDelete, setEventToDelete] = useState<CalendarEvent>();
    const [syncedCalendarData, setSyncedCalendarData] = useState<any>();
    const [currentView, setCurrentView] = useState<string>("");
    const [contactSuggestions, setContactSuggestions] = useState<any[]>([]);
    const [clickedEvents, setClickedEvents] = useState<Partial<CalendarEvent>[]>([]);
    const [clikedDate, setClickedDate] = useState<string>("");
    const [timeZones, setTimeZones] = useState<any[]>([]);
    const tagsSelector = useRef(null);
    const [errors, setErrors] = useState<any>(null);
    const [isValidDuration, setIsValidDuration] = useState<boolean>(false);
    const { showToast } = useToast();

    const [calendarEvent, setCalendarEvent] = useReducer(
        (state: Partial<CalendarEvent>, newState: Partial<CalendarEvent>) => ({ ...state, ...newState }),
        {
            title: "",
            timezone: "",
            duration: "",
            startDate: "",
            startTime: "",
            endDate: "",
            endTime: "",
            description: "",
            contacts: [],
            autoFocus: false,
            googleEventId: "",
            calendarId: "",
        },
    );

    async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        setErrorMessage("");
        setErrors(null);

        if (!calendarEvent.startDate) {
            setErrorMessage("Please select the event start date");
            return;
        }
        if (!calendarEvent.startTime) {
            setErrorMessage("Please select the event start time");
            return;
        }

        if (!calendarEvent.endDate) {
            setErrorMessage("Please select the event end date");
            return;
        }
        if (!calendarEvent.endTime) {
            setErrorMessage("Please select the event end time");
            return;
        }

        setIsSaving(true);

        let attendees = [];
        if (calendarEvent.contacts?.length) {
            attendees = calendarEvent?.contacts?.map(contact => {
                return contact.value;
            });
        }

        let payload = {
            id: calendarEventId,
            summary: calendarEvent.title,
            description: calendarEvent.description,
            //@ts-ignore
            start: convertDateStringToIsoString(calendarEvent?.startDate, calendarEvent?.startTime)?.toString(),
            //@ts-ignore
            end: convertDateStringToIsoString(calendarEvent?.endDate, calendarEvent?.endTime)?.toString(),
            attendees,
            timezone: calendarEvent.timezone,
            duration: getTimeDifference(calendarEvent?.startTime, calendarEvent?.endTime),
        } as EventPayload;

        if (action === "edit") {
            payload.calendarId = calendarEvent?.calendarId;
            updateEvent(payload, { callbackUrl: `/calendar` });
        }

        action === "add" && addEvent(payload, { callbackUrl: `/calendar` });
    }

    async function addEvent(payload: EventPayload, props?: { callbackUrl: string }) {
        try {
            const res = await DI.calendarService.addCalendarEvent(payload);
            showToast({ heading: "Success", message: "Event added.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error, false));
        } finally {
            setIsSaving(false);
        }
    }

    async function updateEvent(payload: EventPayload, props?: { callbackUrl: string }) {
        try {
            const res = await DI.calendarService.updateCalendarEvent(payload);
            showToast({ heading: "Success", message: "Event updated.", variant: "success" });
            if (props?.callbackUrl) {
                router.push(props.callbackUrl);
            }
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error, false));
            setErrors(error.response.data.data);
        } finally {
            setIsSaving(false);
        }
    }

    async function getCalendarIntegration() {
        setIsLoading(true);
        try {
            const res = await DI.calendarService.getCalendarIntegration();
            if (res?.data?.hasIntegration) {
                setHasSyncedGoogleCalendar(true);
                setSyncedCalendarData(res.data);
                getCalendarEvents();

                if (getUrlQuery("status") === "success") {
                    setCurrentView("INTEGRATION_SUCCESS");
                }
                dispatch(calendarActions.setHasIntegration(true));

                return;
            }

            if (getUrlQuery("status") === "failure") {
                setCurrentView("INTEGRATION_FAILURE");
            }
            setHasSyncedGoogleCalendar(false);
            setIsLoading(false);
        } catch (error) {
            setHasSyncedGoogleCalendar(false);
            setCurrentView("INTEGRATION_FAILURE");
            setIsLoading(false);
        }
    }

    async function syncGoogleCalendar() {
        setIsSyncing(true);
        try {
            const res = await DI.calendarService.syncGoogleCalendar();
            location.href = res.data.redirectUrl;
        } catch (error) {}
    }

    function redirectToGoogleCalendar() {
        // open in new tab
        window.open("https://calendar.google.com/calendar/u/0/r", "_blank");
    }

    async function getCalendarEvents() {
        setIsLoading(true);
        try {
            const res = await DI.calendarService.getCalendarEvents();

            let events: CalendarEvent[] = [];
            res.data.results.map((event: CalendarEvent) => {
                events.push({
                    ...event,
                    title: event.summary,
                });
            });
            setCalendarEvents(events);
        } catch (error: any) {
            if (error?.response?.status === 500) {
                disconnectCalendar();
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function getCalendarEvent(eventId: string, hideLoader?: boolean) {
        !hideLoader && setIsLoading(true);
        try {
            const res = await DI.calendarService.getCalendarEvent(eventId);
            setCalendarEvent({
                title: res.data.summary,
                description: res.data.description,
                startDate: res.data.start,
                //@ts-ignore
                startTime: convertIsoTo24HourTime(res?.data?.start),
                endDate: res.data.end,
                duration: res.data.duration,
                timezone: res.data.timezone,
                //@ts-ignore
                endTime: convertIsoTo24HourTime(res?.data?.end),
                attendees: res?.data?.originalData?.attendees
                    ? isObjectArray(res?.data?.originalData?.attendees)
                        ? res?.data?.originalData?.attendees?.map((attendee: any) => attendee.email)
                        : res?.data?.originalData?.attendees
                    : [],
                contacts: getAttendeesAsTags(res?.data?.originalData?.attendees ?? []),
                calendarId: res?.data?.calendarId,
            });
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    function triggerDeleteModal(event: CalendarEvent) {
        setEventToDelete(event);
        setShowDeleteModal(true);
    }

    function triggerDisconnectModal() {
        setShowDisconnectCalendarModal(true);
    }

    async function deleteCalendarEvent(event: CalendarEvent) {
        let payload = _.cloneDeep(event);
        if (!payload.calendarId) {
            payload.calendarId = syncedCalendarData?.email;
        }

        setIsDeleting(true);
        try {
            const res = await DI.calendarService.deleteCalendarEvent(payload);
            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["calendar_events"] });
            } else {
                getCalendarEvents();
            }
            setShowDeleteModal(false);
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    }

    async function disconnectCalendar() {
        setIsDeleting(true);
        try {
            const res = await DI.calendarService.disconnectCalendarIntegration();
            dispatch(calendarActions.setHasIntegration(false));
            getCalendarIntegration();
        } catch (error) {
        } finally {
            setShowDisconnectCalendarModal(false);
            setIsDeleting(false);
        }
    }

    function handleTagsChange(newTags: any) {
        if (newTags.length > 5) {
            newTags.pop();
        }
        if (newTags.length >= 5) {
            // @ts-ignore
            tagsSelector?.current?.blur();
        }
        setCalendarEvent({ contacts: newTags, autoFocus: true });
    }

    async function getContacts() {
        try {
            const response = await DI.contactService.getContacts(1);
            if (response.data.results.length) {
                // @ts-ignore
                let preparedTags: TagInput[] = response.data.results.map((tag: Contact) => {
                    return { value: tag.email, label: tag.firstName };
                });
                setContactSuggestions(preparedTags);
            }
        } catch (error) {}
    }
    function getAttendeesAsTags(attendees?: string[]) {
        let preparedTags = attendees?.map((tag: any) => {
            return { value: tag, label: tag };
        });
        return preparedTags;
    }

    function onCalendarEventClick(value: any) {
        const event = value.event;
        const start = event.range || event.start;
        const end = event.range || event.end;

        setClickedDate(event.startStr || event.start);

        const events = searchResults?.calendarEvents?.results.length
            ? searchResults?.calendarEvents?.results
            : calendarEvents;

        const filteredEvents = events.filter(event => {
            return event.id === value.event.id;
        });
        setClickedEvents(filteredEvents);

        if (filteredEvents.length) {
            getCalendarEvent(`${filteredEvents[0].id}`, true);
            setShowModal(true);
        }
    }

    async function getTimezones() {
        try {
            const res = await DI.calendarService.getTimezones();
            setTimeZones(res.data.timezones);
        } catch (error) {}
    }

    function onChangeStartTime(time: string) {
        if (calendarEvent.endTime && !isStartTimeBeforeEndTime(time, calendarEvent.endTime)) {
            setCalendarEvent({ endTime: "" });
        }
        setCalendarEvent({ startTime: time });
    }
    function onChangeEndTime(time: string) {
        if (calendarEvent.startTime && isStartTimeBeforeEndTime(calendarEvent.startTime, time)) {
            setCalendarEvent({ endTime: time });
        }
    }

    function onDurationChange(duration: string) {
        setCalendarEvent({ duration: duration });
        const range = setTimeRangeInputs(duration);
        setCalendarEvent({ startTime: range.startTime, endTime: range.formattedEndTime });
    }

    function setTimeRangeInputs(duration: string) {
        const now = new Date();
        const unit = duration.split(" ").pop();
        const range = parseInt(duration.split(" ")[0]);

        // Set the start time to the current time
        const startTime = now.toTimeString().slice(0, 5);

        // Calculate the end time based on the range and unit
        let endTime = new Date(now);
        if (unit?.toLowerCase() === "minutes") {
            endTime.setMinutes(now.getMinutes() + range);
        } else if (["hour", "hours"].includes(`${unit?.toLowerCase()}`)) {
            endTime.setHours(now.getHours() + range);
        }
        const formattedEndTime = endTime.toTimeString().slice(0, 5); // Get "HH:MM" from the end time

        return { startTime, formattedEndTime }; // Optional: to return for further use
    }

    return {
        getCalendarIntegration,
        syncGoogleCalendar,
        redirectToGoogleCalendar,
        isLoading,
        isSyncing,
        isSaving,
        setIsSaving,
        setIsLoading,
        hasSyncedGoogleCalendar,
        setHasSyncedGoogleCalendar,
        getCalendarEvents,
        calendarEvent,
        setCalendarEvent,
        handleSubmit,
        errorMessage,
        showFeedbackModal,
        setShowFeedbackModal,
        calendarEvents,
        setCalendarEvents,
        getCalendarEvent,
        calendarEventId,
        setCalendarEventId,
        deleteCalendarEvent,
        triggerDeleteModal,
        isDeleting,
        setIsDeleting,
        showDeleteModal,
        setShowDeleteModal,
        syncedCalendarData,
        showDisconnectCalendarModal,
        setShowDisconnectCalendarModal,
        triggerDisconnectModal,
        disconnectCalendar,
        currentView,
        setCurrentView,
        contactSuggestions,
        handleTagsChange,
        getContacts,
        getAttendeesAsTags,
        clickedEvents,
        clikedDate,
        showModal,
        setShowModal,
        onCalendarEventClick,
        getTimezones,
        timeZones,
        tagsSelector,
        errors,
        searchResults,
        isValidDuration,
        setIsValidDuration,
        onChangeEndTime,
        onChangeStartTime,
        onDurationChange,
        listOrGrid,
        eventToDelete,
        search,
        isSearching,
        setIsSearching,
        searchTerm,
    };
};

export default useCalendar;
