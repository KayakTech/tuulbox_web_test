import { Button, Container, Nav, Navbar } from "react-bootstrap";
import LogoWhite from "./LogoWhite";
import Link from "next/link";
import Logo from "./Logo";
import { useEffect, useState } from "react";
import { CloseCircle, HambergerMenu, Menu, TextalignJustifyright, User } from "iconsax-react";
import { MenuList } from "react-select/dist/declarations/src/components/Menu";
import { X } from "react-feather";
import { isLoggedIn } from "@/helpers";
import { useRouter } from "next/router";
import LogoutModal from "./LogoutModal";

export default function WebsiteTopNav() {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [opened, setOpened] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const targetScrollPosition = 100; // Adjust this value to your desired scroll position

            if (scrollPosition >= targetScrollPosition) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    function toggleDropdown() {
        setOpened(!opened);
    }

    function logoutOrLogin() {
        if (isLoggedIn()) {
            setShowLogoutModal(true);
            return;
        }

        router.push("/overview");
    }

    return (
        <>
            <Navbar
                expand="lg"
                className={`website-topnav ${scrolled ? "scrolled" : ""} ${opened ? "bg-white" : "bg-transparent"}`}
                fixed="top"
            >
                <Container>
                    <Navbar.Brand href="/">
                        <span className="d-none d-lg-block">
                            <LogoWhite width={175.77} height={50.14} />
                        </span>
                        <span className="d-block d-lg-none">{opened ? <Logo /> : <LogoWhite />}</span>
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="navbarScroll" className="border-0" onClick={toggleDropdown}>
                        {opened ? <X size={24} color="#51526C" /> : <HambergerMenu size={24} color={`white`} />}
                    </Navbar.Toggle>
                    <Navbar.Collapse id="navbarScroll" className="mt-4 mt-md-0">
                        <Nav
                            className="mx-auto my-2 my-lg-0 gap-3 gap-md-0"
                            style={{ maxHeight: "100px" }}
                            navbarScroll
                        >
                            <Nav.Link href="/contact" className="">
                                Contact us
                            </Nav.Link>
                        </Nav>
                        <div className="d-flex gap-3">
                            <Link href={"javascript:void(0)"} className="d-block d-md-inline mb-2 mb-md-0 ">
                                <Button variant="default" className="w-100 w-lg-auto px-4" onClick={logoutOrLogin}>
                                    {isLoggedIn() ? "Logout" : "Login"}
                                </Button>
                            </Link>
                            <Link href={"/register"} className="d-block d-md-inline text-decoration-none">
                                {/* For mobile */}
                                <Button variant="primary" className="w-100 w-lg-auto d-block d-md-none border-white">
                                    {isLoggedIn() ? "Go to App" : "Sign up"}
                                </Button>
                                {/* For desktop */}
                                <Button
                                    variant="primary"
                                    className="w-auto d-none d-md-block bg-white text-primary border-white text-nowrap"
                                >
                                    {isLoggedIn() ? "Go to App" : "Sign up"}
                                </Button>
                            </Link>
                        </div>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <LogoutModal showModal={showLogoutModal} setShowModal={setShowLogoutModal} />
        </>
    );
}
