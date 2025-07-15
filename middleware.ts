import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { JWT_COOKIE_KEY } from "./constants";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest, res: NextResponse, next: NextResponse) {
    const isTokenValid = request.cookies.get(JWT_COOKIE_KEY)?.value ?? false;

    const hostName = request.nextUrl.host;
    const pathName = await request.nextUrl.pathname;
    const AUTH_PAGES = ["/login", "/register", "/reset-password", "/forgot-password"];
    const WEBSITE_PAGES = ["/contact", "/support", "/coming-soon", "/accept-invite-route"];
    const isAuthPage = AUTH_PAGES.includes(pathName);
    const url = new URL(request.url);
    const urlPath = url.pathname;
    const isWebsitePage = WEBSITE_PAGES.includes(pathName) || urlPath.includes("/projects/shared");

    const permissionId = url.searchParams.get("permissionId");

    if (pathName.includes("/invite/") && !isTokenValid) {
        // /invite/9a4fddcd-bb7e-4604-a8dc-299efdca7f92?is_new_user=true&email=abc@abc.com
        // check if query contains is_new_user
        const is_new_user = url.searchParams.get("is_new_user");
        const email = url.searchParams.get("email");

        const redirect = pathName;

        let response = NextResponse.redirect(new URL(`/login?redirect=${redirect}`, request.url));

        if (is_new_user) {
            response = NextResponse.redirect(new URL(`/register?redirect=${redirect}`, request.url));
        }

        // save email in cookie to be used in register or login page
        response.cookies.set({
            name: "email",
            value: email ?? "",
        });

        return response;
    }

    if (
        (isAuthPage ||
            (!isAuthPage && !isTokenValid && !isWebsitePage) ||
            (!isAuthPage && isTokenValid && !isWebsitePage)) &&
        hostName === "tuulbox.app"
    ) {
        return NextResponse.redirect(new URL("/coming-soon", request.url));
    }

    if (isAuthPage && isTokenValid) {
        return NextResponse.redirect(new URL("/overview", request.url));
    }
    if (!isAuthPage && !isTokenValid && !isWebsitePage) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathName === "/") {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathName === "/settings") {
        return NextResponse.redirect(new URL("/settings/profile", request.url));
    }
    if (pathName === "/calendar/events") {
        return NextResponse.redirect(new URL("/calendar/events/add", request.url));
    }
    if (pathName === "/contact") {
        return NextResponse.redirect(new URL("/support", request.url));
    }
    if (pathName === "/business/company/company-details") {
        return NextResponse.redirect(new URL("/business/company", request.url));
    }

    if (permissionId) {
        // Construct the new URL path
        const newUrl = `${url.origin}/projects/shared/${permissionId}`;

        // Redirect to the new URL
        return NextResponse.redirect(newUrl);
    }

    if (pathName === "/accept-invite-route") {
        const userAgent = request.headers.get("user-agent") || "";
        const isMobile = /mobile/i.test(userAgent);

        const isAndroid = /android/i.test(userAgent);
        const isApple = /iphone|ipad|ipod/i.test(userAgent);

        const inviteId = url.searchParams.get("inviteId");
        if (inviteId && !isMobile) {
            if (!isTokenValid) {
                return NextResponse.redirect(new URL(`/login?inviteId=${inviteId}`, request.url));
            }
            return NextResponse.redirect(new URL(`/invite/${inviteId}`, request.url));
        }

        if (isMobile) {
            if (isApple) {
                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_STORE_APP_URL}`);
            } else if (isAndroid) {
                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_PLAY_STORE_APP_URL}`);
            }
        }
    }
}

export const config = {
    matcher: [
        "/",
        "/overview",
        "/login",
        "/register",
        "/overview/:path*",
        "/business/:path*",
        "/calendar/:path*",
        "/contacts/:path*",
        "/communication/:path*",
        // "/expirations/:path*",
        "/links/:path*",
        "/projects/:path*",
        "/storage/:path*",
        "/account/:path*",
        "/settings/:path*",
        "/reset-password/:path*",
        "/forgot-password/:path*",
        "/support",
        "/contact",
        "/recents/:path*",
        "/recents",
        "/coming-soon",
        "/accept-invite-route/:path*",
        "/accept-invite-route",
        "/invite/:path*",
        "/invite",
    ],
};
