import { ProjectDocumentFormState } from "./Communications";
import useSubcontractors from "@/hooks/subContractors";
import PageLoader from "./PageLoader";
import EmptyStateInnerPage from "./EmptyStateInnerPage";
import { Card } from "react-bootstrap";
import SubcontractorDetails from "./SubcontractorDetails";
import { SubcontractorPages } from "@/hooks/subContractors";
import SubContractorForm from "./SubContractorForm";
import DeleteModal from "./DeleteModal";
import Engineer from "./icons/Engineer";
import Header from "./Header";
import { useEffect, useState } from "react";
import useProject from "@/hooks/project";
import DataTableComponent from "./DataTableComponent";
import { getUrlQuery, isMobileDevice, isTabletDevice } from "@/helpers";
import { useRouter } from "next/router";

export default function SubContractors(props: ProjectDocumentFormState) {
    const { projectId, project } = props;
    const router = useRouter();
    const {
        isLoading,
        subContractors,
        viewSubContractors,
        viewSubcontractorDetails,
        viewEstimateForm,
        viewSubContractorForm,
        pageToView,
        subContractor,
        isDeleting,
        tableColumns,
        getProjectSubcontractors,
        showDeleteModal,
        setShowDeleteModal,
        deleteSubcontractorFromProject,
        totalRows,
        setPageToView,
    } = useSubcontractors({ projectId, project });
    const { isCreatorOfProject } = useProject({});

    useEffect(() => {
        getProjectSubcontractors();
    }, []);

    useEffect(() => {
        if (getUrlQuery("action") === "form") {
            setPageToView(SubcontractorPages.form);
        }
        if (getUrlQuery("action") === "list") {
            setPageToView(SubcontractorPages.list);
        }
        if (getUrlQuery("action") === "details") {
            setPageToView(SubcontractorPages.details);
        }
    }, [router]);

    return (
        <div className={`position-relative w-100 border-0 ${isLoading ? "vh-100-88" : ""}`}>
            {isLoading && <PageLoader heightClass="h-100" />}

            {!isLoading && pageToView === SubcontractorPages.form && (
                <SubContractorForm viewSubcontractors={viewSubContractors} projectId={projectId} />
            )}

            {!isLoading && pageToView === SubcontractorPages.details && (
                <SubcontractorDetails
                    theSubContractor={subContractor}
                    viewEstimateForm={viewEstimateForm}
                    projectId={projectId}
                    project={project}
                />
            )}

            {!isLoading && pageToView === SubcontractorPages.list && (
                <>
                    <div className={isMobileDevice() || isTabletDevice() ? "container-fluid" : "px-24"}>
                        {subContractors.length ? (
                            <Header
                                showListOrGrid={true}
                                listOrGridKey="Sub Contractor"
                                buttonText={project && isCreatorOfProject(project) ? "New Sub Contractor" : undefined}
                                onButtonClick={viewSubContractorForm}
                                searchPlaceholder="Search Sub Contractor"
                                hideContainerClass={true}
                                className=""
                            />
                        ) : null}
                    </div>
                    <Card className="overflow-hidden rounded-0 border-end-0 mt-4 border-start-0 border-0">
                        <DataTableComponent
                            columns={tableColumns(false, project ? !isCreatorOfProject(project) : false, projectId)}
                            data={subContractors}
                            paginationTotalRows={totalRows}
                            progressPending={isLoading}
                            paginationRowsPerPageOptions={[15]}
                            paginationPerPage={subContractors.length ?? null}
                            onRowClicked={sub => viewSubcontractorDetails(sub)}
                        />
                    </Card>
                    <DeleteModal
                        showModal={showDeleteModal}
                        setShowModal={(value: boolean) => setShowDeleteModal(value)}
                        dataToDeleteName={"Subcontractor"}
                        message="Are you sure you want to delete sub contractor?"
                        isDeleting={isDeleting}
                        onYesDelete={deleteSubcontractorFromProject}
                    />
                </>
            )}

            {!isLoading && pageToView === SubcontractorPages.list && !subContractors.length && (
                <>
                    <div className="h-100 w-100 d-flex flex-column justify-content-center align-items-center">
                        <EmptyStateInnerPage
                            icon={<Engineer />}
                            headerText="No Sub Contractors"
                            descriptionText="Sub Contractors added can be managed here"
                            buttonText={project && isCreatorOfProject(project) ? "New Sub Contractor" : undefined}
                            onButtonClick={viewSubContractorForm}
                            col={12}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
