'use client';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

  // Update viewport height CSS variable for mobile responsiveness
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  const connectSocket = () => {
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      if (event.data === '[END]') {
        setLoading(false);
        return;
      }
      if (event.data === '[ERROR]') {
        setLoading(false);
        alert('Error generating response.');
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
      console.warn('WebSocket closed. Reconnecting in 2 seconds...');
      reconnectTimeoutRef.current = setTimeout(connectSocket, 2000);
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      socket.close();
    };
  };

  useEffect(() => {
    connectSocket();
    return () => {
      socketRef.current?.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() || loading || !socketRef.current) return;
    if (socketRef.current.readyState !== WebSocket.OPEN) {
      alert('WebSocket is not connected. Please wait...');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    const assistantMessage: Message = { role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setLoading(true);

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    socketRef.current.send(input);
  };

  // Allow the default behavior (adding a newline) when pressing Enter.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Optionally, you can add a shortcut such as Ctrl+Enter to send
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize the textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages]);

  return (
    <div 
      className="flex flex-col bg-[#343541] text-white"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
    >
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth px-4 pt-10 pb-32"
      >
        <div className="flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-6">
            {messages.map((msg, i) =>
              msg.role === 'assistant' && !msg.content.trim() ? null : (
                <div key={i} className="flex flex-col gap-2 items-start">
                  <div className="w-32 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                    {msg.role === 'user' ? 'You:' : 'Gigi the robot:'}
                  </div>
                  <div
                    className={`w-full rounded-xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-[#2f3136] text-right'
                        : 'bg-[#444654] text-left'
                    }`}
                  >
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#343541] border-t border-gray-700 p-4 sticky bottom-0 w-full">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Send a message"
              className="flex-grow resize-none min-h-[3rem] bg-[#40414f] text-white border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-white"
              style={{ overflow: 'hidden' }}
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
          transition: background-color 0.2s;
        }
        .send-button:hover {
          background-color: #c0c0c0;
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
