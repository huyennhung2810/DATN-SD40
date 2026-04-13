import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import { useDispatch } from "react-redux";
import { notificationActions, type NotificationType } from "../redux/notification/notificationSlice";

const SERVER_URL = "http://localhost:8386";

interface RawNotification {
  type: NotificationType;
  title: string;
  message: string;
  refId?: string;
  refCode?: string;
  timestamp?: number;
}

function parsePayload(body: string): RawNotification | null {
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed.type === "string" && parsed.message) {
      return parsed as RawNotification;
    }
  } catch {
    // plain-text legacy messages ignored
  }
  return null;
}

/**
 * Subscribe to a WebSocket topic and push incoming messages into the
 * notification Redux slice.
 *
 * @param topic   e.g. "/topic/admin/notifications" or "/topic/client/notifications/userId"
 * @param enabled Set to false to skip connecting (e.g. when user is not logged in)
 */
export function useNotifications(topic: string, enabled = true) {
  const dispatch = useDispatch();
  const ref = useRef<ReturnType<typeof over> | null>(null);

  useEffect(() => {
    if (!enabled || !topic) return;

    let cancelled = false;

    const socket = new SockJS(`${SERVER_URL}/ws-chat`);
    const client = over(socket);
    client.debug = () => {};
    ref.current = client;

    client.connect(
      {},
      () => {
        if (cancelled) return;
        client.subscribe(topic, (frame) => {
          if (cancelled) return;
          const notif = parsePayload(frame.body);
          if (notif) {
            dispatch(
              notificationActions.push({
                type: notif.type,
                title: notif.title,
                message: notif.message,
                refId: notif.refId,
                refCode: notif.refCode,
                timestamp: notif.timestamp ?? Date.now(),
              })
            );
          }
        });
      },
      () => {
        // Reconnect silently after 5 s
        setTimeout(() => {
          if (ref.current) {
            try { ref.current.disconnect(() => {}); } catch { /**/ }
          }
          ref.current = null;
        }, 5000);
      }
    );

    return () => {
      cancelled = true;
      if (ref.current) {
        try { ref.current.disconnect(() => {}); } catch { /**/ }
        ref.current = null;
      }
    };
  }, [topic, enabled, dispatch]);
}
