'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User, ArrowRight, BookOpen, Loader2, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { ChatMessageResponse, Course } from '@/types';
import Link from 'next/link';

interface MessageItem {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  recommendedCourses?: Course[];
}

export default function AIChatWidget({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hello! I am your SkillPilot AI Career Advisor. Tell me your background skills and dream job (e.g. *Python to Backend Developer* or *Flutter Mobile App Developer*), and I will build your personalized course recommendation path!",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: MessageItem = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const data: ChatMessageResponse = await api.sendAIChatMessage(query);

      const botMsg: MessageItem = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.bot_response,
        recommendedCourses: data.recommended_courses,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `⚠️ Error communicating with AI Advisor: ${err.message || 'Please check backend server connection.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      
      {/* Responsive Height Modal Dialog Shell */}
      <div className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[88vh] h-[580px] my-auto bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900">
        
        {/* Top Header (Fixed Shrink 0) */}
        <div className="px-5 py-3.5 bg-[#0f172a] text-white border-b border-slate-800 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                SkillPilot AI Career Counselor
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Online</span>
                </span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">Powered by Google Gemini AI & Course Database</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Window (Flex 1 Scrollable Area) */}
        <div className="flex-1 min-h-0 p-4 sm:p-5 overflow-y-auto space-y-4 bg-[#f8fafc]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Course Recommendation Cards inside Bot Response */}
                {msg.recommendedCourses && msg.recommendedCourses.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <p className="text-[11px] font-black text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Recommended Database Courses:</span>
                    </p>
                    {msg.recommendedCourses.map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-amber-400 transition-colors shadow-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div>
                            <p className="text-xs font-black text-slate-900 line-clamp-1">{c.title}</p>
                            <p className="text-[11px] text-slate-600 font-semibold">
                              {c.level} • {Number(c.price) === 0 ? 'Free' : `$${c.price}`}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/courses/${c.slug}`}
                          onClick={onClose}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-amber-400 border border-amber-300 flex items-center justify-center shrink-0 shadow-sm">
                  <User className="w-4 h-4 text-slate-950 font-bold" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-bl-none p-3.5 text-xs sm:text-sm flex items-center space-x-2 font-semibold shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>SkillPilot AI is evaluating skills & course catalog...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills (Fixed Shrink 0) */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] text-slate-600 font-extrabold shrink-0">Prompts:</span>
          <button
            onClick={() => handleSend("I know Python and basic HTML. My goal is to become a Backend Developer.")}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 text-[11px] font-bold text-slate-800 border border-slate-300 shrink-0 shadow-xs"
          >
            🐍 Python Backend
          </button>
          <button
            onClick={() => handleSend("I know JavaScript and want to build backend server APIs.")}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 text-[11px] font-bold text-slate-800 border border-slate-300 shrink-0 shadow-xs"
          >
            ⚡ JavaScript Node.js
          </button>
          <button
            onClick={() => handleSend("I want to learn mobile app development using Flutter and Dart.")}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 text-[11px] font-bold text-slate-800 border border-slate-300 shrink-0 shadow-xs"
          >
            📱 Flutter Apps
          </button>
          <button
            onClick={() => handleSend("I know Linux and Docker. I want to become a DevOps engineer.")}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 text-[11px] font-bold text-slate-800 border border-slate-300 shrink-0 shadow-xs"
          >
            ☁️ DevOps & AWS
          </button>
        </div>

        {/* Input Form Bar (Fixed Shrink 0) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your skills & goal (e.g. 'I know Python, what should I learn for Backend?')"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-colors font-medium shadow-xs"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="px-4.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center transition-all shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
