import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { authActions } from "./authSlice";
import { resetSessionId, chatSlice, clearMessages } from "../chat/chatSlice";
import type { AuthResponse } from "../../models/auth";
import authApi from "../../api/auth/authApi";
import cartApi from "../../api/cartApi";
import guestCartService from "../../services/guestCartService";
import { setCartCount, setGuestMode } from "../cart/cartSlice";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { GuestCartItem } from "../../services/guestCartService";

function* handleLoginFlow(
  apiFunc: any,
  payload: { data: any; navigate: (role?: string) => void },
) {
  try {
    const response: AuthResponse = yield call(apiFunc, payload.data);

    // Lưu thông tin đăng nhập trước
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

    // Hợp nhất giỏ hàng khách vào tài khoản
    const guestItems: GuestCartItem[] = guestCartService.getMergeItems();
    if (guestItems.length > 0) {
      try {
        yield call(cartApi.mergeGuestCart, response.userId, guestItems);
        notification.success({
          message: "Đã hợp nhất giỏ hàng",
          description: `${guestItems.length} sản phẩm từ giỏ hàng trước đó đã được thêm vào tài khoản của bạn.`,
          duration: 4,
        });
      } catch (mergeError) {
        console.error("Lỗi hợp nhất giỏ hàng:", mergeError);
      }
      // Xóa giỏ hàng khách sau khi hợp nhất
      guestCartService.clearCart();
    }

    // Reset sessionId và xóa sạch tin nhắn chat cũ khi đăng nhập tài khoản mới
    const newSessionId = resetSessionId();
    yield put(chatSlice.actions.setSessionId(newSessionId));
    yield put(clearMessages());

    notification.success({
      message: "Thành công",
      description: `Chào mừng ${response.fullName} quay trở lại!`,
      placement: "topRight",
    });

    // Lấy role và truyền vào hàm navigate
    const userRole = response.roles?.[0];
    payload.navigate(userRole);
  } catch (error: any) {
    const message = error?.message || "Thông tin đăng nhập không chính xác";
    yield put(authActions.authFailed(message));
    notification.error({
      message: "Đăng nhập thất bại",
      description: message,
    });
  }
}

function* handleRegister(action: ReturnType<typeof authActions.register>) {
  try {
    yield call(authApi.register, action.payload.data);
    yield put(authActions.registerSuccess());
    notification.success({
      message: "Đăng ký thành công",
      description: "Tài khoản máy ảnh của bạn đã sẵn sàng. Hãy đăng nhập nhé!",
    });
    action.payload.navigate();
  } catch (error: any) {
    const message = error?.message || "Đăng ký không thành công";
    yield put(authActions.authFailed(message));
    notification.error({ message: "Lỗi đăng ký", description: message });
  }
}

function* handleLogout(
  action: PayloadAction<{ isAdmin?: boolean } | undefined>,
) {
  try {
    yield call(authApi.logout);
  } catch (e) {
    console.error("Lỗi logout API:", e);
  } finally {
    yield put(authActions.logoutAction());

    // Reset sessionId on logout and update Redux state
    const newSessionId = resetSessionId();
    yield put(chatSlice.actions.setSessionId(newSessionId));

    const isAdmin = action.payload?.isAdmin;
    if (isAdmin) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/login";
    }
  }
}

export default function* watchAuthFlow() {
  // Gộp logic login
  yield takeLatest(authActions.login.type, (action: any) =>
    handleLoginFlow(authApi.login, action.payload),
  );
  yield takeLatest(authActions.loginAdmin.type, (action: any) =>
    handleLoginFlow(authApi.loginAdmin, action.payload),
  );

  yield takeLatest(authActions.register.type, handleRegister);
  yield takeLatest(authActions.logout.type, handleLogout);
}
