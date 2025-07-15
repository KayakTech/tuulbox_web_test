import { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosStatic, CreateAxiosDefaults } from "axios";
import { getCookie } from "cookies-next";
import { JWT_COOKIE_KEY } from "../constants";

type RequestConfig = Pick<AxiosRequestConfig, "headers" | "params">;
export class AxiosClient {
    onLogout: () => void = () => {};
    $axios: AxiosInstance;
    BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    constructor(axios: AxiosStatic, config: CreateAxiosDefaults = {}) {
        this.$axios = axios.create({
            ...config,
            withCredentials: false,
            baseURL: this.BASE_URL,
        });

        this.initAuthTokenInterceptor();
        this.initAutoLogoutInterceptor();
    }
    postFil<T>(url: string, payload: FormData, config?: RequestConfig) {
        return this.$axios.post<unknown, AxiosResponse<T>>(url, payload, config);
    }

    patchForm<T>(url: string, payload: FormData, config?: RequestConfig) {
        return this.$axios.patchForm(url, payload, config);
    }

    get<T>(url: string, config?: RequestConfig) {
        return this.$axios.get<T>(url, config);
    }

    post<T>(url: string, payload?: Object, config?: RequestConfig) {
        return this.$axios.post<unknown, AxiosResponse<T>>(url, payload, config);
    }

    put<T>(url: string, payload?: Object, config?: RequestConfig) {
        return this.$axios.put<unknown, AxiosResponse<T>>(url, payload, config);
    }

    patch<T>(url: string, payload?: Object, config?: RequestConfig) {
        return this.$axios.patch<unknown, AxiosResponse<T>>(url, payload, config);
    }

    delete<T>(url: string, payload?: Object, config?: RequestConfig) {
        return this.$axios.delete<unknown, AxiosResponse<T>>(url, {
            ...config,
            data: payload,
        });
    }

    initAuthTokenInterceptor() {
        this.$axios.interceptors.request.use(
            async config => {
                const accessToken = getCookie(JWT_COOKIE_KEY);

                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
                return config;
            },
            error => {
                Promise.reject(error);
            },
        );
    }

    initAutoLogoutInterceptor() {
        this.$axios.interceptors.response.use(
            response => {
                return response;
            },
            error => {
                if (error?.response?.status === 401) {
                    this.onLogout();
                }

                return Promise.reject(error);
            },
        );
    }
}
