import axiosClient from "./axiosClient";
import type { ResponseObject } from "../models/base";
import type { 
    CheckInRequest, 
    CheckOutRequest, 
    ShiftHandoverStatsResponse,
    ShiftHandoverResponse 
} from "../models/shiftHandover";

const BASE_URL = "/admin/shift-handover";

//nhân viên bắt đầu ca làm vc
export const checkIn = async (data: CheckInRequest): Promise<ResponseObject<ShiftHandoverResponse>> => {
  const res = await axiosClient.post<ResponseObject<ShiftHandoverResponse>>(`${BASE_URL}/check-in`, data);
  return res.data;
};

//Lấy thông tin ban đầu của ca làm việc
export const getShiftStats = async (scheduleId: string): Promise<ShiftHandoverStatsResponse> => {
  const res = await axiosClient.get<ResponseObject<ShiftHandoverStatsResponse>>(`${BASE_URL}/stats`, { 
    params: { scheduleId } 
  });
  return res.data.data; 
};

//kết thúc ca
export const checkOut = async (data: CheckOutRequest): Promise<ResponseObject<ShiftHandoverResponse>> => {
  const res = await axiosClient.post<ResponseObject<ShiftHandoverResponse>>(`${BASE_URL}/check-out`, data);
  return res.data;
};

export const shiftHandoverApi = {
    checkIn,
    getShiftStats,
    checkOut
};

export default shiftHandoverApi;