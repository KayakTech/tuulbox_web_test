import DI from "@/di-container";
import { apiErrorMessage } from "@/helpers";
import { useState } from "react";
import { useRouter } from "next/router";

const useWebsite = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [successful, setSucessful] = useState<boolean>(false);

    async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);

        const payload = {
            email: email,
        };

        try {
            const response = await DI.websiteService.addToWaitingList(payload);
            setAlertMessage("Thank you for subscribing to our mailing list");
            setSucessful(true);
            setShowAlert(true);
            setEmail("");

            // setTimeout(() => {
            //     router.push("/register");
            // }, 5000);
        } catch (error: any) {
            setAlertMessage(apiErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        handleSubmit,
        email,
        setEmail,
        setShowModal,
        showModal,
        isSubmitting,
        setIsSubmitting,
        errorMessage,
        setErrorMessage,
        showAlert,
        setShowAlert,
        alertMessage,
        successful,
    };
};

export default useWebsite;
