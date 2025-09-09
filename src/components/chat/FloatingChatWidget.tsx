import { useState, useEffect } from "react";
import FloatingChatButton from "./FloatingChatButton";
import ChatInterface from "./ChatInterface";

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Detect if running in iframe
  const isInIframe = window.self !== window.top;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Make background transparent inside iframe
  useEffect(() => {
    if (isInIframe) {
      document.body.style.backgroundColor = "transparent";
      document.documentElement.style.backgroundColor = "transparent";
    }
  }, [isInIframe]);

  const toggleChat = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Chat popup: now fixed to viewport bottom-right */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 w-96 h-[600px] bg-white border border-gray-200 rounded-lg shadow-2xl z-[2147483646] animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <ChatInterface onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating chat button container: fixed too */}
      <div className="fixed bottom-32 right-4 flex flex-col items-center z-[9999]">
        {!isOpen && (
          <div className="relative flex flex-col items-center">
            <div className="bg-primary/90 text-white px-5 py-2 rounded-xl shadow-xl border border-border text-base font-semibold animate-in fade-in-0 duration-300">
              Ask Veda!
            </div>
            <div
              className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary/90"
              style={{ marginTop: "-2px" }}
            />
          </div>
        )}
        <FloatingChatButton isOpen={isOpen} onClick={toggleChat} />
      </div>
    </>
  );
};

export default FloatingChatWidget;
