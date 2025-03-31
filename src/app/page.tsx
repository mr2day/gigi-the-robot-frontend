'use client';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const assistantMessage: Message = { role: 'assistant', content: '' };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
    setLoading(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userMessage.content }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: updated[updated.length - 1].content + chunk,
        };
        return updated;
      });
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    containerRef.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-[#343541] text-white">
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
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Send a message"
            className="w-full resize-none min-h-[3rem] bg-[#40414f] text-white border border-gray-600 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-white"
          />
          {loading && (
            <div className="text-sm text-gray-400 mt-2 animate-pulse px-1">
              Generating response...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
