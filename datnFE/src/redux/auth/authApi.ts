import axiosClient from "../../api/axiosClient";
import { AUTH_PATH } from "../../constants/url";
import type { AuthTokens, ChangePasswordPayload, CurrentUser, LoginPayload, UpdateProfilePayload } from "../../models/auth";

export async function loginApi(payload: LoginPayload): Promise<AuthTokens> {
  const res = await axiosClient.post(AUTH_PATH.LOGIN, { ...payload, screen: payload.screen ?? "ADMIN" });
  return res.data as AuthTokens;
}

export async function meApi(): Promise<CurrentUser> {
  const res = await axiosClient.get(AUTH_PATH.ME);
  return res.data as CurrentUser;
}

export async function updateProfileApi(payload: UpdateProfilePayload): Promise<CurrentUser> {
  const res = await axiosClient.put(AUTH_PATH.PROFILE, payload);
  return res.data as CurrentUser;
}

export async function changePasswordApi(payload: ChangePasswordPayload): Promise<void> {
  await axiosClient.put(AUTH_PATH.CHANGE_PWD, payload);
}

export async function logoutApi(refreshToken?: string | null): Promise<void> {
  await axiosClient.post(AUTH_PATH.LOGOUT, refreshToken ? { refreshToken } : {});
}

