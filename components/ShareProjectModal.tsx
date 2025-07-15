import { InfoCircle, Link1, UserAdd } from "iconsax-react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { X } from "react-feather";
import Header from "./Header";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProjectModuleListItem from "./ProjectModuleListItem";
import { PROJECT_DOCUMENT_MENU } from "@/helpers/constants";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import { Project, ProjectDocumentCategories } from "@/repositories/project-repository";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import _ from "lodash";
import useContact from "@/hooks/useContact";
import { Contact } from "@/repositories/contact-repositories";
import ProjectContactListItem from "./ProjectContactListItem";
import { TagsInput } from "react-tag-input-component";
import FormAlert from "./FormAlert";
import { isMobileDevice, isTabletDevice } from "@/helpers";

const SHAREABLE_MODULES = PROJECT_DOCUMENT_MENU.filter(
    module =>
        ![
            ProjectDocumentCategories.communications,
            ProjectDocumentCategories.subContractors,
            ProjectDocumentCategories.projectDetails,
        ].includes(module.category),
);

type ShareProjectModalProps = {
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    project: Project;
    onSubmit: (value: any) => void;
    isSubmitting: boolean;
    selectedContacts: string[];
    setSelectedContacts: (value: string[]) => void;
    selectedModules: string[];
    setSelectedModules: (value: string[]) => void;
    onClearSelectedItems: () => void;
    isUpdating?: boolean;
    errorMessage?: string;
    setErrorMessage?: (value: string) => void;
    isShared?: boolean;
};

export default function ShareProjectModal({
    showModal,
    setShowModal,
    project,
    onSubmit,
    isSubmitting,
    selectedContacts,
    setSelectedContacts,
    selectedModules,
    setSelectedModules,
    onClearSelectedItems,
    isUpdating,
    errorMessage,
    setErrorMessage,
    isShared,
}: ShareProjectModalProps) {
    const { getAllContacts, contacts, filteredContacts, searchTerm, setSearchTerm } = useContact({});

    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);

    const [showAlert, setShowAlert] = useState<boolean>(true);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);

    function handleNextPage() {
        if (page === 1 && !isUpdating) {
            setErrorMessage && setErrorMessage("");
            setPage(2);
            return;
        }
        handleSubmit();
    }

    function handleSubmit() {
        onSubmit({ project: project, selectedEmails: selectedContacts, selectedModules: selectedModules });
    }

    function handleOnHide() {
        onClearSelectedItems();
        setShowModal(false);
        setPage(1);
    }

    function onSelectModule(menu: ProjectDocumentMenuItem) {
        let modules = _.cloneDeep(selectedModules);

        if (selectedModules.includes(menu.category)) {
            modules = modules.filter(module => module != menu.category);
        } else {
            modules.push(menu.category);
        }

        setSelectedModules(modules);
    }

    function onSelectContact(contact: Contact) {
        let emails = _.cloneDeep(selectedContacts);

        if (contact.email && selectedContacts.includes(contact?.email)) {
            emails = emails.filter(email => email != contact.email);
        } else {
            contact?.email && emails.push(contact?.email);
        }

        setSelectedContacts(emails);
    }

    useEffect(() => {
        const filteredCategories = SHAREABLE_MODULES.map(menu => {
            return menu.category;
        });

        setSelectedModules(selectAll ? filteredCategories : []);
    }, [selectAll]);

    useEffect(() => {
        if (!isShared) {
            getAllContacts();
        }
    }, []);

    return (
        <Modal
            backdrop="static"
            centered
            size="lg"
            show={showModal}
            onHide={handleOnHide}
            className="contact-card-width position-absolute"
        >
            <div className="invite-modal-content contact-card-width py-20">
                <Modal.Body className="bg-white">
                    <div className="d-flex justify-content-between">
                        <div className="flex-grow-1 d-flex gap-3">
                            <div
                                className="h-56 w-56 object-fit-cover flex-shrink-0 bg-accent-blue-900 border-radius-12 d-flex align-items-center justify-content-center"
                                style={{
                                    boxShadow: `0px 0px 0px 2px rgba(28, 28, 28, 0.08) box-shadow: 0px 1px 2px 0px rgba(17, 17, 17, 0.12) box-shadow: 0px 1px 2px 0px rgba(28, 28, 28, 0.08) box-shadow: 0px 4px 8px 1px rgba(255, 255, 255, 0.04) inset`,
                                }}
                            >
                                {page === 1 ? <Link1 color="white" size={40} /> : <UserAdd color="white" size={40} />}
                            </div>
                            <div>
                                <h3 className="tb-title-subsection-medium tex-gray-900">
                                    {page === 1 ? "Share project link " : "Invite user(s)"}
                                </h3>
                                <p className="text-gray-500 tb-body-large-Regular m-0">
                                    {page === 1
                                        ? "Share your project link with viewers"
                                        : "Invite users to your project with ease"}
                                </p>
                            </div>
                        </div>
                        <X className="pointer" onClick={handleOnHide} />
                    </div>
                </Modal.Body>
                <div className="bg-gray-100 h-2 w-100">
                    <div
                        className={`bg-accent-blue-900 border-radius-4 h-inherit ${
                            page === 1 && !isUpdating ? "w-50" : "w-100"
                        }`}
                    ></div>
                </div>
                <Modal.Body className="vh-65 pt-0 overflow-scroll bg-white w-100">
                    {page === 1 ? (
                        <div>
                            <div className="position-sticky pt-3 top-0 bg-white">
                                <Alert
                                    show={showAlert}
                                    onClose={() => setShowAlert(false)}
                                    variant="info"
                                    dismissible
                                    className="px-2  align-tems-center justify-content-center"
                                >
                                    <div className="m-0 d-flex align-items-center w-100">
                                        <InfoCircle
                                            color="rgba(24, 109, 221, 1)"
                                            size={20}
                                            variant="Bold"
                                            className="me-2"
                                        />
                                        <span className="tb-body-small-medium text-gray-900 invite-text-width">
                                            Only select the Modules you want to share with users
                                        </span>
                                    </div>
                                </Alert>
                                <div className="">
                                    <Header
                                        showListOrGrid
                                        hideContainerClass
                                        showSearchForm={false}
                                        headerText="Select Module"
                                        showBottomBorder={false}
                                        className="w-100 m-0"
                                        listOrGridKey="projectShare"
                                        fixedTop={false}
                                    />
                                    <div className="d-flex justify-content-end mb-4 px-12">
                                        <Link
                                            href={`#!`}
                                            className="text-decoration-none text-primary tb-body-default-medium"
                                            onClick={() => setSelectAll(!selectAll)}
                                        >
                                            {" "}
                                            {selectAll ? `Unselect All` : "Select All"}
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <ul
                                className={`list-unstyled d-flex align-items-center invite-space  ${
                                    listOrGrid.projectShare === "grid" ? "row g-4" : "flex-column gap-3"
                                }`}
                            >
                                {SHAREABLE_MODULES.map((menu: ProjectDocumentMenuItem, index: number) => (
                                    <li
                                        key={index}
                                        className={
                                            listOrGrid.projectShare === "grid"
                                                ? "col-5 col-sm-5 col-md-4 col-lg-3"
                                                : "col-12"
                                        }
                                    >
                                        <ProjectModuleListItem
                                            menu={menu}
                                            selectAll={selectAll}
                                            selectedModules={selectedModules}
                                            onSelected={onSelectModule}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div>
                            <Form.Group className="position-sticky top-0 bg-white">
                                <Form.Label className="fs-16">Add user</Form.Label>
                                <TagsInput
                                    value={selectedContacts}
                                    onChange={setSelectedContacts}
                                    name="email"
                                    placeHolder="Enter email"
                                    onKeyUp={e => {
                                        // @ts-ignore
                                        setSearchTerm(e.target.value);
                                    }}
                                />
                                <small>Press enter to add email</small>
                            </Form.Group>

                            {contacts.length > 0 && (
                                <>
                                    {filteredContacts.length ? (
                                        <>
                                            <Header
                                                hideContainerClass
                                                showSearchForm={false}
                                                headerText="Select Contact"
                                                showBottomBorder={false}
                                                showListOrGrid={false}
                                                fixedTop={false}
                                            />

                                            <ul className={`list-unstyled d-flex flex-column gap-3`}>
                                                {filteredContacts.map((contact: Contact, index: number) => (
                                                    <>
                                                        <li key={contact.id}>
                                                            <ProjectContactListItem
                                                                contact={contact}
                                                                selectAll={selectAll}
                                                                selectedContacts={selectedContacts}
                                                                onSelected={onSelectContact}
                                                            />
                                                        </li>
                                                    </>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <div className="w-100 d-flex align-items-center flex-column text-center mt-5 pt-5">
                                            <p className="text-muted">
                                                No result for{" "}
                                                <span className="text-black">&quot;{searchTerm}&quot;</span>
                                            </p>
                                            <Button
                                                className="px-3 p-2 d-flex align-items-center"
                                                variant="outline-primary"
                                                onClick={() => {
                                                    if (!selectedContacts.includes(searchTerm)) {
                                                        setSelectedContacts([...selectedContacts, searchTerm]);
                                                    }
                                                    setSearchTerm("");
                                                }}
                                            >
                                                <UserAdd size={24} className="me-3" />
                                                Invite Anyways
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer className="border-top-0 d-flex p-0 mt-0">
                    {errorMessage && (
                        <FormAlert show={true} message={errorMessage} onClose={() => {}} variant="danger" />
                    )}
                    <div className="justify-content-end d-flex w-100 mt-5">
                        {page === 2 && (
                            <Button
                                variant="btn btn-outline-secondary"
                                className="px-3 text-gray-600 py-2  me-3 tb-title-body-medium w-140"
                                onClick={() => {
                                    setErrorMessage && setErrorMessage("");
                                    setPage(1);
                                }}
                                disabled={isSubmitting}
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            className={`px-3 py-2  tb-title-body-medium ${
                                isMobileDevice() || isTabletDevice() ? "" : "w-240"
                            }`}
                            onClick={handleNextPage}
                            disabled={
                                (page === 1 && !selectedModules.length) ||
                                (page === 2 && !selectedContacts.length) ||
                                isSubmitting
                            }
                        >
                            {page === 1 && !isUpdating
                                ? "Next"
                                : isSubmitting
                                ? isUpdating
                                    ? "Updating..."
                                    : "Sending..."
                                : isUpdating
                                ? "Update Invite"
                                : "Send Invite"}
                        </Button>
                    </div>
                </Modal.Footer>
            </div>
        </Modal>
    );
}
