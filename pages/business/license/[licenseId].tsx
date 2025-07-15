import { Row, Col, Card, Button, Accordion, Container, Form } from "react-bootstrap";
import { useState } from "react";
import { ArrowUp2, ArrowDown2, Gallery, DocumentText, ArrowRight, ArrowRight2 } from "iconsax-react";
import Header from "@/components/Header";
import { formatDatetime, convertIsoToFriendlyTime, isEmptyObject, snakeCaseToSentenceCase } from "@/helpers";
import DashboardLayout from "@/components/DashboardLayout";
import DeleteModal from "@/components/DeleteModal";
import EmptyState from "@/components/EmptyState";
import { useEffect } from "react";
import InsuranceIcon from "@/components/icons/Insurance";
import { isMobileDevice, isTabletDevice } from "@/helpers";
import useSearchForm from "@/hooks/searchForm";
import DataTableComponent from "@/components/DataTableComponent";
import { SearchNormal1, ShieldTick, ArchiveBox } from "iconsax-react";
import InsuranceDetailsMobile from "@/components/InsuranceCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { InsuranceData } from "@/repositories/business-repository";
import InsuranceCard from "@/components/InsuranceCard";
import PageLoader from "@/components/PageLoader";
import InsuranceCardSmall from "@/components/InsuranceCardSmall";
import SettingsMenu from "@/components/SettingsMenu";
import Link from "next/link";
import ContactDocument from "@/components/ContactDocument";
import EmptyStateInnerPage from "@/components/EmptyStateInnerPage";
import FormLayout from "@/components/FormLayout";
import SelectedFileBox from "@/components/SelectedFileBox";
import Dropzone from "react-dropzone";
import { ACCEPTED_FILES } from "@/helpers/constants";
import Required from "@/components/Required";
import FormErrorMessage from "@/components/FormErrorMessage";
import ButtonLoader from "@/components/ButtonLoader";
import { StorageFile } from "@/repositories/storage-repository";
import { CheckCircle, X } from "react-feather";
import FeedbackModal from "@/components/FeedbackModal";
import useLicense from "@/hooks/useLicense";

export default function LicenseDetails() {
    const [isOpen, setIsOpen] = useState(false);
    const [action, setAction] = useState("list");
    const sizeInMB = parseInt((1024 * 1024).toFixed(2));

    const {
        licenseId,
        setLicenseId,
        getLicense,
        fileName,
        setFileName,
        isInitialLoading,
        setIsLoading,
        searchResults,
        totalRows,
        isSearching,
        router,
        user,
        license,
        listOrGrid,
        storageHook,
        handleOnFileChange,
        file,
        setFile,
        errorMessage,
        isSubmitting,
        showFeedbackModal,
        setShowFeedbackModal,
        licenseFiles,
        licenseFilesTable,
        handleSubmitLicenseFile,
        archiveLicenseFile,
        activateLicenseFile,
        deleteLicenseFile,
        addToFavorites,
        removeFromFavorites,
        viewDocumentFile,
        clearLicenseCache,
    } = useLicense(action);

    function onRouteChange() {
        setFileName("");
        storageHook.setStorageFile(undefined);
        const act: any = router.query.action;
        setAction(`${act ?? "list"}`);

        const fileId: any = router.query.fileId;
        if (fileId && act === "edit") {
            storageHook.getFile({ fileId });
        }

        if (["list", undefined, ""].includes(act)) {
            const id = location.pathname.split("/")[3];
            getLicense(id);
        }
    }

    useEffect(() => {
        if (storageHook.storageFile) {
            setFileName(storageHook.storageFile.originalFileName);
        }
    }, [storageHook.storageFile]);

    useEffect(() => {
        const id = location.pathname.split("/")[3];
        setLicenseId(id);
        getLicense(id);
    }, []);

    useEffect(() => {
        onRouteChange();
    }, [router]);

    const handleRemoveFile = () => {
        storageHook.setStorageFile(undefined);
        setFile(undefined);
        setFileName("");
    };

    const shouldShowLoader = isInitialLoading && !license;

    return (
        <DashboardLayout
            breadCrumbs={[
                { name: "Business", url: "/business" },
                { name: "License", url: "/business/license" },
                { name: "License Details" },
            ]}
            pageTitle="License"
        >
            {shouldShowLoader ? (
                <PageLoader />
            ) : license ? (
                <Container fluid className="my-4">
                    <Accordion className="mt-3m border-radius-12 mb-3" defaultActiveKey={`0`}>
                        <Accordion.Item eventKey="0" className="border-gray-100 rounded-4">
                            <Accordion.Header as={"div"} className="px-3 py-12 pb-0" onClick={() => setIsOpen(!isOpen)}>
                                <div className="w-100 py-3m">
                                    <p className="m-0 tb-body-default-medium text-gray-800">License Details</p>
                                    <p className="text-muted tb-body-small-regular m-0">
                                        <small>License, License type, License number...</small>
                                    </p>
                                </div>
                                {isOpen ? (
                                    <ArrowDown2 size="16" color="#454545" />
                                ) : (
                                    <ArrowUp2 size="16" color="#454545" />
                                )}
                            </Accordion.Header>
                            <Accordion.Body className="pb-3 pt-4 border-top d-flex flex-column gap-3 border-gray-100">
                                <Row className="d-flex pt-4m justify-content-between">
                                    <Col md={4} className="">
                                        <p className="m-0 tb-body-small-medium text-muted">
                                            <small>Name</small>
                                        </p>

                                        <p className="m-0 tb-body-default-medium">{license?.name || "-"}</p>
                                    </Col>
                                    <Col md={4}>
                                        <p className="m-0 tb-body-small-medium text-muted">
                                            <small>License Type</small>
                                        </p>
                                        <p className="m-0 tb-body-default-medium">
                                            {license?.licenseType ? snakeCaseToSentenceCase(license?.licenseType) : "-"}
                                        </p>
                                    </Col>
                                    <Col md={4}>
                                        <p className="m-0 tb-body-small-medium text-muted">
                                            <small>Number</small>
                                        </p>
                                        <p className="m-0 tb-body-default-medium">{license?.licenseNumber || "-"}</p>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <p className="m-0 tb-body-small-medium text-muted">
                                            <small>Validity Start Date</small>
                                        </p>
                                        <p className="m-0 tb-body-default-medium">
                                            {license?.validFrom ? formatDatetime(license?.validFrom) : "-"}
                                        </p>
                                    </Col>
                                    <Col md={4}>
                                        <p className="m-0 tb-body-small-medium text-muted">
                                            <small>Validity End Date</small>
                                        </p>
                                        <p className="m-0 tb-body-default-medium">
                                            {license?.validTo ? formatDatetime(license?.validTo) : "-"}
                                        </p>
                                    </Col>
                                    <Col md={4}>
                                        <p className="m-0 tb-body-small-medium text-muted">
                                            <small>Reminder</small>
                                        </p>
                                        <p className="m-0 tb-body-default-medium">
                                            {license?.reminder ? formatDatetime(license?.reminder) : "-"}
                                        </p>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <p className="m-0 tb-body-small-medium text-muted">
                                            <small>Notify Me</small>
                                        </p>
                                        <p className="m-0 tb-body-default-medium">
                                            {license?.reminder ? convertIsoToFriendlyTime(license?.reminder) : "-"}
                                        </p>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    {/* Files */}
                    <div id="project-documents">
                        <Container fluid className="p-0">
                            <Accordion className="mt-4" defaultActiveKey={`0`}>
                                <Accordion.Item eventKey="0" className="border-gray-100 rounded-4">
                                    <Accordion.Header
                                        className="p-3 py-12 pb-0"
                                        as={"div"}
                                        onClick={() => setIsOpen(!isOpen)}
                                    >
                                        <div className=" w-100">
                                            <p className="m-0 tb-body-default-medium text-gray-900 d-flex align-items-center gap-1">
                                                <span
                                                    className={`${
                                                        ["list", undefined].includes(action) ? "" : "text-muted"
                                                    }`}
                                                >
                                                    Files
                                                </span>
                                                {["add", "edit"].includes(action) && (
                                                    <>
                                                        <ArrowRight2 size={12} color="#454545" />
                                                        <span>{action === "add" ? "New" : "Edit"} File</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        {isOpen ? (
                                            <ArrowDown2 size="16" color="#454545" />
                                        ) : (
                                            <ArrowUp2 size="16" color="#454545" />
                                        )}
                                    </Accordion.Header>

                                    {(license?.file || license?.allAttachments?.length) && action === "list" ? (
                                        <Accordion.Body className="py-0 text-muted border-top border-gray-100">
                                            <Header
                                                className=" px-0"
                                                searchPlaceholder="Search document"
                                                buttonText="New File"
                                                buttonUrl={`/business/license/${licenseId}?action=add`}
                                                hideContainerClass
                                                showBottomBorder={false}
                                                listOrGridKey="license"
                                                showSearchForm={false}
                                                isSearching={isSearching}
                                            />
                                        </Accordion.Body>
                                    ) : null}

                                    <Accordion.Body className="pb-3  text-muted border-top border-gray-100">
                                        {/* Files list */}
                                        {["list", undefined].includes(action) && (
                                            <>
                                                {license?.file || license?.allAttachments?.length ? (
                                                    <>
                                                        {isMobileDevice() ||
                                                        isTabletDevice() ||
                                                        listOrGrid.license === "grid" ? (
                                                            <Row className="g-3">
                                                                {licenseFiles("active")?.length &&
                                                                    licenseFiles("active")?.map((file: StorageFile) => (
                                                                        <Col md={3} key={file.id}>
                                                                            <ContactDocument
                                                                                file={file}
                                                                                onDelete={storageHook.onTriggerDelete}
                                                                                fileType="storage"
                                                                                user={user}
                                                                                onUpdate={file =>
                                                                                    router.push(
                                                                                        `/business/license/${licenseId}?action=edit&fileId=${file.id}`,
                                                                                    )
                                                                                }
                                                                                onItemClick={(document: any) => {
                                                                                    setIsLoading(true);
                                                                                    storageHook.viewDocumentFile(
                                                                                        document,
                                                                                    );
                                                                                    setTimeout(() => {
                                                                                        setIsLoading(false);
                                                                                    }, 2000);
                                                                                }}
                                                                                onArchive={() =>
                                                                                    archiveLicenseFile(file)
                                                                                }
                                                                                showDownloadOption={false}
                                                                                addToFavorites={addToFavorites}
                                                                                removeFromFavorites={
                                                                                    removeFromFavorites
                                                                                }
                                                                            />
                                                                        </Col>
                                                                    ))}
                                                            </Row>
                                                        ) : (
                                                            <Row className={`g-0`}>
                                                                <Col className="mx-0">
                                                                    <Card className={`border-0 mt-4`}>
                                                                        <DataTableComponent
                                                                            columns={licenseFilesTable()}
                                                                            data={licenseFiles("active")}
                                                                            paginationTotalRows={
                                                                                searchResults?.licenses?.results
                                                                                    .length ?? totalRows
                                                                            }
                                                                            pagination={false}
                                                                            onRowClicked={licenseFile => {
                                                                                viewDocumentFile(licenseFile);
                                                                            }}
                                                                        />
                                                                    </Card>
                                                                </Col>
                                                            </Row>
                                                        )}
                                                    </>
                                                ) : (
                                                    <EmptyStateInnerPage
                                                        headerText="No files"
                                                        descriptionText="Files added can be managed here"
                                                        buttonText="New File"
                                                        className="my-5"
                                                        fixedHieght={false}
                                                        onButtonClick={() => {
                                                            router.push(`/business/license/${licenseId}?action=add`);
                                                        }}
                                                    />
                                                )}
                                            </>
                                        )}

                                        {/* File form */}
                                        {["add", "edit"].includes(action) && (
                                            <Row className="justify-content-center my-5">
                                                <Col md={4}>
                                                    <Form onSubmit={handleSubmitLicenseFile}>
                                                        <Form.Group className="mb-4">
                                                            <Form.Label className="text-gray-600 tb-body-small-medium">
                                                                Attachment <Required />
                                                            </Form.Label>

                                                            {storageHook.storageFile != null &&
                                                            !isEmptyObject(storageHook.storageFile) ? (
                                                                <div className="mb-4">
                                                                    <SelectedFileBox
                                                                        file={storageHook.storageFile}
                                                                        onDelete={handleRemoveFile}
                                                                        isEditing={true}
                                                                        canRemoveFile={true}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Dropzone
                                                                    accept={ACCEPTED_FILES}
                                                                    multiple={false}
                                                                    onDrop={handleOnFileChange}
                                                                    disabled={false}
                                                                >
                                                                    {({ getRootProps, getInputProps }) => (
                                                                        <section
                                                                            className={`dropzone-container ${
                                                                                file?.length
                                                                                    ? "dropzone-container-selected gap-4"
                                                                                    : ""
                                                                            } pointer border-radius-12`}
                                                                            title="Drag and drop file, or browse. File types: .png, .jpg, .pdf"
                                                                        >
                                                                            <div
                                                                                {...getRootProps()}
                                                                                className={`${
                                                                                    file?.length
                                                                                        ? "p-0 d-flex align-items-center gap-4 justify-content-between"
                                                                                        : ""
                                                                                }`}
                                                                            >
                                                                                <input {...getInputProps()} />
                                                                                <div
                                                                                    className={`text-muted d-flex align-items-center ${
                                                                                        file?.length
                                                                                            ? ""
                                                                                            : "flex-column text-center"
                                                                                    } text-centerm ${
                                                                                        file?.length
                                                                                            ? "gap-12"
                                                                                            : "gap-3"
                                                                                    } w-100 h-100`}
                                                                                >
                                                                                    {file?.length ? (
                                                                                        <Gallery
                                                                                            size="32"
                                                                                            color="#888888"
                                                                                        />
                                                                                    ) : (
                                                                                        <DocumentText
                                                                                            variant="Bold"
                                                                                            size={40}
                                                                                            color="#D1D1D1"
                                                                                        />
                                                                                    )}

                                                                                    {file?.length ? (
                                                                                        <>
                                                                                            <div className=" m-0 p-0 d-flex flex-column ">
                                                                                                <p className="truncate-1 m-0">
                                                                                                    {file[0].name}
                                                                                                </p>
                                                                                                <p className="m-0">
                                                                                                    {(
                                                                                                        file[0].size /
                                                                                                        sizeInMB
                                                                                                    ).toFixed(2)}
                                                                                                    {"mb"}
                                                                                                </p>
                                                                                            </div>
                                                                                        </>
                                                                                    ) : (
                                                                                        <div className="tb-body-default-medium text-gray-500">
                                                                                            Drag and drop file, or{" "}
                                                                                            <a className="text-primary offset tb-body-default-medium">
                                                                                                Choose a File
                                                                                            </a>
                                                                                            <br />
                                                                                            <small className="text-gray-500 tb-body-small-regular">
                                                                                                File types: .png, .jpg,
                                                                                                .pdf
                                                                                            </small>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {file?.length ? (
                                                                                <div
                                                                                    className="d-flex cancel-dropzone align-items-center justify-content-center rounded-circle bg-grey"
                                                                                    onClick={e => {
                                                                                        e.stopPropagation();
                                                                                        setFile(undefined);
                                                                                    }}
                                                                                >
                                                                                    <X size={16} color="#454545" />
                                                                                </div>
                                                                            ) : (
                                                                                ""
                                                                            )}
                                                                        </section>
                                                                    )}
                                                                </Dropzone>
                                                            )}
                                                        </Form.Group>

                                                        <Form.Group>
                                                            <Form.Label>
                                                                File Name <Required />
                                                            </Form.Label>

                                                            <Form.Control
                                                                type="text"
                                                                placeholder="E.g Living Room Remodel"
                                                                value={fileName}
                                                                onChange={e => setFileName(e.target.value)}
                                                                required
                                                            />
                                                        </Form.Group>

                                                        <div className="mt-4">
                                                            {errorMessage && (
                                                                <FormErrorMessage message={errorMessage} />
                                                            )}
                                                            <div className="d-flex gap-20 w-100">
                                                                <Link
                                                                    href={`/business/license/${licenseId}`}
                                                                    className="text-decoration-none"
                                                                >
                                                                    <Button
                                                                        className="w-140 btn-140 px-3 py-2 tb-title-body-medium"
                                                                        variant="outline-secondary"
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </Link>

                                                                <Button
                                                                    className="w-100 btn-240 px-3 py-2 tb-title-body-medium"
                                                                    type="submit"
                                                                    disabled={
                                                                        isSubmitting ||
                                                                        (action === "add" &&
                                                                            !file &&
                                                                            !storageHook.storageFile) ||
                                                                        !fileName
                                                                    }
                                                                >
                                                                    {isSubmitting ? (
                                                                        <ButtonLoader buttonText={"Saving"} />
                                                                    ) : (
                                                                        "Save"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Form>
                                                </Col>
                                            </Row>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Container>
                    </div>

                    {/* Archived files */}
                    {licenseFiles("archived")?.length > 0 && (
                        <div id="project-documents">
                            <Container fluid className="p-0">
                                <Accordion className="mt-4" defaultActiveKey={`0`}>
                                    <Accordion.Item eventKey="0" className="border-gray-100 rounded-4">
                                        <Accordion.Header
                                            className="p-3 py-12 pb-0"
                                            as={"div"}
                                            onClick={() => setIsOpen(!isOpen)}
                                        >
                                            <div className=" w-100">
                                                <p className="m-0 tb-body-default-medium text-gray-900 d-flex align-items-center gap-1">
                                                    <span
                                                        className={`${
                                                            ["list", undefined].includes(action) ? "" : "text-muted"
                                                        }`}
                                                    >
                                                        Archived
                                                    </span>
                                                </p>
                                            </div>
                                            {isOpen ? (
                                                <ArrowDown2 size="16" color="#454545" />
                                            ) : (
                                                <ArrowUp2 size="16" color="#454545" />
                                            )}
                                        </Accordion.Header>

                                        <Accordion.Body className="pb-3  text-muted border-top border-gray-100">
                                            {/* Files list */}
                                            {["list", undefined].includes(action) && (
                                                <>
                                                    {isMobileDevice() ||
                                                    isTabletDevice() ||
                                                    listOrGrid.license === "grid" ? (
                                                        <Row className="g-3">
                                                            {licenseFiles("archived")?.length &&
                                                                licenseFiles("archived")?.map((file: StorageFile) => (
                                                                    <Col md={3} key={file.id}>
                                                                        <ContactDocument
                                                                            file={file}
                                                                            onDelete={storageHook.onTriggerDelete}
                                                                            fileType="storage"
                                                                            user={user}
                                                                            onUpdate={file =>
                                                                                router.push(
                                                                                    `/business/license/${licenseId}?action=edit&fileId=${file.id}`,
                                                                                )
                                                                            }
                                                                            onItemClick={(document: any) => {
                                                                                setIsLoading(true);
                                                                                storageHook.viewDocumentFile(document);
                                                                                setTimeout(() => {
                                                                                    setIsLoading(false);
                                                                                }, 2000);
                                                                            }}
                                                                            onUnarchive={() =>
                                                                                activateLicenseFile(file)
                                                                            }
                                                                            addToFavorites={addToFavorites}
                                                                        />
                                                                    </Col>
                                                                ))}
                                                        </Row>
                                                    ) : (
                                                        <Row className={`g-0`}>
                                                            <Col className="mx-0">
                                                                <Card className={`border-0 mt-4`}>
                                                                    <DataTableComponent
                                                                        columns={licenseFilesTable()}
                                                                        data={licenseFiles("archived")}
                                                                        paginationTotalRows={
                                                                            searchResults?.licenses?.results.length ??
                                                                            totalRows
                                                                        }
                                                                        pagination={false}
                                                                        onRowClicked={licenseFile => {
                                                                            viewDocumentFile(licenseFile);
                                                                        }}
                                                                    />
                                                                </Card>
                                                            </Col>
                                                        </Row>
                                                    )}
                                                </>
                                            )}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </Container>
                        </div>
                    )}

                    {/* Success modal */}
                    <FeedbackModal
                        icon={<CheckCircle color="green" size={50} />}
                        showModal={showFeedbackModal}
                        setShowModal={setShowFeedbackModal}
                        primaryButtonText={"Go to license files"}
                        onPrimaryButtonClick={() => {
                            setShowFeedbackModal(false);
                            router.push(`/business/license/${licenseId}`);
                        }}
                        secondaryButtonText={action === "edit" ? "Close" : "Add another file"}
                        feedbackMessage={`File ${action === "edit" ? "updated" : "added"} successfully`}
                        onSecondaryButtonClick={() => location.reload()}
                    />

                    <DeleteModal
                        showModal={storageHook.showDeleteModal}
                        setShowModal={(value: boolean) => storageHook.setShowDeleteModal(value)}
                        dataToDeleteName={"file"}
                        isDeleting={storageHook.isDeleting}
                        onYesDelete={deleteLicenseFile}
                    />
                </Container>
            ) : (
                <EmptyState
                    icon={<InsuranceIcon width={80} height={80} />}
                    headerText="Insurance Not Found"
                    descriptionText="An insurance with this ID does not exist."
                    buttonText="View Insurances"
                    buttonUrl="/business/license"
                />
            )}
        </DashboardLayout>
    );
}
