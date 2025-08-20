import { useState, useRef, useEffect } from 'react';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from './ChatMessage';
import ChatHeader from './ChatHeader';
import TypingIndicator from './TypingIndicator';
import chatBackdrop from '@/assets/chat-backdrop.png';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onClose?: () => void;
}

const ChatInterface = ({ onClose }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I am Veda,Welcome to Global Minds India. I'm here to help you with your study abroad journey.How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // WebSocket chat state
  const { response, loading, error, sendMessage, connected } = useChatWebSocket();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim() || loading) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    sendMessage(userMsg.text);
  };

  // Listen for streamed bot response and update messages
  useEffect(() => {
    // Only add bot message if response is non-empty and user has sent a message
    if (isTyping && response) {
      setMessages(prev => {
        // If last message is bot, update it; else, add new bot message
        const last = prev[prev.length - 1];
        if (last && last.sender === 'bot') {
          return [
            ...prev.slice(0, -1),
            { ...last, text: response, timestamp: new Date() },
          ];
        } else {
          return [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              text: response,
              sender: 'bot',
              timestamp: new Date(),
            },
          ];
        }
      });
    }
    if (!loading && isTyping) {
      setIsTyping(false);
    }
    // Show error toast if any
    if (error) {
      toast({
        title: 'Connection Error',
        description: error,
        variant: 'destructive',
      });
    }
    // eslint-disable-next-line
  }, [response, loading, error]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-background rounded-lg overflow-hidden relative"
      style={{
        backgroundImage: `url(${chatBackdrop})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
    <div className="absolute inset-0 bg-background/0 backdrop-blur-none rounded-lg"></div>
      <div className="relative z-10 flex flex-col h-full">
        <ChatHeader onClose={onClose} />
      
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 p-4"
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        </ScrollArea>

        <div className="border-t bg-background/80 backdrop-blur-sm p-4">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message to Global Minds..."
              disabled={loading}
              className="flex-1 bg-background/60 border-border focus:ring-primary text-sm backdrop-blur-sm"
              aria-label="Message input"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || loading}
              size="icon"
              className="bg-primary hover:bg-primary/90 shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;