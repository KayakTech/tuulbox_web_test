import DI from "@/di-container";
import { useRef, useState } from "react";
import { Favorite } from "@/repositories/favorites-repository";
import { ensureHttps, getUrlPreview, getUrlQuery } from "@/helpers";
import { FileAttachment } from "@/components/FileCard";
import { useRouter } from "next/router";
import useSearchForm from "./searchForm";
import { useToast } from "@/context/ToastContext";

const useFavorites = () => {
    const router = useRouter();
    const { search, isSearching } = useSearchForm();

    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [favorite, setFavorite] = useState<Favorite>();
    const [dataToDelete, setDataToDelete] = useState<any>();
    const [showRemoveFavoriteModal, setShowRemoveFavoriteModal] = useState<boolean>(false);
    const [isRemovingFavorite, setIsRemovingFavorite] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [isLoadingFavorites, setIsLoadingFavorites] = useState<boolean>(true);
    const pageReady = useRef(false);
    const { showToast } = useToast();

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
        setIsLoading(true);
        setIsLoadingFavorites(true);
        try {
            const res: any = await DI.favoritesService.getFavorites();

            if (!res.data.length) {
                setFavorites([]);
                return;
            }

            const processedResults = res.data.filter((favorite: any) => favorite.actualObject != null);
            setFavorites(processedResults);

            return res;
        } catch {
            showToast({ heading: "Error", message: "Failed to get favorites.", variant: "danger" });
        } finally {
            setIsLoading(false);
            setIsLoadingFavorites(false);
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
                } catch (error: any) {
                    //
                }
            }

            return favorite;
        });

        // Use Promise.allSettled to handle all promises
        const results: PromiseSettledResult<any>[] = await Promise.allSettled(promises);

        // Filter out the fulfilled promises and set favorites
        const fulfilledFavorites = results
            .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
            .map(result => result.value);
        pageReady.current = true;
        return fulfilledFavorites.filter(data => data.actualObject != null);
    }

    async function processSearchResults(data: Favorite[]) {
        setIsLoadingFavorites(true);
        // const processedResults = await processFavoritesResults(data);
        setFavorites(data);
        setIsLoadingFavorites(false);
    }

    async function removeFavorite() {
        setIsRemovingFavorite(true);
        try {
            const res = await DI.favoritesService.deleteFavorite(favorite?.id);

            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
            router.reload();
        } catch (error) {
        } finally {
            setIsRemovingFavorite(false);
            setShowRemoveFavoriteModal(false);
        }
    }

    async function removeFavoriteById(id: string) {
        setIsRemovingFavorite(true);
        try {
            await DI.favoritesService.deleteFavorite(id);
            showToast({ heading: "Success", message: "Favorite removed.", variant: "success" });
        } catch (error) {
            showToast({ heading: "Error", message: "Failed to remove favorite.", variant: "danger" });
        } finally {
            setIsRemovingFavorite(false);
        }
    }

    function triggerRemoveFromFavoritesModal(theFavorite: Favorite) {
        setFavorite(theFavorite);
        setShowRemoveFavoriteModal(true);
    }
    function triggerDeleteModal(theFavorite: Favorite) {
        setFavorite(theFavorite);
        setDataToDelete(theFavorite.actualObject);
        setShowDeleteModal(true);
    }

    function deleteFavorite() {
        const favoriteType = favorite?.type;

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
        setIsDeleting(true);
        try {
            await DI.resourceService.deleteResource(`${dataToDelete?.id}`);
            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
            setShowDeleteModal(false);
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleDeleteStorage() {
        setIsDeleting(true);

        try {
            await DI.storageService.deleteFile(dataToDelete.id);
            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
            setShowDeleteModal(false);
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleDeleteProject() {
        setIsDeleting(true);
        try {
            await DI.projectService.deleteProject(dataToDelete.id);
            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
            setShowDeleteModal(false);
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleDeleteContact() {
        setIsDeleting(true);
        try {
            await DI.contactService.deleteContact(dataToDelete.id);
            if (getUrlQuery("query")) {
                search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            } else {
                getFavorites();
            }
            setShowDeleteModal(false);
        } catch (error) {
        } finally {
            setIsDeleting(false);
        }
    }

    async function viewDocumentFile(document: any) {
        try {
            const res = await DI.storageService.getFile(document.id);
            const file: FileAttachment = res.data;

            window.open(file?.file, "_blank");
        } catch (error) {
            //
        }
    }

    return {
        addToFavorites,
        getFavorites,
        isLoading,
        favorites,
        setFavorites,
        removeFavorite,
        triggerRemoveFromFavoritesModal,
        showRemoveFavoriteModal,
        setShowRemoveFavoriteModal,
        isRemovingFavorite,
        setIsRemovingFavorite,
        deleteFavorite,
        isDeleting,
        showDeleteModal,
        setShowDeleteModal,
        triggerDeleteModal,
        isLoadingFavorites,
        setIsLoadingFavorites,
        showToast,
        viewDocumentFile,
        setIsLoading,
        processFavoritesResults,
        processSearchResults,
        pageReady,
        search,
        isSearching,
        removeFavoriteById,
    };
};

export default useFavorites;
