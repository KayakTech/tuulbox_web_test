import { Button } from "react-bootstrap";
import { BillingType } from "@/repositories/billing-repository";
import StatusBadge from "@/components/StatusBadge";
import { useState } from "react";
import { isMobileDevice, isTabletDevice } from "@/helpers";
import Link from "next/link";

const useBilling = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Sample billing data
    const sampleBillingData: Partial<BillingType>[] = [
        {
            subscriptionPlan: "Gold",
            amount: "$99.99",
            status: "Successful",
            date: "Dec-05-2025",
        },
        {
            subscriptionPlan: "Platinum",
            amount: "$149.99",
            status: "Successful",
            date: "Dec-05-2025",
        },
        {
            subscriptionPlan: "Gold",
            amount: "$99.99",
            status: "Expired",
            date: "Dec-05-2025",
        },
        {
            subscriptionPlan: "Platinum",
            amount: "$149.99",
            status: "Successful",
            date: "Dec-05-2025",
        },
        {
            subscriptionPlan: "Gold",
            amount: "$99.99",
            status: "Pending",
            date: "Dec-05-2025",
        },
        {
            subscriptionPlan: "Platinum",
            amount: "$149.99",
            status: "Expired",
            date: "Dec-05-2025",
        },
        {
            subscriptionPlan: "Gold",
            amount: "$99.99",
            status: "Successful",
            date: "Dec-05-2025",
        },
    ];

    const billingColumns = () => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Subscription Plan </span>,
                cell: (row: Partial<BillingType>) => (
                    <span className="rowclick tb-body-default-medium">{row.subscriptionPlan}</span>
                ),
                grow: 1,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Amount</span>,
                cell: (row: Partial<BillingType>) => (
                    <span className="rowclick tb-body-default-medium">{row.amount}</span>
                ),
                grow: 1,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Status</span>,
                cell: (row: Partial<BillingType>) => (
                    <span className="rowclick tb-body-default-medium">
                        <StatusBadge status={row.status || ""} />
                    </span>
                ),
                grow: 1,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Date</span>,
                cell: (row: Partial<BillingType>) => (
                    <span className="rowclick tb-body-default-medium">{row.date}</span>
                ),
                grow: 1,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize ms-auto">Action</span>,
                grow: 1,
                cell: (row: Partial<BillingType>, index: number) => (
                    <div
                        className={`d-flex justify-content-end w-100 ${
                            isMobileDevice() || isTabletDevice()
                                ? "flex-column align-items-end gap-1"
                                : "flex-row gap-12 align-items-end justify-content-end"
                        }`}
                    >
                        <Link
                            href={`/settings/billing/history/${index}`}
                            className="text-decoration-none p-1 text-gray-800 p-0 tb-body-default-medium text-truncate"
                        >
                            Preview
                        </Link>
                        <Link
                            href={`/settings/billing/history/${index}/download`}
                            className="text-decoration-none p-1 text-truncate text-gray-800 tb-body-default-medium"
                        >
                            Download
                        </Link>
                    </div>
                ),
            },
        ];
    };

    return {
        billingColumns,
        billingData: sampleBillingData,
        isLoading,
        setIsLoading,
    };
};

export default useBilling;
