import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import { Button, Col, Container, Dropdown, Row } from "react-bootstrap";
import Image from "next/image";
import Header from "@/components/Header";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { MoreHorizontal, Trash } from "react-feather";
import { Iconly } from "react-iconly";
import { useEffect, useState } from "react";
import PageLoader from "@/components/PageLoader";
import { convertIsoToFriendlyTime, getUrlQuery, isMobileDevice, isTabletDevice } from "@/helpers";
import DeleteModal from "@/components/DeleteModal";
import useCalendar from "@/hooks/calendar";
import YouAreSignedInAs from "@/components/YouAreSignedInAs";
import AuthSuccessState from "@/components/AuthSuccessState";
import ErrorStatePage from "@/components/ErrorStatePage";
import EventModal from "@/components/EventModal";

import { CalendarEvent } from "@/repositories/calendar-repository";
import { SearchNormal1, Calendar } from "iconsax-react";
import { useRouter } from "next/router";
import EventCard from "@/components/EventCard";

export default function Events() {
    const router = useRouter();

    const {
        getCalendarIntegration,
        syncGoogleCalendar,
        redirectToGoogleCalendar,
        isLoading,
        hasSyncedGoogleCalendar,
        isSyncing,
        calendarEvents,
        isDeleting,
        triggerDeleteModal,
        showDeleteModal,
        setShowDeleteModal,
        deleteCalendarEvent,
        syncedCalendarData,
        showDisconnectCalendarModal,
        setShowDisconnectCalendarModal,
        triggerDisconnectModal,
        disconnectCalendar,
        currentView,
        setCurrentView,
        showModal,
        setShowModal,
        clickedEvents,
        clikedDate,
        onCalendarEventClick,
        setIsLoading,
        searchResults,
        listOrGrid,
        eventToDelete,
        search,
        isSearching,
        searchTerm,
    } = useCalendar({});

    function init() {
        if (getUrlQuery("query")) {
            // @ts-ignore
            search({ query: getUrlQuery("query"), categories: ["calendar_events"] });
        }
        getCalendarIntegration();
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <DashboardLayout breadCrumbs={[{ name: "Calendar" }]} pageTitle="Calendar">
            {isLoading ? (
                <PageLoader />
            ) : getUrlQuery("status") && getUrlQuery("status") === "failure" ? (
                <div className="h-75vh d-flex justify-content-around align-items-center">
                    <span>
                        {getUrlQuery("status") === "failure" && (
                            <ErrorStatePage
                                title={"Connection Failed"}
                                description="Something went wrong and your google calendar failed to connect with tuulbox."
                                buttonText="Try to reconnect"
                                secondaryText="Got it"
                                secondaryButtonLink="/overview"
                                onPrimaryButtonClick={redirectToGoogleCalendar}
                            />
                        )}

                        {getUrlQuery("status") === "success" && (
                            <AuthSuccessState
                                title={"Connection successful"}
                                description="Your google calendar has been successfully synced with tuulbox."
                                buttonText="Go to Calendar"
                                buttonLink="/calendar"
                            />
                        )}
                    </span>
                </div>
            ) : hasSyncedGoogleCalendar ? (
                <>
                    <Header
                        buttonText="New Event"
                        showListOrGrid={!getUrlQuery("query")}
                        searchPlaceholder="Search Calendar"
                        buttonUrl="/calendar/events/add"
                        listOrGridKey="event"
                        onSearch={(searchTerm: string) =>
                            search({ query: searchTerm, categories: ["calendar_events"] })
                        }
                        isSearching={isSearching}
                        onClearSearch={getCalendarIntegration}
                        showSearchForm={calendarEvents?.length > 0 || searchResults != null}
                    />

                    <YouAreSignedInAs
                        email={syncedCalendarData?.email?.toLowerCase()}
                        onDisconnect={() => triggerDisconnectModal()}
                    />

                    {isSearching ? (
                        <PageLoader />
                    ) : (
                        <>
                            {getUrlQuery("query") && searchResults?.calendarEvents?.results?.length ? (
                                <Container fluid className={`mt-4`}>
                                    <p className="m-0">Events ({searchResults?.calendarEvents?.results.length})</p>
                                </Container>
                            ) : null}

                            {isLoading ? (
                                <PageLoader />
                            ) : (
                                <>
                                    {searchResults?.calendarEvents?.results?.length ||
                                    (calendarEvents.length && !getUrlQuery("query")) ? (
                                        getUrlQuery("query") ||
                                        listOrGrid.event === "grid" ||
                                        isMobileDevice() ||
                                        isTabletDevice() ? (
                                            <Container fluid>
                                                <Row className="my-4 g-3">
                                                    {(getUrlQuery("query")
                                                        ? searchResults?.calendarEvents?.results
                                                        : calendarEvents
                                                    )?.map((event: CalendarEvent, index: number) => (
                                                        <Col key={event.id} md={3} sm={4} xl={3} xxl={3}>
                                                            <EventCard
                                                                event={event}
                                                                onViewDetails={() => onCalendarEventClick({ event })}
                                                                onDelete={() => triggerDeleteModal(event)}
                                                            />
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Container>
                                        ) : (
                                            <FullCalendar
                                                plugins={[dayGridPlugin, interactionPlugin]}
                                                initialView="dayGridMonth" //dayGridDay dayGridWeek dayGridMonth
                                                weekends={true}
                                                events={calendarEvents}
                                                eventContent={e => renderEventContent(e, triggerDeleteModal)}
                                                editable={true}
                                                eventResizableFromStart={true}
                                                eventClick={onCalendarEventClick}
                                                headerToolbar={{
                                                    left: "prev,title,next",
                                                    center: "",
                                                    right: "dayGridDay,dayGridWeek,dayGridMonth",
                                                }}
                                                dayHeaderClassNames={"ddd"}
                                                dayHeaderContent={args => {
                                                    return args.date.toLocaleDateString("en-US", { weekday: "long" });
                                                }}
                                                dayCellContent={args => String(args.date.getDate()).padStart(2, "0")}
                                            />
                                        )
                                    ) : (
                                        <>
                                            {!getUrlQuery("query") && !isLoading && (
                                                <EmptyState
                                                    icon={<Calendar size={80} color="#B0B0B0" />}
                                                    headerText="No Events"
                                                    descriptionText="Events added can be managed here"
                                                    buttonText="Add Event"
                                                    buttonUrl="/calendar/events/add"
                                                />
                                            )}
                                            {getUrlQuery("query") && (
                                                <EmptyState
                                                    icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                                                    headerText={`No Results Found`}
                                                    descriptionText={`"${getUrlQuery(
                                                        "query",
                                                    )}" did not match any data. Please try again.`}
                                                />
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    <DeleteModal
                        showModal={showDeleteModal}
                        setShowModal={(value: boolean) => setShowDeleteModal(value)}
                        dataToDeleteName={"event"}
                        message="Are you sure you want to this event?"
                        onYesDelete={() => eventToDelete && deleteCalendarEvent(eventToDelete)}
                        isDeleting={isDeleting}
                    />

                    <DeleteModal
                        showModal={showDisconnectCalendarModal}
                        setShowModal={(value: boolean) => setShowDisconnectCalendarModal(value)}
                        dataToDeleteName={"Calendar Integration"}
                        message="Are you sure you want to disconnect your google calendar?"
                        onYesDelete={disconnectCalendar}
                        isDeleting={isDeleting}
                    />

                    <EventModal
                        showModal={showModal}
                        setShowModal={setShowModal}
                        clickedEvents={clickedEvents}
                        clikedDate={clikedDate}
                    />
                </>
            ) : (
                <EmptyState
                    headerText="Coming soon! Connect your google account to tuulbox "
                    descriptionText="This would allow you schedule and view all your appointments within tuulbox"
                    buttonText="Open Calendar"
                    showButtonIcon={false}
                    buttonClass="px-4 h-48m"
                    icon={
                        <Button className="btnm border-0 btn-socialm w-80 rounded-circle d-flex align-items-center justify-content-center bg-gray-50 h-80">
                            <Image src={`/images/svg/icons/google.svg`} alt="Sync calendar" width={44} height={44} />
                        </Button>
                    }
                    onButtonClick={redirectToGoogleCalendar}
                    isLoading={isSyncing}
                    isLoadingButtonText="Loading..."
                />
            )}
        </DashboardLayout>
    );
}

function renderEventContent(eventInfo: any, triggerDeleteModal: any) {
    return (
        <div className="d-flex justify-content-between w-100 calendar-event-hover">
            <div className="calendar-event-content ps-2">
                <p className="m-0 text-wrap truncate-text tb-body-extra-small-regular text-muted">
                    {convertIsoToFriendlyTime(eventInfo.event.startStr)} -{" "}
                    {convertIsoToFriendlyTime(eventInfo.event.endStr)}
                </p>
                <p
                    title={eventInfo.event.title}
                    className="text-wrap truncate-1 m-0 tb-body-default-medium text-gray-600"
                >
                    {eventInfo.event.title}
                </p>
            </div>
            <Dropdown className="bg-transparent" drop="down" onClick={event => event.stopPropagation()}>
                <Dropdown.Toggle
                    size="sm"
                    variant="default"
                    className="btn-square bg-transparent border-0"
                    id="dropdown-basic"
                >
                    <MoreHorizontal size={24} />
                </Dropdown.Toggle>
                <Dropdown.Menu align={`end`}>
                    <Dropdown.Item href={`/calendar/events/edit/${eventInfo.event.id}`}>
                        <Iconly set="light" name="Edit" /> <span className="tb-body-default-regular">Update</span>
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => triggerDeleteModal(eventInfo.event)} className="text-danger">
                        <Trash size={20} className="" color="#E70000" />
                        <span className="tb-body-default-regular text-danger">Delete</span>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}
