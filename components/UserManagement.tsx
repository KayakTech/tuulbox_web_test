import { DATA_TABLE_CUSTOM_STYLES } from "@/helpers/constants";
import useUserManagement from "@/hooks/useUserManagement";
import React from "react";
import PageLoader from "./PageLoader";
import DataTableComponent from "./DataTableComponent";

export default function UserManagement() {
    const { userColumns, userData, isLoading } = useUserManagement();
    return (
        <div className="overflow-hidden">
            <section className="">
                <div className="d-flex flex-column">
                    <span className="d-flex flex-column">
                        <h3 className="tb-body-large-medium text-gray-900">User Management</h3>
                        <p className="tb-body-small-regular text-muted"> Manage users on your plan</p>
                    </span>

                    {isLoading ? (
                        <div className="d-flex justify-content-center align-items-center w-100 h-100">
                            <PageLoader />
                        </div>
                    ) : (
                        <>
                            <div className="border-0 d-flex flex-column">
                                {userData.length < 1 ? (
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
                                                    d="M17 21H7c-4 0-5-1-5-5V8c0-4 1-5 5-5h10c4 0 5 1 5 5v8c0 4-1 5-5 5ZM14 8h5M15 12h4M17 16h2"
                                                    stroke="#E0E0E0"
                                                    stroke-width="1"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                ></path>
                                                <path
                                                    d="M8.5 11.29a1.81 1.81 0 1 0 0-3.62 1.81 1.81 0 0 0 0 3.62ZM12 16.33a3.02 3.02 0 0 0-2.74-2.72 7.72 7.72 0 0 0-1.52 0A3.03 3.03 0 0 0 5 16.33"
                                                    stroke="#E0E0E0"
                                                    stroke-width="1"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                ></path>
                                            </svg>
                                        </span>
                                        <div className="d-flex flex-column align-items-center justify-content-center w-242">
                                            <h4 className="tb-title-body-medium text-gray-800">No Users</h4>
                                            <p className="tb-body-small-regular text-center text-muted">
                                                You haven’t subscribed yet. Once you do, your team members will appear
                                                here.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <DataTableComponent
                                            columns={userColumns()}
                                            data={userData}
                                            paginationTotalRows={userData.length}
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
