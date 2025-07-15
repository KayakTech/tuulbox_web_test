import React from "react";

type Status = "successful" | "pending" | "expired" | string;

const BASE_STYLE: React.CSSProperties = {
    padding: "4px 8px",
    borderRadius: "16px",
    textTransform: "capitalize",
};

const STATUS_COLORS = {
    successful: {
        color: "#38A169",
        backgroundColor: "#F0FFF4",
    },
    pending: {
        color: "#975E00",
        backgroundColor: "#FFF8E6",
    },
    expired: {
        color: "#B42318",
        backgroundColor: "#FEF3F2",
    },
    default: {
        color: "#333",
        backgroundColor: "#F0F0F0",
    },
};

interface StatusBadgeProps {
    status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusKey = status.toLowerCase() as keyof typeof STATUS_COLORS;
    const colors = STATUS_COLORS[statusKey] || STATUS_COLORS.default;

    const style = {
        ...BASE_STYLE,
        ...colors,
    };

    return <span style={style}>{status}</span>;
};

export default StatusBadge;
