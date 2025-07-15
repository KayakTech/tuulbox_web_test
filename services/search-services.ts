import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import { AccountActions } from "@/store/account-reducer";
import SearchRepository from "@/repositories/search-repository";

export default class SearchServices {
    constructor(
        private searchRepository: SearchRepository,
        private store: ToolkitStore,
        private accountActions: AccountActions,
    ) {}

    async search(payload: { query: string; categories?: string[] }) {
        return await this.searchRepository.search(payload);
    }
}
