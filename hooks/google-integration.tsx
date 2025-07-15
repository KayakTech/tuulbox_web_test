import { IntergrationResponseData, HasIntergrationResponseData } from "@/repositories/integration-repository";
import DI from "@/di-container";
import { useReducer } from "react";

type GoogleIntegrationState = {
    isLoading: boolean;
    isStartingIntegration: boolean;
    error: string;
    integrationData: IntergrationResponseData;
    hasIntegrationData: HasIntergrationResponseData;
};
const useGoogleIntegration = () => {
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
            const res = await DI.integrationService.startGoogleIntegraions();
            setState({ integrationData: res.data });
        } catch (error) {
            setState({ error: `${error}` });
        } finally {
            setState({ isStartingIntegration: false });
        }
    }

    async function checkForActiveIntegration() {
        try {
            setState({ isLoading: true });
            const res = await DI.integrationService.hasActiveIntegration();
            setState({ hasIntegrationData: res.data });
        } catch (error) {
            setState({ error: `${error}` });
        } finally {
            setState({ isLoading: false });
        }
    }

    return {
        startGoogleIntegration,
        checkForActiveIntegration,
        integrationState: state,
    };
};

export default useGoogleIntegration;
