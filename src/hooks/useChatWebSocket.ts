import { useRef, useState, useCallback } from "react";
 
interface ChatMessage {
message: string;
history: any[];
}
 
interface UseChatWebSocketReturn {
response: string;
loading: boolean;
error: string | null;
connect: () => void;
sendMessage: (msg: string) => void;
connected: boolean;
}
 
export function useChatWebSocket(): UseChatWebSocketReturn {
  const ws = useRef<WebSocket | null>(null);
  const [response, setResponse] = useState("");
  const [partialResponse, setPartialResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const messageQueue = useRef<string[]>([]);
  const isConnecting = useRef(false);

  // Helper to open socket and set up listeners
  const connect = useCallback(() => {
    if (
      ws.current &&
      (ws.current.readyState === WebSocket.OPEN || ws.current.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket already open or connecting");
      return;
    }
    console.log("WebSocket connecting...");
    isConnecting.current = true;
    ws.current = new WebSocket("wss://api.chat.globalmindsindia.com/ws/chat");
    ws.current.onopen = () => {
      console.log("WebSocket open");
      setResponse("");
      setPartialResponse("");
      setConnected(true);
      setError(null);
      isConnecting.current = false;
      // Send any queued messages
      if (messageQueue.current.length > 0) {
        console.log("Sending queued messages...");
        while (messageQueue.current.length > 0 && ws.current?.readyState === WebSocket.OPEN) {
          const queuedMsg = messageQueue.current.shift();
          if (queuedMsg) {
            ws.current.send(queuedMsg);
          }
        }
      }
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.error) {
        setResponse((prev) => prev + "\n[Error] " + data.error + "\n");
        setLoading(false);
        setError(data.error);
      } else if (data.chunk) {
        setPartialResponse((prev) => {
          if (prev.endsWith(" ") && data.chunk.startsWith(" ")) {
            return prev + data.chunk.trimStart();
          } else {
            return prev + data.chunk;
          }
        });
        setLoading(true);
      } else if (data.end) {
        setResponse((partialResponse) => partialResponse);
        setLoading(false);
        setPartialResponse("");
      }
    };
    ws.current.onclose = () => {
      setLoading(false);
      setConnected(false);
      isConnecting.current = false;
      console.log("WebSocket closed");
    };
    ws.current.onerror = () => {
      setLoading(false);
      setError("WebSocket error");
      isConnecting.current = false;
      console.log("WebSocket error");
    };
  }, []);

  // Send message, waiting for socket to open if needed
  const sendMessage = useCallback((msg: string) => {
    setResponse("");
    setPartialResponse("");
    setLoading(true);
    setError(null);
    const payload = JSON.stringify({ message: msg, history: [] });

    function trySend() {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        console.log("WebSocket sending message");
        ws.current.send(payload);
      } else {
        if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
          connect();
        }
        // Queue the message and retry
        if (!messageQueue.current.includes(payload)) {
          messageQueue.current.push(payload);
        }
        console.log("WebSocket not open, retrying in 200ms");
        setTimeout(trySend, 200);
      }
    }
    trySend();
  }, [connect]);

  // Compose the full response for display
  const displayResponse = partialResponse || response;

  return {
    response: displayResponse,
    loading,
    error,
    connect,
    sendMessage,
    connected,
  };
}