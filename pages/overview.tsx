import DashboardLayout from "@/components/DashboardLayout";
import { ArrowRight, ArrowRight2, DirectInbox, NotificationBing, Refresh, Star1 } from "iconsax-react";
import { Button, Col, Row, Spinner } from "react-bootstrap";
import Calendar from "react-calendar";
import { useEffect } from "react";
import DeleteModal from "@/components/DeleteModal";
import Link from "next/link";
import OverviewRecentCard from "@/components/OverviewRecentCard";
import EventModal from "@/components/EventModal";
import { RootState } from "@/store";
import { useSelector, useDispatch } from "react-redux";
import NotificationComponent from "@/components/NotificationComponent";
import useNotifications from "@/hooks/notifications";
import FavoriteMiniCard from "@/components/FavoriteMiniCard";
import { isMobileDevice } from "@/helpers";
import ProjectCardSmall from "@/components/ProjectCardSmall";
import useFavorites from "@/hooks/useFavorites";
import useRecents from "@/hooks/recents";
import { RecentActivity } from "@/repositories/recent-repository";
import useProject from "@/hooks/project";
import EmptyState from "@/components/EmptyState";
import EngineerAndLaptop from "@/components/icons/EngineerAndLaptop";
import useProjects from "@/hooks/useProjects";
import useOverview from "@/hooks/useOverview";

export default function Overview() {
    const {
        setDate,
        showModal,
        setShowModal,
        getCounts,
        recentActivities,
        isLoadingRecentActivities,
        isSilentlyFetchingRecents,
        getRecentActivities,
        getCalendarEvents,
        tileClassName,
        onCalendarDayClick,
        getProjects,
        clickedEvents,
        clikedDate,
        overviewProjects,
        isLoadingProjects,
    } = useOverview();

    const { projects, isLoading: isLoadingProjectsFromStore, isSilentlyFetching } = useProjects("active");

    const {
        triggerArchiveModal,
        showArchiveProjectModal,
        isSubmitting,
        archiveProject,
        dataToDelete,
        setShowArchiveProjectModal,
    } = useProject({});
    const { deleteRecentActivityById } = useRecents();

    const {
        isLoadingFavorites,
        favorites,
        removeFavorite,
        getFavorites,
        showRemoveFavoriteModal,
        setShowRemoveFavoriteModal,
        isRemovingFavorite,
        removeFavoriteById,
        addToFavorites,
        isSilentlyFetching: isSilentlyFetchingFavorites,
    } = useFavorites();

    const { notifications } = useSelector((state: RootState) => state.notifications);
    const { triggerSnoozeModal } = useNotifications();

    async function onRemoveFromRecent(recent: RecentActivity) {
        await deleteRecentActivityById(recent.id);
        await getRecentActivities();
    }

    useEffect(() => {
        getCounts();
        getRecentActivities();
        getFavorites();
        getCalendarEvents();
    }, []);

    async function removeFromFavorites(favoriteId: string) {
        await removeFavoriteById(favoriteId);

        await Promise.all([getFavorites(), getRecentActivities(), getProjects()]);
    }

    async function createFavorites(payload: Record<string, string>) {
        await addToFavorites(payload);
        await Promise.all([getFavorites(), getRecentActivities(), getProjects()]);
    }

    return (
        <DashboardLayout breadCrumbs={[{ name: "Home" }]} pageTitle="Home">
            <section className="my-4 mobile-px-12 px-32 ">
                <div className="d-flex flex-column justify-content-center pt-2 pb-2 ps-3 pe-4 w-100 border-radius-16 gap-2  bg-gray-50">
                    <Row
                        className={`g-2m gap-2 ps-1 pt-1m pe-1 mobile-px-12 ${
                            isMobileDevice() ? "flex-wrap" : "flex-nowrap"
                        }`}
                    >
                        <Col md={6} className="border bg-white p-0 border-gray-100 border-radius-12 d-flex flex-column">
                            <div className="d-flex bg-whitem flex-column p-3 border-bottom border-gray-100 pt-20m pb-3m">
                                <p className="text-gray-800 m-0 tb-title-body-medium">Calendar Events</p>
                            </div>
                            <div className="flex-grow-1 d-flex">
                                <Calendar
                                    className="border-0 w-100 border-radius-12 h-100"
                                    onChange={setDate}
                                    onClickDay={onCalendarDayClick}
                                    tileClassName={tileClassName}
                                />
                            </div>
                        </Col>
                        <Col md={6} className="pe-1m p-0">
                            <div className="d-flex bg-white flex-column pb-3 border border-radius-12 border-gray-100">
                                <p className="p-3 border-bottom border-gray-100 text-gray-800 m-0 tb-title-body-medium">
                                    Notifications
                                </p>

                                {notifications?.length ? (
                                    <ul className="list-unstyled overflow-scroll">
                                        {notifications.slice(0, 2).map((value, index) => (
                                            <li
                                                key={index}
                                                className={`py-20 px-20 notification-space ${
                                                    index !== 0 ? "border-top" : ""
                                                } border-gray-50 pointer hover-bg-blue-10`}
                                            >
                                                <NotificationComponent
                                                    notification={value}
                                                    isDropdown={true}
                                                    onSnooze={triggerSnoozeModal}
                                                    hideButton
                                                    hideIsReadIndicator
                                                    hideFirstDate
                                                    hideBadge
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div
                                        className="d-flex flex-column gap-4 align-items-center justify-content-center"
                                        style={{ height: "300px" }}
                                    >
                                        <NotificationBing size={40} color="#E0E0E0" />
                                        <span className="d-flex gap-1 flex-column align-items-center justify-content-center">
                                            <span className="p-0 body-small-medium text-neutral-strongest">
                                                There are no notifications at this time
                                            </span>
                                            <span className="tb-body-default-regular p-0 text-muted">
                                                Be sure to turn on notifications in your account settings
                                            </span>
                                        </span>
                                    </div>
                                )}

                                {notifications?.length ? (
                                    <Link
                                        href="/notifications"
                                        className="d-flex px-20 border-top border-gray-100 pt-20 justify-content-center align-items-center text-decoration-none"
                                    >
                                        <Button
                                            variant="link"
                                            className="w-100 tb-title-body-medium text-decoration-none border-0 border-gray-400 d-flex align-items-center text-gray-800 gap-12 justify-content-center"
                                        >
                                            View all notifications <ArrowRight color="#5D5D5D" size={16} />
                                        </Button>
                                    </Link>
                                ) : null}
                            </div>
                        </Col>
                    </Row>

                    <Row
                        className={`gap-2 w-100m gap-2 pe-1 ps-2 mobile-px-12 d-flex align-items-centerm justify-content-center ${
                            isMobileDevice() ? "flex-wrap" : "flex-nowrap"
                        }`}
                    >
                        {/* Recently Viewed */}
                        <Col md={4} className="d-flex ps-1 p-0">
                            <div className="w-100 bg-white border-gray-100 border-radius-12 border">
                                <div className="d-flex justify-content-between px-20 pb-3 pt-20 border-bottom border-gray-100">
                                    <span className="tb-title-body-medium text-gray-900">
                                        Recents
                                        {isSilentlyFetchingRecents && (
                                            <span className="ms-2 text-muted small font-weight-normal">
                                                updating...
                                            </span>
                                        )}
                                    </span>
                                    {recentActivities.length > 4 && (
                                        <Link
                                            href="/recents"
                                            className="text-decoration-none d-flex align-items-center gap-2 text-gray-900 tb-body-default-medium"
                                        >
                                            View all <ArrowRight2 size={12} color="#333333" />
                                        </Link>
                                    )}
                                </div>
                                <div className="d-flex flex-column py-3 px-3 h-360 gap-3 overflow-auto">
                                    {recentActivities.length === 0 && isLoadingRecentActivities ? (
                                        <div className="d-flex h-360 justify-content-center align-items-center py-5 w-100">
                                            <div className="text-muted small">Loading recents...</div>
                                        </div>
                                    ) : (
                                        <>
                                            {recentActivities && recentActivities.length > 0 ? (
                                                <div className="d-flex flex-column gap-3">
                                                    {recentActivities.slice(0, 4).map(
                                                        (recent, index) =>
                                                            recent?.originalObject &&
                                                            !Array.isArray(recent.originalObject) && (
                                                                <OverviewRecentCard
                                                                    key={index}
                                                                    recent={recent}
                                                                    onAddToFavorites={payload => {
                                                                        createFavorites(payload);
                                                                    }}
                                                                    onRemoveFromRecent={() =>
                                                                        onRemoveFromRecent(recent)
                                                                    }
                                                                    onRemoveFromFavorites={() =>
                                                                        removeFromFavorites(
                                                                            recent.originalObject?.favoriteId!,
                                                                        )
                                                                    }
                                                                />
                                                            ),
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="d-flex align-items-center justify-content-center h-360">
                                                    <div className="d-flex flex-column gap-4 align-items-center justify-content-center">
                                                        <Refresh size={40} color="#E0E0E0" />
                                                        <span className="d-flex gap-1 flex-column align-items-center justify-content-center">
                                                            <span className="p-0 body-small-medium text-neutral-strongest">
                                                                No Recent
                                                            </span>
                                                            <span className="tb-body-default-regular p-0 text-muted">
                                                                Easily access recent files and resources from here
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Projects */}
                        <Col md={4} className="d-flex p-0">
                            <div className="w-100 bg-white border-gray-100 border-radius-12 border">
                                <div className="d-flex justify-content-between px-20 pb-3 pt-20 border-bottom border-gray-100">
                                    <span className="tb-title-body-medium text-gray-900">
                                        Projects
                                        {isSilentlyFetching && (
                                            <span className="ms-2 text-muted small font-weight-normal">
                                                updating...
                                            </span>
                                        )}
                                    </span>
                                    {projects.length > 4 && (
                                        <Link
                                            href="/projects"
                                            className="text-decoration-none d-flex align-items-center gap-2 text-gray-900 tb-body-default-medium"
                                        >
                                            View All <ArrowRight2 size={12} color="#333333" />
                                        </Link>
                                    )}
                                </div>
                                <div className="d-flex flex-column h-360 pt-3 pb-3 px-3 gap-3 overflow-auto">
                                    {projects.length === 0 && isLoadingProjectsFromStore ? (
                                        <div className="d-flex h-360 justify-content-center align-items-center py-5 w-100">
                                            <div className="text-muted small">Loading projects...</div>
                                        </div>
                                    ) : (
                                        <>
                                            {projects.length > 0 ? (
                                                <div className="d-flex flex-column gap-3">
                                                    {projects.slice(0, 4).map((project, index) => (
                                                        <ProjectCardSmall
                                                            key={index}
                                                            project={project}
                                                            onArchive={() => triggerArchiveModal(project)}
                                                            onAddToFavorites={payload => {
                                                                createFavorites(payload);
                                                            }}
                                                            onRemoveFromFavorites={() =>
                                                                removeFromFavorites(project.favoriteId!)
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="d-flex flex-column gap-4 h-360 align-items-center justify-content-center">
                                                    <EngineerAndLaptop width={40} height={40} />
                                                    <span className="d-flex gap-1 flex-column align-items-center justify-content-center">
                                                        <span className="p-0 body-small-medium text-neutral-strongest">
                                                            No Project
                                                        </span>
                                                        <span className="tb-body-default-regular p-0 text-muted">
                                                            Project added can be managed here
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Favorites */}
                        <Col md={4} className="d-flex p-0">
                            <div className="w-100 bg-white border-gray-100 border-radius-12 border">
                                <div className="d-flex justify-content-between px-20 pb-3 pt-20 border-bottom border-gray-100">
                                    <span className="tb-title-body-medium text-gray-900">
                                        Favorites
                                        {isSilentlyFetchingFavorites && (
                                            <span className="ms-2 text-muted small font-weight-normal">
                                                updating...
                                            </span>
                                        )}
                                    </span>
                                    {favorites.length > 4 && (
                                        <Link
                                            href="/favorites"
                                            className="text-decoration-none d-flex align-items-center gap-2 text-gray-900 tb-body-default-medium"
                                        >
                                            View all <ArrowRight2 size={12} color="#333333" />
                                        </Link>
                                    )}
                                </div>
                                <div className="d-flex h-360 flex-column pt-3 pb-3 px-3 gap-3 overflow-auto">
                                    {favorites.length === 0 && isLoadingFavorites ? (
                                        <div className="d-flex h-360 justify-content-center align-items-center py-5 w-100">
                                            <div className="text-muted small">Loading favorites...</div>
                                        </div>
                                    ) : (
                                        <>
                                            {favorites && favorites.length > 0 ? (
                                                <div className="d-flex flex-column gap-3">
                                                    {favorites.slice(0, 4).map(
                                                        (favorite, index) =>
                                                            favorite &&
                                                            !Array.isArray(favorite) && (
                                                                <FavoriteMiniCard
                                                                    key={index}
                                                                    favorite={favorite}
                                                                    onRemoveFromFavorites={() => {
                                                                        removeFromFavorites(favorite.id!);
                                                                    }}
                                                                />
                                                            ),
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="d-flex flex-column gap-4 h-360 align-items-center justify-content-center">
                                                    <Star1 size={40} color="#E0E0E0" />
                                                    <span className="d-flex gap-1 flex-column align-items-center justify-content-center">
                                                        <span className="p-0 body-small-medium text-neutral-strongest">
                                                            No Favorites
                                                        </span>
                                                        <span className="tb-body-default-regular p-0 text-muted">
                                                            Add items to favorites for quick access
                                                        </span>
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </section>

            <EventModal
                showModal={showModal}
                setShowModal={setShowModal}
                clickedEvents={clickedEvents}
                clikedDate={clikedDate}
                viewMoreEvents
            />

            <DeleteModal
                showModal={showArchiveProjectModal}
                setShowModal={(value: boolean) => setShowArchiveProjectModal(value)}
                action={`${status === "active" ? "UnArchive" : "Archive"}`}
                dataToDeleteName={"Project"}
                isDeleting={isSubmitting}
                onYesDelete={() => archiveProject(dataToDelete).then(() => getProjects())}
                message={`Are you sure you want to ${status === "active" ? "unarchive" : "archive"} project?`}
                rightButtonText={`${status === "active" ? "Unrchive" : "Yes, Archive"}`}
                rightButtonProcessingText={`${status === "active" ? "Unarchiving..." : "Archiving..."}`}
            />

            <DeleteModal
                showModal={showRemoveFavoriteModal}
                setShowModal={(value: boolean) => setShowRemoveFavoriteModal(value)}
                action="Remove"
                dataToDeleteName={"Favorite"}
                isDeleting={isRemovingFavorite}
                onYesDelete={removeFavorite}
                message="Are you sure you want to remove favorite?"
                rightButtonText="Yes, Remove"
                rightButtonProcessingText="Removing..."
            />
        </DashboardLayout>
    );
}
