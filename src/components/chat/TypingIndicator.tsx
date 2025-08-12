const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-chat-bot-bg border border-border rounded-2xl px-4 py-3 shadow-sm max-w-[80%]">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-medium">
            V
          </div>
          <span className="text-xs font-medium text-brand-blue">VEDA</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="text-sm text-muted-foreground">VEDA is typing</span>
          <div className="flex space-x-1 ml-2">
            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;