import { cn } from '@/lib/utils';
import { Message } from './ChatInterface';
import globalMindsLogo from '@/assets/GMI_Logo.jpg';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
          isUser
            ? 'bg-chat-user-bg text-chat-user-text ml-auto'
            : 'bg-chat-bot-bg text-chat-bot-text border border-border'
        )}
      >
        {!isUser && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mr-2 p-0.5">
              <img 
                src={globalMindsLogo} 
                alt="Global Minds" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <span className="text-xs font-medium text-brand-blue">Veda</span>
          </div>
        )}
        
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.text}
        </p>
        
        <div className={cn(
          'text-xs mt-2 opacity-70',
          isUser ? 'text-right' : 'text-left'
        )}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;