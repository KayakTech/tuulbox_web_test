import ProfileImage from "./ProfileImage";
import Selector from "./icons/Selector";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { NavDropdown } from "react-bootstrap";
import { DASHBOARD_TOPNAV_LINKS } from "@/helpers/constants";
import { CloseCircle, LogoutCurve, User } from "iconsax-react";
import DI from "@/di-container";
import LogoutModal from "./LogoutModal";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteAccountActions } from "@/store/delete-account-reducer";

export default function UserSideNavInfo() {
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.account);
    const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

    function hanleMeneClick(link: any) {
        if (link?.name?.toLowerCase() === "delete account") {
            dispatch(deleteAccountActions.setShowDeleteAccountModal(true));
        }
    }

    return (
        <div className="fixed-bottom ps-2 pe-2 justify-content-between user-sidenav-info bg-accent-blue-900 d-flex">
            {
                <NavDropdown
                    align="end"
                    title={
                        <div className="d-flex align-items-center bg-primary">
                            <ProfileImage />
                            <div className="d-flex flex-column mx-2">
                                <span className="text-white text-truncate small" style={{ maxWidth: "156px" }}>
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span
                                    className="text-gray-200 tb-body-small-regular text-truncate small"
                                    style={{ maxWidth: "156px" }}
                                >
                                    {user?.email.toLowerCase()}
                                </span>
                            </div>
                            <Selector />
                        </div>
                    }
                    id="collasible-nav-dropdown"
                    className="profile-dropdown my-auto"
                >
                    {DASHBOARD_TOPNAV_LINKS.map((link, index) => (
                        <NavDropdown.Item
                            className=""
                            href={`${link.url}`}
                            key={`${index}${link}`}
                            onClick={() => hanleMeneClick(link)}
                        >
                            {link.icon === "User" && <User size={16} />}
                            {link.icon === "Delete" && <CloseCircle size={16} />}
                            <span className={`ms-2`}>{link.name}</span>
                        </NavDropdown.Item>
                    ))}
                    <NavDropdown.Item onClick={() => setShowLogoutModal(true)}>
                        <LogoutCurve size={16} color="red" />
                        <span className={`ms-2 text-danger`}>Logout</span>
                    </NavDropdown.Item>
                </NavDropdown>
            }
            <LogoutModal showModal={showLogoutModal} setShowModal={setShowLogoutModal} />
        </div>
    );
}
