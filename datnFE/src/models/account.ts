import type { BaseEntity, CommonStatus} from "./base";

export type AccountRole = "ADMIN" | "STAFF" | "CUSTOMER";
export type AccountProvider = "local" | "google";

export interface AccountResponse extends BaseEntity {
  code: string;
  username: string | null;
  status: CommonStatus;
  role: AccountRole;
  provider: AccountProvider;
}

export interface AccountRequest {
  username: string;
  password?: string;
  confirmPassword?: string;
  role: AccountRole;
  provider?: AccountProvider;
}

export interface AccountSearchParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: CommonStatus;
  role?: AccountRole;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export const ACCOUNT_ROLES: { value: AccountRole; label: string }[] = [
  { value: "ADMIN", label: "Quản trị viên" },
  { value: "STAFF", label: "Nhân viên" },
];

export const ACCOUNT_PROVIDERS: { value: AccountProvider; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "google", label: "Google" },
];
