import { Modal, Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { clearProjectStore } from "@/store/project-reducer";
import { clearRecentStore } from "@/store/recent-reducer";
import { clearFavoriteStore } from "@/store/favorite-reducer";
import { clearProjectDocumentStore } from "@/store/project-document-reducer";
import { clearStorageStore } from "@/store/storage-reducer";
import { clearLicenseStore } from "@/store/license-reducer";
import { clearInsuranceStore } from "@/store/insurance-reducer";
import { clearContactStore } from "@/store/contact-reducer";
import { clearOfficerStore } from "@/store/officers-reducer";
import { clearResources } from "@/store/links-reducer";
import { authActions } from "@/store/auth-reducer";
import {
    clearProjectsFromLocalStorage,
    clearRecentsFromLocalStorage,
    clearFavoritesFromLocalStorage,
    clearProjectDocumentsFromLocalStorage,
    clearStorageFromLocalStorage,
    clearLicensesFromLocalStorage,
    clearInsurancesFromLocalStorage,
    clearContactsFromLocalStorage,
    clearOfficersFromLocalStorage,
    clearLinksFromLocalStorage,
} from "@/store";
import DI from "@/di-container";
import Image from "next/image";

type DeleteModalState = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
};

const DEFAULT_MESSAGE = "Are you sure you want to logout?";

export default function LogoutModal(props: DeleteModalState) {
    const { showModal, setShowModal } = props;
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            // First, clear project data from the Redux store
            dispatch(clearProjectStore());

            // Clear recent activities data from the Redux store
            dispatch(clearRecentStore());

            // Clear recent activities data from the Redux store
            dispatch(clearRecentStore());

            dispatch(clearFavoriteStore());

            dispatch(clearProjectDocumentStore());

            dispatch(clearStorageStore());

            dispatch(clearLicenseStore());

            dispatch(clearInsuranceStore());

            dispatch(clearContactStore());

            dispatch(clearOfficerStore());

            dispatch(clearResources());

            // Clear any potential project data from localStorage
            clearProjectsFromLocalStorage();

            // Clear any potential recent activities data from localStorage
            clearRecentsFromLocalStorage();

            // Clear any potential recent activities data from localStorage
            clearRecentsFromLocalStorage();

            clearFavoritesFromLocalStorage();

            clearProjectDocumentsFromLocalStorage();

            clearStorageFromLocalStorage();

            clearLicensesFromLocalStorage();

            clearInsurancesFromLocalStorage();

            clearContactsFromLocalStorage();

            clearOfficersFromLocalStorage();

            clearLinksFromLocalStorage();

            // Now clear auth state
            dispatch(authActions.logout());

            // Finally, perform the actual logout service call
            await DI.authService.logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <Modal centered show={showModal} onHide={() => setShowModal(false)} className="delete-modal">
            <Modal.Body className="text-center">
                <div className="text-center d-flex flex-column">
                    <div className="delete-icon-box d-flex mx-auto">
                        <Image
                            className="m-auto"
                            src={`/images/svg/icons/warning-triangle.svg`}
                            width={24}
                            height={24}
                            alt=""
                        />
                    </div>
                    <div className="mt-4">
                        <h4 className="text-capitalize tb-title-subsection-medium">Logout</h4>
                        <p className="m-0 text-muted">{DEFAULT_MESSAGE}</p>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="p-3">
                <div className="d-flex justify-content-center w-100">
                    <Button className="me-2 w-100" variant="outline-secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" className="w-100" onClick={handleLogout}>
                        Yes, Logout
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
