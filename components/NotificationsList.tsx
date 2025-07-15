import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import useNotifications from "@/hooks/notifications";
import { NotificationBing } from "iconsax-react";
import { Container, Spinner } from "react-bootstrap";
import { NotificationObject, NotificationQuery } from "@/repositories/notifications-repository";
import PageLoader from "@/components/PageLoader";
import NotificationComponent from "@/components/NotificationComponent";
import NotificationsMenu from "@/components/NotificationsMenu";
import EmptyState from "./EmptyState";
import InfiniteScroll from "react-infinite-scroll-component";
import DI from "@/di-container";

export default function NotificationsList() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [notifications, setNotifications] = useState<NotificationObject[]>([]);
    const page = useRef<number>(0);
    const [notificationResponse, setNotificationResponse] = useState({
        count: 0,
        next: "",
        previous: "",
        results: [] as NotificationObject[],
    });

    async function getNotifications(query: NotificationQuery) {
        setIsLoading(true);
        try {
            const res = await DI.notificationsService.getNotifications(query);
            setNotificationResponse(res);
            if (query.page === 1) {
                setNotifications(res.results);
                return res;
            }
            setNotifications([...notifications, ...res.results]);
            return res;
        } catch (error) {
            return {
                count: 0,
                next: "",
                previous: "",
                results: [] as NotificationObject[],
            };
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        page.current = 1;
        setNotifications([]);
        getNotifications({
            filter_by: router.query.filter_by as string,
            page: 1,
        });
    }, [router.query.filter_by]);

    return (
        <DashboardLayout pageTitle="Notifications" breadCrumbs={[{ name: "Notifications" }]}>
            <div className="mt-4">
                <NotificationsMenu />
                {isLoading ? (
                    <PageLoader />
                ) : (
                    <div className="position-relative">
                        {notifications.length > 0 ? (
                            <InfiniteScroll
                                dataLength={notifications.length}
                                next={() => {
                                    page.current += 1;
                                    getNotifications({
                                        filter_by: router.query.filter_by as string,
                                        page: page.current,
                                    });
                                }}
                                hasMore={!!notificationResponse.next}
                                loader={
                                    <div className="text-center my-5 py-5">
                                        <Spinner />
                                    </div>
                                }
                            >
                                {notifications.map((notification: NotificationObject, index: number) => (
                                    <div key={index} className="py-12 mt-3 pointer hover-bg-blue-10">
                                        <Container fluid key={index}>
                                            <NotificationComponent notification={notification} />
                                        </Container>
                                    </div>
                                ))}
                            </InfiniteScroll>
                        ) : (
                            <div className="flex align-items-center justify-content-center notification-empty">
                                <EmptyState
                                    headerText="There are no notifications at this time"
                                    descriptionText="Be sure to turn on notifications in your account settings"
                                    icon={<NotificationBing color="#B0B0B0" size={60} />}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
