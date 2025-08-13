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
 
const connect = useCallback(() => {
if (
ws.current &&
(ws.current.readyState === 1 || ws.current.readyState === 0)
)
return;
ws.current = new WebSocket("wss://api.chat.globalmindsindia.com/ws/chat");
ws.current.onopen = () => {
setResponse("");
setPartialResponse("");
setConnected(true);
setError(null);
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
};
ws.current.onerror = () => {
setLoading(false);
setError("WebSocket error");
};
}, []);
 
const sendMessage = useCallback(
(msg: string) => {
setResponse("");
setPartialResponse("");
setLoading(true);
setError(null);
if (!ws.current || ws.current.readyState !== 1) connect();
setTimeout(() => {
ws.current?.send(JSON.stringify({ message: msg, history: [] }));
}, 100);
},
[connect]
);
 
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