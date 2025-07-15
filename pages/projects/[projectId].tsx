import DashboardLayout from "@/components/DashboardLayout";
import ProjectDetails from "@/components/ProjectDetails";
import { useState } from "react";

export default function ProjectView() {
    const projectId = window.location.pathname.split("/")[2];
    const [projectName, setProjectName] = useState("Project Details");
    return (
        <DashboardLayout
            pageTitle="Add Project"
            breadCrumbs={[{ name: "Projects", url: "/projects" }, { name: projectName }]}
        >
            <ProjectDetails id={projectId} onSetProjectName={setProjectName} />
        </DashboardLayout>
    );
}
