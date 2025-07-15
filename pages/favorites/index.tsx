import DashboardLayout from "@/components/DashboardLayout";
import { Row, Col, Container } from "react-bootstrap";
import { useEffect } from "react";
import EmptyState from "@/components/EmptyState";
import PageLoader from "@/components/PageLoader";
import Header from "@/components/Header";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { SearchNormal1, Star1 } from "iconsax-react";
import FavoriteCard from "@/components/FavoriteCard";
import useFavorites from "@/hooks/useFavorites";
import { Favorite } from "@/repositories/favorites-repository";
import DeleteModal from "@/components/DeleteModal";
import useProject from "@/hooks/project";
import FavoriteCardFull from "@/components/FavoriteCardFull";
import { getUrlQuery, isMobileDevice } from "@/helpers";

export default function Favorites() {
    const { listOrGrid } = useSelector((state: RootState) => state.dataDisplayLayout);
    const { searchResults } = useSelector((state: RootState) => state.searchResults);

    const {
        favorites,
        isLoading,
        isSilentlyFetching,
        removeFavoriteById,
        getFavorites,
        viewDocumentFile,
        triggerRemoveFromFavoritesModal,
        showRemoveFavoriteModal,
        setShowRemoveFavoriteModal,
        isRemovingFavorite,
        removeFavorite,
        deleteFavorite,
        isDeleting,
        showDeleteModal,
        setShowDeleteModal,
        triggerDeleteModal,
        processSearchResults,
        search,
        isSearching,
    } = useFavorites();

    const { setShowArchiveProjectModal, showArchiveProjectModal, isSubmitting, updateProject, triggerArchiveModal } =
        useProject({});

    const favoritesToDisplay = searchResults?.favorites?.results || favorites;
    const isShowingSearchResults = Boolean(searchResults?.favorites?.results);

    useEffect(() => {
        if (getUrlQuery("query")) {
            search({ query: `${getUrlQuery("query")}`, categories: ["favorites"] });
            return;
        }

        getFavorites();
    }, []);

    useEffect(() => {
        if (getUrlQuery("query") && searchResults?.favorites) {
            processSearchResults(searchResults.favorites.results);
        }
    }, [searchResults?.favorites?.results]);

    return (
        <DashboardLayout
            pageTitle="Favorites"
            breadCrumbs={[{ name: "Favorites", url: "/favorites" }]}
            onSearch={(searchTerm: string) => search({ query: searchTerm, categories: ["favorites"] })}
        >
            <Header
                showListOrGrid={false}
                searchPlaceholder="Search favorites"
                listOrGridKey="favorite"
                onSearch={(searchTerm: string) => search({ query: searchTerm, categories: ["favorites"] })}
                isSearching={isSearching}
                onClearSearch={getFavorites}
            />

            {searchResults?.favorites?.results?.length ? (
                <Container fluid className={`mt-4`}>
                    <p className="m-0">Favorites ({searchResults?.favorites?.results.length})</p>
                </Container>
            ) : null}

            {/* Show loader only when we're initially loading and have no data */}
            {(isLoading && favorites.length === 0 && !isSilentlyFetching) || isSearching ? (
                <PageLoader />
            ) : favoritesToDisplay.length > 0 ? (
                <>
                    <div className="container-fluid my-4">
                        {(!listOrGrid?.favorite || listOrGrid?.favorite === "list") && !isMobileDevice() && (
                            <Row className="g-4">
                                {favoritesToDisplay.map((favorite: Favorite, index: number) => (
                                    <Col sm={12} key={`${favorite?.id}${index}`}>
                                        <FavoriteCardFull
                                            favorite={favorite}
                                            onArchive={() => triggerArchiveModal(favorite?.actualObject)}
                                            onRemoveFromFavorites={() => triggerRemoveFromFavoritesModal(favorite)}
                                            onDelete={() => triggerDeleteModal(favorite)}
                                            onCopy={() => {}}
                                            viewDocumentFile={viewDocumentFile}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        )}

                        {(listOrGrid.favorite === "grid" || isMobileDevice()) && (
                            <Row className="g-4">
                                {favoritesToDisplay.map((favorite: Favorite, index: number) => (
                                    <Col
                                        sm={12}
                                        md={4}
                                        lg={4}
                                        xl={3}
                                        xxl={3}
                                        className="d-flex justify-content-center"
                                        key={`${favorite?.id}${index}`}
                                    >
                                        <FavoriteCard
                                            favorite={favorite}
                                            onArchive={() => triggerArchiveModal(favorite?.actualObject)}
                                            onRemoveFromFavorites={() => triggerRemoveFromFavoritesModal(favorite)}
                                            onDelete={() => triggerDeleteModal(favorite)}
                                            onCopy={() => {}}
                                            viewDocumentFile={viewDocumentFile}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </div>

                    <DeleteModal
                        showModal={showArchiveProjectModal}
                        setShowModal={(value: boolean) => setShowArchiveProjectModal(value)}
                        action="Archive"
                        dataToDeleteName={"Project"}
                        isDeleting={isSubmitting}
                        onYesDelete={updateProject}
                        message="Are you sure you want to archive project?"
                        rightButtonText="Yes, Archive"
                        rightButtonProcessingText="Archiving..."
                    />

                    <DeleteModal
                        showModal={showRemoveFavoriteModal}
                        setShowModal={(value: boolean) => setShowRemoveFavoriteModal(value)}
                        action="Remove"
                        dataToDeleteName={"Favorite"}
                        isDeleting={isRemovingFavorite}
                        onYesDelete={removeFavorite}
                        message="Are you sure you want to remove favorite?"
                        rightButtonText="Yes, Remove"
                        rightButtonProcessingText="Removing..."
                    />

                    <DeleteModal
                        showModal={showDeleteModal}
                        setShowModal={(value: boolean) => setShowDeleteModal(value)}
                        action="Delete"
                        dataToDeleteName={"Favorite"}
                        isDeleting={isDeleting}
                        onYesDelete={deleteFavorite}
                        message="Are you sure you want to delete favorite?"
                        rightButtonText="Yes, Delete"
                        rightButtonProcessingText="Deleting..."
                    />
                </>
            ) : getUrlQuery("query") ? (
                <EmptyState
                    icon={<SearchNormal1 size={56} color="#B0B0B0" />}
                    headerText={`No Results Found`}
                    descriptionText={`"${getUrlQuery("query")}" did not match any data. Please try again.`}
                />
            ) : (
                <div className="mt-5">
                    <EmptyState
                        icon={<Star1 variant="Outline" size={60} color="#B0B0B0" />}
                        headerText="Your Favorites"
                        descriptionText="Easily access files and links from here"
                    />
                </div>
            )}
        </DashboardLayout>
    );
}
