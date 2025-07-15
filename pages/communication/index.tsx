import ButtonLoader from "@/components/ButtonLoader";
import DashboardLayout from "@/components/DashboardLayout";
import DI from "@/di-container";
import { HasIntergrationResponseData, IntergrationResponseData } from "@/repositories/integration-repository";
import { use, useEffect, useReducer } from "react";

type IntegrationState = {
    isLoading: boolean;
    error: string;
    integrationData: IntergrationResponseData;
    hasIntegrationData: HasIntergrationResponseData;
};

function UseIntergrationPloc(props: {}) {
    const [state, setState] = useReducer(
        (state: IntegrationState, newState: Partial<IntegrationState>) => ({ ...state, ...newState }),
        {
            isLoading: false,
            error: "",
            integrationData: {} as IntergrationResponseData,
            hasIntegrationData: {} as HasIntergrationResponseData,
        },
    );

    async function startGoogleIntegration<T>() {
        try {
            setState({ isLoading: true });
            const res = await DI.integrationService.startGoogleIntegraions();
            setState({ integrationData: res.data });
        } catch (error) {
            setState({ error: `${error}` });
        } finally {
            setState({ isLoading: false });
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
}

export default function Communication() {
    const { startGoogleIntegration, integrationState, checkForActiveIntegration } = UseIntergrationPloc({});

    useEffect(() => {
        checkForActiveIntegration();
    }, []);

    return (
        <DashboardLayout breadCrumbs={[{ name: "Communication" }]} pageTitle="Communication">
            <div className="d-flex gap-4 py-4">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        startGoogleIntegration<IntergrationResponseData>();
                    }}
                >
                    {integrationState.isLoading ? <ButtonLoader buttonText="Loading" /> : "Enable gmail Integration"}
                </button>

                <button
                    className="btn btn-secondary"
                    onClick={() => {
                        checkForActiveIntegration();
                    }}
                >
                    Has Active Integration
                </button>
            </div>

            <div>{integrationState.error}</div>

            <p>Has Intergraion : {`${integrationState?.hasIntegrationData?.hasIntegration}`}</p>

            <p>
                <a href={`${integrationState?.integrationData?.redirectUrl}`} target="_blank" rel="noopener noreferrer">
                    Login with gmail
                </a>
                {`${integrationState?.integrationData?.redirectUrl}`}
            </p>
        </DashboardLayout>
    );
}
