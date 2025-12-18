import { useRef, useState, useCallback } from "react";

export function useChatWebSocket() {
  const ws = useRef<WebSocket | null>(null);

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  // STREAM buffer
  const bufferRef = useRef<string>("");

  // Track pending single message
  const pendingMessage = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) return;

    ws.current = new WebSocket("wss://api.chat.globalmindsindia.com/ws/chat");

    ws.current.onopen = () => {
      setConnected(true);
      setError(null);

      // If a message was waiting → send ONCE
      if (pendingMessage.current) {
        ws.current.send(pendingMessage.current);
        pendingMessage.current = null;
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Streaming chunk
      if (data.chunk) {
        bufferRef.current += data.chunk;
        setLoading(true);
        return;
      }

      // Final response
      if (data.end) {
        setResponse(bufferRef.current);
        bufferRef.current = "";
        setLoading(false);
        return;
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
    };

    ws.current.onerror = () => {
      setError("WebSocket error");
      setLoading(false);
    };
  }, []);

  const sendMessage = useCallback(
    (msg: string) => {
      setError(null);
      setLoading(true);
      bufferRef.current = "";
      setResponse("");

      const payload = JSON.stringify({ message: msg, history: [] });

      // Always store 1 pending message
      pendingMessage.current = payload;

      // If socket ready → send immediately
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(payload);
        pendingMessage.current = null;
        return;
      }

      // Otherwise connect (message will send on open ONCE)
      connect();
    },
    [connect]
  );

  return {
    response,
    loading,
    error,
    sendMessage,
    connect,
    connected,
  };
}
