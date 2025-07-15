import { ArchiveBoxIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import CircleGrey from "./CircleGrey";
import { Button } from "react-bootstrap";
import { TextMessage } from "@/repositories/communications-repository";
import { formatDatetime } from "@/helpers";
import Image from "next/image";

type TextMessageThreadsState = {
    textMessageToView: TextMessage;
    onViewTextMessageList: () => void;
    threads: TextMessage[];
    archiveTextMessage(textMessageId: string): void;
};

export default function TextMessageThreads(props: TextMessageThreadsState) {
    const { textMessageToView, onViewTextMessageList, threads, archiveTextMessage } = props;

    return (
        <div className="d-flex">
            <ArrowLeftIcon
                onClick={onViewTextMessageList}
                width={20}
                height={20}
                className="me-4 mt-4 pointer"
                color="black"
            />
            <div className="w-100">
                <div className="d-flex align-items-center my-4">
                    <CircleGrey>
                        <Image src={`/images/svg/icons/user-grey.svg`} alt="" width={16} height={16} />
                    </CircleGrey>
                    <span>{threads[0].to[0]}</span>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        className="ms-auto"
                        onClick={() => archiveTextMessage(textMessageToView.id)}
                    >
                        <ArchiveBoxIcon width={20} height={20} /> Archive
                    </Button>
                </div>
                <div className="w-100 d-flex flex-column">
                    {threads?.map((thread: TextMessage, index: number) => (
                        <div key={index} className={`my-2 text-message-thread ${thread.to.length ? "to" : "from"}`}>
                            <div className={`bg-grey p-3 body text-black ${thread.to.length ? "to" : "from"}`}>
                                {thread.content}
                                <div>
                                    <small className="small text-muted">Sender: {thread.sender}</small>
                                </div>
                            </div>
                            <div className="small text-muted mt-2">{formatDatetime(thread.createdAt)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
