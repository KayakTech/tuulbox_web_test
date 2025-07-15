export type UserType = {
    fullName: string;
    email: string;
    role: "Admin" | "Manager" | "User";
    permission: "Read and Edit" | "Read Only";
    lastActive: string;
    id: string;
};
