import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import authApi from "../../api/authApi";
import { authActions } from "./authSlice";
import type { AuthResponse } from "../../models/auth";

// ─── Login (Customer) 
function* handleLogin(
  action: ReturnType<typeof authActions.login>,
): Generator<any, any, any> {
  try {
    const response: AuthResponse = yield call(
      authApi.login,
      action.payload.data,
    );

    yield put(
      authActions.loginSuccess({
        user: {
          userId: response.userId,
          username: response.username,
          fullName: response.fullName,
          email: response.email,
          pictureUrl: response.pictureUrl,
          roles: response.roles,
        },
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }),
    );

    notification.success({
      message: "Đăng nhập thành công",
      description: `Chào mừng ${response.fullName}!`,
    });
    action.payload.navigate(); // Chỉ gọi khi thành công
  } catch (error: any) {
    const message = error?.message || "Đăng nhập thất bại";
    yield put(authActions.authFailed(message));
    notification.error({ message: "Đăng nhập thất bại", description: message });
    // Không gọi navigate khi lỗi
  }
}

//Login Admin (Employee / Staff) 
function* handleLoginAdmin(
  action: ReturnType<typeof authActions.loginAdmin>,
): Generator<any, any, any> {
  try {
    const response: AuthResponse = yield call(
      authApi.loginAdmin,
      action.payload.data,
    );

    yield put(
      authActions.loginSuccess({
        user: {
          userId: response.userId,
          username: response.username,
          fullName: response.fullName,
          email: response.email,
          pictureUrl: response.pictureUrl,
          roles: response.roles,
        },
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }),
    );

    notification.success({
      message: "Đăng nhập thành công",
      description: `Chào mừng ${response.fullName}!`,
    });
    action.payload.navigate(); // Chỉ gọi khi thành công
  } catch (error: any) {
    const message = error?.message || "Đăng nhập thất bại";
    yield put(authActions.authFailed(message));
    notification.error({ message: "Đăng nhập thất bại", description: message });
  }
}

//Register
function* handleRegister(
  action: ReturnType<typeof authActions.register>,
): Generator<any, any, any> {
  try {
    yield call(authApi.register, action.payload.data);
    yield put(authActions.registerSuccess());
    notification.success({
      message: "Đăng ký thành công",
      description: "Vui lòng đăng nhập!",
    });
    action.payload.navigate();
  } catch (error: any) {
    const message =
      error?.response?.data?.message || error?.message || "Đăng ký thất bại";
    yield put(authActions.authFailed(message));
    notification.error({ message: "Đăng ký thất bại", description: message });

  }
}

//Logout
function* handleLogout(): Generator<any, any, any> {
  try {
    yield call(authApi.logout);
  } catch {
    // Bỏ qua lỗi từ server khi logout (token có thể đã hết hạn)
  } finally {
    yield put(authActions.logoutSuccess());
    window.location.href = "/login";
  }
}

export default function* watchAuthFlow() {
  yield takeLatest(authActions.login.type, handleLogin);
  yield takeLatest(authActions.loginAdmin.type, handleLoginAdmin);
  yield takeLatest(authActions.register.type, handleRegister);
  yield takeLatest(authActions.logout.type, handleLogout);
}
