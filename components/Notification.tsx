import { ArrowRight2 } from "iconsax-react";
import Link from "next/link";
import NotificationItem from "./NotificationItem";
import { NotificationType } from "@/repositories/notifications-repository";
import NotificatonCountBadge from "./NotificationCountBadge";
import { Container } from "react-bootstrap";

type NotificationProps = {
    title?: string;
    notification: NotificationType;
    showHeader?: boolean;
};

export default function Notification(props: NotificationProps) {
    const { title, notification, showHeader = true } = props;

    const url = (): string => {
        if (title?.includes("license")) return "/business/license";
        if (title?.includes("insurance")) return "/business/insurance";
        return "javascript:void(0)";
    };
    return (
        <>
            {showHeader && (
                <Container fluid>
                    <div className="d-flex flex-row justify-content-between mb-3">
                        <div className="d-flex align-items-center">
                            <p className="mb-0 me-2 text-capitalize">{title}</p>
                            <NotificatonCountBadge count={notification.length} customClass="bg-gray-100" />
                        </div>

                        <Link href={url()} className="text-decoration-none">
                            <small>
                                See all <ArrowRight2 size="12" color="#222020" />
                            </small>
                        </Link>
                    </div>
                </Container>
            )}
            <ul className="list-unstyled">
                {notification.map((value, index) => (
                    <li key={index} className="py-4 pointer hover-bg-blue-10">
                        <Container fluid>
                            <NotificationItem data={value} notificationType={title} key={index} />
                        </Container>
                    </li>
                ))}
            </ul>
        </>
    );
}
