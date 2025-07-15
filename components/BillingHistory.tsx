import { DATA_TABLE_CUSTOM_STYLES } from "@/helpers/constants";
import useBilling from "@/hooks/useBilling";
import React from "react";
import EmptyState from "@/components/EmptyState";
import PageLoader from "./PageLoader";
import DataTableComponent from "./DataTableComponent";

export default function BillingHistory() {
    const { billingColumns, billingData, isLoading } = useBilling();
    return (
        <div className="overflow-hidden">
            <section className="">
                <div className="d-flex flex-column">
                    <span className="d-flex flex-column">
                        <h3 className="tb-body-large-medium text-gray-900">Billing History</h3>
                        <p className="tb-body-small-regular text-muted">Manage your invoices</p>
                    </span>

                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center w-100 h-100">
                            <PageLoader />
                        </div>
                    ) : (
                        <>
                            <div className="border-0 d-flex flex-column">
                                {billingData.length < 1 ? (
                                    <div className="d-flex flex-column gap-3 justify-content-center align-items-center">
                                        <span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="80"
                                                height="80"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                            >
                                                <path
                                                    d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18.5 9.5v5M9 18c0 .75-.21 1.46-.58 2.06A3.97 3.97 0 0 1 5 22a3.97 3.97 0 0 1-3.42-1.94A3.92 3.92 0 0 1 1 18c0-2.21 1.79-4 4-4s4 1.79 4 4Z"
                                                    stroke="#E0E0E0"
                                                    stroke-width="0.5"
                                                    stroke-miterlimit="10"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                ></path>
                                                <path
                                                    d="m3.441 18 .99.99 2.13-1.97"
                                                    stroke="#E0E0E0"
                                                    stroke-width="0.5"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                ></path>
                                                <path
                                                    d="M2 15.3V9c0-3.5 2-5 5-5h10c3 0 5 1.5 5 5v6c0 3.5-2 5-5 5H8.5"
                                                    stroke="#E0E0E0"
                                                    stroke-width="0.5"
                                                    stroke-miterlimit="10"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                ></path>
                                            </svg>
                                        </span>
                                        <div className="d-flex flex-column align-items-center justify-content-center w-240">
                                            <h4 className="tb-title-body-medium text-gray-800">No history</h4>
                                            <p className="tb-body-small-regular text-center text-muted">
                                                You haven’t subscribed yet. Once you do, your invoices will appear here.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <DataTableComponent
                                            columns={billingColumns()}
                                            data={billingData}
                                            paginationTotalRows={billingData.length}
                                            pagination={false}
                                        />
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
