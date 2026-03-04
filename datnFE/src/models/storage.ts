import type { CommonStatus } from "./base";

// 1. Interface đại diện cho dữ liệu trả về từ API
// Khớp với ADStorageCapacityResponse.java
export interface StorageCapacityResponse {
  id: string;
  code: string;
  name: string;
  status: CommonStatus; 
  createdTime: string; // Backend trả về String nên dùng string ở đây để hiển thị
}

// 2. Interface cho dữ liệu khi gửi lên (Form)
export interface StorageCapacityFormValues {
  code: string;
  name: string;
  status: CommonStatus;
}

// 3. Giá trị khởi tạo cho Form
export const initialStorageCapacity: StorageCapacityFormValues = {
  code: "",
  name: "",
  status: "ACTIVE",
};

// 4. Các tham số khi gọi API lấy danh sách
export interface StorageCapacityPageParams {
  keyword?: string;
  status?: string;
  page: number;
  size: number;
}