import DashboardLayout from "@/components/DashboardLayout";
import { useEffect } from "react";
import { NotificationPayload } from "@/components/NotificationItem";
import { useRouter } from "next/router";
import useNotifications from "@/hooks/notifications";
import { Container } from "react-bootstrap";
import PageLoader from "./PageLoader";
import NotificationTypeComponent from "./Notification";

export default function Notifications(props: NotificationPayload) {
    const { notifications, isLoading } = useNotifications();

    return (
        <DashboardLayout breadCrumbs={[{ name: "Notifications" }]}>
            {isLoading ? (
                <PageLoader />
            ) : (
                <Container className="" fluid>
                    {notifications != undefined &&
                        Object.keys(notifications).map((key: string, index: number) => (
                            // @ts-ignore
                            <NotificationTypeComponent key={key} notification={notifications[key]} title={key} />
                        ))}
                </Container>
            )}
        </DashboardLayout>
    );
}
