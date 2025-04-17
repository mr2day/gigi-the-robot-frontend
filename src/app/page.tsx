"use client";
import DisplayFormattedText from "@/components/DisplayFormattedText";
import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wsUrl =
    process.env.NEXT_PUBLIC_WS_URL || "wss://api.gigi-the-robot.com";
  const conversationUrl =
    process.env.NEXT_PUBLIC_CONVERSATION_URL ||
    "https://api.gigi-the-robot.com/conversation";

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  useEffect(() => {
    fetch(conversationUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Conversation not found");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch((err) => console.log("No previous conversation found:", err));
  }, [conversationUrl]);

  useEffect(() => {
    const connectSocket = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => console.log("WebSocket connected");

      socket.onmessage = (event) => {
        if (event.data === "[END]") return setLoading(false);
        if (event.data === "[ERROR]") {
          setLoading(false);
          alert("Error generating response.");
          return;
        }

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + event.data,
          };
          return updated;
        });
      };

      socket.onclose = () => {
        console.warn("WebSocket closed. Reconnecting in 2 seconds...");
        reconnectTimeoutRef.current = setTimeout(connectSocket, 2000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        socket.close();
      };
    };

    connectSocket();
    return () => {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
    };
  }, [wsUrl]);

  const handleSend = () => {
    if (!input.trim() || loading || !socketRef.current) return;
    if (socketRef.current.readyState !== WebSocket.OPEN) {
      alert("WebSocket is not connected. Please wait...");
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    socketRef.current.send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages]);

  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }}
    >
      <div className="py-4 px-4 sticky top-0 w-full border-b border-b-slate-700">
        <div className="">
          <div className="flex items-center gap-3">
            <img
              src="/gigi-icon.png"
              alt="Gigi the robot"
              className="h-7"
            />
            <span className="font-bold text-lg">Gigi the Robot</span>
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth px-4 pt-10 pb-32"
      >
        <div className="flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-6">
            {messages.map((msg, i) =>
              msg.role === "assistant" && !msg.content.trim() ? null : (
                <div
                  key={i}
                  className="relative flex flex-col gap-2 items-start"
                >
                  {msg.role === "assistant" && (
                    <img
                      src="/gigi-icon.png"
                      alt="Gigi the robot"
                      className="w-7 h-5 absolute -top-7 -left-1"
                    />
                  )}
                  <div
                    className={`prose prose-invert text-left ${
                      msg.role === "user"
                        ? "rounded-xl px-4 py-3 bg-[#33353a] self-end max-w-[80%]"
                        : "w-full self-start"
                    }`}
                  >
                    <DisplayFormattedText content={msg.content} />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="py-8 -mx-2 sticky bottom-0 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Send a message"
              className="flex-grow resize-none min-h-[5rem] bg-[#33353a] rounded-xl py-3 px-4 focus:outline-none"
              style={{ overflow: "hidden" }}
            />
            <button
              className="send-button"
              onClick={handleSend}
              aria-label="Send message"
            ></button>
          </div>
          {loading && (
            <div className="text-sm text-gray-400 mt-2 animate-pulse px-1">
              Generating response...
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .send-button {
          background-color: #d3d3d3;
          border: none;
          outline: none;
          cursor: pointer;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          position: relative;
          transition: background-color 0.2s, box-shadow 0.2s;
        }
        .send-button:hover {
          background-color: #c0c0c0;
        }
        .send-button:focus {
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.6);
        }
        .send-button::before {
          content: "";
          display: inline-block;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-bottom: 6px solid transparent;
          border-left: 8px solid black;
        }
      `}</style>
    </div>
  );
}
