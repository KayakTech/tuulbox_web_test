import { useEffect, useReducer } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setProjects, appendProjects, setProjectsLoading, setSilentlyFetching } from "@/store/project-reducer";
import DI from "@/di-container";
import { Project } from "@/repositories/project-repository";
import { useToast } from "@/context/ToastContext";

interface UseProjectsReturn {
    projects: Project[];
    isLoading: boolean;
    isInitialLoading: boolean;
    isSilentlyFetching: boolean;
    totalRows: number;
    hasMore: boolean;
    fetchProjects: (options?: { resetData?: boolean; pageNumber?: number }) => Promise<void>;
    loadMoreProjects: () => Promise<void>;
    page: number;
    setPage: (page: number) => void;
}

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

interface ProjectsLocalState {
    isInitialLoading: boolean;
    page: number;
    hasMore: boolean;
}

interface FetchProjectsOptions {
    resetData?: boolean;
    pageNumber?: number;
}

const INITIAL_STATE: ProjectsLocalState = {
    // prevent loading when store has data
    isInitialLoading: false,
    page: 1,
    hasMore: true,
};

export default function useProjects(status: string): UseProjectsReturn {
    const reduxDispatch = useDispatch();
    const { showToast } = useToast();

    const { activeProjects, archivedProjects, isSilentlyFetching } = useSelector((state: RootState) => state.projects);
    const projectsData = status === "active" ? activeProjects : archivedProjects;

    const [localState, setLocalState] = useReducer(
        (state: ProjectsLocalState, newState: Partial<ProjectsLocalState>) => ({ ...state, ...newState }),
        INITIAL_STATE,
    );

    const fetchProjects = async (options: FetchProjectsOptions = {}) => {
        const { resetData = false, pageNumber } = options;
        const currentPageNumber = pageNumber !== undefined ? pageNumber : resetData ? 1 : localState.page;

        // Don't fetch if we already know there's no more data and it's not a reset
        if (!resetData && !localState.hasMore) {
            return;
        }

        // lets show loading state if there's no data available
        if ((resetData || !projectsData.data.length) && !projectsData.lastFetched) {
            reduxDispatch(setProjectsLoading({ status, loading: true }));
            setLocalState({ isInitialLoading: true });
        } else {
            // Silent background fetch when we have data
            reduxDispatch(setSilentlyFetching(true));
        }

        try {
            const response = await DI.projectService.getProjects(currentPageNumber, status);

            if (resetData || currentPageNumber === 1) {
                reduxDispatch(
                    setProjects({
                        status,
                        data: response.results,
                        count: response.count,
                        next: response.next,
                    }),
                );
            } else {
                reduxDispatch(
                    appendProjects({
                        status,
                        data: response.results,
                        next: response.next,
                    }),
                );
            }

            // Calculate if there's more data based on API response to be fetched
            const hasMoreData = response.next !== null;

            // Only increment page if there's more data
            let newPage = currentPageNumber;
            if (hasMoreData && !resetData) {
                newPage = currentPageNumber + 1;
            } else if (resetData && hasMoreData) {
                newPage = 2;
            }
            // If no more data, keep current page number

            setLocalState({
                hasMore: hasMoreData,
                page: newPage,
                isInitialLoading: false,
            });
        } catch (error) {
            showToast({ heading: "Error", message: "Error fetching projects", variant: "danger" });
        } finally {
            reduxDispatch(setProjectsLoading({ status, loading: false }));
            reduxDispatch(setSilentlyFetching(false));
            setLocalState({ isInitialLoading: false });
        }
    };

    const loadMoreProjects = async () => {
        if (
            !localState.hasMore ||
            projectsData.loading ||
            isSilentlyFetching ||
            projectsData.data.length >= projectsData.count
        ) {
            return;
        }

        await fetchProjects({ resetData: false });
    };

    const setPage = (page: number) => {
        // Don't set page if we know there's no more data
        const maxPage = Math.ceil(projectsData.count / 50);
        if (page > maxPage && projectsData.count > 0) {
            return;
        }

        setLocalState({ page });
        fetchProjects({ resetData: false, pageNumber: page });
    };

    useEffect(() => {
        setLocalState({ page: 1, hasMore: true });
    }, [status]);

    useEffect(() => {
        // don't set initial loading state if we have already set data in the store
        if (projectsData.data.length > 0) {
            setLocalState({ isInitialLoading: false });

            // Check if data is stale and needs a refresh
            const isDataStale = projectsData.lastFetched && Date.now() - projectsData.lastFetched > CACHE_EXPIRATION;

            // If data is stale, do a background refresh
            if (isDataStale) {
                fetchProjects({ resetData: true });
            }
        } else {
            // No data in store? do a normal fetch with loading indicators
            setLocalState({ isInitialLoading: true });
            fetchProjects({ resetData: true });
        }
    }, [status]);

    return {
        projects: projectsData.data,
        isLoading: projectsData.loading,
        isInitialLoading: localState.isInitialLoading,
        isSilentlyFetching,
        totalRows: projectsData.count,
        hasMore: localState.hasMore,
        fetchProjects,
        loadMoreProjects,
        page: localState.page,
        setPage,
    };
}
