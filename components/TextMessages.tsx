import { useEffect } from "react";
import PageLoader from "./PageLoader";
import EmptyStateInnerPage from "./EmptyStateInnerPage";
import Image from "next/image";
import useTextMessage from "@/hooks/textMessages";
import DataTable from "react-data-table-component";
import TextMessageThreads from "./TextMessageThreads";
import MessageIcon from "./icons/Message";

type TextMessagesState = {
    projectId: string;
};

export default function TextMessages(props: TextMessagesState) {
    const { projectId } = props;
    const {
        tableColumns,
        viewThread,
        setViewThread,
        textMessageToView,
        getTextMessages,
        threads,
        isLoading,
        textMessages,
        archiveTextMessage,
    } = useTextMessage({ projectId });

    useEffect(() => {
        getTextMessages();
    }, []);

    return (
        <div className="text-messages d-flex flex-column" style={{ height: "35rem" }}>
            {isLoading ? (
                <PageLoader heightClass="h-35vh" />
            ) : textMessages.length ? (
                viewThread ? (
                    <TextMessageThreads
                        threads={threads}
                        textMessageToView={textMessageToView}
                        onViewTextMessageList={getTextMessages}
                        archiveTextMessage={archiveTextMessage}
                    />
                ) : (
                    <DataTable
                        pointerOnHover
                        noTableHead
                        highlightOnHover
                        className="mt-4"
                        columns={tableColumns()}
                        data={textMessages}
                    />
                )
            ) : (
                <div className="h-100 w-100 d-flex justify-content-center align-items-center">
                    <EmptyStateInnerPage
                        icon={<MessageIcon />}
                        headerText={`No Text Messages`}
                        descriptionText={`Text Messages you send/receive can be managed here`}
                        col={11}
                    />
                </div>
            )}
        </div>
    );
}
