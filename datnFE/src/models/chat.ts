export type SenderType = 'AI' | 'CUSTOMER' | 'STAFF' | 'SYSTEM';

export interface ChatMessage {
  content: string;
  sender: SenderType;
  timestamp?: string;
  sessionId: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  content: string;
  sender: SenderType;
  timestamp: string;
}