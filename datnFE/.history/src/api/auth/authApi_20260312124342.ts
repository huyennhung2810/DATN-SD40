import type { AuthResponse, LoginRequest } from "../../models/auth";
import type { ResponseObject } from "../../models/base";
import axiosClient from "../axiosClient";


const authApi = {
    // Đăng nhập Khách hàng
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await axiosClient.post<ResponseObject<AuthResponse>>(AUTH_PATH.LOGIN, data);
        return res.data.data;
    },

    // Đăng nhập Nhân viên/Quản lý
    loginAdmin: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await axiosClient.post<ResponseObject<AuthResponse>>(AUTH_PATH.LOGIN_ADMIN, data);
        return res.data.data;
    },

    // Đăng ký tài khoản kh
    register: async (data: RegisterRequest): Promise<void> => {
        const res = await axiosClient.post<ResponseObject<void>>(AUTH_PATH.REGISTER, data);
        return res.data.data;
    },

    //làm mới token
    refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
        const res = await axiosClient.post<ResponseObject<AuthResponse>>(AUTH_PATH.REFRESH, data);
        return res.data.data;
    },

    // Đăng xuất
    logout: async (): Promise<void> => {
        await axiosClient.post<ResponseObject<void>>("/auth/logout");
    },

    //đổi mk
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