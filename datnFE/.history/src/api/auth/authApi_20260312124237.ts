import axiosClient from "./axiosClient";
import type { ResponseObject } from "../models/base";
import type {
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    VerifyOtpRequest,
    AuthResponse,
} from "../models/auth";
import { AUTH_PATH } from "../constants/url";

const authApi = {
    /**
     * Đăng nhập Khách hàng
     */
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await axiosClient.post<ResponseObject<AuthResponse>>(AUTH_PATH.LOGIN, data);
        return res.data.data;
    },

    /**
     * Đăng nhập Admin / Nhân viên
     */
    loginAdmin: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await axiosClient.post<ResponseObject<AuthResponse>>(AUTH_PATH.LOGIN_ADMIN, data);
        return res.data.data;
    },

    /**
     * Đăng ký tài khoản Khách hàng
     */
    register: async (data: RegisterRequest): Promise<void> => {
        const res = await axiosClient.post<ResponseObject<void>>(AUTH_PATH.REGISTER, data);
        return res.data.data;
    },

    /**
     * Làm mới access token
     */
    refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
        const res = await axiosClient.post<ResponseObject<AuthResponse>>(AUTH_PATH.REFRESH, data);
        return res.data.data;
    },

    //
    logout: async (): Promise<void> => {
        await axiosClient.post<ResponseObject<void>>("/auth/logout");
    },

    //đổi mk (yêu cầu phải đăng nhập)
    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        await axiosClient.post<ResponseObject<void>>(AUTH_PATH.CHANGE_PWD, data);
    },

    //quên mk 
    forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
        await axiosClient.post<ResponseObject<void>>("/auth/forgot-password", data);
    },

    //xác thực OTP cho quên mk
    verifyOtp: async (data: VerifyOtpRequest): Promise<void> => {
        await axiosClient.post<ResponseObject<void>>("/auth/verify-otp", data);
    },
};

export default authApi;