import {
    UserSquare,
    Notification,
    EmptyWallet,
    Briefcase,
    Personalcard,
    Messages2,
    ShieldTick,
    DocumentText,
    DeviceMessage,
    Clock,
} from "iconsax-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useRouter } from "next/router";
import React from "react";

const TABS = [
    {
        tabName: "All notifications",
        isActive: false,
        id: "all",
        icon: Notification,
        url: "/notifications/",
        filter: [],
    },
    {
        tabName: "Communications",
        isActive: false,
        id: "communications",
        icon: DeviceMessage,
        url: "/notifications/communications",
        filter: ["communications", "chat_messages"],
    },

    {
        tabName: "Expirations",
        isActive: false,
        id: "expirations",
        icon: Clock,
        url: "/notifications/expirations",
        filter: ["expirations"],
    },
    {
        tabName: "Reminders",
        isActive: false,
        id: "reminders",
        icon: Notification,
        url: "/notifications/reminders",
        filter: ["reminders"],
    },
    {
        tabName: "Licenses",
        isActive: false,
        id: "licenses",
        icon: Personalcard,
        url: "/notifications/licenses",
        filter: ["licenses"],
    },
    {
        tabName: "Insurances",
        isActive: false,
        id: "insurances",
        icon: ShieldTick,
        url: "/notifications/insurances",
        filter: ["insurances"],
    },

    {
        tabName: "Invites",
        isActive: false,
        id: "invites",
        icon: DeviceMessage,
        url: "/notifications/invites",
        filter: ["pending_invites"],
    },
];

type NotificationMenuProps = {};

export default function NotificationsMenu() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("all");

    useEffect(() => {
        const path = location.pathname.split("/")[2];
        setActiveTab(path ?? "all");
    }, [router]);

    return (
        <ListGroup horizontal className="overflow-scroll navbar-expand border-bottom-gray-100 rounded-0">
            {TABS.map(tab => (
                <ListGroup.Item
                    style={{
                        border: "none",
                        borderBottom: activeTab === tab.id ? "2px solid black" : "none",
                        alignItems: "center",
                    }}
                    className="d-fle pointer"
                    key={tab.id}
                >
                    <Link
                        href={`${tab.url}?filter_by=${tab.filter.join(",")}`}
                        className="text-decoration-none align-items-center"
                    >
                        <span
                            className="h6 ms-2 d-flex align-items-center gap-2 tb-title-body-medium"
                            style={{
                                fontSize: "14px",
                                whiteSpace: "nowrap",
                                color: activeTab === tab.id ? "black " : "#B0B0B0",
                            }}
                        >
                            {React.createElement(tab.icon, {
                                className: "icon-box",
                                size: 16,
                                variant: tab.id === "profile" ? "Bold" : "Outline",
                                style: {
                                    color: activeTab === tab.id ? "black" : "#888888",
                                },
                            })}
                            {tab.tabName}
                        </span>
                    </Link>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}
