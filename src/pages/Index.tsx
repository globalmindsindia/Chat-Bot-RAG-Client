import FloatingChatWidget from '@/components/chat/FloatingChatWidget';
import globalMindsHomeBg from '@/assets/global-minds-home-bg.png';

const Index = () => {
  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: `url(${globalMindsHomeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better readability */}
      {/* <div className="absolute inset-0 bg-background/80 z-0"></div> */}
      <div className="flex items-center justify-center h-screen relative z-10">
        {/* <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Welcome to VEDA</h1>
          <p className="text-muted-foreground">Click the chat button to start a conversation with our AI assistant.</p>
        </div> */}
      </div>
      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
};

export default Index;



