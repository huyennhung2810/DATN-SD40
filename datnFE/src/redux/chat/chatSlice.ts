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
sessionId: localStorage.getItem('hikari_chat_session') || `client-${Math.random().toString(36).substr(2, 9)}`,};

if (!localStorage.getItem('hikari_chat_session')) {
  localStorage.setItem('hikari_chat_session', initialState.sessionId);
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    sendMessageRequest: (state, _action: PayloadAction<{ content: string; sessionId: string }>) => {
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
      const isDuplicate = state.messages.length > 0 && 
                          state.messages[state.messages.length - 1].content === action.payload.content &&
                          state.messages[state.messages.length - 1].sender === action.payload.sender;
      
      if (!isDuplicate) {
        state.messages.push(action.payload);
      }
    },

    requestStaff: (_state, _action: PayloadAction<{ sessionId: string }>) => {
     },
  },
});

export const { sendMessageRequest, addMessage, setLoading, requestStaff, receiveMessage, setMessages } = chatSlice.actions;
export default chatSlice.reducer;