import type { ChatRequest, ChatResponse } from "../models/chat";
import axiosClient from "./axiosClient";


const BASE_URL = "/support";

export const postChatMessage = (data: ChatRequest) => {
  return axiosClient.post<ChatResponse>(`${BASE_URL}/chat`, data);
};