import { Lock } from "iconsax-react";

export default function PrivateLock() {
    return (
        <div
            className="w-32 h-32 d-flex justify-content-center align-items-center rounded-circle"
            style={{ backgroundColor: "#88888899" }}
        >
            <Lock size={16} color="white" />
        </div>
    );
}
