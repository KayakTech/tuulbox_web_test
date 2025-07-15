import { PencilIcon } from "@heroicons/react/24/outline";
import { Button, Col, Row } from "react-bootstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import { Email } from "@/repositories/communications-repository";
import YouAreSignedInAs from "./YouAreSignedInAs";
import { Edit2 } from "iconsax-react";

type EmailListState = {
    tableColumns: () => TableColumn<Email>[];
    emails: Email[];
    onComposeEmail: () => void;
    integratedEmail: string;
    hideAction?: boolean;
};
export default function EmailList(props: EmailListState) {
    const { tableColumns, emails, onComposeEmail, integratedEmail, hideAction } = props;

    return (
        <>
            {integratedEmail && <YouAreSignedInAs email={integratedEmail} hideAction={hideAction} />}
            <div className="p-24">
                <Button
                    variant="outline-secondary"
                    className="float-start float-md-end mt-3 mt-md-0 d-flex gap-2 align-items-center justify-content-center"
                    onClick={onComposeEmail}
                >
                    <Edit2 size={24} /> Compose Email
                </Button>
            </div>
            <DataTable
                data={emails}
                noTableHead
                pointerOnHover
                highlightOnHover
                className="mt-2"
                columns={tableColumns()}
                pagination
            />
        </>
    );
}
