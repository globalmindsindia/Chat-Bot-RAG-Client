import { cn } from "@/lib/utils";
import { Message } from "./ChatInterface";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === "user";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div
      className={cn(
        "flex w-full mb-1",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-xl px-3 py-2 shadow-sm",
          isUser
            ? "bg-chat-user-bg text-chat-user-text ml-auto"
            : "bg-chat-bot-bg text-chat-bot-text border border-border"
        )}
      >
        {/* BOT HEADER ROW (Avatar + Veda + Time) */}
        {!isUser && (
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center mr-1 overflow-hidden">
                <img
                  src="/favicon_transparent.ico"
                  alt="Global Minds"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] font-medium text-brand-blue">
                Veda
              </span>
            </div>

            {/* TIME MOVED HERE */}
            <span className="text-[10px] opacity-60 ml-2">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        {/* USER TIME RIGHT CORNER */}
        {isUser && (
          <div className="flex items-center justify-between mb-1">
            {/* USER LABEL + ICON */}
            <div className="flex items-center">
              <span className="text-[10px] font-medium opacity-80">You</span>
            </div>

            {/* TIME */}
            <span className="text-[10px] opacity-60 ml-2">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}

        <p className="text-sm leading-snug whitespace-pre-wrap break-words">
          {message.text}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
