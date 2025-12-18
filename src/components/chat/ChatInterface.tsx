import { useState, useRef, useEffect } from "react";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import ChatMessage from "./ChatMessage";
import ChatHeader from "./ChatHeader";
import TypingIndicator from "./TypingIndicator";
import chatBackdrop from "@/assets/chat-backdrop.png";
import { chatFlow } from "@/config/chatFlow";
import { BookingService } from "@/services/booking.service";

export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatInterface = ({ onClose }: { onClose?: () => void }) => {
  const [currentState, setCurrentState] = useState(chatFlow.start_state);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: chatFlow.states[chatFlow.start_state].message,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastResponse, setLastResponse] = useState("");
  const [userTyped, setUserTyped] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [showOptions, setShowOptions] = useState(true);

  /** 🗓 Scheduling State */
  const [scheduleData, setScheduleData] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    date?: string;
    slot?: string;
  }>({});

  const isScheduling = currentState.startsWith("SCHEDULE");

  const { response, loading, error, sendMessage } = useChatWebSocket();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  /** AUTO SCROLL */
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages, isTyping]);

  /** DATE & SLOT HELPERS */
  const getNext15Days = () => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 15; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  };

  const generateTimeSlots = (
    startHour = 10,
    endHour = 20,
    intervalMinutes = 30
  ) => {
    const slots: string[] = [];

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += intervalMinutes) {
        const h = hour.toString().padStart(2, "0");
        const m = min.toString().padStart(2, "0");
        slots.push(`${h}:${m}`);
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots(10, 20, 30);

  /** BUTTON CLICK (STATE FLOW) */
  const handleStateButtonClick = (id: string) => {
    const btn = chatFlow.states[currentState].buttons.find((b) => b.id === id);

    if (btn?.url) {
      window.open(btn.url, "_blank");
      return;
    }

    const next = chatFlow.transitions[id];
    if (!next) return;

    setCurrentState(next);
    setShowOptions(true);

    setMessages((p) => [
      ...p,
      {
        id: Date.now().toString(),
        text: chatFlow.states[next].message,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  /** SEND MESSAGE */
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const text = inputValue.trim();

    /** 🗓 SCHEDULING FLOW (NO AI) */
    if (isScheduling) {
      const text = inputValue.trim();
      let nextState = currentState;

      if (currentState === "SCHEDULE_NAME") {
        setScheduleData((p) => ({ ...p, name: text }));
        nextState = "SCHEDULE_PHONE";
      } else if (currentState === "SCHEDULE_PHONE") {
        setScheduleData((p) => ({ ...p, phone: text }));
        nextState = "SCHEDULE_EMAIL";
      } else if (currentState === "SCHEDULE_EMAIL") {
        setScheduleData((p) => ({ ...p, email: text }));
        nextState = "SCHEDULE_DATE";
      }

      setCurrentState(nextState);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text,
          sender: "user",
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          text: chatFlow.states[nextState].message,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);

      setInputValue("");
      return;
    }

    /** 🤖 NORMAL AI FLOW */
    setUserTyped(true);
    setShowOptions(false);

    setMessages((p) => [
      ...p,
      {
        id: Date.now().toString(),
        text,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    sendMessage(text);
    setIsTyping(true);
    setInputValue("");
  };

  const today = new Date();
  const minDate = new Date(today.setDate(today.getDate() + 1))
    .toISOString()
    .split("T")[0];

  const maxDate = new Date(new Date().setDate(new Date().getDate() + 15))
    .toISOString()
    .split("T")[0];

  /** AI RESPONSE */
  useEffect(() => {
    if (!response || response === lastResponse) return;

    setLastResponse(response);
    setIsTyping(false);

    setMessages((p) => [
      ...p,
      {
        id: Date.now().toString(),
        text: response,
        sender: "bot",
        timestamp: new Date(),
      },
    ]);

    setShowBackButton(true);
  }, [response]);

  const goToMainMenu = () => {
    setCurrentState(chatFlow.start_state);
    setScheduleData({});
    setShowOptions(true);
    setShowBackButton(false);
  };

  const formatDateTimeReadable = (startTime: string) => {
    const dateObj = new Date(startTime.replace(" ", "T"));

    const date = dateObj.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const time = dateObj.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { date, time };
  };

  return (
    <div
      className="flex flex-col h-full bg-background rounded-lg overflow-hidden"
      style={{
        backgroundImage: `url(${chatBackdrop})`,
        backgroundSize: "cover",
      }}
    >
      <ChatHeader onClose={onClose} />

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}

          {isTyping && <TypingIndicator />}

          {/* 🗓 DATE SELECTION */}
          {/* 📅 CALENDAR DATE PICKER */}
          {currentState === "SCHEDULE_DATE" && (
            <div className="bg-card border rounded-xl p-4 max-w-sm">
              <label className="text-sm font-medium mb-2 block">
                Choose Date
              </label>

              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={scheduleData.date || ""}
                onChange={(e) =>
                  setScheduleData((p) => ({ ...p, date: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm"
              />

              <Button
                className="mt-3 w-full"
                disabled={!scheduleData.date}
                onClick={() => {
                  setCurrentState("SCHEDULE_SLOT");

                  setMessages((prev) => [
                    ...prev,
                    {
                      id: Date.now().toString(),
                      text: chatFlow.states["SCHEDULE_SLOT"].message,
                      sender: "bot",
                      timestamp: new Date(),
                    },
                  ]);
                }}
              >
                Continue
              </Button>
            </div>
          )}

          {/* 🕒 SLOT SELECTION */}
          {currentState === "SCHEDULE_SLOT" && (
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const start_time = `${scheduleData.date} ${slot}`;

                    const payload = {
                      name: scheduleData.name,
                      phone: scheduleData.phone,
                      email: scheduleData.email,
                      topic: "Study Abroad Counselling Session",
                      start_time, // YYYY-MM-DD HH:mm
                    };

                    // Show typing while booking
                    setIsTyping(true);

                    try {
                      const res = await BookingService.createBooking(payload);

                      setIsTyping(false);

                      if (res.success) {
                        const { date, time } =
                          formatDateTimeReadable(start_time);

                        setMessages((prev) => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            text: `✅ Your meeting has been successfully booked!
                                  🗓 Date: ${date}
                                  ⏰ Time: ${time}

                                  📧 The meeting link and details have been sent to your registered email.
                                  Please check your inbox (and spam folder if needed).

                                  We look forward to speaking with you 😊`,
                            sender: "bot",
                            timestamp: new Date(),
                          },
                        ]);

                        goToMainMenu();
                      } else {
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            text: `⚠️ Unable to book meeting:\n${res.error}`,
                            sender: "bot",
                            timestamp: new Date(),
                          },
                        ]);
                      }
                    } catch (err: any) {
                      setIsTyping(false);

                      setMessages((prev) => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          text: "❌ Something went wrong while booking the meeting.\nPlease try another slot or come back later.",
                          sender: "bot",
                          timestamp: new Date(),
                        },
                      ]);
                    }
                  }}
                >
                  {slot}
                </Button>
              ))}
            </div>
          )}

          {/* NORMAL OPTIONS */}
          {showOptions &&
            chatFlow.states[currentState]?.buttons?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {chatFlow.states[currentState].buttons.map((btn) => (
                  <Button
                    key={btn.id}
                    size="sm"
                    variant="outline"
                    onClick={() => handleStateButtonClick(btn.id)}
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            )}

          {showBackButton && (
            <Button size="sm" variant="secondary" onClick={goToMainMenu}>
              🔙 Back to Main Menu
            </Button>
          )}
        </div>
      </ScrollArea>

      {/* INPUT */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <textarea
            ref={textAreaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && handleSendMessage()
            }
            className="flex-1 resize-none border rounded-md p-2 text-sm"
            placeholder="Type your message…"
          />
          <Button onClick={handleSendMessage} size="icon">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
