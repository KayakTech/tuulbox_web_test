import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Button, Form, Offcanvas, InputGroup } from "react-bootstrap";
import { Iconly } from "react-iconly";
import { useEffect } from "react";
import Image from "next/image";
import ButtonLoader from "@/components/ButtonLoader";
import Required from "@/components/Required";
import FormErrorMessage from "@/components/FormErrorMessage";
import Link from "next/link";
import useAccount from "@/hooks/account";
import { useRouter } from "next/router";
import PhoneInput from "react-phone-input-2";

export default function Account() {
    const router = useRouter();
    const {
        errorMessage,
        profileImageRef,
        showEditPersonalInformationModal,
        setShowPersonalInformationModal,
        isValid,
        state,
        dispatch,
        onInputChange,
        renderErrorMessage,
        handleSaveUserProfile,
        user,
        previewImage,
        closeAccountModal,
    } = useAccount();

    useEffect(() => {
        if (!user?.isRegistrationCompleted) {
            router.push("/account/create");
        }
    }, [user]);

    return (
        <DashboardLayout pageTitle="Account Settings" breadCrumbs={[{ name: "Account" }]}>
            <div className="container-fluid">
                <Row>
                    <Col sm={12} className="mb-4">
                        <Card className="p-4">
                            <Card.Body>
                                <Card.Title className="mb-4">Personal information</Card.Title>
                                <Row>
                                    <Col sm={6}>
                                        <div className="d-flex align-items-center">
                                            <div className="profile-image me-2 big">
                                                {!user?.profilePicture ? (
                                                    <Iconly name="Image" primaryColor="grey" set="light" size={25} />
                                                ) : (
                                                    <Image
                                                        className="rounded-circle object-fit-cover flex-shrink-0"
                                                        width={60}
                                                        height={60}
                                                        src={user?.profilePicture || ""}
                                                        alt=""
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <p className="m-0">{`${user?.firstName} ${user?.lastName}`}</p>
                                                <small className="text-muted">{user?.email.toLowerCase()}</small>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <Button
                                            variant="secondary"
                                            className="px-5 float-md-end mt-4 mt-lg-0"
                                            onClick={() => setShowPersonalInformationModal(true)}
                                        >
                                            <Iconly set="light" name="Edit" /> Edit
                                        </Button>
                                    </Col>
                                </Row>

                                <Row className="mt-4">
                                    <Col sm={12}>
                                        <h6>More details</h6>
                                    </Col>
                                    <Col sm={6} md={8}>
                                        <ul className="list-unstyled">
                                            <li className="mt-3">
                                                <Row>
                                                    <Col sm={4} className="text-muted">
                                                        Mobile
                                                    </Col>
                                                    <Col sm={8}>{user?.mobile}</Col>
                                                </Row>
                                            </li>
                                            <li className="mt-3">
                                                <Row>
                                                    <Col sm={4} className="text-muted">
                                                        Address
                                                    </Col>
                                                    <Col sm={8}>{user?.address} </Col>
                                                </Row>
                                            </li>
                                            <li className="mt-3 d-none">
                                                <Row>
                                                    <Col sm={4} className="text-muted">
                                                        Date of birth
                                                    </Col>
                                                    <Col sm={8}>N/A</Col>
                                                </Row>
                                            </li>
                                        </ul>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Notifications */}
                    <Col sm={12} className="mb-4">
                        <Card className="p-4">
                            <Card.Body>
                                <Row>
                                    <Col sm={6}>
                                        <div className="d-flex">
                                            <Iconly name="Notification" primaryColor="grey" set="light" size={25} />
                                            <div className="ms-2">
                                                <h6 className="m-0 fw-bold">Notifications</h6>
                                                <small className="text-muted">Receive notifications at all times</small>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col
                                        sm={6}
                                        className="align-items-center d-flex justify-content-start justify-content-md-end"
                                    >
                                        <Form.Check type="switch" className="float-md-end mt-4 mt-lg-0" />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Security */}
                    <Col sm={12} className="mb-4">
                        <Card className="p-4">
                            <Card.Body>
                                <Row>
                                    <Col sm={6}>
                                        <div className="d-flex">
                                            <Iconly name="ShieldDone" primaryColor="grey" set="light" size={25} />
                                            <div className="ms-2">
                                                <h6 className="m-0 fw-bold">Security</h6>
                                                <small className="text-muted">
                                                    Get to know more about how we manage your data.
                                                </small>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <Link href={"https://tuulbox.trunspoz.com/"} target="_blank">
                                            <Button variant="secondary" className="px-5 float-md-end mt-4 mt-lg-0">
                                                <Iconly set="light" name="Upload" /> Open
                                            </Button>
                                        </Link>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Delete account */}
                    <Col sm={12} className="mb-4">
                        <Card className="p-4">
                            <Card.Body>
                                <Row>
                                    <Col sm={6}>
                                        <div className="d-flex">
                                            <Iconly name="Danger" primaryColor="grey" set="light" size={25} />
                                            <div className="ms-2">
                                                <h6 className="m-0 fw-bold">Delete user account</h6>
                                                <small className="text-muted">
                                                    Danger zone. You will lose all data related to the action.
                                                </small>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={6}>
                                        <Button variant="secondary" className="px-5 float-md-end mt-4 mt-lg-0">
                                            <Iconly set="light" name="Delete" /> Delete
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            <Offcanvas
                show={showEditPersonalInformationModal}
                onHide={closeAccountModal}
                placement="end"
                name="Edit personal details"
                backdrop="static"
            >
                <Offcanvas.Body className="p-0 d-flex flex-column">
                    <Form validated={isValid} onSubmit={handleSaveUserProfile}>
                        {showEditPersonalInformationModal && (
                            <Button variant="primary" className="close mb-4 mb-md-0" onClick={closeAccountModal}>
                                <Image src={`/images/svg/icons/close.svg`} width={12} height={12} alt="close" />
                            </Button>
                        )}
                        <div className="px-5 py-3 account-form">
                            <h6>Update personal information</h6>
                            <input
                                type="file"
                                hidden
                                ref={profileImageRef}
                                accept="image/*"
                                onChange={e => onInputChange("profilePicture", e)}
                            />
                            <div
                                className="profile-image large mx-auto my-3 position-relative pointer"
                                onClick={() => {
                                    if (profileImageRef.current) {
                                        profileImageRef.current.click();
                                    }
                                }}
                            >
                                {user?.profilePicture || previewImage ? (
                                    <Image
                                        className="rounded-circle object-fit-cover w-full h-full  "
                                        fill
                                        src={previewImage || user?.profilePicture || ""}
                                        alt=""
                                    />
                                ) : (
                                    <Iconly name="Image" set="light" primaryColor="grey" />
                                )}

                                <div className="profile-image small position-absolute">
                                    <Image src={`/images/svg/icons/plus.svg`} width={10} height={10} alt="Add image" />
                                </div>
                            </div>
                            <Form.Group className="mb-3" controlId="firstName">
                                <Form.Label>
                                    First name <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={state.firstName}
                                    onChange={e => onInputChange("firstName", e)}
                                    required
                                />
                                {renderErrorMessage("firstName")}
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="lastName">
                                <Form.Label>
                                    Last name <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={state.lastName}
                                    onChange={e => onInputChange("lastName", e)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>
                                    Email <Required />
                                </Form.Label>
                                <InputGroup hasValidation>
                                    <Form.Control
                                        type="email"
                                        value={state.email}
                                        onChange={e => onInputChange("email", e)}
                                        required
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="phone">
                                <Form.Label>
                                    Mobile <Required />
                                </Form.Label>
                                <InputGroup>
                                    <PhoneInput
                                        country={"us"}
                                        value={state.mobile}
                                        onChange={value => onInputChange("mobile", value)}
                                        specialLabel={""}
                                        countryCodeEditable={false}
                                    />
                                </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="address">
                                <Form.Label>
                                    Address <Required />
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    value={state.addressLine1}
                                    onChange={e => dispatch({ addressLine1: e.target.value })}
                                    required
                                />
                            </Form.Group>
                        </div>
                        <div className="mt-auto border-top p-4 bottom-0 position-absolute w-100">
                            {errorMessage && <FormErrorMessage message={errorMessage} />}
                            <div className="d-flex justify-content-center align-items-center">
                                <Button variant="default" className="px-4 me-2" onClick={closeAccountModal}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={state.isUpdating}>
                                    {state.isUpdating ? <ButtonLoader buttonText={`Saving...`} /> : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
        </DashboardLayout>
    );
}
