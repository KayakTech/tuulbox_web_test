import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import PageLoader from "@/components/PageLoader";
import Header from "@/components/Header";
import { Clock } from "iconsax-react";
import ExpirationsMenu from "@/components/ExpirartionsMenu";
import DataTable from "react-data-table-component";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, Col, Row } from "react-bootstrap";
import DeleteModal from "@/components/DeleteModal";
import useStorage from "@/hooks/storage";
import { useEffect } from "react";
import ContactDocument from "@/components/ContactDocument";

export default function Expirations() {
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);

    const {
        getExpiredFiles,
        expiredFiles,
        isLoading,
        expiredFilesTable,
        showDeleteModal,
        setShowDeleteModal,
        isDeleting,
        onDelete,
        onTriggerDelete,
        viewDocumentFile,
        setIsLoading,
    } = useStorage({});

    useEffect(() => {
        getExpiredFiles();
    }, []);

    return (
        <DashboardLayout pageTitle="Expirations" breadCrumbs={[{ name: "Expirations", url: "/expirations" }]}>
            <div className="mt-4">
                <ExpirationsMenu />
            </div>

            {isLoading ? (
                <PageLoader />
            ) : expiredFiles.length ? (
                <div className="pb-5">
                    <Header showListOrGrid={true} searchPlaceholder="Search Expirations" listOrGridKey="expiration" />
                    {listOrGrid.expiration === "grid" ? (
                        <div className="container-fluid">
                            <Row className=" g-4 mt-4">
                                {expiredFiles.map((file: any, index) => (
                                    <Col md={`4`} key={index} className="">
                                        <ContactDocument
                                            file={file}
                                            onDelete={file => onTriggerDelete(file)}
                                            fileType="storage"
                                            isExpiring={true}
                                            onItemClick={(document: any) => {
                                                setIsLoading(true);
                                                viewDocumentFile(file);
                                                setTimeout(() => {
                                                    setIsLoading(false);
                                                }, 2000);
                                            }}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ) : (
                        <Row className="">
                            <Col>
                                <Card className="overflow-hidden rounded-0">
                                    <DataTable pagination columns={expiredFilesTable()} data={expiredFiles} />
                                </Card>
                            </Col>
                        </Row>
                    )}
                    <DeleteModal
                        showModal={showDeleteModal}
                        setShowModal={value => setShowDeleteModal(value)}
                        dataToDeleteName={"Resource"}
                        isDeleting={isDeleting}
                        onYesDelete={onDelete}
                        message="Are you sure you want to delete file from expiration? This action cannot be undone"
                    />
                </div>
            ) : (
                <EmptyState
                    icon={<Clock variant="Outline" size={80} color="#B0B0B0" />}
                    headerText="No Expirations"
                    descriptionText="Expirations added can be managed here"
                />
            )}
        </DashboardLayout>
    );
}
