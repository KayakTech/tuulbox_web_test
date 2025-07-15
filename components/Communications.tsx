import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import { useState } from "react";
import Emails from "./Emails";
import TextMessages from "./TextMessages";
import { Project } from "@/repositories/project-repository";
import useProject from "@/hooks/project";
import Link from "next/link";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

export type ProjectDocumentFormState = {
    activeMenu: ProjectDocumentMenuItem;
    projectId: string;
    project?: Partial<Project>;
};

const COMMUNICATIONS_TABS = ["Emails", "Text Messages", "Chats"];

export default function Communications(props: ProjectDocumentFormState) {
    const { activeMenu, projectId, project } = props;
    const [path, setPath] = useState<string>("emails");
    const { isCreatorOfProject } = useProject({});

    const { user } = useSelector((state: RootState) => state.account);

    return (
        <>
            <div className="overflowX-hidden overflowY-scroll position-relative w-100" style={{ height: "35rem" }}>
                {activeMenu.pathName === "emails" && (
                    <Emails
                        projectId={projectId}
                        activeMenu={activeMenu}
                        hideAction={project ? !isCreatorOfProject(project) : false}
                    />
                )}
                {path === "text messages" && <TextMessages projectId={projectId} />}
                {activeMenu.pathName === "chat" && (
                    <div>
                        {" "}
                        <Link href={`/chat-app?roomID=${project?.chatRoomId}&email=${user?.email}`}>
                            Go to chat
                        </Link>{" "}
                    </div>
                )}
            </div>
        </>
    );
}
