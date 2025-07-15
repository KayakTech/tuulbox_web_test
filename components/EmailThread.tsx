import { EmailPart, ThreadEmail } from "@/repositories/communications-repository";
import CircleGrey from "./CircleGrey";
import { Button } from "react-bootstrap";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Accordion } from "react-bootstrap";

type EmailThreadState = {
    projectId: string;
    thread: ThreadEmail;
    index: number;
    emailId: string;
    archiveEmail: (emailId: string) => void;
};

export default function EmailThread(props: EmailThreadState) {
    const { integrationData } = useSelector((state: RootState) => state.email);
    const { thread, index, emailId, archiveEmail } = props;

    const from = (convertToMe: boolean) => {
        const from = thread?.payload?.headers.filter(header => header.name.toLowerCase() === "from");
        if (convertToMe) return from[0].value === integrationData?.email ? "me" : from[0].value;
        return from[0].value;
    };
    const to = (convertToMe: boolean) => {
        const to = thread?.payload?.headers.filter(header => header.name.toLowerCase() === "to");
        if (convertToMe) return to[0].value === integrationData?.email ? "me" : to[0].value;
        return to[0].value;
    };
    const cc = () => {
        const cc = thread?.payload?.headers.filter(header => header.name.toLowerCase() === "cc");
        return cc.length ? cc[0].value : null;
    };
    const isSent = () => {
        return thread?.labelIds.includes("SENT");
    };

    function reformatEmailContent(content: string) {
        return content.replace(/-/g, "+").replace(/_/g, "/");
    }

    function subject() {
        const sub = thread?.payload?.headers?.filter(header => header?.name?.toLowerCase() === "subject");
        if (sub.length) {
            return sub[0].value;
        }
        return "";
    }

    function content() {
        if (isSent()) return atob(reformatEmailContent(thread.payload.body.data));
        const htmlPart = thread?.payload?.parts.find(isHtml);
        if (!htmlPart) {
            try {
                return atob(reformatEmailContent(thread?.payload?.parts[0]?.body.data));
            } catch (error) {
                return "Unable to display this message at the moment. Kindly visit your inbox";
            }
        }
        return atob(reformatEmailContent(htmlPart.body.data));
    }
    function isHtml(part: EmailPart) {
        return part.mimeType.toLowerCase() === "text/html";
    }

    return (
        <>
            <div className="email-thread">
                <div className="d-flex mb-4">
                    <CircleGrey className="text-capitalize">{isSent() ? from(false)[0] : to(false)[0]}</CircleGrey>
                    <div>
                        <span>{from(false)}</span>
                        <Accordion>
                            <Accordion.Item eventKey="0" className="border-0">
                                <Accordion.Header className="text-muted">
                                    <small className="text-muted">To: {to(true)}</small>{" "}
                                </Accordion.Header>
                                <Accordion.Body>
                                    <ul className="list-unstyled small text-muted mb-0">
                                        <li>From: {from(true)} </li>
                                        {cc() ? <li>Cc: {cc()}</li> : ""}
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </div>
                </div>
                <p className="text-uppercase">{subject() ?? "(NO SUBJECT)"}</p>
                <div className="text-muted" dangerouslySetInnerHTML={{ __html: content() }}></div>
            </div>
        </>
    );
}
