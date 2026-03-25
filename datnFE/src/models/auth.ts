export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    username: string;
    password: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface VerifyOtpRequest {
    email: string;
    otpCode: string;
    newPassword: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
    username: string;
    fullName: string;
    email: string;
    pictureUrl?: string;
    roles: string[];
}

export interface AuthUser {
    userId: string;
    username: string;
    fullName: string;
    email: string;
    pictureUrl?: string;
    image?: string;
    roles: string[];
}

export const AUTH_STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    USER: 'auth_user',
} as const;