import { Subcontractor } from "@/repositories/subcontractor-repository";
import { Project } from "@/repositories/project-repository";
import { getUrlQuery } from "@/helpers";
import ContactDetailsComponent from "./ContactDetailsComponent";

type SubcontractorDetailsState = {
    projectId: string;
    viewEstimateForm: () => void;
    theSubContractor?: Subcontractor;
    project?: Partial<Project>;
};

export default function SubcontractorDetails(props: SubcontractorDetailsState) {
    return <ContactDetailsComponent sContractorId={`${getUrlQuery("id")}`} />;
}
