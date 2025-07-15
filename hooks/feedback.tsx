import { useReducer, useState } from "react";
import FeedbackRepository, { FeedbackPayload } from "@/repositories/feedback-repository";
import DI from "@/di-container";
import { apiErrorMessage } from "@/helpers";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const useSupport = () => {
    const { user } = useSelector((state: RootState) => state.account);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const [feedback, setFeedback] = useReducer(
        (state: FeedbackPayload, newState: Partial<FeedbackPayload>) => ({ ...state, ...newState }),
        {
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            email: user?.email ?? "",
            message: "",
        },
    );
    const [showModal, setShowModal] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!feedback.firstName) {
            setErrorMessage("Please enter your first name.");
            return;
        }
        if (!feedback.lastName) {
            setErrorMessage("Please enter your last name.");
            return;
        }
        setIsSubmitting(true);
        setErrorMessage("");
        try {
            const res = await DI.feedbackService.sendFeedback(feedback);
            setShowModal(true);
        } catch (error) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    async function sendFeedback(payload: FeedbackPayload) {}

    return {
        handleSubmit,
        showModal,
        setShowModal,
        feedback,
        setFeedback,
        isSubmitting,
        setErrorMessage,
        setIsSubmitting,
        errorMessage,
    };
};
export default useSupport;
