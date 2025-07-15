import EmptyStateGoogle from "./EmptyStateGoogle";
import Image from "next/image";
import EmptyStateInnerPage from "./EmptyStateInnerPage";
import { useEffect } from "react";
import PageLoader from "./PageLoader";
import useEmails from "@/hooks/emails";
import EmailList from "./EmailList";
import { ProjectDocumentMenuItem } from "./ProjectDocumentSection";
import EmailThreads from "./EmailThreads";
import ComposeEmail from "./ComposeEmail";
import YouAreSignedInAs from "./YouAreSignedInAs";
import Folder from "./icons/Folder";
import { FolderIcon } from "@heroicons/react/24/outline";
import { Edit2 } from "iconsax-react";
import { getUrlQuery } from "@/helpers";
import ErrorStatePage from "./ErrorStatePage";

type EmailsState = {
    projectId: string;
    activeMenu: ProjectDocumentMenuItem;
    hideAction?: boolean;
};

export default function Emails(props: EmailsState) {
    const { projectId, activeMenu, hideAction } = props;
    const {
        tableColumns,
        emailToView,
        viewThread,
        startGoogleIntegration,
        state,
        checkForActiveIntegration,
        emails,
        emailThread,
        isSubmitting,
        sendEmail,
        getEmailThread,
        archiveEmail,
        composeEmail,
        setComposeEmail,
        viewEmails,
        triggerDisconnectEmailModal,
        showDeleteModal,
        setShowDeleteModal,
        connectionStatus,
        setConnectionStatus,
    } = useEmails({ projectId });

    useEffect(() => {
        const status = getUrlQuery("status");
        if (status) {
            setConnectionStatus(status);
        }
        checkForActiveIntegration();
    }, []);

    return (
        <div className="emails d-flex flex-column h-100">
            {state.isLoading ? (
                <PageLoader heightClass="h-35vh" />
            ) : state?.hasIntegrationData?.hasIntegration ? (
                composeEmail ? (
                    <ComposeEmail
                        integratedEmail={state.hasIntegrationData.email}
                        onViewEmailList={() => setComposeEmail(false)}
                        viewEmailList={viewEmails}
                        projectId={projectId}
                        sendEmail={sendEmail}
                        isSubmitting={isSubmitting}
                    />
                ) : emails.length ? (
                    <>
                        {viewThread && (
                            <EmailThreads
                                email={emailToView}
                                projectId={projectId}
                                onViewEmailList={() => viewEmails()}
                                onComposeEmail={() => setComposeEmail(true)}
                                emailThread={emailThread}
                                sendEmail={sendEmail}
                                getEmailThread={(emailId: string) => getEmailThread(emailId)}
                                isSubmitting={isSubmitting}
                                archiveEmail={archiveEmail}
                            />
                        )}

                        {!viewThread && (
                            <EmailList
                                tableColumns={tableColumns}
                                emails={emails}
                                onComposeEmail={() => setComposeEmail(true)}
                                integratedEmail={state.hasIntegrationData.email}
                                hideAction={hideAction}
                            />
                        )}
                    </>
                ) : (
                    <>
                        {state?.hasIntegrationData?.hasIntegration && (
                            <YouAreSignedInAs
                                email={state.hasIntegrationData.email.toLowerCase()}
                                hideAction={hideAction}
                            />
                        )}
                        <div className="h-100 w-100  mt-5 d-flex justify-content-center align-items-center">
                            <EmptyStateInnerPage
                                icon={<Folder />}
                                buttonIcon={<Edit2 />}
                                headerText={`No Emails`}
                                descriptionText={`Emails you send/receive can be managed here`}
                                buttonText={`${hideAction ? "" : "Compose Email"}`}
                                onButtonClick={() => {
                                    !hideAction && setComposeEmail(true);
                                }}
                                col={11}
                            />
                        </div>
                    </>
                )
            ) : (
                <>
                    {getUrlQuery("status") === "failure" ? (
                        <div className="h-100 d-flex justify-content-center align-items-center flex-column">
                            <ErrorStatePage
                                title={"Connection Failed"}
                                description="Something went wrong and your email account failed to connect with tuulbox."
                                buttonText="Try to reconnect"
                                // secondaryText="Got it"
                                // secondaryButtonLink={`/projects/${projectId}?action=list&activeMenu=communications`}
                                onPrimaryButtonClick={startGoogleIntegration}
                            />
                        </div>
                    ) : (
                        <div className="h-100 d-flex justify-content-center align-items-center flex-column">
                            <EmptyStateGoogle
                                isLoading={state.isStartingIntegration}
                                onButtonClick={startGoogleIntegration}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
