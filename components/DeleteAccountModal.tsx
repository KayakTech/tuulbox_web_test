import { Button, Form, Modal } from "react-bootstrap";
import ButtonLoader from "./ButtonLoader";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useDispatch } from "react-redux";
import { deleteAccountActions } from "@/store/delete-account-reducer";
import Image from "next/image";
import useAccount from "@/hooks/account";
import { ACCOUNT_DELETION_REASONS } from "@/helpers/constants";

export default function DeleteAccountModal() {
    const dispatch = useDispatch();
    const { showModal } = useSelector((state: RootState) => state.deleteAccount);
    const { deleteAccount, isDeletingAccount, deleteAccountReason, setDeleteAccountReason } = useAccount();

    function closeModal() {
        dispatch(deleteAccountActions.setShowDeleteAccountModal(false));
        setDeleteAccountReason({ reason: "", notes: "" });
    }

    return (
        <Modal centered show={showModal} onHide={closeModal} className="delete-account-modal me-0">
            <div className="d-flex flex-column align-items-center justify-content-center  p-20 rounded-4 bg-white modal-px">
                <Form className="w-100" onSubmit={deleteAccount}>
                    <Modal.Body className="m-0 p-0 d-flex flex-column gap-4">
                        <div className="text-center d-flex flex-column gap-4">
                            <div className="delete-icon-box d-flex mx-auto">
                                <Image
                                    className="m-auto"
                                    src={`/images/svg/icons/warning-triangle.svg`}
                                    width={24}
                                    height={24}
                                    alt=""
                                />
                            </div>
                            <div className="mt-4 w-100">
                                <h4 className="text-capitalize tb-title-subsection-medium">Delete Account</h4>
                                <p className="m-0 text-gray-400 tb-body-large-regular">
                                    This will delete your account info, profile and all of your data.
                                </p>
                            </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-center w-100 flex-column gap-4">
                            {ACCOUNT_DELETION_REASONS.map((reason: any, index: number) => (
                                <div className="reason-container acc" key={reason.value}>
                                    <Form.Check type="radio" id={reason.value}>
                                        <Form.Check.Input
                                            type={"radio"}
                                            name="delete-reason"
                                            onChange={e => {
                                                setDeleteAccountReason({ reason: reason.value });
                                            }}
                                        />
                                        <Form.Check.Label className="m-0 ms-2 mt-1 pointer text-gray-600 tb-body-default-medium">
                                            {reason.label}
                                        </Form.Check.Label>
                                    </Form.Check>
                                </div>
                            ))}
                        </div>
                        {deleteAccountReason?.reason === "other" && (
                            <div className="w-100">
                                <Form.Group className="mb-3 p-0" controlId="exampleForm.ControlTextarea1">
                                    <Form.Label className="text-gray-600 tb-title-body-medium">
                                        Additional Note
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={5}
                                        className=""
                                        placeholder="Type your message here..."
                                        value={deleteAccountReason.notes}
                                        onChange={e => setDeleteAccountReason({ notes: e.target.value })}
                                        maxLength={250}
                                    />
                                </Form.Group>
                            </div>
                        )}
                    </Modal.Body>
                    <div className="border-top-0 pt-4 pb-0 m-0 gap-3  w-100 d-flex justify-content-end">
                        <Button
                            className="tb-title-body-medium px-3 py-2 w-140"
                            variant="outline-secondary"
                            disabled={isDeletingAccount}
                            onClick={closeModal}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="danger"
                            type="submit"
                            className="px-3 py-2 tb-title-body-medium w-240"
                            disabled={isDeletingAccount || !deleteAccountReason.reason}
                        >
                            {isDeletingAccount ? <ButtonLoader buttonText="Deleting..." /> : "Delete Account"}
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
}
