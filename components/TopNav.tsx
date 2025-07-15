import { Navbar, Nav, Offcanvas, NavDropdown, Form, InputGroup, Container } from "react-bootstrap";
import { Iconly } from "react-iconly";
import { DASHBOARD_TOPNAV_LINKS, GLOBAL_SEARCH_PAGES, SEARCH_MODULES, SearchModule } from "@/helpers/constants";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import BreadCrumbs, { Crumb } from "./BreadCrumbs";
import SearchModal from "./SearchModal";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { searchActions } from "@/store/search-reducer";
import { useDispatch } from "react-redux";
import CompanyImage from "./CompanyImage";
import { User } from "iconsax-react";
import UserSideNavInfo from "./UserSideNavInfo";
import LogoutModal from "./LogoutModal";
import DeleteAccountModal from "./DeleteAccountModal";
import NotificationDropdown from "./NotificationDropdown";
import useSearchForm from "@/hooks/searchForm";
import { useRouter } from "next/router";
import BlueHeaderLeftImage from "./icons/BlueHeaderLeftImage";
import SearchForm from "./SearchForm";
import { isMobileDevice, isTabletDevice } from "@/helpers";

type TopNavProps = {
    breadcrumbs: Crumb[];
    pageTitle?: string;
};

export default function TopNav({ breadcrumbs, pageTitle }: TopNavProps) {
    const dispatch = useDispatch();
    const router = useRouter();
    const { query, pathname } = router;

    const { setSearchTerm } = useSearchForm();

    const [showSidebarModal, setShowSidebarModal] = useState<boolean>(false);
    const { showModal } = useSelector((state: RootState) => state.searchResults);
    const { company } = useSelector((state: RootState) => state.business);
    const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

    useEffect(() => {
        setSearchTerm(query.q);
        // search();
    }, [query.q]);

    return (
        <>
            <Navbar bg="white" expand="lg" fixed="top" className="top_nav flex-column border border-gray-100">
                {isMobileDevice() || isTabletDevice() ? (
                    <Container fluid className="w-100 bg-white border-bottom border-gray-100">
                        <div className="d-flex flex-column w-100">
                            <div className="d-flex w-100 justify-content-between">
                                <Nav
                                    aria-controls="navbarScroll"
                                    onClick={() => {
                                        setShowSidebarModal(true);
                                    }}
                                    className="border-0 d-block d-lg-none me-2"
                                >
                                    <div
                                        className="bg-gray-50 d-flex align-items-center justify-content-center border-gray-50 rounded-2"
                                        style={{ width: "40px", height: "40px", border: "0.5px" }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1}
                                            stroke="#333333"
                                            className="w-75"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                            />
                                        </svg>
                                    </div>
                                </Nav>
                                <Navbar id="responsive-navbar-nav" className="p-0">
                                    <Nav className="flex-row align-items-center">
                                        <Nav.Link href="" className="d-flex align-items-center text-gray-500">
                                            {company?.name}
                                        </Nav.Link>

                                        <Nav.Link
                                            href=""
                                            className="d-flex p-0 flex-shrink-0 object-fit-cover align-items-center px-3 text-gray-500"
                                        >
                                            <CompanyImage />
                                        </Nav.Link>
                                        <Nav className="d-flex align-items-center">
                                            <NotificationDropdown />
                                        </Nav>
                                    </Nav>
                                </Navbar>
                            </div>

                            <div className="d-flex flex-column my-12">
                                <div className="">
                                    <Navbar.Brand className="d-flex me-autog align-items-center text-gray-800 tb-title-body-medium">
                                        <BreadCrumbs crumbs={breadcrumbs} />
                                    </Navbar.Brand>
                                </div>
                            </div>
                            {/* Search form */}
                            {GLOBAL_SEARCH_PAGES.includes(pathname) && (
                                <div className="mb-24">
                                    <SearchForm />
                                </div>
                            )}
                        </div>
                    </Container>
                ) : (
                    <div className="container-fluid d-flex">
                        <Nav
                            aria-controls="navbarScroll"
                            onClick={() => {
                                setShowSidebarModal(true);
                            }}
                            className="border-0 d-block d-lg-none me-2"
                        >
                            <div
                                className="bg-gray-50 d-flex align-items-center justify-content-center border-gray-50 rounded-2"
                                style={{ width: "40px", height: "40px", border: "0.5px" }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1}
                                    stroke="#333333"
                                    className="w-75"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                    />
                                </svg>
                            </div>
                        </Nav>

                        <Navbar.Brand className="d-lg-flex d-none me-auto align-items-center text-gray-800 tb-title-body-medium">
                            <BreadCrumbs crumbs={breadcrumbs} />
                        </Navbar.Brand>

                        {/* Search form */}
                        {GLOBAL_SEARCH_PAGES.includes(pathname) && <SearchForm />}

                        <Navbar id="responsive-navbar-nav" className="d-flex align-items-center">
                            <Nav className="ms-auto flex-row align-items-center">
                                <Nav.Link href="" className="d-flex align-items-center text-gray-500">
                                    {company?.name}
                                </Nav.Link>

                                <Nav.Link
                                    href=""
                                    className="d-flex flex-shrink-0 object-fit-cover align-items-center px-3 text-gray-500"
                                >
                                    <CompanyImage />
                                </Nav.Link>

                                <Nav className="d-flex align-items-center pe-md-0">
                                    <NotificationDropdown />
                                </Nav>
                            </Nav>
                        </Navbar>
                        <LogoutModal showModal={showLogoutModal} setShowModal={setShowLogoutModal} />
                    </div>
                )}
            </Navbar>

            <SearchModal showModal={showModal} setShowModal={data => dispatch(searchActions.setShowModal(data))} />
            <DeleteAccountModal />

            <Offcanvas
                name="Sidbar"
                show={showSidebarModal}
                onHide={() => setShowSidebarModal(false)}
                className="sidebar"
            >
                <BlueHeaderLeftImage width={30} height={54} className="position-absolute left-0 top-0 z-index-1" />
                <Offcanvas.Body className="p-0 pb-80 pt-80">
                    <aside className="dashboard_wrapper side-nav">
                        <Sidebar />
                        <UserSideNavInfo />
                    </aside>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}
