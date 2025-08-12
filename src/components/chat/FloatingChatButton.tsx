import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const FloatingChatButton = ({ isOpen, onClick }: FloatingChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full bg-gradient-brand text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50"
      size="icon"
      aria-label={isOpen ? "Close chat" : "Open chat with VEDA"}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageCircle className="h-6 w-6" />
      )}
    </Button>
  );
};

export default FloatingChatButton;