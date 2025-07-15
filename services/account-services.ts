import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import { AccountActions } from "@/store/account-reducer";
import AccountRepository, { DeleteAcccountPayload, SignupPayload, User } from "@/repositories/account-repository";

export default class AccountServices {
    constructor(
        private accountRepository: AccountRepository,
        private store: ToolkitStore,
        private accountActions: AccountActions,
    ) {}

    async getUser() {
        const res = await this.accountRepository.getUser();
        this.store.dispatch(this.accountActions.setUserProfile(res.data));
        return res;
    }

    async fetchUser() {
        const res = await this.accountRepository.getUser();
        return res;
    }

    async updateUser(payload: Partial<User>) {
        const res = await this.accountRepository.updateUser(payload);
        this.store.dispatch(this.accountActions.setUserProfile(res.data));
        return res;
    }

    async deleteAccount(payload: DeleteAcccountPayload) {
        const res = await this.accountRepository.deleteAccount(payload);
        return res;
    }

    async signup(payload: SignupPayload) {
        const res = await this.accountRepository.signup(payload);
        return res;
    }
}
