import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Crumb } from "./BreadCrumbs";
import UserSideNavInfo from "./UserSideNavInfo";
import BlueHeaderLeftImage from "./icons/BlueHeaderLeftImage";
import { searchActions } from "@/store/search-reducer";
import { useDispatch } from "react-redux";
import { getUrlQuery, isMobileDevice, isTabletDevice } from "@/helpers";
import { GLOBAL_SEARCH_PAGES } from "@/helpers/constants";

type LayoutProps = {
    children?: React.ReactNode;
    pageTitle?: string;
    breadCrumbs: Crumb[];
    onSearch?: (searchTerm: string) => void;
};

export default function DashboardLayout({ children, pageTitle, breadCrumbs, onSearch }: LayoutProps) {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.account);
    useEffect(() => {
        // Empty the search results
        dispatch(searchActions.setSearchResults(null));

        if (user && !user.isRegistrationCompleted) {
            router.push(`/account/create`);
            return;
        }
    }, []);

    useEffect(() => {
        const query = getUrlQuery("query");
        if (query && onSearch) {
            onSearch(query);
        }
    }, []);

    return (
        <div className="">
            <Head>
                <title>{`${pageTitle ? pageTitle + " - " : ""} tuulbox`}</title>
            </Head>
            {user?.isRegistrationCompleted ? (
                <div className="dashboard_wrapper d-flex position-relative">
                    <BlueHeaderLeftImage
                        width={"2.8rem"}
                        height={71}
                        className="position-fixed left-0 top-0 z-index-1 box-sizing-border-box"
                    />
                    <aside className={`d-none d-lg-block bg-primary side-nav pt-80`}>
                        <Sidebar />
                        <UserSideNavInfo />
                    </aside>
                    <div className="content w-100">
                        <TopNav pageTitle={pageTitle} breadcrumbs={breadCrumbs} />
                        <main
                            className={`${
                                (isMobileDevice() || isTabletDevice()) && GLOBAL_SEARCH_PAGES.includes(router.pathname)
                                    ? "pt-88"
                                    : isMobileDevice() || isTabletDevice()
                                    ? "pt-40"
                                    : ""
                            }`}
                        >
                            <div className="">{children}</div>
                        </main>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
