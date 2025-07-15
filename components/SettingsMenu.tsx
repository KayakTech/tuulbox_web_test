import { UserSquare, Notification, EmptyWallet, Messages2, DocumentText, MoneyTick } from "iconsax-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useRouter } from "next/router";

const TABS = [
    {
        tabName: "Profile",
        isActive: false,
        id: "profile",
        icon: UserSquare,
        url: "/settings/profile",
    },
    {
        tabName: "Manage notifications",
        isActive: false,
        id: "notifications",
        icon: Notification,
        url: "/settings/notifications",
    },
    // This Feature is disabled for now.
    // {
    //     tabName: "Billing & subscription",
    //     isActive: false,
    //     id: "billing",
    //     icon: MoneyTick,
    //     url: "/settings/billing",
    // },
    {
        tabName: "Others",
        isActive: false,
        id: "others",
        icon: DocumentText,
        url: "/settings/others",
    },
];

export default function SettingsMenu() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");

    useEffect(() => {
        const path = location.href.split("/")[4];
        path && setActiveTab(path);
    }, [router]);

    return (
        <ListGroup horizontal className="overflow-scroll navbar-expand border-bottom-gray-100 rounded-0 w-100">
            {TABS.map(tab => (
                <ListGroup.Item
                    style={{
                        border: "none",
                        borderBottom: activeTab === tab.id ? "2px solid black" : "none",
                        alignItems: "center",
                    }}
                    className="d-flex pointer"
                    onClick={() => router.push(tab.url)}
                    key={tab.id}
                >
                    <Link href={tab.url} className="text-decoration-none align-items-center d-flex">
                        <tab.icon
                            className="icon-box"
                            size={20}
                            variant={tab.id === "profile" ? "Bold" : "Outline"}
                            style={{
                                color: activeTab === tab.id ? "black" : "#888888",
                            }}
                        />
                        <span
                            className="ms-2 text-gray-400 tb-title-body-medium"
                            style={{
                                fontSize: "14px",
                                whiteSpace: "nowrap",
                                color: activeTab === tab.id ? "black " : "#B0B0B0",
                            }}
                        >
                            {tab.tabName}
                        </span>
                    </Link>
                </ListGroup.Item>
            ))}
        </ListGroup>
    );
}
