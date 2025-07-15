import { ThreadEmail } from "@/repositories/communications-repository";
import { Button, Col, Form, Row } from "react-bootstrap";
import { ArchiveBoxIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import EmailThread from "./EmailThread";
import { useReducer } from "react";
import { Email } from "@/repositories/communications-repository";
import ButtonLoader from "./ButtonLoader";
import { ArchiveMinus, ArrowLeft, Trash } from "iconsax-react";

type EmailThreadsState = {
    projectId: string;
    onViewEmailList: () => void;
    email: Email;
    archiveEmail: (emailId: string) => void;
    onComposeEmail: () => void;
    emailThread: ThreadEmail[];
    isSubmitting: boolean;
    sendEmail: (email: Email) => Promise<boolean>;
    getEmailThread: (emailId: string) => void;
};

export default function EmailThreads(props: EmailThreadsState) {
    const {
        projectId,
        onViewEmailList,
        email,
        onComposeEmail,
        emailThread,
        isSubmitting,
        sendEmail,
        getEmailThread,
        archiveEmail,
    } = props;

    const [reply, setReply] = useReducer((state: any, newState: Partial<Email>) => ({ ...state, ...newState }), {
        content: "",
        subject: email?.subject,
        project: projectId,
        threadId: email.threadId,
        to: email.to,
        isRead: email.isRead,
        tags: email.tags,
        cc: email.cc,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!reply.content) return;
        const res = await sendEmail(reply);
        if (res) getEmailThread(email.id);
    }

    return (
        <div className="d-flex flex-column">
            <div className="d-flex justify-content-between border-bottom-gray-100 px-24 py-3">
                <ArrowLeft onClick={onViewEmailList} size={24} className="pointer" color="black" />
                <div className="d-flex gap-3">
                    <ArchiveMinus
                        onClick={() => archiveEmail(email.id)}
                        size={24}
                        className="pointer"
                        color="#6D6D6D"
                    />
                    <Trash className="pointer" size={24} color="#6D6D6D" />
                </div>
            </div>
            <div className="w-100 px-24">
                {emailThread.length ? (
                    <>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            className="ms-auto d-block d-lg-none mt-3 me-3"
                            onClick={() => archiveEmail(email.id)}
                        >
                            <ArchiveBoxIcon width={20} height={20} /> Archive
                        </Button>

                        {emailThread.map((thread: any, index: number) => (
                            <div className="d-flex mt-4 flex-column" key={index}>
                                <EmailThread
                                    thread={thread}
                                    projectId={projectId}
                                    key={index}
                                    index={index}
                                    emailId={email?.id}
                                    archiveEmail={(emailId: string) => archiveEmail(emailId)}
                                />
                            </div>
                        ))}
                        <Form onSubmit={handleSubmit} className="justify-content-end align-bottom mt-4">
                            <div
                                className="bg-gray-50 p-20 border-radius w-100 d-flex align-items-center gap-3"
                                style={{ content: "", bottom: "20px" }}
                            >
                                <div className="flex-fill">
                                    <Form.Control
                                        as="textarea"
                                        placeholder="Type your message ..."
                                        rows={1}
                                        value={reply.content}
                                        onChange={e => setReply({ content: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Button disabled={isSubmitting} className="px-5" type="submit">
                                        {isSubmitting ? <ButtonLoader buttonText="" /> : "Send"}
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </>
                ) : (
                    ""
                )}
            </div>
        </div>
    );
}
