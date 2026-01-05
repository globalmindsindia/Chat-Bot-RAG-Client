import { useState, useRef, useEffect } from "react";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { Send, ChevronDown } from "lucide-react";
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
  const [currentState, setCurrentState] = useState(() => {
    const saved = sessionStorage.getItem("chatState");
    return saved ? JSON.parse(saved) : chatFlow.start_state;
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem("chatMessages");
    if (saved) {
      return JSON.parse(saved).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
    return [
      {
        id: "1",
        text: chatFlow.states[chatFlow.start_state].message,
        sender: "bot",
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastResponse, setLastResponse] = useState("");
  const [userTyped, setUserTyped] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [bookingCompleted, setBookingCompleted] = useState(false);

  /** 🗓 Scheduling State */
  const [scheduleData, setScheduleData] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    date?: string;
    slot?: string;
  }>(() => {
    const saved = sessionStorage.getItem("scheduleData");
    return saved ? JSON.parse(saved) : {};
  });

  const isScheduling = currentState.startsWith("SCHEDULE");

  const { response, loading, error, sendMessage } = useChatWebSocket();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  /** PERSISTENCE */
  useEffect(() => {
    sessionStorage.setItem("chatState", JSON.stringify(currentState));
  }, [currentState]);

  useEffect(() => {
    sessionStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem("scheduleData", JSON.stringify(scheduleData));
  }, [scheduleData]);

  /** AUTO SCROLL - IMPROVED */
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;

    if (!viewport || !shouldAutoScroll) return;

    // Smooth scroll to bottom
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping, shouldAutoScroll]);

  // Handle scroll detection to determine if user is scrolling
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLElement;

    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold

      setShouldAutoScroll(isNearBottom);

      if (!isNearBottom) {
        setIsUserScrolling(true);
      } else {
        setIsUserScrolling(false);
      }
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset auto-scroll when user sends a message
  useEffect(() => {
    if (
      messages.length > 0 &&
      messages[messages.length - 1].sender === "user"
    ) {
      setShouldAutoScroll(true);
      setIsUserScrolling(false);
    }
  }, [messages]);

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
    intervalMinutes = 60
  ) => {
    const slots: string[] = [];

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min = 0; min < 60; min += intervalMinutes) {
        const h = hour.toString().padStart(2, "0");
        const m = min.toString().padStart(2, "0");
        slots.push(`${h}:${m}`);
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots(10, 20, 60);

  /** VALIDATION FUNCTIONS */
  const validateName = (name: string) => {
    if (name.length < 3) return "Name must be at least 3 characters long.";
    if (!/^[a-zA-Z\s]+$/.test(name))
      return "Name should only contain letters and spaces.";
    return null;
  };

  const validateEmail = (email: string) => {
    if (!email.endsWith("@gmail.com")) return "Email must end with @gmail.com";
    return null;
  };

  const validatePhone = (phone: string) => {
    if (phone.length !== 10) return "Phone number must be exactly 10 digits.";
    if (!/^\d+$/.test(phone)) return "Phone number should only contain digits.";
    if (/^[12345]/.test(phone))
      return "Phone number cannot start with 1, 2, 3, 4, or 5.";
    if (/(.)\1{4,}/.test(phone))
      return "Phone number cannot have more than 4 consecutive same digits.";
    return null;
  };

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
      let validationError = null;

      if (currentState === "SCHEDULE_NAME") {
        validationError = validateName(text);
        if (!validationError) {
          setScheduleData((p) => ({ ...p, name: text }));
          nextState = "SCHEDULE_PHONE";
        }
      } else if (currentState === "SCHEDULE_PHONE") {
        validationError = validatePhone(text);
        if (!validationError) {
          setScheduleData((p) => ({ ...p, phone: text }));
          nextState = "SCHEDULE_EMAIL";
        }
      } else if (currentState === "SCHEDULE_EMAIL") {
        validationError = validateEmail(text);
        if (!validationError) {
          setScheduleData((p) => ({ ...p, email: text }));
          nextState = "SCHEDULE_CONFIRM";
        }
      }

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
          text: validationError || chatFlow.states[nextState].message,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);

      if (!validationError) {
        setCurrentState(nextState);
      }

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
    setBookingCompleted(false);
    sessionStorage.removeItem("chatState");
    sessionStorage.removeItem("scheduleData");

    // Explicitly scroll to bottom
    setTimeout(() => {
      const viewport = scrollAreaRef.current?.querySelector(
        "[data-radix-scroll-area-viewport]"
      ) as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
      }
    }, 50); // A small delay to allow UI to update
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
      className="flex flex-col h-full bg-background rounded-lg overflow-hidden relative"
      style={{
        backgroundImage: `url(${chatBackdrop})`,
        backgroundSize: "cover",
      }}
    >
      <div className="absolute inset-0 bg-white/80 rounded-lg"></div>
      <div className="relative z-10 flex flex-col h-full">
        <ChatHeader onClose={onClose} />

        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}

            {isTyping && <TypingIndicator />}

            {/* CONFIRM DETAILS */}
            {currentState === "SCHEDULE_CONFIRM" && (
              <div className="bg-card border rounded-xl p-4 max-w-sm">
                <h3 className="font-medium mb-3">
                  Please confirm your details:
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    {editingField === "name" ? (
                      <input
                        type="text"
                        value={scheduleData.name || ""}
                        onChange={(e) =>
                          setScheduleData((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                        className="flex-1 border rounded px-2 py-1 mr-2"
                        autoFocus
                      />
                    ) : (
                      <span>Name: {scheduleData.name}</span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (editingField === "name") {
                          const error = validateName(scheduleData.name || "");
                          if (error) {
                            setEditError(error);
                            return;
                          }
                          setEditError(null);
                          setEditingField(null);
                        } else {
                          setEditingField("name");
                          setEditError(null);
                        }
                      }}
                    >
                      {editingField === "name" ? "Save" : "Edit"}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    {editingField === "phone" ? (
                      <input
                        type="text"
                        value={scheduleData.phone || ""}
                        onChange={(e) =>
                          setScheduleData((p) => ({
                            ...p,
                            phone: e.target.value,
                          }))
                        }
                        className="flex-1 border rounded px-2 py-1 mr-2"
                        autoFocus
                      />
                    ) : (
                      <span>Phone: {scheduleData.phone}</span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (editingField === "phone") {
                          const error = validatePhone(scheduleData.phone || "");
                          if (error) {
                            setEditError(error);
                            return;
                          }
                          setEditError(null);
                          setEditingField(null);
                        } else {
                          setEditingField("phone");
                          setEditError(null);
                        }
                      }}
                    >
                      {editingField === "phone" ? "Save" : "Edit"}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center">
                    {editingField === "email" ? (
                      <input
                        type="email"
                        value={scheduleData.email || ""}
                        onChange={(e) =>
                          setScheduleData((p) => ({
                            ...p,
                            email: e.target.value,
                          }))
                        }
                        className="flex-1 border rounded px-2 py-1 mr-2"
                        autoFocus
                      />
                    ) : (
                      <span>Email: {scheduleData.email}</span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (editingField === "email") {
                          const error = validateEmail(scheduleData.email || "");
                          if (error) {
                            setEditError(error);
                            return;
                          }
                          setEditError(null);
                          setEditingField(null);
                        } else {
                          setEditingField("email");
                          setEditError(null);
                        }
                      }}
                    >
                      {editingField === "email" ? "Save" : "Edit"}
                    </Button>
                  </div>
                </div>
                {editError && (
                  <p className="text-red-600 text-xs mt-2">{editError}</p>
                )}
                <Button
                  className="mt-4 w-full"
                  disabled={editingField !== null}
                  onClick={() => {
                    setCurrentState("SCHEDULE_DATE");
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: Date.now().toString(),
                        text: chatFlow.states["SCHEDULE_DATE"].message,
                        sender: "bot",
                        timestamp: new Date(),
                      },
                    ]);
                  }}
                >
                  Confirm & Continue
                </Button>
              </div>
            )}

            {/* DATE SELECTION */}
            {/* CALENDAR DATE PICKER */}
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
                              text: `Thank you for scheduling a counselling session with Global Minds India.

We've successfully shared your session details with your registered email address. Please check your inbox, and don't forget to look in the spam folder if you don't see it right away.

We're excited to connect with you and support you in shaping a successful future. See you soon!`,
                              sender: "bot",
                              timestamp: new Date(),
                            },
                          ]);

                          setCurrentState("BOOKING_DONE");
                          setBookingCompleted(true);
                          setShowOptions(false);
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

            {/* BOOKING COMPLETED - ONLY BACK BUTTON */}
            {bookingCompleted && (
              <Button size="sm" variant="secondary" onClick={goToMainMenu}>
                🔙 Back to Main Menu
              </Button>
            )}

            {/* NORMAL OPTIONS */}
            {!bookingCompleted &&
              showOptions &&
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

            {!bookingCompleted && showBackButton && (
              <Button size="sm" variant="secondary" onClick={goToMainMenu}>
                🔙 Back to Main Menu
              </Button>
            )}

            {/* SCHEDULING BACK BUTTON */}
            {!bookingCompleted && isScheduling && (
              <Button size="sm" variant="secondary" onClick={goToMainMenu}>
                🔙 Back to Main Menu
              </Button>
            )}
          </div>
        </ScrollArea>

        {/* INPUT */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <textarea
              ref={textAreaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSendMessage()
              }
              className="flex-1 resize-none border rounded-md p-2 text-sm h-10"
              placeholder="Type your message…"
              rows={1}
            />
            <Button onClick={handleSendMessage} size="icon">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
