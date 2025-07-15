import { RootState } from "@/store";
import { FormEvent, useReducer, useRef, useState } from "react";
import { useSelector } from "react-redux";
import DI from "@/di-container";
import useCompany from "./company";
import convertImageToBase64, { allowOnlyAphabets, currentPage, readImageFile } from "@/helpers";
import _ from "lodash";
import { DeleteAcccountPayload, SignupPayload } from "@/repositories/account-repository";
import { useToast } from "@/context/ToastContext";

export type AccountState = {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    addressLine1: string;
    addressLine2: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    isUpdating: boolean;
    profilePicture?: any;
    extension: string;
};

export type NewUserData = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
};

const useAccount = () => {
    const { showToast } = useToast();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [activeForm, setActiveForm] = useState<number>(1);
    const [currentError, setCurrentError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const profileImageRef = useRef<HTMLInputElement>(null);
    const [showEditPersonalInformationModal, setShowPersonalInformationModal] = useState<boolean>(false);
    const { user } = useSelector((state: RootState) => state.account);
    const [isValid, setIsValid] = useState(true);
    const [previewImage, setPreviewImage] = useState<any>("");
    const [accountIsComplete, setAccountIsComplete] = useState<boolean>(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");
    const [fileSizeExceeds10Mb, setFileSizeExceeds10Mb] = useState<boolean>(false);
    const [showProfileImageModal, setShowProfileImageModal] = useState<boolean>(false);
    const [imageUploaded, setImageUploaded] = useState<number>(0);
    const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);
    const [currentImage, setCurrentImage] = useState(user?.profilePicture || null);
    const [isSavingAccountDetails, setIsSavingAccountDetails] = useState<boolean>(false);

    const [state, dispatch] = useReducer(
        (state: Partial<AccountState>, newState: Partial<AccountState>) => ({ ...state, ...newState }),
        {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            mobile: user?.mobile || "",
            addressLine1: user?.addressLine1 || "",
            addressLine2: user?.addressLine2 || "",
            country: user?.country || "",
            state: user?.state || "",
            city: user?.city || "",
            zipCode: user?.zipCode || "",
            isUpdating: false,
            profilePicture: user?.profilePicture || "",
            extension: user?.extension || "",
        },
    );

    const [deleteAccountReason, setDeleteAccountReason] = useReducer(
        (state: any, newState: any) => ({ ...state, ...newState }),
        {
            reason: "",
            notes: "",
        },
    );

    const { companyDetails, setCompanyDetails, handleSubmit } = useCompany();

    function canSubmitForm() {
        return state?.firstName && state?.lastName;
    }

    async function onInputChange(label: string, e: any) {
        if (e?.target?.value !== "" || e !== "") {
            setErrorMessage("");
        }
        if ((label === "profilePicture" && e?.target?.files) || e?.length) {
            const image = await readImageFile(e?.target?.files[0] || e[0]);
            image && setPreviewImage(image);
            const file = e?.target?.files[0] || e[0];

            //@ts-ignore
            dispatch({ [label]: file });
        } else {
            dispatch({ [label]: e });
        }
    }

    const isValidName = (name: any) => {
        const nameRegex = /^[a-zA-Z0-9]+$/;
        return nameRegex.test(name) && name.length <= 30;
    };

    const isValidEmail = (email: any) => {
        const emailRegex = /^[^@]+@[^.]+\..+$/;

        return emailRegex.test("isaac@gmail.com");
    };

    const isValidPhoneNumber = (phoneNumber: any) => {
        const phoneRegex = /^[+]?[0-9]+(?:[-\s]?[0-9]+)*$/;
        return phoneRegex.test(phoneNumber) && phoneNumber.replace(/\D/g, "").length >= 10;
    };

    function isValidForm() {
        if (!isValidName(state.firstName)) {
            setErrorMessage("Please enter a valid first name.");
            setIsValid(false);
            return false;
        }
        if (!isValidName(state.lastName)) {
            setErrorMessage("Please enter a valid last name.");
            setIsValid(false);
            return false;
        }
        if (!isValidEmail(state.email)) {
            setErrorMessage("Please enter a valid email");
            setIsValid(false);
            return false;
        }
        if (!isValidPhoneNumber(state.mobile)) {
            setErrorMessage("Plese enter a valid phone number");
            setIsValid(false);
            return false;
        }
        setIsValid(true);
        return true;
    }

    function renderErrorMessage(fieldName: string) {
        if (errorMessage) {
            return <p className="error">{errorMessage}</p>;
        }
        return null;
    }

    async function handleSaveUserProfile(event: React.FormEvent<HTMLFormElement>, isCreatingAccount?: boolean) {
        event.preventDefault();
        setErrorMessage("");
        dispatch({ isUpdating: true });
        const validForm = isValidForm() as boolean;

        if (validForm) {
            setIsSaving(true);
            setIsSavingAccountDetails(true);
            try {
                const payload = {
                    ...state,
                };

                if (payload.profilePicture instanceof File) {
                    const base64String = await convertImageToBase64(payload.profilePicture);
                    payload.profilePicture = base64String;
                }

                if (
                    (isCreatingAccount && payload.profilePicture !== undefined) ||
                    payload.profilePicture.includes("https://")
                ) {
                    delete payload.profilePicture;
                }

                let formData: any = new FormData();
                for (const key in payload) {
                    if (payload.hasOwnProperty(key)) {
                        // @ts-ignore
                        formData.append(key, payload[key]);
                    }
                }

                const res = await DI.accountService.updateUser(payload);
                await DI.businessService.getCompanyDetails(res.data.companyId);
                setCurrentError(null);
                setShowFeedbackModal(true);
                const isUploaded = 1 + imageUploaded;
                setImageUploaded(isUploaded);

                if (currentPage() === "account") {
                    location.href = "/overview";
                }
            } catch (error) {
                showToast({ heading: "Update Failed", message: "Failed to update user profile.", variant: "danger" });
                setIsSavingAccountDetails(false);
            } finally {
                setShowPersonalInformationModal(false);
                setIsSaving(false);
            }
        }
        dispatch({ isUpdating: false });
    }

    async function registerNewUser(userData: NewUserData): Promise<boolean> {
        try {
            setIsSaving(true);
            const payload: SignupPayload = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                password: userData.password,
            };

            await DI.accountService.signup(payload);
            return true;
        } catch (error: any) {
            if (error?.response?.data?.data) {
                const errorData = error.response.data.data;

                throw error;
            }

            showToast({
                heading: "Registration Failed",
                message: "Error registering user.",
                variant: "danger",
            });
            return false;
        } finally {
            setIsSaving(false);
        }
    }

    function handleCreateAccountSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (activeForm === 1) {
            handleSaveUserProfile(event, true);
            // handleSubmit(event);
        }
    }

    function closeAccountModal() {
        setPreviewImage("");
        setShowPersonalInformationModal(false);
    }

    function onButtonClick() {
        // if (activeForm === 1 && isValidForm()) {
        //     setErrorMessage("");
        //     setActiveForm(2);
        // }
    }
    function removeSelectedImage() {
        setCurrentImage(null);
        setPreviewImage("");
        dispatch({ profilePicture: "" });
    }

    function handleProfileImageChange(file: File[]) {
        setDropZoneErrorMessage("");
        setFileSizeExceeds10Mb(false);

        if (!file.length) {
            setDropZoneErrorMessage("Only (png and jpg) files are accepted");
            return;
        }

        // Check the file size of the image
        const fileSizeInBytes = file[0].size;
        const fileSizeInKB = fileSizeInBytes / 1024;
        if (fileSizeInKB > 10240) {
            setFileSizeExceeds10Mb(true);
            return;
        }

        onInputChange("profilePicture", file);
    }

    async function deleteAccount(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const payload: DeleteAcccountPayload = _.cloneDeep(deleteAccountReason);
        if (payload.reason != "other") {
            payload.notes = "";
        }

        try {
            setIsDeletingAccount(true);
            const res = await DI.accountService.deleteAccount(payload);
            await DI.authService.logout();
        } catch (error) {
            showToast({
                heading: "Account Deletion Failed",
                message: "Failed to delete account. Please try again.",
                variant: "danger",
            });
        } finally {
            setIsDeletingAccount(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
        const filteredValue = allowOnlyAphabets(e.target.value);
        if (name === "firstName") {
            dispatch({ firstName: filteredValue });
        }
        if (name === "lastName") {
            dispatch({ lastName: filteredValue });
        }
    };

    return {
        errorMessage,
        setErrorMessage,
        activeForm,
        setActiveForm,
        onButtonClick,
        currentError,
        setCurrentError,
        isSaving,
        setIsSaving,
        profileImageRef,
        showEditPersonalInformationModal,
        setShowPersonalInformationModal,
        user,
        isValid,
        setIsValid,
        state,
        dispatch,
        onInputChange,
        isValidName,
        isValidEmail,
        isValidPhoneNumber,
        isValidForm,
        renderErrorMessage,
        handleSaveUserProfile,
        previewImage,
        closeAccountModal,
        handleCreateAccountSubmit,
        companyDetails,
        setCompanyDetails,
        accountIsComplete,
        setAccountIsComplete,
        showFeedbackModal,
        setShowFeedbackModal,
        removeSelectedImage,
        handleProfileImageChange,
        dropZoneErrorMessage,
        fileSizeExceeds10Mb,
        showProfileImageModal,
        setShowProfileImageModal,
        imageUploaded,
        setImageUploaded,
        isDeletingAccount,
        deleteAccount,
        currentImage,
        setCurrentImage,
        canSubmitForm,
        handleInputChange,
        isSavingAccountDetails,
        deleteAccountReason,
        setDeleteAccountReason,
        registerNewUser,
    };
};

export default useAccount;
