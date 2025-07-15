import { UserSquare, Notification, EmptyWallet, Messages2, DocumentText, ArchiveBox, ArchiveBook } from "iconsax-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useRouter } from "next/router";

const TABS = [
    {
        tabName: "Active",
        isActive: true,
        id: "active",
        icon: DocumentText,
        url: "/projects",
    },
    {
        tabName: "Archived",
        isActive: false,
        id: "archived",
        icon: ArchiveBox,
        url: "/projects/archived",
    },
];

export default function ProjectNav() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("active");

    useEffect(() => {
        const path = location.href.split("/")[4];
        path && setActiveTab(path);
    }, [router]);

    return (
        <ListGroup
            horizontal
            className="overflow-hidden navbar-expand  border-bottom-gray-100 d-flex gap-4 rounded-0 w-100"
        >
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
                    <Link href={tab.url} className="text-decoration-none align-items-center d-flex gap-2">
                        <tab.icon
                            className="icon-box"
                            size={20}
                            variant={tab.id === "profile" ? "Bold" : "Outline"}
                            style={{
                                color: activeTab === tab.id ? "black" : "#888888",
                            }}
                        />
                        <span
                            className="text-gray-400 tb-title-body-medium"
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
