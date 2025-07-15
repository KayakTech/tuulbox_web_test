import DI from "@/di-container";
import convertImageToBase64, { apiErrorMessage } from "@/helpers";
import { Company, CompanyNewId, NewBusinessId } from "@/repositories/business-repository";
import { RootState } from "@/store";
import { useRouter } from "next/router";
import { useEffect, useReducer, useState } from "react";
import { useSelector } from "react-redux";

const useCompany = () => {
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.account);
    const { company } = useSelector((state: RootState) => state.business);

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [dropZoneErrorMessage, setDropZoneErrorMessage] = useState<string>("");
    const [attachment, setAttachment] = useState<File[]>([]);
    const [isChangingLogo, setIsChangingLogo] = useState<boolean>(false);
    const [isDeletingNewId, setIsDeleteingNewId] = useState<boolean>(false);
    const [newIds, setNewIds] = useState<CompanyNewId[]>([
        {
            idNameLabel: "Name of ID (Type)",
            idNamePlaceholder: "Name of ID",
            idNameValue: "",
            idNumberLabel: "ID Number",
            idNumberPlaceholder: "**_****864",
            idNumberValue: "",
        },
    ]);

    const [companyDetails, setCompanyDetails] = useReducer(
        (state: any, newState: Partial<Company>) => ({ ...state, ...newState }),
        {
            id: user?.companyId || "",
            name: company?.name || "",
            addressLine1: company?.addressLine1 || "",
            addressLine2: company?.addressLine2 || "",
            city: company?.city || "",
            state: company?.state || "",
            country: company?.country || "",
            zipCode: company?.zipCode || "",
            taxId: company?.taxId || "",
            website: company?.website || "",
            logo: company?.logo || "",
            businessIds: company?.businessIds || [],
        },
    );

    async function handleSubmit(event?: React.FormEvent<HTMLFormElement>) {
        event?.preventDefault();

        let businessIds: Partial<NewBusinessId>[] = [];
        let payload = JSON.parse(JSON.stringify(companyDetails));

        if (newIds.length) {
            newIds.map((id, index) => {
                const idName = document.getElementsByName(`newIdName${index + 1}`) as NodeListOf<HTMLInputElement>;
                const idNumber = document.getElementsByName(`newIdNumber${index + 1}`) as NodeListOf<HTMLInputElement>;
                businessIds.push({ typeId: idName[0]?.value, numberId: idNumber[0]?.value });
            });

            payload = { ...payload, businessIds: businessIds };
            setCompanyDetails(payload);
        }

        setErrorMessage("");

        // if (!attachment.length && !companyDetails.logo) {
        //     setErrorMessage("Please attach your company logo.");
        //     return;
        // }

        if (!companyDetails.name.length) {
            setErrorMessage("Please add your company legal name.");
            return;
        }

        if (companyDetails.logo && !attachment.length) {
            delete payload.logo;
        }

        setIsSaving(true);

        if (attachment.length) {
            setIsChangingLogo(true);
            const base64Image = await convertImageToBase64(attachment[0]);
            setCompanyDetails({ logo: base64Image });
            return; // useEffect listening to this below
        }
        updateCompanyDetails(payload);
    }

    useEffect(() => {
        if (companyDetails.logo && isChangingLogo) {
            updateCompanyDetails();
        }
    }, [companyDetails.logo]);

    // set new ids on load
    useEffect(() => {
        let ids: CompanyNewId[] = [];
        if (companyDetails?.businessIds && companyDetails?.businessIds.length && !isDeletingNewId) {
            companyDetails?.businessIds.map((businessId: NewBusinessId, index: number) => {
                ids.push({
                    idNameLabel: "Name of ID (Type)",
                    idNamePlaceholder: "Name of ID",
                    idNameValue: businessId.typeId,
                    idNumberLabel: "ID Number",
                    idNumberPlaceholder: "**_****864",
                    idNumberValue: businessId.numberId,
                });
            });

            setNewIds(ids);
        }
    }, []);
    async function updateCompanyDetails(payload?: Partial<Company>) {
        setIsSaving(true);
        try {
            await DI.businessService.updateCompanyDetails(payload || companyDetails);
            setShowModal(true);
        } catch (error: any) {
            setErrorMessage(apiErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    }

    function handleOnFileChange(file: File[]) {
        setDropZoneErrorMessage("");
        if (!file.length) {
            setDropZoneErrorMessage("Only (png, jpg and pdf) files are accepted");
            return;
        }
        setAttachment(file);
    }

    function removeNewCompanyId(index: number) {
        setIsDeleteingNewId(true);

        const ids = newIds.filter((id: CompanyNewId, i: number) => index != i);
        setNewIds(ids);

        if (companyDetails.businessIds.length) {
            const companyIds = companyDetails?.businessIds.filter((id: NewBusinessId, i: number) => index != i);
            setCompanyDetails({ businessIds: companyIds });
        }
    }
    return {
        user,
        company,
        isSaving,
        errorMessage,
        showModal,
        setShowModal,
        companyDetails,
        setCompanyDetails,
        handleSubmit,
        handleOnFileChange,
        attachment,
        setAttachment,
        isChangingLogo,
        setIsChangingLogo,
        router,
        dropZoneErrorMessage,
        setDropZoneErrorMessage,
        setNewIds,
        newIds,
        setIsDeleteingNewId,
        isDeletingNewId,
        removeNewCompanyId,
    };
};

export default useCompany;
