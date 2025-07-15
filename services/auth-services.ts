import { ToolkitStore } from "@reduxjs/toolkit/dist/configureStore";
import AuthRepository from "@/repositories/auth-repository";
import { AuthActions } from "@/store/auth-reducer";
import { User } from "firebase/auth";
import { setCookies, getCookie, removeCookies } from "cookies-next";
import { JWT_COOKIE_KEY } from "@/constants";

export default class AuthService {
    constructor(
        private authRepository: AuthRepository,
        private store: ToolkitStore,
        private authActions: AuthActions,
    ) {}

    async getAuthToken(user: User) {
        try {
            const firebaseJwt = await user.getIdToken();

            const res = await this.authRepository.getAuthToken(firebaseJwt);
            // save token to cookies
            setCookies(JWT_COOKIE_KEY, res.data.access, {
                maxAge: 60 * 60 * 24 * 7,
            });
            return res;
        } catch (error) {
            throw error;
        }
    }

    isAuthenticated() {
        return getCookie(JWT_COOKIE_KEY);
    }

    logout() {
        removeCookies("tuulbox_core_jwt");
        removeCookies("csrftoken");
        removeCookies("sessionid");
        window.location.href = "/login";
    }

    getCountryCode() {
        return this.authRepository.getCountryCode();
    }
}
