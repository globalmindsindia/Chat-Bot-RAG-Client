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

  // Set document body background to transparent if in iframe
  useEffect(() => {
    if (isInIframe) {
      document.body.style.backgroundColor = "transparent";
      document.documentElement.style.backgroundColor = "transparent";
    }
  }, [isInIframe]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat popup */}
      {isOpen && (
        <div
          className="fixed bottom-36 right-6 w-96 h-[600px] bg-white border border-gray-200 rounded-lg shadow-2xl z-[9999] animate-in slide-in-from-bottom-2 fade-in-0 duration-300"
          style={{ zIndex: 2147483646 }} // High z-index but below React dev tools
        >
          <ChatInterface onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Floating chat button container */}
      <div className="fixed bottom-32 right-4 flex flex-col items-center z-">
        {!isOpen && (
          <div className="relative flex flex-col items-center">
            <div className="bg-primary/90 text-white px-5 py-2 rounded-xl shadow-xl border border-border text-base font-semibold animate-in fade-in-0 duration-300">
              Ask Veda!
            </div>
            <div
              className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-primary/90"
              style={{ marginTop: "-2px" }}
            ></div>
          </div>
        )}
        <FloatingChatButton isOpen={isOpen} onClick={toggleChat} />
      </div>
    </>
  );
};

export default FloatingChatWidget;
