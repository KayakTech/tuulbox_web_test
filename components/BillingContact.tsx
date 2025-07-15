import React, { useState } from "react";
import PageLoader from "./PageLoader";
import { Card } from "iconsax-react";
import { Button, Form } from "react-bootstrap";
import PhoneInput from "react-phone-input-2";
import BillingContactDetails from "./BillingContactDetails";

interface BillingContactForm {
    fullName: string;
    email: string;
    address: string;
    state: string;
    country: string;
    companyName: string;
    phoneNumber: string;
    city: string;
    zipcode: string;
}
export default function BillingContact() {
    const [showDetails, setShowDetails] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<BillingContactForm>({
        fullName: "",
        email: "",
        address: "",
        state: "",
        country: "",
        companyName: "",
        phoneNumber: "",
        city: "",
        zipcode: "",
    });
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePhoneChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            phoneNumber: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", formData);

        setFormData({
            fullName: "",
            email: "",
            address: "",
            state: "",
            country: "",
            companyName: "",
            phoneNumber: "",
            city: "",
            zipcode: "",
        });

        setShowDetails(true);
    };

    return showDetails ? (
        <BillingContactDetails contactData={formData} />
    ) : (
        <div className="overflow-hidden">
            <section className="d-flex gap-4 mt-4 flex-column">
                <span className="d-flex flex-column">
                    <h3 className="tb-body-large-medium text-gray-900">Billing Contact</h3>
                    <p className="tb-body-small-regular text-muted">Manage your contact information</p>
                </span>
                <Form onSubmit={handleSubmit} className="w-100">
                    <section className="d-flex gap-3 flex-column  border-radius-16 w-835 py-3 w-835 border border-gray-100">
                        <div className="d-flex gap-3 px-3 w-100">
                            <div className="d-flex flex-column gap-3 w-100">
                                <Form.Group className=" ">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Full Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        placeholder="E.g Hannah Gabriel"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className=" ">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        Billing Email Address
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.email}
                                        name="email"
                                        onChange={handleInputChange}
                                        placeholder="Enter email"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className=" ">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Address </Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.address}
                                        name="address"
                                        onChange={handleInputChange}
                                        placeholder="E.g 123 way"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className=" ">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">State</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.state}
                                        name="state"
                                        onChange={handleInputChange}
                                        placeholder="E.g California"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className=" ">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Country</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.country}
                                        name="country"
                                        onChange={handleInputChange}
                                        placeholder="E.g United Kingdom"
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="d-flex flex-column gap-3 w-100">
                                <Form.Group className=" ">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Company Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.companyName}
                                        name="companyName"
                                        onChange={handleInputChange}
                                        placeholder="E.g H&G global"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className=" ">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Phone Number</Form.Label>

                                    <PhoneInput
                                        country={"gh"}
                                        value={formData.phoneNumber}
                                        onChange={handlePhoneChange}
                                        placeholder="E.g +233 552 534 233"
                                        specialLabel=""
                                        countryCodeEditable={true}
                                        inputClass="form-control"
                                    />
                                </Form.Group>
                                <Form.Group className=" ">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">City</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="E.g San francisco"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className=" ">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">Zipcode</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="zipcode"
                                        value={formData.zipcode}
                                        onChange={handleInputChange}
                                        placeholder="E.g 123455"
                                        required
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end px-3 pt-3">
                            <Button size="sm" variant="primary" className="tb-body-default-medium h-0">
                                Save contact
                            </Button>
                        </div>
                    </section>
                </Form>
            </section>
        </div>
    );
}
