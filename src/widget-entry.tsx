import ReactDOM from "react-dom/client";
import FloatingChatWidget from "./components/chat/FloatingChatWidget";
import "./index.css";

declare global {
  interface Window {
    initGlobalChat?: (opts?: { containerId?: string }) => void;
  }
}

window.initGlobalChat = function ({
  containerId = "globalminds-chatbot",
} = {}) {
  const el = document.getElementById(containerId);
  if (!el) {
    console.error(`Container #${containerId} not found.`);
    return;
  }
  const root = ReactDOM.createRoot(el);
  root.render(<FloatingChatWidget />);
};
