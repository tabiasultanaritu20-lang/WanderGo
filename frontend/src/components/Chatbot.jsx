import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your Travel Advisor. How can I help you plan your next adventure today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  const formatAssistantNode = (text) => {
    let t = (text || '').trim();
    t = t.replace(/^---+\s*$/gm, '');
    t = t.replace(/^#{1,6}\s+/gm, '');
    t = t.replace(/\*\*([^*]+)\*\*/g, '$1');
    t = t.replace(/\*([^*]+)\*/g, '$1');
    t = t.replace(/_([^_]+)_/g, '$1');
    t = t.replace(/^\s*[-*]\s+/gm, '• ');
    t = t.replace(/\n{3,}/g, '\n\n');
    const paragraphs = t.split(/\n{2,}/);
    return paragraphs.map((p, idx) => (
      <p key={idx} className="whitespace-pre-line mb-2 leading-relaxed">{p.trim()}</p>
    ));
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const navigationAction = checkNavigationKeywords(userMsg.content);
      
      const res = await axios.post(`${API_BASE}/chat`, { 
        message: userMsg.content,
        history: messages // Pass conversation history
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
      
      const assistantNav = checkNavigationKeywords(res.data.reply);
      const navigateAction = navigationAction || assistantNav;
      if (navigateAction) navigateAction();
      
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "I apologize, but I'm having a little trouble connecting right now. Could you please try asking that again?" }]);
    }
    
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const checkNavigationKeywords = (text) => {
    const t = text.toLowerCase();
    
    if (t.includes('visa') || t.includes('document') || t.includes('passport')) {
      return () => navigate('/visa-docs');
    }
    if (t.includes('book') || t.includes('package')) {
      return () => navigate('/packages');
    }
    if (t.includes('emergency') || t.includes('help') || t.includes('police')) {
      return () => navigate('/emergency');
    }
    if (t.includes('spot') || t.includes('visit')) {
      return () => navigate('/spots');
    }
    if (t.includes('blog') || t.includes('news') || t.includes('article')) {
      return () => navigate('/blogs');
    }
    if (t.includes('navigate: /')) {
      const match = t.match(/navigate:\s*(\/[-a-z0-9/]+)/);
      if (match && match[1]) {
        const route = match[1];
        return () => navigate(route);
      }
    }
    return null;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
        >
          <span className="text-2xl">✈️</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✈️</span>
              <div>
                <h3 className="font-bold">Travel Advisor</h3>
                <p className="text-xs text-indigo-200">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`mb-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none whitespace-pre-wrap' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}>
                  {m.role === 'assistant' ? formatAssistantNode(m.content) : m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm resize-none overflow-hidden"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ minHeight: '40px' }}
            />
            <button type="submit" className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition h-10 w-10 flex items-center justify-center shrink-0">
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
