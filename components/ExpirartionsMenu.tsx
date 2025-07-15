import { UserSquare, Notification, EmptyWallet, Messages2, DocumentText } from "iconsax-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useRouter } from "next/router";

const TABS = [
    {
        tabName: "All expirations",
        isActive: false,
        id: "expiration",
        url: "/expirations",
    },
    {
        tabName: "Upcoming expirations",
        isActive: false,
        id: "upcoming",
        url: "/expirations/upcoming",
    },
    {
        tabName: "Overdue expirations",
        isActive: false,
        id: "overdue",
        url: "/expirations/overdue",
    },
];

export default function ExpirationsMenu() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("expiration");

    useEffect(() => {
        const path = location.href.split("/")[4];
        path && setActiveTab(path);
    }, [router]);

    return (
        <ListGroup horizontal className="overflow-hidden navbar-expand border-bottom-gray-100 rounded-0">
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
                    <Link href={tab.url} className="text-decoration-none align-items-center">
                        <span
                            className="h6 ms-2 fw-normal"
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
