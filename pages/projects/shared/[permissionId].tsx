import ProjectDetails from "@/components/ProjectDetails";
import SupportPageHeader from "@/components/SupportPageHeader";
import { Container } from "react-bootstrap";

export default function ProjectView() {
    const permissionId = window.location.pathname.split("/")[3];
    return (
        <>
            <SupportPageHeader width={175} height={50} isNav={true} />
            <Container className="p-5 pt-2">
                <div className="border border-gray-100 border-radius-20 overflow-hidden">
                    <ProjectDetails id={permissionId} />
                </div>
            </Container>
        </>
    );
}
