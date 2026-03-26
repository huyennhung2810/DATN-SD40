import { call, put, takeLatest } from 'redux-saga/effects';
import type { ChatResponse } from '../../models/chat';
import { addMessage, requestStaff, sendMessageRequest, setLoading } from './chatSlice';
import { postChatMessage } from '../../api/chatApi';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';


function* handleSendMessage(action: PayloadAction<{ content: string; sessionId: string; userId?: string; customerName?: string }>) {
  try {
    const { content, sessionId, userId, customerName } = action.payload;

    yield put(addMessage({ content, sender: 'CUSTOMER', sessionId }));

    const response: { data: ChatResponse } = yield call(postChatMessage, { 
      message: content, 
      sessionId,
      userId,
      customerName,
    });

    if (response.data.sender === 'AI') {
      yield put(addMessage({
        content: response.data.content,
        sender: 'AI',
        sessionId,
        timestamp: response.data.timestamp
      }));
    }
  } catch (error) {
    console.error("Send message failed", error);
    yield put(setLoading(false));
  }
}

function* handleRequestStaffSaga(action: PayloadAction<{ sessionId: string; customerName?: string }>) {
  try {
    const { sessionId, customerName } = action.payload;
    const params = new URLSearchParams({ sessionId });
    if (customerName) params.append('customerName', customerName);
    yield call(axiosClient.post, `/support/request-staff?${params.toString()}`);
    yield put(addMessage({
      content: "_Yêu cầu của bạn đã được gửi tới nhân viên hỗ trợ. Vui lòng chờ trong giây lát!_",
      sender: 'SYSTEM',
      sessionId,
    }));
  } catch (error) {
    console.error("Request staff failed", error);
  }
}

export function* watchChatSaga() {
  yield takeLatest(sendMessageRequest.type, handleSendMessage);
  yield takeLatest(requestStaff.type, handleRequestStaffSaga);
}