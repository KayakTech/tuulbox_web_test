import DI from "@/di-container";
import { getCookie } from "cookies-next";
import { JWT_COOKIE_KEY } from "@/constants";
import { Notifications } from "@/repositories/notifications-repository";
import { SelectTimetype } from "@/components/TimeSelector";
import moment from "moment";
import { PROJECT_DOCUMENT_MENU } from "./constants";
import { Project, ProjectDocumentCategories, ProjectDocumentCategoriesPlural } from "@/repositories/project-repository";
import { ProjectDocumentMenuItem } from "@/components/ProjectDocumentSection";
import { SearchResult } from "@/repositories/search-repository";

export function isNumber(value?: string): boolean {
    const pattern = /\d/;
    return value ? pattern.test(value) : false;
}
export function isValidMobileNumber(phoneNumber: string): boolean {
    // Remove any non-digit characters from the phone number
    return /^\+[0-9]{10,}$/.test(phoneNumber);
    // return /^\+?([2-9][0-8][0-9])[2-9][0-9]{6+$/.test(phoneNumber);
}
export function validateMobileNumber(mobileNumber: string) {
    return mobileNumber.replace(/[^0-9+]/g, "");
}

export function isValidUrl(url: string): boolean {
    const urlRegex: RegExp = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
    return urlRegex.test(url);
}

export async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {}
}

// Date formatters

export function convertIsoTo24HourTime(isoDateString: string) {
    return moment(isoDateString).format("HH:mm");
}

export function convertIsoToFriendlyTime(isoDateString: any) {
    return moment(isoDateString).format("h:mm A");
}
export function getTimeZone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getTimeFromTimestamp(timestamp: string) {
    return moment(timestamp).format("HH:mm");
}

export function isStartTimeBeforeEndTime(startTime: string, endTime: string) {
    return startTime < endTime;
}

export const daysLeft = (targetDateStr: string) => {
    return moment(targetDateStr).diff(moment(), "days");
};

// for display
export function formatDatetime(dateStr?: string, useTimestampFormat: boolean = false) {
    if (!dateStr) return "-";
    // allowed formats: Today 2:30 | Yesterday 2:30 |  last week 2:30 | Jan 2, 2024

    if (!useTimestampFormat) {
        return moment(dateStr).format("MMM DD, YYYY");
    }

    if (moment(dateStr).isSame(moment(), "day")) {
        return "Today, " + moment(dateStr).format("h:mm A");
    }

    if (moment(dateStr).isSame(moment().subtract(1, "day"), "day")) {
        return "Yesterday, " + moment(dateStr).format("h:mm A");
    }

    if (moment(dateStr).isSameOrBefore(moment().subtract(7, "day"), "day")) {
        return "Last week, " + moment(dateStr).format("h:mm A");
    }

    if (moment(dateStr).isSameOrBefore(moment().subtract(30, "day"), "day")) {
        return "Last month, " + moment(dateStr).format("h:mm A");
    }

    return moment(dateStr).format("MMM DD, YYYY");
}

// for api call
export function convertDateStringToIsoString(dateString: string | Date) {
    // Convert the date string to an ISO string
    return moment(dateString).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
}

export function preventAlphabetsInTelInput(event: React.KeyboardEvent<HTMLInputElement>) {
    // Prevent mouse wheel and trackpad scrolling behavior
    if (!/^[0-9+]$/.test(event.key)) {
        event.preventDefault();
    }
}

export const allowOnlyAphabets = (value: string) => {
    return value.replace(/[^a-zA-Z]/g, "");
};

export function preventArrowKeysOnInput(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
    }
}
export function preventMouseScrollOnInput(event: React.WheelEvent<HTMLInputElement>) {
    // Prevent mouse wheel and trackpad scrolling behavior
    if (event.ctrlKey) {
        event.preventDefault();
    }
}
export function isEmptyObject(object: any) {
    return Object.keys(object).length === 0;
}
export function apiErrorMessage(error: any, hasList: boolean = true) {
    let errorMessage: string = "";
    for (let key in error?.response?.data?.data) {
        if (error?.response?.data?.data.hasOwnProperty(key)) {
            errorMessage += `${hasList ? error?.response?.data?.data[key][0] : error?.response?.data?.data[key]}`;
        }
    }
    return errorMessage;
}
export function convertToSlug(str: string) {
    return str.split(" ").join("-");
}
export function slugToString(str: string) {
    return str.split("-").join(" ");
}

export function readImageFile(selectedFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            if (e.target && e.target.result) {
                resolve(e.target.result as string);
            } else {
                reject(new Error("Failed to read the image file."));
            }
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsDataURL(selectedFile);
    });
}
export function isStrongPassword(password: string): boolean {
    // Minimum of 8 characters, and a mix of letters, digits, and special characters. At least a capital letter. No spaces are allowed.
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{8,}$/;

    // Password should have at least a capital letter, small letter, number and special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-_+=])[A-Za-z\d!@#$%^&*()-_+=]{8,}$/;

    return regex.test(password);
}

export function hasSpecialCharacter(str: string): boolean {
    const regex = /[^\w\s]/; // Matches any character that is not a word character or space
    return regex.test(str);
}

export default function convertImageToBase64(imageFile: Blob | File): any {
    return new Promise((resolve, reject) => {
        if (!imageFile) {
            reject("No image file provided");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const base64String = e.target?.result as string;
            resolve(base64String);
        };

        reader.onerror = function (error) {
            reject(error);
        };

        reader.readAsDataURL(imageFile);
    });
}

export function prependHttp(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "http://" + url;
    }
    return url;
}

export function stringToSnakeCase(string: string): string {
    return string.replace(/\s+/g, "_").toLowerCase();
}
export function snakeCaseToSentenceCase(snakeCaseString: any) {
    const words = snakeCaseString.split("_");

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].slice(1).toLowerCase();
    }

    return words.join(" ");
}
export function getUrlPreview(url: string) {
    return DI.resourceService.getResourcePreview(url);
}

export const isLoggedIn = (): string | boolean => {
    return getCookie(JWT_COOKIE_KEY) != undefined;
};

export function addSelectedTimeToDateTime(params: SelectTimetype, dateTimeToUpdate: any) {
    const { timeString, timeValue, isPickingtime } = params;

    const currentTime = isPickingtime ? moment(moment(timeValue, "HH:mm").format()) : moment();
    const subtractedTime = currentTime.clone().subtract(isPickingtime ? 0 : timeValue, "minutes");
    const chosenTime = subtractedTime.format("HH:mm");
    const newTime = moment(chosenTime, "HH:mm");

    let newDateTime = moment(dateTimeToUpdate);

    newDateTime.set({
        hour: newTime.hours(),
        minute: newTime.minutes(),
        second: 0,
    });

    return {
        newDateTime: newDateTime.utc().format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (zz)"),
        chosenTime,
    };
}

export function getRandomString(stringArray: string[]) {
    const randomIndex = Math.floor(Math.random() * stringArray.length);
    return stringArray[randomIndex];
}

export function getActiveProjectMenu(props: { isShared?: boolean; project?: Project }) {
    const { isShared, project } = props;

    let menu = PROJECT_DOCUMENT_MENU;

    if (isShared) {
        menu = getProjectDocumentMenu({ isShared: isShared, project: project });
    }

    return menu[0];
}

export function getProjectDocumentMenu(props: { isShared?: boolean; project?: Project }) {
    const { project, isShared } = props;
    let projectDocumentMenu = PROJECT_DOCUMENT_MENU;

    if (isShared) {
        let newMenu: ProjectDocumentMenuItem[] = [];

        project?.documentCategoryAccesses?.map(access => {
            if (access.accessLevel != "no_access") {
                const docMenu = PROJECT_DOCUMENT_MENU.find(doc => doc.category === access.documentCategory);
                docMenu && newMenu.push(docMenu);
            }
            projectDocumentMenu = [...newMenu];
        });
    }

    if (!isShared) {
        projectDocumentMenu = PROJECT_DOCUMENT_MENU.filter(
            menu => !["communication", "subcontractor"].includes(menu.name.toLowerCase()),
        );
    }

    return projectDocumentMenu;
}

export async function downloadFile(props: { fileUrl: string; fileName: string }) {
    const { fileUrl, fileName } = props;
    // Function to handle the file download
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const blob = await response.blob(); // Convert the response to a Blob
        const url = window.URL.createObjectURL(blob); // Create a URL for the Blob

        // Create a link element and trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "download"; // Use provided fileName or a default name
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Release the object URL
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Failed to download file:", error);
    }
}

export function convertCamelCaseToSentenceCase(str: string) {
    return str.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();

    // Replace underscores with spaces
    const words = str.replace(/_/g, " ").split(" ");

    // Capitalize the first letter of each word
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

    // Join the words back into a single string
    return capitalizedWords.join(" ");
}
export function currentPage(index?: number) {
    return location.pathname.split("/")[index || 1];
}

export function convertCamelToHyphenated(str: string) {
    return str?.replace(/[A-Z]/g, m => "-" + m.toLowerCase()).replace(/_/g, "-");
}
export function hyphenToNormalString(str: string) {
    return str?.replace(/-/g, " ");
}

export function hyphenToSnakeCase(str: string) {
    return str?.replace(/-/g, "_");
}

export function isNumbersOnly(str: any) {
    return /^\d*$/.test(str);
}

export function getTimeDifference(startTime: string, endTime: string) {
    const format = "HH:mm"; // You can change this format based on input

    // Parse the times
    const start = moment(startTime, format);
    const end = moment(endTime, format);

    // Handle cases where the end time is the next day
    if (end.isBefore(start)) {
        end.add(1, "day");
    }

    // Get the duration
    const duration = moment.duration(end.diff(start));

    // Format the difference
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    const milliseconds = duration.milliseconds();

    // Convert milliseconds to microseconds (approximate)
    const microseconds = milliseconds * 1000;

    // Return formatted string
    return `${days.toString().padStart(2, "0")} ${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${microseconds.toString().padStart(6, "0")}`;
}

export const AddQueryToUrl = (searchTerm: string) => {
    if (!searchTerm) return;

    // Get current URL
    const currentUrl = window.location.href;

    // Create a new URL object based on the current URL
    const url = new URL(currentUrl);

    // Set or update the query parameter 'q' with the search term
    url.searchParams.set("query", searchTerm);

    // Update the URL without reloading the page
    window.history.pushState({}, "", url);
};

export function removeQueryFromUrl(param: string) {
    // Get the current URL
    const currentUrl = window.location.href;

    // Create a new URL object from the current URL
    const url = new URL(currentUrl);

    // Check if the query parameter exists and remove it
    if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
    }

    // Update the URL without reloading the page
    window.history.pushState({}, "", url);
}

export function getUrlQuery(query: string) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(query);
}

export function getFullUrlQueryValue(query: string) {
    const url = new URL(window.location.href);
    const search = url.search;
    const result = search.replace(`?${query}=`, "");
    return result;
}

export const updateUrlQuery = (param: { key: string; value: string }) => {
    const { key, value } = param;
    const url = new URL(window.location.href); // Create a URL object with the current location
    const params = new URLSearchParams(url.search); // Get the current query params

    // Update the query parameter
    if (value === null || value === undefined || value === "") {
        params.delete(key); // Remove param if value is null/undefined/empty
    } else {
        params.set(key, value); // Set the new value for the param
    }

    // Update the browser's URL without reloading the page
    window.history.pushState({}, "", `${url.pathname}?${params}`);
};

export function searchResultHasData(searResult: SearchResult) {
    return Object.values(searResult).some(innerObj => innerObj.results && innerObj.results.length > 0);
}

export function isValidEmail(str: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(str);
}

export const ensureHttps = (url: string) => {
    if (!url) return "";
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
};

export async function fetchImagePreview(url: string) {
    const proxyUrl = "https://thingproxy.freeboard.io/fetch/"; // Replace with your own proxy if needed

    try {
        const response = await fetch(`${proxyUrl}${url}`);

        const text = await response.text();

        // Use regex to extract Open Graph image tag
        const ogImageMatch = text.match(/<meta name="og:image" content="(.*?)"/);
        const twitterImageMatch = text.match(/<meta name="twitter:image" content="(.*?)"/);
        const thumbnail = text.match(/<meta name="thumbnail" content="(.*?)"/);
        const description = text.match(/<meta name="description" content="(.*?)"/);

        let data: any = {
            thumbnail: null,
            description: null,
        };

        if (ogImageMatch && ogImageMatch?.length) {
            data.thumbnail = ogImageMatch[1];
        }

        if (twitterImageMatch && twitterImageMatch?.length) {
            data.thumbnail = twitterImageMatch[1];
        }

        if (thumbnail && thumbnail?.length) {
            data.thumbnail = thumbnail[1];
        }

        if (description && description?.length) {
            data.description = description[1];
        }

        return data; // No preview image found
    } catch (error) {
        console.error("Error fetching image preview:", error);
        return {
            thumbnail: null,
            description: null,
        };
    }
}

export function projectCategoryToUrl(str: string) {
    // @ts-ignore
    if ([ProjectDocumentCategories.planAndElevation, ProjectDocumentCategoriesPlural.planAndElevations].includes(str)) {
        return "plans-and-elevation";
    }

    return convertCamelToHyphenated(str);
}
export function isAlphabetic(str: string) {
    return /^[A-Za-z\s]+$/.test(str);
}

export function isObjectArray(arr: any) {
    if (!Array.isArray(arr) || arr.length === 0) {
        return false;
    }

    // Check if all items are strings
    if (arr.every(item => typeof item === "string")) {
        return false;
    }

    // Check if all items are objects
    if (arr.every(item => typeof item === "object" && item !== null && !Array.isArray(item))) {
        return true;
    }

    return false;
}
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isTabletDevice() {
    // Check for tablet by screen size or user agent patterns
    const userAgent = navigator.userAgent.toLowerCase();
    // Common user agent keywords for tablets
    const tabletKeywords = /(ipad|tablet|(android(?!.*mobile))|kindle|playbook|silk|nexus 7)/i;
    // Screen width commonly used by tablets
    const isTabletScreenSize = window.innerWidth >= 600 && window.innerWidth <= 1024;
    return tabletKeywords.test(userAgent) || isTabletScreenSize;
}

export function projectDocumentPathName(category: string) {
    if (category === "plan_and_elevations") return "plans-and-elevation";
    if (category === "permits") return "permits";
    if (category === "estimates") return "estimates";
    if (category === "contracts") return "contracts";
    if (category === "change_orders") return "change-orders";
    if (category === "payment_schedules") return "payment-schedules";
    if (category === "performance_schedules") return "performance-schedules";
    if (category === "specifications") return "specifications";
    if (category === "communications") return "communications";
    if (category === "galleries") return "gallery";
    return category;
}

export function formatPhoneNumber(input: string) {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, "");

    // Format by adding hyphens after the first 3 and second 3 digits
    return "+" + cleaned.replace(/^(\d{3})(\d{3})(\d+)$/, "$1-$2-$3");
}

export function formatPhoneNumberWithSpace(input: string) {
    // Remove all non-digit characters
    const cleaned = input.replace(/\D/g, "");

    // Format: Separate numbers with a space every 3 digits (for 10+ digit numbers)
    return "+" + cleaned.replace(/(\d{3})(?=\d)/g, "$1 ");
}

export function isValidPhoneInput(key: string): boolean {
    // Only allow digits, +, -, and spaces
    const allowedChars = /^[0-9+\-\s]$/;
    return allowedChars.test(key);
}

export function isValidPhoneNumber(phone: string): boolean {
    // only allow digits, +, -, and spaces
    const phoneRegex = /^[+\d\s-]+$/;

    if (!phoneRegex.test(phone)) {
        return false;
    }

    // verify count of digits and ignore other characters
    const digitCount = phone.replace(/\D/g, "").length;
    return digitCount >= 10;
}
