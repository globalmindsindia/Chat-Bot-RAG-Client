import { useState, useEffect, useRef, useCallback } from "react";

export const useWebSocket = () => {
  const [connected, setConnected] = useState(false);
  const [response, setResponse] = useState("");
  const [partialResponse, setPartialResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const messageQueue = useRef<string[]>([]);

  const connect = useCallback(() => {
    if (
      ws.current &&
      (ws.current.readyState === WebSocket.OPEN ||
        ws.current.readyState === WebSocket.CONNECTING)
    ) {
      return; // Already connected or connecting
    }

    ws.current = new WebSocket("wss://api.chat.globalmindsindia.com/ws/chat");

    ws.current.onopen = () => {
      setConnected(true);
      setError(null);
      console.log("✅ WebSocket connected");

      // Flush queued messages
      while (messageQueue.current.length > 0) {
        const queuedMsg = messageQueue.current.shift();
        if (queuedMsg) {
          ws.current?.send(queuedMsg);
        }
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.partial) {
          setPartialResponse((prev) => prev + data.partial);
        } else if (data.message) {
          setResponse(data.message);
          setPartialResponse("");
          setLoading(false);
        }
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", err);
      }
    };

    ws.current.onerror = (event) => {
      console.error("❌ WebSocket error:", event);
      setError("WebSocket connection error");
      setConnected(false);
    };

    ws.current.onclose = () => {
      console.warn("⚠️ WebSocket closed. Reconnecting in 3s...");
      setConnected(false);
      setTimeout(connect, 3000);
    };
  }, []);

  const sendMessage = useCallback(
    (msg: string) => {
      setResponse("");
      setPartialResponse("");
      setLoading(true);
      setError(null);

      const payload = JSON.stringify({ message: msg, history: [] });

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(payload);
      } else {
        messageQueue.current.push(payload);
        connect();
      }
    },
    [connect]
  );

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  return {
    connected,
    response,
    partialResponse,
    loading,
    error,
    sendMessage,
  };
};
