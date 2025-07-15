import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Button, Form, Offcanvas, InputGroup, ListGroup } from "react-bootstrap";
import { Iconly } from "react-iconly";
import { UserSquare, Notification, EmptyWallet, Messages2, DocumentText, ElementPlus, CloudPlus } from "iconsax-react";
import Required from "@/components/Required";
import Image from "next/image";
import { useEffect, useReducer, useState } from "react";
import SettingsMenu from "@/components/SettingsMenu";
import useAccount from "@/hooks/account";
import ButtonLoader from "@/components/ButtonLoader";
import FeedbackModal from "@/components/FeedbackModal";
import { CheckCircle } from "react-feather";
import ProfileImage from "@/components/ProfileImage";
import { Plus } from "react-feather";
import ProfileImageModal from "@/components/ProfileImageModal";
import { COUNTRIES } from "@/helpers/countries";
import { isNumbersOnly, isValidEmail, validateMobileNumber } from "@/helpers";
import PhoneInput from "react-phone-input-2";

export default function Profile() {
    const {
        user,
        state,
        dispatch,
        isSaving,
        handleSaveUserProfile,
        showFeedbackModal,
        setShowFeedbackModal,
        showProfileImageModal,
        setShowProfileImageModal,
        currentImage,
        setCurrentImage,
        previewImage,
    } = useAccount();

    let isCreatingAccount: boolean = false;
    return (
        <div className="overflow-hidden pb-5">
            <DashboardLayout breadCrumbs={[{ name: "Account settings", url: "/settings" }]} pageTitle="Settings">
                <div className="user-profile mt-4">
                    <SettingsMenu />

                    <div className="px-48 profile-card-padding">
                        <Form
                            onSubmit={e => handleSaveUserProfile(e, false)}
                            className="d-flex align-items-center justify-content-center w-100"
                        >
                            <Card className="mx-md-5 mt-5 w-100">
                                <Card.Header className="bg-transparent">
                                    <Card.Title className="text-gray-900 tb-title-subsection-medium">
                                        Profile
                                    </Card.Title>
                                </Card.Header>
                                <Card.Body>
                                    <div
                                        className="d-flex my-4 flex-shrink-0 object-fit-cover pointer position-relative"
                                        style={{ width: "80px", height: "94px" }}
                                        onClick={() => setShowProfileImageModal(true)}
                                    >
                                        <div className="profile-image img-size flex-shrink-0 object-fit-cover  large border border-3 border-gray-50">
                                            {user?.profilePicture ? (
                                                <Image
                                                    src={currentImage ?? user.profilePicture ?? ""}
                                                    width={80}
                                                    height={80}
                                                    alt="Profle image"
                                                    className="flex-shrink-0 img-size"
                                                />
                                            ) : (
                                                <span
                                                    className="text-uppercase text-gray-900 tb-title-subsection-medium"
                                                    style={{ fontSize: "20px" }}
                                                >
                                                    {user?.firstName[0]}
                                                    {user?.lastName[0]}
                                                </span>
                                            )}
                                        </div>

                                        <div className="profile-image small absolute bottom-0 end-50 d-flex">
                                            <Plus color="#007FFF" size={14} />
                                        </div>
                                    </div>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    First Name <Required />
                                                </Form.Label>
                                                <Form.Control
                                                    value={state?.firstName}
                                                    onChange={e => dispatch({ firstName: e.target.value })}
                                                    type="text"
                                                    placeholder="Kwame"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    Last Name
                                                </Form.Label>
                                                <Form.Control
                                                    value={state?.lastName}
                                                    onChange={e => dispatch({ lastName: e.target.value })}
                                                    type="text"
                                                    placeholder="Adu-Jamroll"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    Email
                                                </Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    value={state.email}
                                                    onChange={e => dispatch({ email: e.target.value })}
                                                    placeholder="Your email address"
                                                    readOnly
                                                    disabled
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    Phone
                                                </Form.Label>
                                                <PhoneInput
                                                    value={state?.mobile}
                                                    onChange={value =>
                                                        dispatch({ mobile: validateMobileNumber(value) })
                                                    }
                                                    placeholder="233244123456"
                                                    specialLabel=""
                                                    countryCodeEditable={false}
                                                    country={"us"}
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    Address Line 1
                                                </Form.Label>
                                                <Form.Control
                                                    value={state?.addressLine1}
                                                    onChange={e => dispatch({ addressLine1: e.target.value })}
                                                    placeholder="123 Some Awesome Street Name"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    Address Line 2
                                                </Form.Label>
                                                <Form.Control
                                                    value={state?.addressLine2}
                                                    onChange={e => dispatch({ addressLine2: e.target.value })}
                                                    placeholder="123 Some Awesome Street Name"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    Country
                                                </Form.Label>
                                                <Form.Select
                                                    value={state.country}
                                                    onChange={e => dispatch({ country: e.target.value })}
                                                    placeholder="Ghana"
                                                >
                                                    <option value="" disabled hidden></option>
                                                    {COUNTRIES.map(country => (
                                                        <option key={country.name} value={country.name}>
                                                            {country.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    State
                                                </Form.Label>
                                                <Form.Control
                                                    value={state?.state}
                                                    onChange={e => dispatch({ state: e.target.value })}
                                                    placeholder="Accra"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    City
                                                </Form.Label>
                                                <Form.Control
                                                    value={state?.city}
                                                    onChange={e => dispatch({ city: e.target.value })}
                                                    placeholder="Accra"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="text-gray-600 tb-body-default-medium">
                                                    Zip Code
                                                </Form.Label>
                                                <Form.Control
                                                    value={state?.zipCode}
                                                    onChange={e => dispatch({ zipCode: e.target.value })}
                                                    placeholder="112459"
                                                    type="number"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                                <Card.Footer className="mt-4">
                                    <div className="d-flex justify-content-end w-100">
                                        <Button
                                            disabled={isSaving}
                                            className="tb-body-large-medium me-1 w-140 px-3 py-2"
                                            variant="outline-secondary "
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={
                                                isSaving ||
                                                !state.firstName ||
                                                !(state.email && isValidEmail(`${state.email}`))
                                            }
                                            type="submit"
                                            className="ms-3 px-3 py-2 w-240 tb-body-large-medium"
                                        >
                                            {isSaving ? <ButtonLoader buttonText="Saving Changes" /> : "Save Changes"}
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Form>
                    </div>
                </div>
                <ProfileImageModal showModal={showProfileImageModal} setShowModal={setShowProfileImageModal} />
                <FeedbackModal
                    icon={<CheckCircle color="green" size={50} />}
                    showModal={showFeedbackModal}
                    setShowModal={setShowFeedbackModal}
                    primaryButtonText={"Ok"}
                    feedbackMessage={"Profile updated successfully."}
                    onPrimaryButtonClick={() => {
                        setShowFeedbackModal(false);
                    }}
                />
            </DashboardLayout>
        </div>
    );
}
