import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Button, Form } from "react-bootstrap";
import Link from "next/link";
import { useEffect } from "react";
import PageLoader from "./PageLoader";
import FeedbackModal from "./FeedbackModal";
import { CheckCircle } from "react-feather";
import ButtonLoader from "./ButtonLoader";
import FormErrorMessage from "./FormErrorMessage";
import { isAlphabetic, isNumbersOnly, isValidEmail, validateMobileNumber } from "@/helpers";
import Required from "./Required";
import PhoneInput from "react-phone-input-2";
import FormLayout from "./FormLayout";
import { People } from "iconsax-react";
import useOfficers from "@/hooks/useOfficers";
import { COUNTRIES } from "@/helpers/countries";

type OfficerFormState = {
    action: string;
};

const TITLES = ["Mr.", "Mrs.", "Ms.", "Sir"];

export default function OfficersForm(props: OfficerFormState) {
    const { action } = props;
    const {
        officer,
        setOfficerId,
        getOfficer,
        isLoading,
        handleSubmit,
        showModal,
        setShowModal,
        handleAddAgain,
        feedbackMessage,
        dispatch,
        errorMessage,
        isSubmitting,
        showDeleteModal,
        setShowDeleteModal,
    } = useOfficers(action);

    useEffect(() => {
        if (action === "edit") {
            const id = window.location.pathname.split("/")[5];
            setOfficerId(id);
            getOfficer(id);
        }
    }, [action]);

    return (
        <DashboardLayout
            pageTitle={action === "add" ? "Add officer" : "Update officer"}
            breadCrumbs={[
                { name: "Company", url: "/business/company" },
                { name: "Officers", url: "/business/company/officers" },
                { name: action === "add" ? "New Officer" : "Update Officer" },
            ]}
        >
            {action === "edit" && isLoading ? (
                <PageLoader />
            ) : (
                <div className="mb-5">
                    <FormLayout
                        leftSideIcon={<People size={24} color="#888888" />}
                        leftSideText={action === "add" ? "New Officer" : "Update officer"}
                        leftSideDescription={`Fill in the correct details to ${
                            action === "add" ? "create new" : "update"
                        } officer`}
                    >
                        <Form onSubmit={handleSubmit} className="pb-5">
                            {/* Title */}
                            {false && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        Title <Required />
                                    </Form.Label>
                                    <Form.Select
                                        value={officer.title}
                                        onChange={e => dispatch({ title: e.target.value })}
                                        required
                                        className="text-gray-300"
                                    >
                                        <option
                                            value=""
                                            hidden
                                            disabled
                                            className="tb-body-default-regular text-gray-300"
                                        >
                                            Select Title
                                        </option>
                                        {TITLES.map((title: string, index: number) => (
                                            <option key={title + index} value={title}>
                                                {title}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            )}

                            {/* First Name */}
                            <Row className="">
                                <Col className="padding-0">
                                    <Form.Group className="mb-4 margin-16">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            First Name <Required />
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={officer.firstname}
                                            onChange={e => dispatch({ firstname: e.target.value })}
                                            required
                                            placeholder="E.g Michael"
                                            className={`${
                                                officer.firstname && !isAlphabetic(officer.firstname)
                                                    ? "border-danger"
                                                    : ""
                                            }`}
                                        />
                                        {officer.firstname && !isAlphabetic(officer.firstname) && (
                                            <small className="text-danger">Please enter a valid name</small>
                                        )}
                                    </Form.Group>
                                </Col>
                                {/* Last Name */}
                                <Col className="padding-0">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="text-gray-600 tb-body-small-medium">
                                            Last Name
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={officer.lastname}
                                            onChange={e => dispatch({ lastname: e.target.value })}
                                            placeholder="E.g Sarpong"
                                            className={`${
                                                officer.lastname && !isAlphabetic(officer.lastname)
                                                    ? "border-danger"
                                                    : ""
                                            }`}
                                        />
                                        {officer.lastname && !isAlphabetic(officer.lastname) && (
                                            <small className="text-danger">Please enter a valid name</small>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Mobile Number */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Phone</Form.Label>
                                <PhoneInput
                                    value={officer.mobileNumber}
                                    onChange={value => dispatch({ mobileNumber: validateMobileNumber(value) })}
                                    placeholder="E.g +233 552 534 233"
                                    countryCodeEditable={false}
                                    country={"us"}
                                />
                            </Form.Group>

                            {/* Extension */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Extension</Form.Label>

                                <Form.Control
                                    type="text"
                                    value={officer.extension}
                                    onChange={e =>
                                        isNumbersOnly(e.target.value) && dispatch({ extension: e.target.value })
                                    }
                                    placeholder="E.g 1234"
                                    maxLength={5}
                                />
                            </Form.Group>

                            {/* Email */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="E.g mike.sarp.ky@gmail.com"
                                    value={officer.email}
                                    onChange={e => dispatch({ email: e.target.value })}
                                    className={`${
                                        officer.email && !isValidEmail(officer.email) ? "border-danger" : ""
                                    }`}
                                />
                                {officer.email && !isValidEmail(officer.email) && (
                                    <small className="text-danger">Please enter a valid email</small>
                                )}
                            </Form.Group>

                            {/* Job Tile */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Job Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={officer.jobPosition}
                                    onChange={e => dispatch({ jobPosition: e.target.value })}
                                    placeholder="Marketing Manager"
                                />
                            </Form.Group>

                            {/* Address Line 1 */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Address Line 1</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={officer.addressLine1}
                                    onChange={e => dispatch({ addressLine1: e.target.value })}
                                    placeholder="E.g 35 Ezra Road, Lashibi Comm. 18. Tema"
                                />
                            </Form.Group>

                            {/* Address Line 2 */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Address Line 2</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={officer.addressLine2}
                                    onChange={e => dispatch({ addressLine2: e.target.value })}
                                    placeholder="E.g 35 Ezra Road, Lashibi Comm. 18. Tema"
                                />
                            </Form.Group>

                            {/* City */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">City</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={officer.city}
                                    onChange={e => dispatch({ city: e.target.value })}
                                    placeholder="E.g Accra"
                                />
                            </Form.Group>

                            {/* State */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">State</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={officer.state}
                                    onChange={e => dispatch({ state: e.target.value })}
                                    placeholder="E.g Accra"
                                />
                            </Form.Group>

                            {/* Zip code */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Zip Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={officer.zipCode}
                                    onChange={e => {
                                        if (isNumbersOnly(e.target.value) || "") {
                                            dispatch({ zipCode: e.target.value });
                                        }
                                    }}
                                    placeholder="E.g 112789"
                                />
                            </Form.Group>

                            {/* Country */}
                            <Form.Group className="mb-4">
                                <Form.Label className="text-gray-600 tb-body-small-medium">Country</Form.Label>
                                <Form.Select
                                    value={officer.country}
                                    onChange={e => dispatch({ country: e.target.value })}
                                    placeholder="E.g Ghana"
                                >
                                    <option value="" disabled hidden></option>
                                    {COUNTRIES.map(country => (
                                        <option key={country.name} value={country.name}>
                                            {country.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <div className="mt-4">
                                {errorMessage && <FormErrorMessage message={errorMessage} />}
                                <div className="d-flex gap-20 w-100 m-0">
                                    <Link
                                        href={`/business/company/officers`}
                                        className="text-decoration-none flex-fill"
                                    >
                                        <Button
                                            size="lg"
                                            className="w-140 btn-140 px-3 py-2 tb-title-body-medium"
                                            variant="outline-secondary"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>

                                    <Button
                                        className="w-100 tb-title-body-medium flex-fill"
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={
                                            isSubmitting || !officer.firstname || !isAlphabetic(officer.firstname)
                                        }
                                    >
                                        {isSubmitting ? (
                                            <ButtonLoader
                                                buttonText={action === "add" ? "Adding Officer" : "Save Changes"}
                                            />
                                        ) : action === "add" ? (
                                            "Add Officer"
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </FormLayout>
                </div>
            )}

            {/* Success modal */}
            <FeedbackModal
                icon={<CheckCircle color="green" size={50} />}
                showModal={showModal}
                setShowModal={setShowModal}
                primaryButtonText={"Go to officers"}
                primaryButtonUrl={"/business/company/officers"}
                secondaryButtonText={action === "edit" ? "Close" : "Add another officer"}
                feedbackMessage={feedbackMessage}
                onSecondaryButtonClick={handleAddAgain}
            />
        </DashboardLayout>
    );
}
