import { ProjectDocumentMenuItem } from "@/components/ProjectDocumentSection";
import { ProjectDocumentCategories } from "@/repositories/project-repository";
import { Accept } from "react-dropzone";
import {
    Buildings2,
    DeviceMessage,
    NotificationBing,
    Personalcard,
    ShieldTick,
    DocumentText,
    Category,
    Briefcase,
    CommandSquare,
    StatusUp,
    Triangle,
    Receipt2,
    Stickynote,
    Refresh2,
    CardPos,
    Note,
    Link1,
    Bill,
    MenuBoard,
    Gallery,
    Refresh,
    Bookmark,
    ClipboardTick,
    People,
    Copy,
    DocumentCopy,
    FolderAdd,
    ArchiveBox,
    Element3,
    Receipt1,
    Messages2,
    Message,
    Add,
} from "iconsax-react";
import { SelectTimetype } from "@/components/TimeSelector";
import { FileText } from "react-feather";
import { OverviewCounts } from "@/types";
import { Calendar, TimeCircle } from "react-iconly";
import { SnoozeOption } from "@/repositories/notifications-repository";
import { toInteger } from "lodash";

export const SIZE_IN_MB = toInteger((1024 * 1024).toFixed(2));
export const DATE_PICKER_FORMAT = "MM-dd-y";
export const SOCIAL_LOGINS = [
    {
        name: "google",
        imagePath: "/images/svg/icons/google.svg",
    },
    {
        name: "apple",
        imagePath: "/images/svg/icons/apple.svg",
    },
    // {
    //     name: "facebook",
    //     imagePath: "/images/svg/icons/facebook.svg",
    // },
];
export interface Link {
    name?: string;
    url?: string;
    icon?: any;
    type?: string;
}
export type DashboardLinks = {
    name: string;
    url?: string;
    icon?: any;
    color?: string;
    sublinks?: Link[];
    cta?: Link;
};
export const DASHBOARD_SIDEBAR_LINKS: Array<DashboardLinks> = [
    {
        name: "Home",
        url: "/overview",
        icon: Element3,
    },
    {
        name: "Business",
        icon: Briefcase,
        sublinks: [
            {
                name: "Company",
                url: "/business/company",
                icon: Buildings2,
            },
            {
                name: "License",
                url: "/business/license",
                icon: Personalcard,
            },
            {
                name: "Insurance",
                url: "/business/insurance",
                icon: ShieldTick,
            },
        ],
    },
    {
        name: "Projects",
        icon: DocumentText,
        // cta: {
        //     name: "New Project",
        //     icon: Add,
        //     url: "/projects/add",
        // },
        sublinks: [
            {
                name: "Active",
                url: "/projects",
            },
            {
                name: "Archived",
                url: `/projects/archived`,
            },
        ],
    },

    {
        name: "Contacts",
        url: "/contacts",
        icon: "User",
    },
    {
        name: "Calendar",
        url: "/calendar",
        icon: "Calendar",
    },
    {
        name: "Favorites",
        url: "/favorites",
        icon: "Star",
    },
    {
        name: "Links",
        url: "/links",
        icon: Link1,
    },
    {
        name: "Storage",
        url: "/storage",
        icon: "Folder",
    },
    // {
    //     name: "Photos",
    //     url: "/photos",
    //     icon: Gallery,
    // },
];

export const DASHBOARD_TOPNAV_LINKS: Array<DashboardLinks> = [
    {
        name: "Account settings",
        url: "/settings/profile",
        icon: "User",
    },
    {
        name: "Delete Account",
        url: "javascript:void(0)",
        icon: "Delete",
    },
];

export const PROJECT_DOCUMENT_MENU: ProjectDocumentMenuItem[] = [
    {
        pathName: "project-details",
        name: "Project Details",
        shortName: "Project Details",
        singularName: "Project Details",
        category: ProjectDocumentCategories.projectDetails,
        icon: DocumentText,
        searchKey: "projectDetails",
        searchCategory: "subcontractors",
    },
    {
        pathName: "emails",
        name: "Emails",
        shortName: "Emails",
        singularName: "Emails",
        lastPath: "emails",
        category: ProjectDocumentCategories.communications,
        icon: Message,
        // @ts-ignore
        searchKey: "communications",
        searchCategory: "communications",
    },
    // We need to comment this out for now since it not ready yet
    // {
    //     pathName: "chats",
    //     name: "Chats",
    //     shortName: "Chats",
    //     singularName: "Chats",
    //     lastPath: "chats",
    //     category: ProjectDocumentCategories.communications,
    //     icon: Messages2,
    //     // @ts-ignore
    //     searchKey: "communications",
    //     searchCategory: "communications",
    // },
    {
        pathName: "sub-contractors",
        name: "Subcontractor",
        shortName: "Sub Contractors",
        singularName: "Sub Contractor",
        category: ProjectDocumentCategories.subContractors,
        icon: StatusUp,
        searchKey: "subcontractors",
        searchCategory: "subcontractors",
    },
    {
        pathName: "plans-and-elevation",
        name: "Plans & Elevation",
        shortName: "Plans",
        singularName: "Plans & Elevation",
        category: ProjectDocumentCategories.planAndElevation,
        icon: Triangle,
        searchKey: "planAndElevations",
        searchCategory: "plan_and_elevations",
    },
    {
        pathName: "permits",
        name: "Permits",
        shortName: "Permits",
        singularName: "Permits",
        category: ProjectDocumentCategories.permit,
        icon: ClipboardTick,
        searchKey: "permits",
        searchCategory: "permits",
    },
    {
        pathName: "estimates",
        name: "Estimates",
        shortName: "Estimate",
        singularName: "Estimate",
        category: ProjectDocumentCategories.estimate,
        icon: Receipt1,
        searchKey: "estimates",
        searchCategory: "estimates",
    },
    {
        pathName: "contracts",
        name: "Contracts",
        shortName: "Contract",
        singularName: "Contract",
        category: ProjectDocumentCategories.contract,
        icon: Stickynote,
        searchKey: "contracts",
        searchCategory: "contracts",
    },
    {
        pathName: "change-orders",
        name: "Change Orders",
        shortName: "Change Order",
        singularName: "Change Order",
        category: ProjectDocumentCategories.changeOrder,
        icon: Refresh,
        searchKey: "changeOrders",
        searchCategory: "change_orders",
    },

    {
        pathName: "specifications",
        name: "Specifications",
        shortName: "Specification",
        singularName: "Specification",
        category: ProjectDocumentCategories.specification,
        icon: Bill,
        searchKey: "specifications",
        searchCategory: "specifications",
    },
    {
        pathName: "additional-documents",
        name: "Additional Documents",
        shortName: "Document",
        singularName: "Additional Document",
        category: ProjectDocumentCategories.additionalDocuments,
        icon: MenuBoard,
        searchKey: "additionalDocuments",
        searchCategory: "additional_documents",
    },
    {
        pathName: "gallery",
        name: "Photos",
        shortName: "Photos",
        singularName: "Photos",
        category: ProjectDocumentCategories.gallery,
        icon: Gallery,
        searchKey: "gallery",
        searchCategory: "gallery",
    },
];

export type SearchModule = { name: string; icon: any; category: string; inputPaddingLeft: number };

export const SEARCH_MODULES: SearchModule[] = [
    {
        name: "Calendar",
        icon: Calendar,
        category: "calendarEvents",
        inputPaddingLeft: 123,
    },
    // {
    //     name: "Communication",
    //     icon: DeviceMessage,
    //     category: "communication",
    //     inputPaddingLeft: 160,
    // },
    {
        name: "Contacts",
        icon: People,
        category: "contacts",
        inputPaddingLeft: 123,
    },
    {
        name: "Insurance",
        icon: ShieldTick,
        category: "insurances",
        inputPaddingLeft: 123,
    },
    {
        name: "License",
        icon: Personalcard,
        category: "licenses",
        inputPaddingLeft: 118,
    },
    {
        name: "Links & Resources",
        icon: DocumentCopy,
        category: "resources",
        inputPaddingLeft: 167,
    },
    // {
    //     name: "Officer",
    //     icon: People,
    //     category: "officers",
    //     inputPaddingLeft: 115,
    // },
    {
        name: "Projects",
        icon: DocumentText,
        category: "projects",
        inputPaddingLeft: 120,
    },
    // {
    //     name: "Subcontractor",
    //     category: ProjectDocumentCategories.subContractors,
    //     icon: StatusUp,
    //     inputPaddingLeft: 150,
    // },
    {
        name: "Storage",
        category: "storages",
        icon: FolderAdd,
        inputPaddingLeft: 120,
    },
    {
        name: "Plans & Elevation",
        category: "plan_and_elevations",
        icon: Triangle,
        inputPaddingLeft: 160,
    },
    {
        name: "Permits",
        category: "permits",
        icon: ClipboardTick,
        inputPaddingLeft: 120,
    },
    {
        name: "Estimates",
        category: "estimates",
        icon: Bookmark,
        inputPaddingLeft: 123,
    },
    {
        name: "Contracts",
        category: "contracts",
        icon: Stickynote,
        inputPaddingLeft: 123,
    },
    {
        name: "Change Orders",
        category: "changeOrders",
        icon: Refresh,
        inputPaddingLeft: 160,
    },
    {
        name: "Payment Schedule",
        category: "payment_schedules",
        icon: CardPos,
        inputPaddingLeft: 160,
    },
    {
        name: "Performance Schedule",
        category: "performance_schedules",
        icon: Note,
        inputPaddingLeft: 160,
    },
    {
        name: "Specifications",
        category: "specifications",
        icon: Bill,
        inputPaddingLeft: 160,
    },
    {
        name: "Additional Documents",
        category: "additional_documents",
        icon: MenuBoard,
        inputPaddingLeft: 195,
    },
    {
        name: "Gallery",
        category: "galleries",
        icon: Gallery,
        inputPaddingLeft: 120,
    },
];

export const ACCEPTED_FILES: Accept = {
    "image/png": [".png"],
    "image/jpeg": [".jpg", ".jpeg"],
    "application/pdf": [".pdf"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

export const ACCEPTED_IMAGE_FILES: Accept = {
    "image/png": [".png", ".jpeg", ".jpg"],
};

export const CERTIFICATE_CATEGORIES = [
    { label: "Compensation", value: "compensation" },
    { label: "Insurance", value: "insurance" },
    { label: "Tax document", value: "tax_document" },
];

export const GLOBAL_SEARCH_PAGES = ["/overview", "/expirations", "/search"];

export const DEFAULT_RESOURCE_PREVIEW = "/images/Link1-Linear-32px (2).svg";
export const DEFAULT_PHOTO_PREVIEW = "/images/svg/Gallery-Linear-32px (1).svg";

export const HOMEPAGE_CONTACT_CARDS = [
    {
        icon: `<PhoneRing />`,
        title: "Call Us",
        subTitle: "Reach us Mon-Fri from 9:00AM on any of the numbers below:",
        contact: "+127892020-922",
        contactType: "phoneNumber",
    },
    {
        icon: `<PhoneRing />`,
        title: "Feedback & Support",
        subTitle: "Let us know your issues so we can support you.",
        contact: "Send Feedback ",
        contactType: "link",
    },
    {
        icon: `<PhoneRing />`,
        title: "Connect with us",
        subTitle: "Feel free to add us up on any of our social media pages.",
        contact: "Send Feedback ",
        contactType: "link",
    },
];

export const HOMEPAGE_FAQS = [
    {
        header: "What Makes tuulbox different from other apps?",
        content: "tuulbox is your All-in-One construction management solution. ",
    },
    {
        header: "What Makes tuulbox different from other apps?",
        content: "tuulbox is your All-in-One construction management solution. ",
    },
    {
        header: "What Makes tuulbox different from other apps?",
        content: "tuulbox is your All-in-One construction management solution. ",
    },
    {
        header: "What Makes tuulbox different from other apps?",
        content: "tuulbox is your All-in-One construction management solution. ",
    },
    {
        header: "What Makes tuulbox different from other apps?",
        content: "tuulbox is your All-in-One construction management solution. ",
    },
];

export const DATA_TABLE_CUSTOM_STYLES = { rows: { style: { cursor: "pointer" } } };
export const PREDEFINED_TIMES: SelectTimetype[] = [
    { timeString: "None", timeValue: 0 },
    { timeString: "15 Minutes Before", timeValue: 15 },
    { timeString: "30 Minutes Before", timeValue: 30 },
    { timeString: "1 Hour Before", timeValue: 60 },
];
export const OVERVIEW_COUNTS: OverviewCounts = {
    projects: {
        count: 0,
        title: "Total Projects",
        icon: FileText,
    },
    expirations: {
        count: 0,
        title: "Expirations",
        icon: TimeCircle,
    },
    reminders: {
        count: 0,
        title: "Reminders",
        icon: NotificationBing,
    },
};

export const CALENDAR_BORDER_CLASSES = ["border-yellow-600", "border-blue-500"];
export const CALENDAR_BACKGROUND_CLASSES = ["bg-yellow-600", "bg-blue-500", "bg-green-600", "bg-red-600", "bg-red-900"];

export const INSURANCE_TYPES = [
    { label: "General Liability", value: "general_liability" },
    { label: "Workers Compensation", value: "workers_compensation" },
    { label: "Other", value: "other" },
];

export const LICENSE_TYPES = [
    { label: "Contractor License", value: "contractor_license" },
    { label: "Business License", value: "business_license" },
    { label: "Other", value: "other" },
];

export const APPLE_STORE_URL = "https://testflight.apple.com/join/DJDvVvb8"; //"https://apps.apple.com/us/app/tuulbox/id6463489669";
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.tuulbox.app&hl=en&gl=US";

export const ACCOUNT_DELETION_REASONS = [
    {
        label: "Limited utility/features",
        value: "not_useful",
    },
    {
        label: "Performance issues",
        value: "not_working",
    },
    {
        label: "Privacy concerns",
        value: "privacy_concerns",
    },
    {
        label: "Other reasons",
        value: "other",
    },
];

export const SNOOZE_OPTIONS: SnoozeOption[] = [
    { name: "Never" },
    { name: "Day Time" },
    { name: "Week Time" },
    { name: "Pick a Date" },
];

let HOST: string;

if (typeof window !== "undefined") {
    HOST = location.hostname === "localhost" ? `http://${location.host}` : `https://${location.host}`;
} else {
    HOST = process.env.DEFAULT_HOST || "https://example.com";
}

export { HOST };

export type PlanType = "freemium" | "silver" | "platinum";

export interface PlanData {
    name: string;
    price: string;
    nextBillingDate?: string;
    renewalStatus?: boolean;
    features: {
        projects: string;
        contacts: boolean;
        calendar: boolean;
        media: boolean;
        email: boolean;
        collaborators: string;
        chat: string;
        storage: string;
        archive: string;
        receipts: string;
        timesheets: string;
        support: string;
        costLabel?: string;
    };
}
