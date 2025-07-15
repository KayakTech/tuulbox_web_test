import {
    Button,
    Card,
    Col,
    Form,
    FormControl,
    FormGroup,
    FormLabel,
    FormSelect,
    Modal,
    ModalBody,
    ModalFooter,
    Row,
} from "react-bootstrap";
import DeleteButton from "./DeleteButton";
import OpenLinkButton from "./OpenLinkButton";
import Link from "next/link";
import useSettings from "@/hooks/settings";
import AuthSuccessState from "./AuthSuccessState";
import { ArrowLeft } from "iconsax-react";
import ButtonLoader from "./ButtonLoader";
import Select from "react-select/dist/declarations/src/Select";
import AutoLogoutModal from "./AutoLogoutModal";

export default function OthersList() {
    const {
        OTHER_SETTINGS,
        showResetPasswordModal,
        setShowResetPasswordModal,
        user,
        userEmail,
        setUserEmail,
        handleResetPasswordSubmit,
        hasSentResetLink,
        isSubmitting,
        backToLogin,
        errorMessage,
        settings,
        defaultTimeZone,
        showTimeZoneModal,
        setShowTimeZoneModal,
        timeZones,
        userTimeZone,
        setUserTimeZone,
        handleTimeZoneSubmit,
        showAutoLogoutModal,
        setShowAutoLogoutModal,
        autoLogoutDuration,
        handleAutoLogoutSave,
    } = useSettings();

    return (
        <>
            <Card className="mx-md-5 mobile-mt mb-40 mt-5 w-100">
                <Card.Header className="header bg-transparent">
                    <Card.Title className="text-gray-900 tb-title-subsection-medium">Others</Card.Title>
                </Card.Header>
                <Card.Body className="w-100 px-0">
                    <div className="mt-4 d-flex flex-column gap-4 w-100 px-20 mobile-px-12">
                        {OTHER_SETTINGS.map((option, index) => (
                            <div
                                key={index}
                                className={`d-flex gap-4 py-3 other-items ${
                                    index !== OTHER_SETTINGS.length - 1 ? "border-bottom-gray-50" : ""
                                } other-list pb-2`}
                            >
                                <div className=" d-flex flex-column gap-2">
                                    <h6 className="m-0 text-gray-800 tb-title-body-medium">{option.title}</h6>
                                    <p className="text-muted m-0 tb-body-default-regular text-width">
                                        {/* @ts-ignore */}
                                        {option.title.toLowerCase() === "time zone"
                                            ? ((settings?.timezone ?? defaultTimeZone?.label) as string)
                                            : option.description}
                                    </p>
                                </div>
                                {index === OTHER_SETTINGS.length - 1 ? (
                                    <DeleteButton />
                                ) : (
                                    <Link
                                        href={`${option.url ?? "javascript:void(0)"}`}
                                        className="text-decoration-none"
                                    >
                                        <Button
                                            variant="secondary"
                                            className="w-135 d-flex align-items-center justify-content-center border-gray-50 g-1"
                                            onClick={() => (option.onClick ? option.onClick() : null)}
                                        >
                                            {option.icon && <option.icon className="me-2" size="16" color="#102340" />}
                                            <span className="no-underline tb-body-default-medium">
                                                {option.buttonText}
                                            </span>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </Card.Body>
            </Card>

            {/* Reset Password Modal */}
            <Modal
                centered
                size="sm"
                show={showResetPasswordModal}
                onHide={() => setShowResetPasswordModal(false)}
                backdrop={"static"}
            >
                {!hasSentResetLink ? (
                    <Form onSubmit={handleResetPasswordSubmit}>
                        <ModalBody style={{ width: "444px" }} className="px-0">
                            <div className="px-24">
                                <p className="mb-2">Reset Password</p>
                                <p className="text-gray-400 fs-14">
                                    Please confirm your registered email address and a reset link will be sent to your
                                    email
                                </p>

                                <FormGroup className="mb-3">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl type="text" placeholder="jon@mail.com" value={user?.email} readOnly />
                                </FormGroup>
                            </div>
                            <hr className="my-24 border-gray-300" />
                            {errorMessage && <p className="text-danger px-24">{errorMessage}</p>}
                            <Row className="g-3 px-24 d-flex justify-content-end">
                                <Col sm={3}>
                                    <Button
                                        className="w-100"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowResetPasswordModal(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                                <Col sm={4}>
                                    <Button
                                        className="w-100"
                                        type="submit"
                                        size="sm"
                                        variant="primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <ButtonLoader buttonText="Confirming..." /> : "Confirm"}
                                    </Button>
                                </Col>
                            </Row>
                        </ModalBody>
                    </Form>
                ) : (
                    <ModalBody style={{ width: "444px" }} className="p-24">
                        <AuthSuccessState
                            title={"Reset link sent successfully"}
                            description="We've sent a password reset link to your email. Follow the instructions to reset your password and access your account."
                            buttonText="Go Back To Login"
                            buttonIcon={<ArrowLeft size={20} className="me-2" />}
                            onPrimaryButtonClick={backToLogin}
                        />
                    </ModalBody>
                )}
            </Modal>

            {/* Time zone modal */}
            <Modal
                centered
                size="sm"
                show={showTimeZoneModal}
                onHide={() => setShowTimeZoneModal(false)}
                backdrop={"static"}
            >
                <Form onSubmit={handleTimeZoneSubmit}>
                    <ModalBody style={{ width: "444px" }} className="px-0">
                        <div className="px-24">
                            <FormGroup className="mb-3">
                                <FormLabel>Timezone</FormLabel>
                                <FormSelect
                                    placeholder="jon@mail.com"
                                    value={userTimeZone}
                                    onChange={e => setUserTimeZone(e.target.value)}
                                >
                                    {timeZones != null &&
                                        timeZones.map(tz => (
                                            <option key={tz.value} value={tz.value}>
                                                {tz.label}
                                            </option>
                                        ))}
                                </FormSelect>
                            </FormGroup>
                        </div>
                        <hr className="my-24 border-gray-300" />
                        {errorMessage && <p className="text-danger px-24">{errorMessage}</p>}
                        <Row className="g-3 px-24 d-flex justify-content-end">
                            <Col sm={3}>
                                <Button
                                    className="w-100"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setShowTimeZoneModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                            </Col>
                            <Col sm={4}>
                                <Button
                                    className="w-100"
                                    size="sm"
                                    type="submit"
                                    variant="primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <ButtonLoader buttonText="Saving..." /> : "Save Changes"}
                                </Button>
                            </Col>
                        </Row>
                    </ModalBody>
                </Form>
            </Modal>

            {/* Auto Logout Modal */}
            <AutoLogoutModal
                show={showAutoLogoutModal}
                onHide={() => setShowAutoLogoutModal(false)}
                currentDuration={autoLogoutDuration}
                onSave={handleAutoLogoutSave}
                isSubmitting={isSubmitting}
            />
        </>
    );
}
