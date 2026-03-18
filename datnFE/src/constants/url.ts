
const env = import.meta.env;
export const DOMAIN_BACKEND = (env.VITE_BASE_URL_SERVER as string) || "http://localhost:8386";
export const DOMAIN_FRONTEND = (env.VITE_BASE_URL_CLIENT as string) || "http://localhost:6688";

export const API_URL = `${DOMAIN_BACKEND}/api/v1`;

// 2. OAUTH2 Redirect Config
export const REDIRECT_URI = `${DOMAIN_FRONTEND}/oauth2/redirect`;
const G_AUTH = "/oauth2/authorization/google";
const GH_AUTH = "/oauth2/authorization/github";



// Hàm helper tạo URL Social Login cho 4 đối tượng
export const getSocialLoginUrl = (provider: 'google' | 'github', role: string) => {
    const baseUrl = provider === 'google' ? G_AUTH : GH_AUTH;
return `${DOMAIN_BACKEND}${baseUrl}?redirect_uri=${REDIRECT_URI}&screen=${role}&register=false`;};

// 3. API PREFIXES (Gom nhóm theo lớp bảo vệ của Spring Security)
export const API_ENDPOINTS = {
    AUTH: `${API_URL}/auth`,
    ADMIN: `${API_URL}/admin`,     // Lớp bảo vệ: ADMIN, STAFF
    PUBLIC: `${API_URL}/permitall`, // Lớp bảo vệ: Mọi đối tượng (Guest)
};

// 4. CHI TIẾT ENDPOINTS (Gom nhóm để quản lý)
export const AUTH_PATH = {
    LOGIN: "/auth/login",
  LOGIN_ADMIN: "/auth/login-admin",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  CHANGE_PWD: "/auth/change-password",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password",
  VERIFY_OTP: "/auth/verify-otp",
};

export const ADMIN_PATH = {
    STATISTICS: `${API_ENDPOINTS.ADMIN}/thong-ke`,
    COLOR: `${API_ENDPOINTS.ADMIN}/mau-sac`,
    SIZE: `${API_ENDPOINTS.ADMIN}/size`,
    BRAND: `${API_ENDPOINTS.ADMIN}/thuong-hieu`,
    CUSTOMER: `${API_ENDPOINTS.ADMIN}/khach-hang`,
    EMPLOYEE: `${API_ENDPOINTS.ADMIN}/nhan-vien`,
    PRODUCT: `${API_ENDPOINTS.ADMIN}/san-pham`,
    PRODUCT_DETAIL: `${API_ENDPOINTS.ADMIN}/san-pham-chi-tiet`,
    POS: `${API_ENDPOINTS.ADMIN}/ban-hang`,
    VOUCHER: `${API_ENDPOINTS.ADMIN}/voucher`,
    ORDER: `${API_ENDPOINTS.ADMIN}/hoa-don`,
    // Endpoint có biến (Params)
    ORDER_DETAIL: (id: string | number) => `${API_ENDPOINTS.ADMIN}/hoa-don/${id}`,
};

export const PUBLIC_PATH = {
    PRODUCT: `${API_ENDPOINTS.PUBLIC}/san-pham`,
    PRODUCT_DETAIL: (id: string | number) => `${API_ENDPOINTS.PUBLIC}/san-pham-chi-tiet/${id}`,
    CART: `${API_ENDPOINTS.PUBLIC}/cart`,
    PROFILE: `${API_ENDPOINTS.PUBLIC}/profile`,
    ORDER_HISTORY: `${API_ENDPOINTS.PUBLIC}/don-mua`,
};