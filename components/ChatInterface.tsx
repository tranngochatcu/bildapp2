import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { GeminiService } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import toast from 'react-hot-toast';

interface ChatInterfaceProps {
  apiKey: string | null;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ apiKey, messages, setMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || !apiKey) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const gemini = new GeminiService(apiKey);

      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const responseText = await gemini.sendChatMessage(history, userMsg.content);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "⚠️ Đã xảy ra lỗi kết nối. Vui lòng kiểm tra API Key hoặc thử lại sau.",
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4 bg-white">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Hỏi đáp chuyên sâu</h2>
          <p className="text-sm text-slate-500">Hỗ trợ 5G, SDN, Giao thức mạng & Cấu hình thiết bị</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors" title="Xóa lịch sử" onClick={() => {
            if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat không?")) {
              setMessages([messages[0]]);
            }
          }}>
            <i className="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[95%] md:max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  }`}
              >
                <i className={`fa-solid ${msg.role === 'user' ? 'fa-user' : 'fa-robot'} text-xs`}></i>
              </div>

              {/* Bubble */}
              <div
                className={`overflow-hidden rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  } ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap text-sm md:text-base">{msg.content}</p>
                ) : (
                  <div className="text-sm md:text-base">
                    <MarkdownRenderer content={msg.content} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm">
                <i className="fa-solid fa-robot text-xs"></i>
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-none bg-white px-4 py-3 shadow-sm border border-slate-200">
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSendMessage} className="relative mx-auto max-w-4xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Nhập câu hỏi hoặc yêu cầu vẽ sơ đồ mạng..."
            className="w-full rounded-full border border-gray-300 bg-gray-50 py-3.5 pl-5 pr-14 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-600 p-2 text-white shadow-md hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none transition-all"
          >
            <i className="fa-solid fa-paper-plane px-1"></i>
          </button>
        </form>
        <div className="mt-2 text-center text-xs text-gray-400">
          AI có thể vẽ sơ đồ (Mermaid) và bảng biểu. Vui lòng kiểm chứng với tài liệu chuẩn.
        </div>
      </div>
    </div>
  );
};