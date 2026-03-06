// models/workSchedule.ts
import type { Dayjs } from "dayjs";

export interface ScheduleSearchRequest {
  fromDate?: string | Date | Dayjs;
  toDate?: string | Date | Dayjs;
}

export interface CreateScheduleRequest {
  employeeId: string;
  shiftTemplateId: string;
  workDate: string | Date | Dayjs;
}

export interface WorkScheduleResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  shiftName: string;
  startTime: string; 
  endTime: string; 
  workDate: string;  
  status: 'REGISTERED' | 'WORKING' | 'COMPLETED' | 'ABSENT';
}