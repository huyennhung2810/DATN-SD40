import { STORAGE_KEYS } from "../constants/storage";

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function decodeOAuthState(state: string): { accessToken: string; refreshToken: string } {
  try {
    // The backend encodes the token as base64 JSON: {"accessToken":"...","refreshToken":"..."}
    const json = atob(state);
    const parsed = JSON.parse(json);
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    };
  } catch (e) {
    console.error("Error decoding OAuth state:", e);
    throw new Error("Invalid OAuth state");
  }
}
