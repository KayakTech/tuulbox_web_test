import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
    setProjectDetailLoading,
    setProjectDetail,
    setProjectDetailError,
    selectProjectDetail,
} from "@/store/project-detail-reducer";
import DI from "@/di-container";
import { useToast } from "@/context/ToastContext";

interface UseProjectDetailReturn {
    projectDetail: any;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export default function useProjectDetail(projectId: string): UseProjectDetailReturn {
    const dispatch = useDispatch();
    const { showToast } = useToast();

    const projectDetailState = useSelector((state: RootState) => selectProjectDetail(state, projectId));

    const fetchProjectDetail = async (silent = false) => {
        if (!silent) {
            dispatch(setProjectDetailLoading({ projectId, loading: true }));
        }

        try {
            const response = await DI.projectService.getProject(projectId);

            dispatch(
                setProjectDetail({
                    projectId,
                    data: response.data,
                }),
            );
        } catch (error) {
            const errorMessage = "Failed to fetch project details";
            dispatch(
                setProjectDetailError({
                    projectId,
                    error: errorMessage,
                }),
            );

            if (!silent) {
                showToast({
                    heading: "Error",
                    message: errorMessage,
                    variant: "danger",
                });
            }
        }
    };

    useEffect(() => {
        if (!projectId) return;

        const hasData = !!projectDetailState.data;

        if (!hasData) {
            // No data - fetch with loading state
            fetchProjectDetail(false);
        }
    }, [projectId]);

    return {
        projectDetail: projectDetailState.data,
        isLoading: projectDetailState.loading,
        error: projectDetailState.error,
        refetch: () => fetchProjectDetail(false),
    };
}
