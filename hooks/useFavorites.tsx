import { useRef, useReducer } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
    setFavorites,
    appendFavorites,
    setFavoritesLoading,
    setSilentlyFetching,
    deleteFavorite as deleteFavoriteAction,
} from "@/store/favorite-reducer";
import DI from "@/di-container";
import { Favorite } from "@/repositories/favorites-repository";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/router";
import { ensureHttps, getUrlPreview, getUrlQuery } from "@/helpers";
import { FileAttachment } from "@/components/FileCard";
import useSearchForm from "./searchForm";

interface FavoritesLocalState {
    favorite?: Favorite;
    dataToDelete?: any;
    showRemoveFavoriteModal: boolean;
    isRemovingFavorite: boolean;
    showDeleteModal: boolean;
    isDeleting: boolean;
    isLoadingFavorites: boolean;
}

const INITIAL_STATE: FavoritesLocalState = {
    favorite: undefined,
    dataToDelete: undefined,
    showRemoveFavoriteModal: false,
    isRemovingFavorite: false,
    showDeleteModal: false,
    isDeleting: false,
    isLoadingFavorites: true,
};

const useFavorites = () => {
    const router = useRouter();
    const reduxDispatch = useDispatch();
    const { search, isSearching } = useSearchForm();
    const { showToast } = useToast();

    const { favorites, isSilentlyFetching } = useSelector((state: RootState) => state.favorites);

    const [localState, setLocalState] = useReducer(
        (state: FavoritesLocalState, newState: Partial<FavoritesLocalState>) => ({ ...state, ...newState }),
        INITIAL_STATE,
    );

    const pageReady = useRef(false);

    // Cache expiration time (5 minutes)
    const CACHE_EXPIRATION = 5 * 60 * 1000;

    async function addToFavorites(payload: Partial<Favorite>) {
        try {
            const res = await DI.favoritesService.addToFavorites(payload);
            await getFavorites();
            showToast({ heading: "Success", message: "Added to favorites.", variant: "success" });
        } catch {
            showToast({ heading: "Error", message: "Failed to add to favorites.", variant: "danger" });
        }
    }

    async function getFavorites() {
        reduxDispatch(setFavoritesLoading(true));
        setLocalState({ isLoadingFavorites: true });

        try {
            const res: any = await DI.favoritesService.getFavorites();

            if (!res.data.length) {
                reduxDispatch(
                    setFavorites({
                        data: [],
                        count: 0,
                        next: null,
                    }),
                );
                return res;
            }

            const processedResults = res.data.filter((favorite: any) => favorite.actualObject != null);

            reduxDispatch(
                setFavorites({
                    data: processedResults,
                    count: res.count || processedResults.length,
                    next: res.next || null,
                }),
            );

            return res;
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to get favorites.", variant: "danger" });
        } finally {
            reduxDispatch(setFavoritesLoading(false));
            setLocalState({ isLoadingFavorites: false });
        }
    }

    async function processFavoritesResults(data: Favorite[]) {
        const promises: Promise<any>[] = data.map(async (favorite: any, index: number) => {
            if (favorite.type === "resource" && favorite.actualObject != null) {
                try {
                    const preview: any = await getUrlPreview(favorite?.actualObject?.url);

                    if (preview) {
                        favorite.actualObject.metaImage = ensureHttps(preview.metaImage);
                        favorite.actualObject.metaDescription = preview.metaDescription;
                    }
                } catch (error: any) {}
            }

            return favorite;
        });

        const results: PromiseSettledResult<any>[] = await Promise.allSettled(promises);

        const fulfilledFavorites = results
            .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
            .map(result => result.value);
        pageReady.current = true;
        return fulfilledFavorites.filter(data => data.actualObject != null);
    }

    async function processSearchResults(data: Favorite[]) {
        setLocalState({ isLoadingFavorites: true });
        reduxDispatch(
            setFavorites({
                data,
                count: data.length,
                next: null,
            }),
        );
        setLocalState({ isLoadingFavorites: false });
    }

    async function removeFavorite() {
        setLocalState({ isRemovingFavorite: true });
        try {
            await DI.favoritesService.deleteFavorite(localState.favorite?.id);

            if (localState.favorite?.id) {
                reduxDispatch(deleteFavoriteAction(localState.favorite.id));
            }

            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to remove favorite.", variant: "danger" });
        } finally {
            setLocalState({ isRemovingFavorite: false, showRemoveFavoriteModal: false });
        }
    }

    async function removeFavoriteById(id: string) {
        setLocalState({ isRemovingFavorite: true });
        try {
            await DI.favoritesService.deleteFavorite(id);

            reduxDispatch(deleteFavoriteAction(id));

            showToast({ heading: "Success", message: "Favorite removed.", variant: "success" });
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to remove favorite.", variant: "danger" });
        } finally {
            setLocalState({ isRemovingFavorite: false });
        }
    }

    function triggerRemoveFromFavoritesModal(theFavorite: Favorite) {
        setLocalState({ favorite: theFavorite, showRemoveFavoriteModal: true });
    }

    function triggerDeleteModal(theFavorite: Favorite) {
        setLocalState({
            favorite: theFavorite,
            dataToDelete: theFavorite.actualObject,
            showDeleteModal: true,
        });
    }

    function deleteFavorite() {
        const favoriteType = localState.favorite?.type;

        if (favoriteType === "resource") {
            handleDeleteResource();
            return;
        }

        if (favoriteType === "storage") {
            handleDeleteStorage();
            return;
        }

        if (favoriteType === "project") {
            handleDeleteProject();
            return;
        }

        if (favoriteType === "contact") {
            handleDeleteContact();
            return;
        }
    }

    async function handleDeleteResource() {
        setLocalState({ isDeleting: true });
        try {
            await DI.resourceService.deleteResource(`${localState.dataToDelete?.id}`);
            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
            setLocalState({ showDeleteModal: false });
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to delete resource.", variant: "danger" });
        } finally {
            setLocalState({ isDeleting: false });
        }
    }

    async function handleDeleteStorage() {
        setLocalState({ isDeleting: true });
        try {
            await DI.storageService.deleteFile(localState.dataToDelete.id);
            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
            setLocalState({ showDeleteModal: false });
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to delete file.", variant: "danger" });
        } finally {
            setLocalState({ isDeleting: false });
        }
    }

    async function handleDeleteProject() {
        setLocalState({ isDeleting: true });
        try {
            await DI.projectService.deleteProject(localState.dataToDelete.id);
            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
            setLocalState({ showDeleteModal: false });
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to delete project.", variant: "danger" });
        } finally {
            setLocalState({ isDeleting: false });
        }
    }

    async function handleDeleteContact() {
        setLocalState({ isDeleting: true });
        try {
            await DI.contactService.deleteContact(localState.dataToDelete.id);
            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
            setLocalState({ showDeleteModal: false });
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to delete contact.", variant: "danger" });
        } finally {
            setLocalState({ isDeleting: false });
        }
    }

    async function viewDocumentFile(document: any) {
        try {
            const res = await DI.storageService.getFile(document.id);
            const file: FileAttachment = res.data;

            window.open(file?.file, "_blank");
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to view document.", variant: "danger" });
        }
    }

    // Check if data in Redux is stale and refresh if needed
    const refreshFavoritesIfNeeded = () => {
        // If we have data in the Redux store
        if (favorites.data.length > 0 && favorites.lastFetched) {
            // Check if data is stale
            const isDataStale = Date.now() - favorites.lastFetched > CACHE_EXPIRATION;

            // If data is stale, silently refresh
            if (isDataStale) {
                reduxDispatch(setSilentlyFetching(true));
                getFavorites().finally(() => {
                    reduxDispatch(setSilentlyFetching(false));
                });
            }
        } else {
            // No data in store, fetch with loading indicators
            getFavorites();
        }
    };

    return {
        addToFavorites,
        getFavorites,
        isLoading: favorites.loading,
        favorites: favorites.data,
        removeFavorite,
        triggerRemoveFromFavoritesModal,
        showRemoveFavoriteModal: localState.showRemoveFavoriteModal,
        setShowRemoveFavoriteModal: (show: boolean) => setLocalState({ showRemoveFavoriteModal: show }),
        isRemovingFavorite: localState.isRemovingFavorite,
        setIsRemovingFavorite: (removing: boolean) => setLocalState({ isRemovingFavorite: removing }),
        deleteFavorite,
        isDeleting: localState.isDeleting,
        showDeleteModal: localState.showDeleteModal,
        setShowDeleteModal: (show: boolean) => setLocalState({ showDeleteModal: show }),
        triggerDeleteModal,
        isLoadingFavorites: localState.isLoadingFavorites,
        setIsLoadingFavorites: (loading: boolean) => setLocalState({ isLoadingFavorites: loading }),
        showToast,
        viewDocumentFile,
        processFavoritesResults,
        processSearchResults,
        pageReady,
        search,
        isSearching,
        removeFavoriteById,
        refreshFavoritesIfNeeded,
        isSilentlyFetching,
        totalRows: favorites.count,
    };
};

export default useFavorites;
