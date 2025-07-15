import { AuthType } from "@/components/AuthComponent";
import AuthComponent from "@/components/AuthComponent";
import ButtonLoader from "@/components/ButtonLoader";
import FormErrorMessage from "@/components/FormErrorMessage";
import Required from "@/components/Required";
import Head from "next/head";
import { useEffect } from "react";
import { Button, Form, Row, Col } from "react-bootstrap";
import useAccount from "@/hooks/account";
import AuthSuccessState from "@/components/AuthSuccessState";
import PhoneInput from "react-phone-input-2";

export default function CreateAccount() {
    const {
        errorMessage,
        activeForm,
        onButtonClick,
        handleCreateAccountSubmit,
        user,
        state,
        dispatch,
        companyDetails,
        setCompanyDetails,
        accountIsComplete,
        setAccountIsComplete,
        canSubmitForm,
        handleInputChange,
        isSavingAccountDetails,
    } = useAccount();

    useEffect(() => {
        if (user?.isRegistrationCompleted) {
            location.href = "/overview";
            setAccountIsComplete(true);
        }
    }, []);

    const isValidForm = () => {
        if (
            (!state.firstName || !state.lastName || !state.email || !state.mobile || state?.mobile.length < 10) &&
            activeForm === 1
        ) {
            return false;
        }
        if (!companyDetails.name && activeForm === 2) {
            return false;
        }
        return true;
    };

    return (
        <>
            <Head>
                <title>Create Account - tuulbox</title>
            </Head>

            <AuthComponent
                onLoginSuccesful={() => {}}
                authType={AuthType.account}
                form={
                    (accountIsComplete || user?.isRegistrationCompleted) && !isSavingAccountDetails ? (
                        <AuthSuccessState
                            title={"All set"}
                            description="Your profile has been created successfully, you can now proceed to get work started."
                            buttonText="Done"
                            buttonLink="/overview"
                        />
                    ) : (
                        <Form onSubmit={handleCreateAccountSubmit}>
                            <h6 className=" text-grsy-900 tb-title-medium text-start mb-4" style={{ fontSize: "32px" }}>
                                Create Your Account
                            </h6>

                            <h6 className="fw-bold">{activeForm === 1 ? " Personal details" : "Company details"}</h6>
                            <p className="text-muted mb-4">
                                {activeForm === 1
                                    ? "Provide your personal or contact information"
                                    : "Provide your company information to get you started."}
                            </p>

                            {activeForm === 1 ? (
                                <>
                                    <Row>
                                        <Col md={6} className="">
                                            <Form.Group className="mb-3">
                                                <Form.Label className="tb-body-small-medium text-gray-900">
                                                    First Name <Required />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Kwame"
                                                    value={state.firstName}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        handleInputChange(e, "firstName")
                                                    }
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            {" "}
                                            <Form.Group className="mb-3">
                                                <Form.Label className="tb-body-small-medium text-gray-900">
                                                    Last Name <Required />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Adu-Jamroll"
                                                    value={state.lastName}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        handleInputChange(e, "lastName")
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col className="">
                                            <Form.Group className="mb-3">
                                                <Form.Label className="tb-body-small-medium text-gray-900">
                                                    Email <Required />
                                                </Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    placeholder="kwame@mail.com"
                                                    value={state.email}
                                                    onChange={e => dispatch({ email: e.target.value })}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="tb-body-small-medium text-gray-900">
                                                    Phone <Required />
                                                </Form.Label>
                                                <PhoneInput
                                                    value={state.mobile}
                                                    onChange={value => dispatch({ mobile: value })}
                                                    placeholder="233244123456"
                                                    specialLabel={""}
                                                    countryCodeEditable={false}
                                                    country={"us"}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </>
                            ) : (
                                <>
                                    <Row>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="tb-body-small-medium text-gray-900">
                                                    Legal Name <Required />
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Your Company Name"
                                                    required
                                                    value={companyDetails.name}
                                                    onChange={e => setCompanyDetails({ name: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="tb-body-small-medium text-gray-900">
                                                    Website
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="https://yourwebsite.com"
                                                    value={companyDetails.website}
                                                    onChange={e => setCompanyDetails({ website: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="tb-body-small-medium text-gray-900">
                                                    Tax ID{" "}
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="**_****864"
                                                    value={companyDetails.taxId}
                                                    onChange={e => setCompanyDetails({ taxId: e.target.value })}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </>
                            )}

                            <div className="d-grid mb-2 mt-5">
                                {errorMessage ? <FormErrorMessage message={errorMessage} /> : null}
                                <Button
                                    variant="primary"
                                    type={"submit"}
                                    onClick={onButtonClick}
                                    disabled={isSavingAccountDetails || !canSubmitForm() || !isValidForm()}
                                >
                                    {isSavingAccountDetails ? (
                                        <ButtonLoader />
                                    ) : activeForm === 1 ? (
                                        "Create account"
                                    ) : (
                                        "Get started"
                                    )}
                                </Button>
                            </div>
                        </Form>
                    )
                }
            />
        </>
    );
}
