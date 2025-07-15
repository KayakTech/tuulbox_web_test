import { Wifi } from "iconsax-react";
import EmptyState from "@/components/EmptyState";

export default function OfflineStateComponent() {
    return (
        <div className="h-100 d-flex flex-column justify-content-center align-items-center">
            <EmptyState
                icon={<Wifi size={56} color="#B0B0B0" />}
                headerText="You are offline"
                descriptionText="Please check your internet connection and try again"
                buttonText=""
            />
        </div>
    );
}
