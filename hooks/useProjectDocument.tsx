import { useEffect, useReducer } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
    setProjectDocuments,
    appendProjectDocuments,
    setProjectDocumentsLoading,
    setSilentlyFetching,
    setProjectId,
} from "@/store/project-document-reducer";
import DI from "@/di-container";
import { ProjectDocumentType } from "@/repositories/project-repository";
import { useToast } from "@/context/ToastContext";

interface UseProjectDocumentsReturn {
    documents: ProjectDocumentType[];
    isLoading: boolean;
    isInitialLoading: boolean;
    isSilentlyFetching: boolean;
    totalRows: number;
    hasMore: boolean;
    fetchProjectDocuments: (options?: { resetData?: boolean; pageNumber?: number }) => Promise<void>;
    loadMoreDocuments: () => Promise<void>;
    page: number;
    setPage: (page: number) => void;
}

const CACHE_EXPIRATION = 5 * 1000;

interface ProjectDocumentsLocalState {
    isInitialLoading: boolean;
    page: number;
    hasMore: boolean;
    currentSearchTerm: string;
}

interface FetchProjectDocumentsOptions {
    resetData?: boolean;
    pageNumber?: number;
}

const INITIAL_STATE: ProjectDocumentsLocalState = {
    isInitialLoading: false,
    page: 1,
    hasMore: true,
    currentSearchTerm: "",
};

export default function useProjectDocuments(
    projectId: string,
    category: string,
    searchTerm?: string,
): UseProjectDocumentsReturn {
    const reduxDispatch = useDispatch();
    const { showToast } = useToast();

    const {
        projectId: storeProjectId,
        documentCategories,
        isSilentlyFetching,
    } = useSelector((state: RootState) => state.projectDocuments);

    const categoryData = documentCategories[category] || {
        data: [],
        count: 0,
        next: null,
        loading: false,
        lastFetched: null,
    };

    // filter documents based on search term (client-side filtering)
    const filteredDocuments = React.useMemo(() => {
        if (!searchTerm || !searchTerm.trim()) {
            return categoryData.data;
        }

        const searchLower = searchTerm.toLowerCase().trim();
        return categoryData.data.filter((doc: ProjectDocumentType) => {
            const name = doc.name?.toLowerCase() || "";
            const fileName = doc.file?.originalFileName?.toLowerCase() || "";
            const tags = doc.file?.tags?.map((tag: any) => tag.name.toLowerCase()).join(" ") || "";

            return name.includes(searchLower) || fileName.includes(searchLower) || tags.includes(searchLower);
        });
    }, [categoryData.data, searchTerm]);

    const [localState, setLocalState] = useReducer(
        (state: ProjectDocumentsLocalState, newState: Partial<ProjectDocumentsLocalState>) => ({
            ...state,
            ...newState,
        }),
        INITIAL_STATE,
    );

    // Set project the ID in store when it changes
    useEffect(() => {
        if (storeProjectId !== projectId) {
            reduxDispatch(setProjectId(projectId));
        }
    }, [projectId, storeProjectId, reduxDispatch]);

    const fetchProjectDocuments = async (options: FetchProjectDocumentsOptions = {}) => {
        const { resetData = false, pageNumber } = options;
        const currentPageNumber = pageNumber !== undefined ? pageNumber : resetData ? 1 : localState.page;

        if (!projectId) {
            showToast({
                heading: "Error fetching document",
                message: "The project is missing few details. Confirm you have access to this project.",
                variant: "danger",
            });
            return;
        }

        // Show loading state if there's no data available
        const shouldShowInitialLoading = (resetData || !categoryData.data.length) && !categoryData.lastFetched;

        if (shouldShowInitialLoading) {
            reduxDispatch(setProjectDocumentsLoading({ category, loading: true }));
            setLocalState({ isInitialLoading: true });
        } else {
            // Silent background fetch when we have data
            reduxDispatch(setSilentlyFetching(true));
        }

        try {
            const params: any = {
                category,
                page: currentPageNumber,
            };

            //  we don't send search term to API anymore since we filter client-side

            const response = await DI.projectService.getProjectDocuments(projectId, params);

            if (resetData || currentPageNumber === 1) {
                reduxDispatch(
                    setProjectDocuments({
                        category,
                        data: response.results,
                        count: response.count,
                        next: response.next,
                    }),
                );
            } else {
                reduxDispatch(
                    appendProjectDocuments({
                        category,
                        data: response.results,
                        next: response.next,
                    }),
                );
            }

            const newPage = response.next ? (resetData ? 2 : currentPageNumber + 1) : currentPageNumber;

            setLocalState({
                hasMore: response.next !== null,
                page: newPage,
                isInitialLoading: false,
            });
        } catch (error) {
            console.error("Error fetching project documents:", error);
            showToast({
                heading: "Failed to fetch document",
                message:
                    "An error occurred while fetching document. Try reloading the page. If problem persists, contact support",
                variant: "danger",
            });
        } finally {
            reduxDispatch(setProjectDocumentsLoading({ category, loading: false }));
            reduxDispatch(setSilentlyFetching(false));
            setLocalState({ isInitialLoading: false });
        }
    };

    const loadMoreDocuments = async () => {
        if (!localState.hasMore || categoryData.loading || isSilentlyFetching) return;

        await fetchProjectDocuments({ resetData: false });
    };

    const setPage = (page: number) => {
        setLocalState({ page });
        fetchProjectDocuments({ resetData: false, pageNumber: page });
    };

    // Handle search term changes
    useEffect(() => {
        const currentSearch = searchTerm || "";

        if (localState.currentSearchTerm !== currentSearch) {
            setLocalState({
                currentSearchTerm: currentSearch,
                // Reset pagination for search results
                page: 1,
                hasMore: true,
            });
        }
    }, [searchTerm]);

    // Handle category changes
    useEffect(() => {
        setLocalState({ page: 1, hasMore: true });

        // Check if we have data for this category (with current search term)
        if (categoryData.data.length === 0) {
            setLocalState({ isInitialLoading: true });
            fetchProjectDocuments({ resetData: true });
        } else {
            // Check if data is stale and needs a refresh
            const isDataStale = categoryData.lastFetched && Date.now() - categoryData.lastFetched > CACHE_EXPIRATION;

            if (isDataStale) {
                fetchProjectDocuments({ resetData: true });
            }
        }
    }, [category, projectId]);

    return {
        // Return filtered documents instead of raw data
        documents: filteredDocuments,
        isLoading: categoryData.loading,
        isInitialLoading: localState.isInitialLoading,
        isSilentlyFetching,
        // Adjust count for search
        totalRows: searchTerm ? filteredDocuments.length : categoryData.count,
        // No pagination for search results
        hasMore: searchTerm ? false : localState.hasMore,
        fetchProjectDocuments,
        // Disable load more for search
        loadMoreDocuments: searchTerm ? async () => {} : loadMoreDocuments,
        page: localState.page,
        setPage,
    };
}
