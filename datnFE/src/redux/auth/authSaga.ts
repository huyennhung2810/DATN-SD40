import { call, put, takeLatest } from "redux-saga/effects";
import { authActions } from "./authSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ChangePasswordPayload, LoginPayload, UpdateProfilePayload } from "../../models/auth";
import { changePasswordApi, loginApi, logoutApi, meApi, updateProfileApi } from "./authApi";
import { clearTokens, setTokens, getRefreshToken } from "../../utils/authStorage";

function normalizeError(e: any): string {
  if (!e) return "Có lỗi xảy ra";
  if (typeof e === "string") return e;
  if (e.message) return e.message;
  return "Có lỗi xảy ra";
}

function* loginFlow(action: PayloadAction<{ payload: LoginPayload; onSuccess?: () => void }>) {
  try {
    const tokens: { accessToken: string; refreshToken: string } = yield call(loginApi, action.payload.payload);
    setTokens(tokens.accessToken, tokens.refreshToken);
    yield put(authActions.loginSuccess(tokens));
    yield put(authActions.fetchMe());
    action.payload.onSuccess?.();
  } catch (e: any) {
    clearTokens();
    yield put(authActions.loginFailed(normalizeError(e)));
  }
}

function* fetchMeFlow() {
  try {
    const me = yield call(meApi);
    yield put(authActions.fetchMeSuccess(me));
  } catch (e: any) {
    clearTokens();
    yield put(authActions.fetchMeFailed(normalizeError(e)));
  }
}

function* updateProfileFlow(action: PayloadAction<{ payload: UpdateProfilePayload; onSuccess?: () => void }>) {
  try {
    const me = yield call(updateProfileApi, action.payload.payload);
    yield put(authActions.updateProfileSuccess(me));
    action.payload.onSuccess?.();
  } catch (e: any) {
    yield put(authActions.updateProfileFailed(normalizeError(e)));
  }
}

function* changePasswordFlow(action: PayloadAction<{ payload: ChangePasswordPayload; onSuccess?: () => void }>) {
  try {
    yield call(changePasswordApi, action.payload.payload);
    yield put(authActions.changePasswordSuccess());
    action.payload.onSuccess?.();
  } catch (e: any) {
    yield put(authActions.changePasswordFailed(normalizeError(e)));
  }
}

function* logoutFlow(action: PayloadAction<{ onDone?: () => void } | undefined>) {
  try {
    const refreshToken = getRefreshToken();
    yield call(logoutApi, refreshToken);
  } catch (_e) {
    // ignore
  } finally {
    clearTokens();
    yield put(authActions.logoutDone());
    action.payload?.onDone?.();
  }
}

export default function* watchAuthFlow() {
  yield takeLatest(authActions.login.type, loginFlow);
  yield takeLatest(authActions.fetchMe.type, fetchMeFlow);
  yield takeLatest(authActions.updateProfile.type, updateProfileFlow);
  yield takeLatest(authActions.changePassword.type, changePasswordFlow);
  yield takeLatest(authActions.logout.type, logoutFlow);
}
