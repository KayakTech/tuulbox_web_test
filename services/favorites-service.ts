import FavoritesRepository from "@/repositories/favorites-repository";

export default class FavoritesService {
    constructor(private favoritesRepository: FavoritesRepository) {}

    async addToFavorites(payload: any) {
        const res = await this.favoritesRepository.addToFavorites(payload);
        return res;
    }

    async getFavorites() {
        const res = await this.favoritesRepository.getFavorites();
        return res;
    }

    async deleteFavorite(favoriteId?: string) {
        const res = await this.favoritesRepository.deleteFavorite(favoriteId);
        return res;
    }
}
