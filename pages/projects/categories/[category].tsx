import AllProjectDocuments from "@/components/AllProjectDocuments";
import AllProjectSubcontractors from "@/components/AllProjectSubcontractors";
import useProject from "@/hooks/project";

export default function ProjectCategories() {
    const { projectDocumentCategory } = useProject({});
    return projectDocumentCategory() === "sub_contractors" ? <AllProjectSubcontractors /> : <AllProjectDocuments />;
}
