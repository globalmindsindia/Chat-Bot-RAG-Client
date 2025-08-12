import { useState, useEffect } from 'react';
import FloatingChatButton from './FloatingChatButton';
import ChatInterface from './ChatInterface';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Close chat on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat popup */}
      {isOpen && (
        <div className="fixed bottom-36 right-6 w-96 h-[600px] bg-card border border-border rounded-lg shadow-2xl z-40 animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          <ChatInterface onClose={() => setIsOpen(false)} />
        </div>
      )}
      
      {/* Floating chat button and Ask Veda bubble */}
      <div className="fixed bottom-32 right-4 flex flex-col items-center z-50">
        {!isOpen && (
          <div className="relative flex flex-col items-center">
            <div className="bg-white text-primary px-5 py-2 rounded-xl shadow-xl border border-border text-base font-semibold animate-in fade-in-0 duration-300">
              Ask Veda!
            </div>
            {/* Pointer triangle */}
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" style={{marginTop: '-2px'}}></div>
          </div>
        )}
        <FloatingChatButton isOpen={isOpen} onClick={toggleChat} />
      </div>
    </>
  );
};

export default FloatingChatWidget;