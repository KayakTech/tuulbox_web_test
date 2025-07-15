import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import Image from "next/image";
import Link from "next/link";
import ButtonLoader from "@/components/ButtonLoader";
import FormErrorMessage from "@/components/FormErrorMessage";
import FeedbackModal from "@/components/FeedbackModal";
import { CheckCircle, X } from "react-feather";
import Required from "@/components/Required";
import useCompany from "@/hooks/company";
import { useRef } from "react";
import { Buildings2, DocumentText, Gallery } from "iconsax-react";
import FormLayout from "@/components/FormLayout";
import Dropzone from "react-dropzone";
import { ACCEPTED_IMAGE_FILES } from "@/helpers/constants";
import { COUNTRIES } from "@/helpers/countries";
import SelectedFileBox from "@/components/SelectedFileBox";
import { Plus } from "react-feather";
import { CompanyNewId, NewBusinessId } from "@/repositories/business-repository";
import { isNumber, toInteger } from "lodash";
import { isNumbersOnly } from "@/helpers";

export default function UpdateCompanyDetails() {
    const companyLogoRef = useRef<HTMLInputElement>(null);
    const {
        user,
        company,
        isSaving,
        errorMessage,
        showModal,
        setShowModal,
        companyDetails,
        setCompanyDetails,
        handleSubmit,
        handleOnFileChange,
        attachment,
        setAttachment,
        isChangingLogo,
        setIsChangingLogo,
        router,
        setNewIds,
        newIds,
        isDeletingNewId,
        setIsDeleteingNewId,
        removeNewCompanyId,
    } = useCompany();
    const sizeInMB = toInteger((1024 * 1024).toFixed(2));
    return (
        <DashboardLayout
            pageTitle="Update company details"
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "Company", url: "/business/company" },
                { name: "Update company details" },
            ]}
        >
            <div className="">
                <FormLayout
                    leftSideIcon={<Buildings2 size={24} color="#888888" />}
                    leftSideText="Company"
                    leftSideDescription="Please fill in the right details about your company"
                >
                    <Form onSubmit={handleSubmit} className="mb-4">
                        {/* Logo */}
                        <Form.Group className="mb-4">
                            <Form.Label>Company Logo</Form.Label>
                            {company?.logo && !isChangingLogo ? (
                                <>
                                    <SelectedFileBox
                                        file={company?.logo}
                                        showDescription={false}
                                        onDelete={() => {
                                            setCompanyDetails({ logo: "" });
                                            setIsChangingLogo(true);
                                        }}
                                        icon={
                                            <Image
                                                className="rounded-3 object-fit-cover"
                                                src={company.logo}
                                                width={50}
                                                height={50}
                                                alt="logo"
                                            />
                                        }
                                    />
                                </>
                            ) : (
                                <Dropzone accept={ACCEPTED_IMAGE_FILES} multiple={false} onDrop={handleOnFileChange}>
                                    {({ getRootProps, getInputProps }) => (
                                        <section
                                            className={`dropzone-container ${
                                                attachment?.length ? "dropzone-container-selected gap-4" : ""
                                            } pointer border-radius-12`}
                                            title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                        >
                                            <div
                                                {...getRootProps()}
                                                className={`${
                                                    attachment.length
                                                        ? "p-0 d-flex align-items-center gap-4 justify-content-between"
                                                        : ""
                                                }`}
                                            >
                                                <input {...getInputProps()} />
                                                <div
                                                    className={`text-muted d-flex align-items-center ${
                                                        attachment?.length ? "" : "flex-column text-center"
                                                    } text-centerm ${
                                                        attachment?.length ? "gap-12" : "gap-3"
                                                    } w-100 h-100`}
                                                >
                                                    {attachment?.length ? (
                                                        <Gallery size="32" color="#888888" />
                                                    ) : (
                                                        <DocumentText variant="Bold" size={40} color="#D1D1D1" />
                                                    )}
                                                    {attachment?.length ? (
                                                        <>
                                                            <div className=" m-0 p-0 d-flex flex-column ">
                                                                <p className="truncate-1 m-0">{attachment[0].name}</p>
                                                                <p className="m-0">
                                                                    {(attachment[0].size / sizeInMB).toFixed(2)}
                                                                    {"mb"}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="tb-body-default-medium text-gray-500">
                                                            Drag and drop or{" "}
                                                            <a className="text-primary tb-body-default-medium offset">
                                                                Choose a File
                                                            </a>
                                                            <br />
                                                            <small className="tb-body-small-regular text-gray-500">
                                                                File types: .png, .jpg, .pdf
                                                            </small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {attachment.length ? (
                                                <div
                                                    className="d-flex cancel-dropzone align-items-center justify-content-center rounded-circle bg-grey"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        setAttachment([]);
                                                    }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="size-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M6 18 18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </div>
                                            ) : (
                                                ""
                                            )}
                                        </section>
                                    )}
                                </Dropzone>
                            )}
                        </Form.Group>

                        {/* Legal Name */}

                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                Legal Name <Required />
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={companyDetails.name}
                                onChange={e => setCompanyDetails({ name: e.target.value })}
                                required
                            />
                        </Form.Group>

                        {/* Address Line 1 */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Address Line 1</Form.Label>
                            <Form.Control
                                type="text"
                                value={companyDetails.addressLine1}
                                onChange={e => setCompanyDetails({ addressLine1: e.target.value })}
                                placeholder="E.g 35 Ezra Road, Lashibi Comm. 18. Tema"
                            />
                        </Form.Group>

                        {/* Address Line 1 */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Address Line 2</Form.Label>
                            <Form.Control
                                type="text"
                                value={companyDetails.addressLine2}
                                onChange={e => setCompanyDetails({ addressLine2: e.target.value })}
                                placeholder="E.g 35 Ezra Road, Lashibi Comm. 18. Tema"
                            />
                        </Form.Group>

                        {/* City */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">City</Form.Label>
                            <Form.Control
                                type="text"
                                value={companyDetails.city}
                                onChange={e => setCompanyDetails({ city: e.target.value })}
                                placeholder="E.g Accra"
                            />
                        </Form.Group>

                        {/* State */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">State</Form.Label>
                            <Form.Control
                                type="text"
                                value={companyDetails.state}
                                onChange={e => setCompanyDetails({ state: e.target.value })}
                                placeholder="E.g Accra"
                            />
                        </Form.Group>

                        {/* Zip code */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Zip Code</Form.Label>
                            <Form.Control
                                type="text"
                                value={companyDetails.zipCode}
                                onChange={e => {
                                    if (isNumbersOnly(e.target.value) || e.target.value === "") {
                                        setCompanyDetails({ zipCode: e.target.value });
                                    }
                                }}
                                placeholder="E.g 112789"
                            />
                        </Form.Group>

                        {/* Country */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Country</Form.Label>
                            <Form.Select
                                value={companyDetails.country}
                                onChange={e => setCompanyDetails({ country: e.target.value })}
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

                        {/* Website */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Website</Form.Label>
                            <Form.Control
                                type="text"
                                value={companyDetails.website}
                                onChange={e => setCompanyDetails({ website: e.target.value })}
                            />
                        </Form.Group>

                        {/* Tax ID */}
                        <Form.Group className="mb-4">
                            <Form.Label className="text-gray-600 tb-body-small-medium">Tax ID</Form.Label>
                            <Form.Control
                                type="text"
                                value={companyDetails.taxId}
                                onChange={e => setCompanyDetails({ taxId: e.target.value })}
                            />
                            <Form.Text className="d-flex align-items-center gap-2">
                                <Image src={`/images/svg/icons/info.svg`} alt="" width={12.32} height={12.8} />{" "}
                                <p className="tb-body-extra-small-regular text-muted m-0">
                                    This is your unique government-issued business number
                                </p>
                            </Form.Text>
                        </Form.Group>

                        {/* New ids */}
                        {newIds?.map((newId: CompanyNewId, index: number) => (
                            <div key={newId.idNameLabel}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="justify-content-between d-flex text-gray-600 tb-body-small-medium">
                                        <span>{newId.idNameLabel}</span>
                                        <X
                                            className="pointer text-primary"
                                            onClick={() => removeNewCompanyId(index)}
                                            size={20}
                                        />
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder={newId.idNamePlaceholder}
                                        name={`newIdName${index + 1}`}
                                        defaultValue={newId.idNameValue}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="text-gray-600 tb-body-small-medium">
                                        {newId.idNumberLabel}
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder={newId.idNumberPlaceholder}
                                        name={`newIdNumber${index + 1}`}
                                        defaultValue={newId.idNumberValue}
                                    />
                                </Form.Group>
                            </div>
                        ))}

                        {newIds.length < 2 && (
                            <div className="d-grid mb-5">
                                <Button
                                    variant="outline-primary"
                                    className="d-flex align-items-center justify-content-center"
                                    onClick={() => {
                                        const ids = [
                                            ...newIds,
                                            {
                                                idNameLabel: "Name of ID (Type)",
                                                idNamePlaceholder: "Name of ID",
                                                idNameValue: "",
                                                idNumberLabel: "ID Number",
                                                idNumberPlaceholder: "**_****864",
                                                idNumberValue: "",
                                            },
                                        ];
                                        setNewIds(ids);
                                    }}
                                >
                                    <Plus width={20} height={20} className="me-2" /> New ID
                                </Button>
                            </div>
                        )}

                        <div className="mt-4">
                            {errorMessage && <FormErrorMessage message={errorMessage} />}
                            <div className="d-flex gap-20 w-100 m-0">
                                <Link href={`/business/company`} className="text-decoration-none">
                                    <Button
                                        className="w-140 px-3 py-2 tb-title-body-medium"
                                        variant="outline-secondary"
                                    >
                                        Cancel
                                    </Button>
                                </Link>

                                <Button
                                    className="w-100 form-width px-3 py-2 tb-title-body-medium"
                                    type="submit"
                                    disabled={isSaving || !companyDetails.name}
                                >
                                    {isSaving ? <ButtonLoader buttonText="Saving..." /> : "Save Changes"}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </FormLayout>

                <FeedbackModal
                    icon={<CheckCircle color="green" size={50} />}
                    showModal={showModal}
                    setShowModal={value => setShowModal(value)}
                    primaryButtonText={"Go to Company"}
                    primaryButtonUrl={"/business/company"}
                    secondaryButtonText={"Close"}
                    feedbackMessage={"Company details updated."}
                    onSecondaryButtonClick={() => router.reload()}
                />
            </div>
        </DashboardLayout>
    );
}
