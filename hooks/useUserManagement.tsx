import { Dropdown } from "react-bootstrap";
import { useState } from "react";
import { UserType } from "@/repositories/user-repository";
import { MoreVertical } from "react-feather";
import { Trash } from "iconsax-react";

const useUserManagement = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Sample billing data
    const sampleUserData: UserType[] = [
        {
            id: "usr_001",
            fullName: "John Anderson",
            email: "john.anderson@example.com",
            role: "Admin",
            permission: "Read and Edit",
            lastActive: "Jun-06-2025",
        },
        {
            id: "usr_002",
            fullName: "Sarah Williams",
            email: "sarah.w@example.com",
            role: "Manager",
            permission: "Read and Edit",
            lastActive: "Dec-06-2025",
        },
        {
            id: "usr_003",
            fullName: "Michael Chen",
            email: "m.chen@example.com",
            role: "User",
            permission: "Read Only",
            lastActive: "Jun-06-2025",
        },
        {
            id: "usr_004",
            fullName: "Emma Thompson",
            email: "emma.t@example.com",
            role: "Manager",
            permission: "Read and Edit",
            lastActive: "Dec-06-2025",
        },
        {
            id: "usr_005",
            fullName: "David Rodriguez",
            email: "d.rodriguez@example.com",
            role: "User",
            permission: "Read Only",
            lastActive: "Jun-06-2025",
        },
        {
            id: "usr_006",
            fullName: "Lisa Johnson",
            email: "lisa.j@example.com",
            role: "Admin",
            permission: "Read and Edit",
            lastActive: "Dec-06-2025",
        },
        {
            id: "usr_007",
            fullName: "James Wilson",
            email: "j.wilson@example.com",
            role: "User",
            permission: "Read Only",
            lastActive: "Jun-06-2025",
        },
    ];

    const userColumns = () => {
        return [
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Full Name</span>,
                cell: (row: Partial<UserType>) => (
                    <span className="rowclick tb-body-default-medium">{row?.fullName}</span>
                ),
                grow: 1.5,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Email</span>,
                cell: (row: Partial<UserType>) => (
                    <span className="text-muted  d-flex flex-column gap-2">
                        <a
                            title={row?.email?.toLowerCase()}
                            className="text-blue-900 text-decoration-none"
                            href={`mailto:${row?.email}`}
                        >
                            {row?.email?.toLowerCase()}
                        </a>
                    </span>
                ),
                grow: 1.5,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Role</span>,
                cell: (row: Partial<UserType>) => <span className="rowclick tb-body-default-medium">{row?.role}</span>,
                grow: 1.5,
            },
            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Permission</span>,
                cell: (row: Partial<UserType>) => (
                    <span className="rowclick tb-body-default-medium">{row?.permission}</span>
                ),
                grow: 1.5,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize">Last Active</span>,
                cell: (row: Partial<UserType>) => (
                    <span className="rowclick tb-body-default-medium">{row?.lastActive}</span>
                ),
                grow: 1,
            },

            {
                name: <span className="text-gray-800 tb-title-body-medium text-capitalize ms-auto">Action</span>,
                cell: (row: Partial<UserType>, index: number) => (
                    <div className="d-flex w-100 justify-content-end align-items-center gap-2">
                        <Dropdown className="ms-autom">
                            <Dropdown.Toggle
                                size="sm"
                                variant="default"
                                className="btn-square ms-auto bg-transparent"
                                id="dropdown-basic"
                            >
                                <MoreVertical size={24} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu align={`end`}>
                                <>
                                    <Dropdown.Item className="text-danger">
                                        <Trash size={16} className="" color="#E70000" />
                                        <span className="tb-body-default-regular text-danger">Delete</span>
                                    </Dropdown.Item>
                                </>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                ),
                grow: 1,
            },
        ];
    };

    return {
        userColumns,
        userData: sampleUserData,
        isLoading,
        setIsLoading,
    };
};

export default useUserManagement;
