export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
  screen?: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  email: string;
  name: string;
  phoneNumber?: string | null;
  employeeImage?: string | null;
  status?: string | null;
  role?: string | null;
  code?: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  employeeImage?: string;
  hometown?: string;
  provinceCity?: string;
  wardCommune?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

