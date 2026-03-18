import axiosClient from "./axiosClient";
import dayjs from "dayjs";
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
  const res = await axiosClient.get<ResponseObject<ShiftHandoverStatsResponse>>(
    `${BASE_URL}/stats`, 
    { params: { scheduleId } }
  );
  return res.data.data; 
};

//kết thúc ca
export const checkOut = async (data: CheckOutRequest): Promise<ResponseObject<ShiftHandoverResponse>> => {
  const res = await axiosClient.post<ResponseObject<ShiftHandoverResponse>>(`${BASE_URL}/check-out`, data);
  return res.data;
};

export const getShiftHistory = async (params: any): Promise<ResponseObject<any>> => {
  const formattedParams = {
    ...params,
    fromDate: params.fromDate
      ? dayjs(params.fromDate).format("YYYY-MM-DD")
      : undefined,
    toDate: params.toDate
      ? dayjs(params.toDate).format("YYYY-MM-DD")
      : undefined,
  };

  const res = await axiosClient.get(`${BASE_URL}/history`, {
    params: formattedParams,
  });
  return res.data;
};

export const confirmShift = async (data: { handoverId: string; adminNote: string }): Promise<ResponseObject<any>> => {
    const res = await axiosClient.post(`${BASE_URL}/confirm`, data);
    return res.data;
};

export const shiftHandoverApi = {
    checkIn,
    getShiftStats,
    checkOut,
    getShiftHistory,
    confirmShift,
};

export default shiftHandoverApi;