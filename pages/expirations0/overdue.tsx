import DashboardLayout from "@/components/DashboardLayout";
import EmptyState from "@/components/EmptyState";
import PageLoader from "@/components/PageLoader";
import Header from "@/components/Header";
import { Clock } from "iconsax-react";
import ExpirationsMenu from "@/components/ExpirartionsMenu";
import DataTable from "react-data-table-component";
import dataDisplayLayout from "@/store/data-display-layout";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Card, Col, Row } from "react-bootstrap";
import DeleteModal from "@/components/DeleteModal";
import useStorage from "@/hooks/storage";
import { useEffect } from "react";
import ContactDocument from "@/components/ContactDocument";

export default function OverdueExpirations() {
    const { dataDisplayLayout } = useSelector((state: RootState) => state.dataDisplayLayout);

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
    } = useStorage({});

    useEffect(() => {
        // getExpiredFiles();
    }, []);

    return (
        <DashboardLayout
            pageTitle="Expirations"
            breadCrumbs={[{ name: "Expirations", url: "/expirations" }, { name: "Overdue" }]}
        >
            <div className="mt-4">
                <ExpirationsMenu />
            </div>
            <EmptyState
                icon={<Clock variant="Outline" size={80} color="#B0B0B0" />}
                headerText="No Overdue Expirations"
                descriptionText="Overdue Expirations added can be managed here"
            />
        </DashboardLayout>
    );
}
