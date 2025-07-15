import MessageItem, { MessageType } from "@/components/MessageItem";
import { Email, ThreadEmail } from "@/repositories/communications-repository";
import { useState } from "react";
import { IntergrationResponseData, HasIntergrationResponseData } from "@/repositories/integration-repository";
import DI from "@/di-container";
import { useReducer } from "react";
import { formatDatetime } from "@/helpers";
import { useDispatch, useSelector } from "react-redux";
import { emailActions } from "@/store/email-reducer";
import { RootState } from "@/store";

type UseEmailsState = {
    projectId?: string;
};
type GoogleIntegrationState = {
    isLoading: boolean;
    isStartingIntegration: boolean;
    error: string;
    integrationData: IntergrationResponseData;
    hasIntegrationData: HasIntergrationResponseData;
};

const useEmails = (props: UseEmailsState) => {
    const dispatch = useDispatch();
    const { integrationData } = useSelector((state: RootState) => state.email);
    const { projectId } = props;
    const [emails, setEmails] = useState<Email[]>([]);
    const [emailToView, setEmailToview] = useState<Email>(emails[0]);
    const [viewThread, setViewThread] = useState<boolean>(false);
    const [emailThread, setEmailThread] = useState<ThreadEmail[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [composeEmail, setComposeEmail] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<string>("");

    const [state, setState] = useReducer(
        (state: GoogleIntegrationState, newState: Partial<GoogleIntegrationState>) => ({ ...state, ...newState }),
        {
            isLoading: true,
            isStartingIntegration: false,
            error: "",
            integrationData: null as IntergrationResponseData,
            hasIntegrationData: null as HasIntergrationResponseData,
        },
    );

    async function startGoogleIntegration<T>() {
        try {
            setState({ isStartingIntegration: true });
            const res = await DI.integrationService.startGoogleIntegraions(`${projectId}`);
            setState({ integrationData: res.data });
            if (res.data) {
                location.href = res.data.redirectUrl;
            }
        } catch (error) {
            setState({ error: `${error}` });
        } finally {
            setState({ isStartingIntegration: false });
        }
    }

    function triggerDisconnectEmailModal() {
        setShowDeleteModal(true);
    }

    async function disconnectGoogleIntegration() {
        setIsDeleting(true);
        try {
            const res = await DI.integrationService.deleteGoogleIntegration();
            setIsDeleting(false);
            setShowDeleteModal(false);
            dispatch(emailActions.setIntegratedEmail(null));
            location.reload();
            return res;
        } catch (error) {
        } finally {
        }
    }

    async function viewEmails() {
        getEmails();
        setViewThread(false);
        setComposeEmail(false);
    }

    async function checkForActiveIntegration() {
        // if (integrationData) {
        //     setState({ hasIntegrationData: integrationData });
        //     getEmails();
        //     return;
        // }

        try {
            setState({ isLoading: true });
            const res = await DI.integrationService.hasActiveIntegration();
            setState({ hasIntegrationData: res.data });

            if (res.data?.hasIntegration) {
                dispatch(emailActions.setIntegratedEmail(res.data));
                getEmails();
            }
            if (!res.data?.hasIntegration) {
                setState({ isLoading: false });
            }
        } catch (error) {
            setState({ error: `${error}`, isLoading: false });
        } finally {
        }
    }

    async function getEmails() {
        setState({ isLoading: true });
        try {
            const res = await DI.communicationsService.getEmails({ projectId, pageNumber: 1 });
            setEmails(res.data.results);
        } catch (error) {
        } finally {
            setState({ isLoading: false });
        }
    }

    async function getEmailThread(emailId: string) {
        setState({ isLoading: true });
        try {
            const res = await DI.communicationsService.getEmail({ emailId });
            setEmailThread(res.data.body.messages);
            setViewThread(true);
        } catch (error) {
        } finally {
            setState({ isLoading: false });
        }
    }

    async function sendEmail(email: Email): Promise<boolean> {
        setIsSubmitting(true);
        try {
            const res = await DI.communicationsService.composeEmail(email);
            return true;
        } catch (error) {
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    async function archiveEmail(emailId: string) {
        try {
            const res = await DI.communicationsService.archiveEmail({ emailId });
            viewEmails();
        } catch (error) {
            return false;
        }
    }

    const tableColumns = () => {
        return [
            {
                cell: (email: Email) => (
                    <MessageItem onClick={() => gotToThread(email)} data={email} type={MessageType.email} />
                ),
                grow: 5,
            },

            {
                cell: (email: Email) => (
                    <span className="ms-auto text-muted pointer" onClick={() => gotToThread(email)}>
                        {`${formatDatetime(email.createdAt)}`}
                    </span>
                ),
                grow: 1,
            },
        ];
    };

    function gotToThread(email: Email) {
        if (email) {
            setEmailToview(email);
            getEmailThread(email.id);
        }
    }
    return {
        tableColumns,
        emailToView,
        viewThread,
        setViewThread,
        startGoogleIntegration,
        checkForActiveIntegration,
        emails,
        getEmails,
        state: state,
        emailThread,
        isSubmitting,
        sendEmail,
        getEmailThread,
        archiveEmail,
        composeEmail,
        setComposeEmail,
        viewEmails,
        disconnectGoogleIntegration,
        triggerDisconnectEmailModal,
        setShowDeleteModal,
        showDeleteModal,
        isDeleting,
        setIsDeleting,
        connectionStatus,
        setConnectionStatus,
    };
};

export default useEmails;
