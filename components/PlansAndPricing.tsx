import { Button, Card } from "react-bootstrap";
import { ReactNode, useState } from "react";
import SubscriptionPage from "./SubscriptionPage";
import { plans } from "@/helpers/planData";

type FeatureItem = {
    label: string;
    value: string | ReactNode;
    subValue?: string;
    hasCheck?: boolean;
    currentPlan?: string;
    price?: string;
    nextBillingDate?: string;
};
const FeaturesList: FeatureItem[] = [
    { label: "Projects", value: "1 Active at any time", subValue: "3 Projects archived" },
    {
        label: "Contacts integration",
        value: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                width={20}
                height={20}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
        ),

        hasCheck: true,
    },
    {
        label: "Calendar integration",
        value: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                width={20}
                height={20}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
        ),
        hasCheck: true,
    },
    {
        label: "Photos & video",
        value: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                width={20}
                height={20}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
        ),
        hasCheck: true,
    },
    {
        label: "Email",
        value: (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                width={20}
                height={20}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
        ),
        hasCheck: true,
    },
    { label: "Collaborators", value: "1 Person" },
    { label: "Chat", value: "1 Person" },
    { label: "Storage space", value: "200 Megabytes" },
    { label: "Archive period", value: "1 Year" },
    { label: "Receipts", value: "None" },
    { label: "Timesheets", value: "None" },
    { label: "Support", value: "Email" },
    { label: "Cost", value: "Free" },
];

export default function PlansAndPricing() {
    const [actionbutton, setActionButton] = useState(false);
    return <SubscriptionPage currentPlan="silver" />;
}
