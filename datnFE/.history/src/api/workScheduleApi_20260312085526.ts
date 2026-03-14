import dayjs from 'dayjs';
import type { CreateScheduleRequest, ScheduleSearchRequest, WorkScheduleResponse } from '../models/workSchedule';
import axiosClient from './axiosClient'; 
import type { ResponseObject } from '../models/base';

const BASE_URL = '/admin/work-schedule';

//Lấy lịch làm việc
export const getSchedules = async (params: ScheduleSearchRequest): Promise<ResponseObject<WorkScheduleResponse[]>> => {  
  const formattedParams = {
    ...params,
    fromDate: params.fromDate ? dayjs(params.fromDate).format("YYYY-MM-DD") : undefined,
    toDate: params.toDate ? dayjs(params.toDate).format("YYYY-MM-DD") : undefined,
  };

  const res = await axiosClient.get<ResponseObject<WorkScheduleResponse[]>>(BASE_URL, { 
    params: formattedParams 
  });
  return res.data;
};


//Phân ca làm việc cho nhân viên
export const assignShift = async (data: CreateScheduleRequest): Promise<ResponseObject<WorkScheduleResponse>> => {
  const payload = {
    ...data,
    workDate: dayjs(data.workDate).format("YYYY-MM-DD")
  };

  const res = await axiosClient.post<ResponseObject<WorkScheduleResponse>>(BASE_URL, payload);
  
  return res.data;
};

//Xóa lịch làm việc
export const deleteSchedule = async (id: string): Promise<ResponseObject<void>> => {
  const res = await axiosClient.delete<ResponseObject<void>>(`${BASE_URL}/${id}`);
  return res.data;
};


export const updateSchedule = async (
  id: string, 
  data: CreateScheduleRequest
): Promise<ResponseObject<WorkScheduleResponse>> => {
  const payload = {
    ...data,
    workDate: dayjs(data.workDate).format("YYYY-MM-DD")
  };

  const res = await axiosClient.put<ResponseObject<WorkScheduleResponse>>(`${BASE_URL}/${id}`, payload);
  return res.data;
};


export const workScheduleApi = {
    getSchedules,
    assignShift,
    deleteSchedule,
    updateSchedule
};

export default workScheduleApi;