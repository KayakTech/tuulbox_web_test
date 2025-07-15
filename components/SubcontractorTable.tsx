import { Contact } from "@/repositories/contact-repositories";
import { Subcontractor } from "@/repositories/subcontractor-repository";
import { Card, Col, Row } from "react-bootstrap";
import DataTable, { TableColumn } from "react-data-table-component";

type SubcontractorTableProps = {
    data: (Contact | undefined)[];
    columns: any;
};

export default function SubcontractorTable({ data, columns }: SubcontractorTableProps) {
    return (
        <Row className="">
            <Col>
                <Card className="overflow-hidden rounded-0 border-top-0">
                    <DataTable className="light-header" columns={columns} data={data} />
                </Card>
            </Col>
        </Row>
    );
}
