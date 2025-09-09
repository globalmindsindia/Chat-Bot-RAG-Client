import FloatingChatWidget from "@/components/chat/FloatingChatWidget";

const Index = () => {
  return (
    <div className="bg-transparent min-h-screen">
      {/* Other page content here... */}

      {/* Fixed-position wrapper for the chat widget */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          // optional: adjust margins
          margin: "1rem",
          zIndex: 1000,
        }}
      >
        <FloatingChatWidget />
      </div>
    </div>
  );
};

export default Index;
