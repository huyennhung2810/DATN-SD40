import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_STATUS"
  | "CHAT_REQUEST"
  | "SHIFT_ALERT";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  refId?: string;
  refCode?: string;
  timestamp: number;
  read: boolean;
}

interface NotificationState {
  items: AppNotification[];
}

const MAX_ITEMS = 50;

const notificationSlice = createSlice({
  name: "notification",
  initialState: { items: [] } as NotificationState,
  reducers: {
    push(state, action: PayloadAction<Omit<AppNotification, "id" | "read">>) {
      const item: AppNotification = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        read: false,
      };
      state.items.unshift(item);
      if (state.items.length > MAX_ITEMS) {
        state.items = state.items.slice(0, MAX_ITEMS);
      }
    },
    markRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.read = true;
    },
    markAllRead(state) {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
    clear(state) {
      state.items = [];
    },
  },
});

export const notificationActions = notificationSlice.actions;
export default notificationSlice.reducer;
