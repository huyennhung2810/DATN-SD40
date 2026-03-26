// Hàm reset sessionId khi login/logout
export const resetSessionId = () => {
  const newSessionId = `client-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('hikari_chat_session', newSessionId);
  return newSessionId;
};

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage } from '../../models/chat';

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  sessionId: string;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  sessionId: localStorage.getItem('hikari_chat_session') || `client-${Math.random().toString(36).substr(2, 9)}`,
};

if (!localStorage.getItem('hikari_chat_session')) {
  localStorage.setItem('hikari_chat_session', initialState.sessionId);
}


const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
    },
    sendMessageRequest: (state, _action: PayloadAction<{ content: string; sessionId: string; userId?: string; customerName?: string }>) => {
      state.loading = true;
    },
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
      state.loading = false;
    },

    receiveMessage: (state, action: PayloadAction<ChatMessage>) => {
      const lastMsg = state.messages[state.messages.length - 1];
      const isDuplicate =
        !!lastMsg &&
        lastMsg.content === action.payload.content &&
        lastMsg.sender === action.payload.sender &&
        ((lastMsg.timestamp && action.payload.timestamp && lastMsg.timestamp === action.payload.timestamp) ||
         (!lastMsg.timestamp && !action.payload.timestamp));
      if (!isDuplicate) {
        state.messages.push(action.payload);
      }
    },

    requestStaff: (_state, _action: PayloadAction<{ sessionId: string; userId?: string; customerName?: string }>) => {},

    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
    },
  },
});

// Đồng bộ sessionId giữa các tab
export const listenSessionIdSync = (dispatch: any) => {
  window.addEventListener('storage', (e) => {
    if (e.key === 'hikari_chat_session' && typeof e.newValue === 'string') {
      dispatch(chatSlice.actions.setSessionId(e.newValue));
    }
  });
};

export const { sendMessageRequest, addMessage, setLoading, requestStaff, receiveMessage, setMessages, clearMessages } = chatSlice.actions;
export { chatSlice };
export default chatSlice.reducer;