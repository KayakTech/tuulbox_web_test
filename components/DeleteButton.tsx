import { ExportSquare, Link, Trash } from "iconsax-react";
import { Button, Col } from "react-bootstrap";
import { Iconly } from "react-iconly";
import DeleteAccountModal from "./DeleteAccountModal";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteAccountActions } from "@/store/delete-account-reducer";

export default function DeleteButton() {
    const dispatch = useDispatch();
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showModal, setShowDeleteModal] = useState(false);

    const handleDeleteButtonClick = () => {
        dispatch(deleteAccountActions.setShowDeleteAccountModal(true));
    };
    return (
        <div>
            <Button
                variant="light"
                className="delete-account-button d-flex align-items-center justify-content-center border-red-50 tb-body-default-medium"
                onClick={handleDeleteButtonClick}
            >
                <Trash className="me-2" size="16" color="#E70000" /> Delete
            </Button>
        </div>
    );
}
