import useProject from "@/hooks/project";
import { Project } from "@/repositories/project-repository";
import { DocumentText, UserAdd } from "iconsax-react";
import { useState } from "react";
import { Card, Button, Collapse, Dropdown } from "react-bootstrap";
import { MoreHorizontal, Edit2, Trash } from "react-feather";
type ProjectDetailsMobileProps = {
    project: Project;
    onUpdate: () => void;
    onInviteUsers: () => void;
    onDelete: () => void;
};
export default function ProjectDetailsMobile({
    project,
    onUpdate,
    onDelete,
    onInviteUsers,
}: ProjectDetailsMobileProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="container mt-3  gap-3 ">
            {/* Project Card */}
            <Card className="mb-3 shadow-sm border p-12 border-gray-100 rounded">
                <Card.Body className="d-flex p-0 gap-12 align-items-center">
                    <div
                        className="flex-shrink-0 object-fit-cover border-gray-100 border-radius-8 "
                        style={{ width: "48px", height: "48px" }}
                    >
                        {project.projectLogo ? (
                            <img
                                src={project?.projectLogo}
                                alt="thumbnail"
                                className="border-radius-8 flex-shrink-0 object-fit-cover h-100"
                                width="48"
                                height="48"
                            />
                        ) : (
                            <div className="w-56 h-56 border-radius-12 d-flex justify-content-center align-items-center  bg-gray-50">
                                <DocumentText color="#B0B0B0" size={30} />
                            </div>
                        )}
                    </div>
                    <div className=" d-flex flex-column">
                        <h5 className="text-gray-700 tb-title-body-medium m-0">{project?.name}</h5>
                        <small className="text-muted tb-body-small-regular">Owner: {project?.owner}</small>
                    </div>
                </Card.Body>
            </Card>

            {/* Additional Information */}
            <Card className="border border-gray-100 shadow-sm rounded">
                <Card.Header className="bg-transparent border-0">
                    <Button
                        variant="link"
                        onClick={() => setOpen(!open)}
                        aria-controls="additional-info"
                        aria-expanded={open}
                        className="p-0 text-decoration-none d-flex justify-content-between w-100 text-muted tb-body-default-medium"
                    >
                        <div className="d-flex flex-column align-items-start">
                            More Information
                            <span className="text-muted tb-body-small-regular">
                                Name, owner, Address, Secondary......
                            </span>
                        </div>
                        <span className="ms-2">
                            {open ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        stroke="#333333"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeMiterlimit="10"
                                        strokeWidth="2.5"
                                        d="M19.92 15.05L13.4 8.53c-.77-.77-2.03-.77-2.8 0l-6.52 6.52"
                                    ></path>
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <path
                                        stroke="#333333"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeMiterlimit="10"
                                        strokeWidth="2.5"
                                        d="M19.92 8.95l-6.52 6.52c-.77.77-2.03.77-2.8 0L4.08 8.95"
                                    ></path>
                                </svg>
                            )}
                        </span>
                    </Button>
                </Card.Header>
                <Collapse in={open}>
                    <div id="additional-info">
                        <Card.Body className="text-muted">
                            <div className="py-3 px-3 border-top-0 border-gray-100 border-start-0 border-end-0 bg-blue-200 border d-flex flex-column more-details">
                                <h3 className="tb-body-title-caps text-muted">Project Name</h3>
                                <p
                                    title={project?.name}
                                    className="tb-body-default-medium text-truncate m-0 text-text-muted"
                                >
                                    {project?.name}
                                </p>
                            </div>
                            <div className="py-3 px-3 border-top-0 border-gray-100 border-start-0 border-end-0 bg-blue-200 border d-flex flex-column more-details">
                                <h3 className="tb-body-title-caps text-muted">Owner</h3>
                                <p className="tb-body-default-medium m-0 text-muted">{project?.owner}</p>
                                <p className="tb-body-default-medium m-0 text-decoration-none ">
                                    <a
                                        title={project?.email}
                                        className="text-blue-900 text-decoration-none"
                                        href={`mailto:${project?.email}`}
                                    >
                                        {project?.email}
                                    </a>
                                </p>
                                <p className="tb-body-default-medium text-decoration-none m-0 text-blue-900">
                                    <a className="text-blue-900 text-decoration-none" href={`tel:${project?.contact}`}>
                                        {project?.contact}
                                    </a>
                                </p>
                                <p className="tb-body-default-medium m-0 text-muted">Extension: {project?.extension}</p>
                            </div>
                            {
                                <div className="py-3 px-3 border-top-0 border-gray-100 border-start-0 border-end-0 bg-blue-200 border d-flex flex-column more-details">
                                    <h3 className="tb-body-title-caps text-muted">Address</h3>
                                    {project?.addressLine1 ||
                                    project?.addressLine2 ||
                                    project?.country ||
                                    project?.state ||
                                    project?.city ||
                                    project?.zipCode ? (
                                        <>
                                            {project?.addressLine1 && (
                                                <p className="tb-body-default-medium m-0 text-text-muted">
                                                    {project?.addressLine1}
                                                </p>
                                            )}

                                            {project?.addressLine2 && (
                                                <p className="tb-body-default-medium m-0 text-muted">
                                                    {project?.addressLine2}
                                                </p>
                                            )}
                                            {project?.country && (
                                                <p className="tb-body-default-medium m-0 text-muted">
                                                    {project?.country}
                                                </p>
                                            )}

                                            {project?.state && (
                                                <p className="tb-body-default-medium m-0 text-muted">
                                                    {project?.state}
                                                </p>
                                            )}
                                            {project?.city && (
                                                <p className="tb-body-default-medium m-0 text-muted">{project?.city}</p>
                                            )}
                                            {project?.zipCode && (
                                                <p className="tb-body-default-medium m-0 text-muted">
                                                    {project?.zipCode}
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        "-"
                                    )}
                                </div>
                            }
                            <div className="py-3 px-3 border-top-0 border-gray-100 border-start-0 border-end-0 bg-blue-200 border d-flex flex-column more-details">
                                <h3 className="tb-body-title-caps text-muted">secondary contact</h3>

                                {project.additionalContacts.length &&
                                (project?.additionalContacts[0].firstName ||
                                    project?.additionalContacts[0].email ||
                                    project?.additionalContacts[0].phoneNumber ||
                                    project?.additionalContacts[0].extension) ? (
                                    <>
                                        {project?.additionalContacts[0].firstName && (
                                            <p className="tb-body-default-medium m-0 text-muted">
                                                {project?.additionalContacts[0]?.firstName}
                                            </p>
                                        )}
                                        {project?.additionalContacts[0].email && (
                                            <p className="tb-body-default-medium m-0 text-blue-900">
                                                {project?.additionalContacts[0]?.email}
                                            </p>
                                        )}
                                        {project.additionalContacts[0].phoneNumber && (
                                            <p className="tb-body-default-medium m-0 text-blue-900">
                                                {project?.additionalContacts[0]?.phoneNumber}
                                            </p>
                                        )}
                                        {project.additionalContacts[0].extension && (
                                            <p className="tb-body-default-medium m-0 text-muted">
                                                Extension: {project?.additionalContacts[0]?.extension}
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    "-"
                                )}
                            </div>

                            <div className=" d-flex justify-content-between align-items-center more-details p-3">
                                <h6 className="text-muted tb-body-title-caps">Action</h6>
                                <Dropdown>
                                    <Dropdown.Toggle
                                        as={"button"}
                                        variant="default"
                                        className="btn btn-default"
                                        style={{ width: "40px", height: "40px" }}
                                    >
                                        <MoreHorizontal size={24} />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={onUpdate}>
                                            <Edit2 className="" size={16} />{" "}
                                            <span className="tb-body-default-regular">{"Update"}</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={onInviteUsers}>
                                            <UserAdd size={16} color="#888888" />
                                            <span className="tb-body-default-regular">Invite user(s)</span>
                                        </Dropdown.Item>
                                        <Dropdown.Item onClick={onDelete}>
                                            <Trash className="" size={16} color="#E70000" />
                                            <span className="tb-body-default-regular text-danger">Delete</span>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </Card.Body>
                    </div>
                </Collapse>
            </Card>
        </div>
    );
}
