import { useRouter } from "next/router";
import { useState } from "react";
import { TextMessage } from "@/repositories/communications-repository";
import MessageItem, { MessageType } from "@/components/MessageItem";
import DI from "@/di-container";
import { formatDatetime } from "@/helpers";

type UseTextMessageState = {
    projectId: string;
};

const useTextMessage = (props: UseTextMessageState) => {
    const router = useRouter();
    const { projectId } = props;
    const [textMessages, setTextMessages] = useState<TextMessage[]>([]);
    const [textMessageToView, setTextMessageToView] = useState<TextMessage>(textMessages[0]);
    const [threads, setThreads] = useState<TextMessage[]>([]);
    const [viewThread, setViewThread] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isArchiving, setIsArchiving] = useState<boolean>(false);

    async function getTextMessages() {
        setIsLoading(true);
        try {
            const res = await DI.communicationsService.getTextMessages({ projectId, pageNumber: 1 });
            setTextMessages(res.data.results);
            setViewThread(false);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    async function getTextMessageThread(textMessageId: string) {
        setIsLoading(true);
        try {
            const res = await DI.communicationsService.getTextMessageThread(textMessageId, projectId);
            setThreads(res.data.body);
            setViewThread(true);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    }

    async function archiveTextMessage(textMessageId: string) {
        setIsArchiving(true);
        try {
            const res = await DI.communicationsService.archiveTextMessage(textMessageId, projectId);
            getTextMessages();
        } catch (error) {
        } finally {
            setIsArchiving(false);
        }
    }

    const tableColumns = () => {
        return [
            {
                cell: (textMessage: TextMessage) => (
                    <MessageItem onClick={() => gotToThread(textMessage)} data={textMessage} type={MessageType.text} />
                ),
                grow: 5,
            },

            {
                cell: (textMessage: TextMessage) => (
                    <span className="ms-auto text-muted pointer" onClick={() => gotToThread(textMessage)}>
                        {`${formatDatetime(textMessage.updatedAt)}`}
                    </span>
                ),
                grow: 1,
            },
        ];
    };

    function gotToThread(textMessage: TextMessage) {
        if (textMessage) {
            setTextMessageToView(textMessage);
            getTextMessageThread(textMessage.id);
        }
    }
    return {
        tableColumns,
        textMessageToView,
        viewThread,
        setViewThread,
        getTextMessages,
        threads,
        textMessages,
        isLoading,
        getTextMessageThread,
        archiveTextMessage,
    };
};

export default useTextMessage;
