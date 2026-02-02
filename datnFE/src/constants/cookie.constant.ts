// Nhận diện lỗi từ backend 

export const ACCOUNT_NOT_EXIST: string = 'e_a_n_e'
export const ACCOUNT_NOT_EXIST_MESSAGE: string = 'Tài khoản đăng nhập không tồn tại trong hệ thống'

export const ACCOUNT_EXIST: string = 'e_a_e'
export const ACCOUNT_EXIST_MESSAGE: string = 'Tài khoản đăng nhập đã tồn tại trong hệ thống'

export const ACCOUNT_NOT_HAVE_PERMISSION: string = 'a_n_h_p'
export const ACCOUNT_NOT_HAVE_PERMISSION_MESSAGE: string =
  'Tài khoản đăng nhập không có quyền trong hệ thống'

export const COOKIE_1_HOURS: number = 3600
export const COOKIE_2_HOURS: number = 7200

export const Unverified_Account: string = 'u_v_a'
export const Unverified_Account_MESSAGE: string = 'Đăng ký thành công chờ phê duyệt tài khoản'

export const Registered_Awaiting_Confirmation: string = 'r_a_c'
export const Registered_Awaiting_Confirmation_MESSAGE: string = 'Tài khoản chưa được phê duyệt'