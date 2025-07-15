import React from "react";
import { PlanCard } from "./PlanCard";
import { plans } from "@/helpers/planData";
import { PlanType } from "@/helpers/constants";

type Props = {
    currentPlan: PlanType;
};

const SubscriptionPage: React.FC<Props> = ({ currentPlan }) => {
    return (
        <div className="containerm mt-4m" style={{ maxWidth: "832px" }}>
            <PlanCard plan={plans[currentPlan]} currentPlan={currentPlan} />
        </div>
    );
};

export default SubscriptionPage;
