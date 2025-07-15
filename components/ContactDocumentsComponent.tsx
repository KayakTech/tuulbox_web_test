import { Subcontractor, TaxDocument } from "@/repositories/subcontractor-repository";
import { RootState } from "@/store";
import { Card, Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import ContactDocument from "./ContactDocument";
import { updateUrlQuery } from "@/helpers";
import { ProjectDocumentType } from "@/repositories/project-repository";
import useStorage from "@/hooks/storage";
import DataTable from "react-data-table-component";
import EmptyStateInnerPage from "./EmptyStateInnerPage";
import { Folder } from "iconsax-react";
import { useRouter } from "next/router";
import DataTableComponent from "./DataTableComponent";

type ContactDocumentsComponentProps = {
    subContractor?: Subcontractor;
    documentsTable: any;
    onEdit: () => void;
    onDelete: (document: any) => void;
    onAddToFavorites: (document: any) => void;
    onAddDocument: () => void;
};

export default function ContactDocumentsComponent(props: ContactDocumentsComponentProps) {
    const { dataDisplayLayout, listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { viewDocumentFile } = useStorage({});
    const router = useRouter();

    const { subContractor, documentsTable, onEdit, onDelete, onAddToFavorites, onAddDocument } = props;

    return (
        <div className=" d-flex align-items-center justify-content-center w-100">
            <div className="w-100">
                {subContractor?.certificates.length ? (
                    <>
                        {listOrGrid.contactDocument === "grid" ? (
                            <div className="">
                                <Row className="g-3">
                                    {subContractor?.certificates.map((certificate: TaxDocument, index: number) => (
                                        <Col md={3} sm={4} className="" key={index}>
                                            <ContactDocument
                                                file={certificate.certificate}
                                                fileType="contact-document"
                                                onDelete={() => onDelete(certificate)}
                                                onUpdate={() => {
                                                    updateUrlQuery({ key: "action", value: "edit" });
                                                    updateUrlQuery({ key: "certId", value: certificate.id });
                                                    onEdit();
                                                }}
                                                onItemClick={(document: ProjectDocumentType) => {
                                                    viewDocumentFile(document);
                                                }}
                                                addToFavorites={onAddToFavorites}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        ) : (
                            <Card className="overflow-hidden rounded-0 border-top-0 border-0">
                                <DataTableComponent
                                    columns={documentsTable({
                                        subcontractor: subContractor,
                                    })}
                                    data={subContractor?.certificates}
                                    paginationTotalRows={subContractor?.certificates.length}
                                    pagination={false}
                                />
                            </Card>
                        )}
                    </>
                ) : (
                    <div className="">
                        <EmptyStateInnerPage
                            icon={<Folder />}
                            headerText="No Documents"
                            descriptionText="Documents added can be managed here"
                            buttonText="New Document"
                            onButtonClick={() => {
                                updateUrlQuery({ key: "action", value: "add" });
                                onAddDocument();
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
