'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Course, ChatMessageResponse } from '@/types';
import { Sparkles, Send, Loader2, BookOpen } from 'lucide-react';

export default function AiChatPage() {
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'bot'; text: string; courses?: Course[] }>
  >([
    {
      sender: 'bot',
      text: 'Hello! I am your SkillPilot AI Career Advisor. Ask me anything about skill pathways, recommended courses, or career transitions!',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const msgToSend = customMsg || chatInput;
    if (!msgToSend.trim() || chatLoading) return;

    setChatMessages((prev) => [...prev, { sender: 'user', text: msgToSend }]);
    if (!customMsg) setChatInput('');
    setChatLoading(true);

    try {
      const res: ChatMessageResponse = await api.sendAIChatMessage(msgToSend);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: res.bot_response || 'Here are the best skill tracks matched to your inquiry.',
          courses: res.recommended_courses,
        },
      ]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'I recommend exploring our Full Stack Web Development and AI Data Science pathways to advance your technical career.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px] animate-fadeIn">
      {/* Chat Header */}
      <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">SkillPilot Gemini AI Counselor</h3>
            <p className="text-[11px] text-slate-400 font-medium">Real-time career guidance & course recommendations</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
          Online & Ready
        </span>
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs font-bold text-slate-700">
        <span className="text-slate-400 text-[11px] shrink-0">Try asking:</span>
        {[
          'Suggest a path for Fullstack Backend',
          'What skills do I need for DevOps & AWS?',
          'Which course is best for beginners in AI?',
        ].map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(undefined, prompt)}
            className="px-3 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 shrink-0 text-slate-800 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              
              {/* Course Recommendations inside Bot response */}
              {msg.courses && msg.courses.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {msg.courses.map((c) => (
                    <Link
                      href={`/courses/${c.slug}`}
                      key={c.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{c.title}</h5>
                        <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{c.category_name || (typeof c.category === 'object' ? c.category?.name : String(c.category || ''))}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {chatLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-3 relative"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Describe your career goals or what you want to learn..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim()}
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
