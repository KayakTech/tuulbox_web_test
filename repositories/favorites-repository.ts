import { AxiosClient } from "@/utils/clients";
import { ApiResponse } from "@/types";

export type Favorite = {
    objectType: string;
    objectId: string;
    createdBy: string | number;
    company: string;
    actualObject?: any;
    id?: string;
    type?: string;
};

export default class FavoritesRepository {
    constructor(private client: AxiosClient) {}

    async addToFavorites(payload: Favorite) {
        const res = await this.client.post<ApiResponse<Favorite>>(`/general/create-favorite`, payload);
        return res.data;
    }
    async getFavorites() {
        const res = await this.client.get<ApiResponse<Favorite[]>>(`/general/get-favorite`);
        return res.data;
    }
    async deleteFavorite(favoriteId?: string) {
        const res = await this.client.delete<ApiResponse<Favorite[]>>(`/general/delete-favorite/${favoriteId}/`);
        return res.data;
    }
}
