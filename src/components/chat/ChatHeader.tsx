import { X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import globalMindsLogo from '@/assets/GMI_Logo.jpg';

interface ChatHeaderProps {
  onClose?: () => void;
}

const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <header className="bg-chat-header-bg/90 backdrop-blur-sm text-chat-header-text p-4 border-b border-brand-light-blue/20">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg p-1">
            <img 
              src={globalMindsLogo} 
              alt="Global Minds India" 
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <h1 className="font-semibold text-lg">VEDA</h1>
            <p className="text-sm opacity-90">Study Abroad Assistant </p>
            <p className="text-sm opacity-90">Online</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="text-chat-header-text hover:bg-white/10"
              onClick={onClose}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;