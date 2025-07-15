import { Spinner } from "react-bootstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import { PaginationChangePage } from "react-data-table-component/dist/src/DataTable/types";

type DataTableComponentProps = {
    columns: any;
    data: unknown[];
    paginationTotalRows: number | undefined;
    onChangePage?: PaginationChangePage | undefined;
    progressPending?: boolean | undefined;
    paginationRowsPerPageOptions?: number[] | null;
    paginationPerPage?: number | null;
    onRowClicked?: (data: any) => void;
    pagination?: boolean;
    pointerOnHover?: boolean;
};
export default function DataTableComponent({
    columns,
    data,
    paginationTotalRows,
    onChangePage,
    progressPending,
    paginationRowsPerPageOptions,
    paginationPerPage,
    onRowClicked,
    pagination = true,
    pointerOnHover = false,
}: DataTableComponentProps) {
    return (
        <DataTable
            pagination={pagination}
            columns={columns}
            data={data}
            paginationServer
            paginationTotalRows={paginationTotalRows}
            onChangePage={onChangePage}
            paginationPerPage={paginationPerPage || 15}
            paginationRowsPerPageOptions={paginationRowsPerPageOptions || [15]}
            progressPending={progressPending}
            responsive
            progressComponent={
                <div className="text-center my-5 py-5">
                    <Spinner />
                </div>
            }
            onRowClicked={onRowClicked}
            pointerOnHover
            highlightOnHover
        />
    );
}
