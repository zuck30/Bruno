import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  ChevronDown,
  Wifi,
  Battery,
  Signal,
  Map,
  Mountain,
  Landmark,
  UtensilsCrossed,
  Users,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBrunoResponse } from '@/lib/gemini';

type Msg = { role: 'user' | 'model'; text: string; time: string };

const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ── Typing dots ── */
const TypingDots = () => (
  <div className="flex items-center gap-[5px] px-1 py-0.5">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-[7px] h-[7px] rounded-full"
        style={{ background: 'rgba(42,31,22,0.35)' }}
        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

/* ── Avatar ── */
const Avatar = ({ size = 36 }: { size?: number }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ background: 'conic-gradient(from 0deg, #1F2937 0%, rgba(42,31,22,0.3) 50%, #1F2937 100%)' }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
    />
    <div
      className="absolute inset-[2px] rounded-full flex items-center justify-center"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <Map size={size * 0.45} color="#1F2937" />
    </div>
  </div>
);

/* ── Message bubble ── */
const Bubble = ({ msg, isLast }: { msg: Msg; isLast: boolean }) => {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
      className={cn('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && <Avatar size={28} />}
      <div className={cn('flex flex-col gap-0.5', isUser ? 'items-end' : 'items-start', 'flex-1', isUser ? 'max-w-[85%]' : 'max-w-[85%]')}>
        <div
          className="px-4 py-2.5 text-[13.5px] leading-[1.55] shadow-sm w-full"
          style={
            isUser
              ? {
                  background: '#1F2937',
                  color: 'white',
                  borderRadius: '20px 20px 5px 20px',
                }
              : {
                  background: 'transparent',
                  color: '#1a1108',
                  borderRadius: '20px 20px 20px 5px',
                  padding: '4px 4px 4px 0',
                }
          }
        >
          <div className="whitespace-pre-wrap break-words">{msg.text}</div>
        </div>
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px]" style={{ color: 'rgba(42,31,22,0.3)' }}>{msg.time}</span>
          {isUser && isLast && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[10px]"
              style={{ color: 'rgba(42,31,22,0.4)' }}
            >✓✓</motion.span>
          )}
        </div>
      </div>
      {isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px]"
          style={{ background: 'rgba(42,31,22,0.08)', border: '1px solid rgba(42,31,22,0.1)' }}
        >
          👤
        </div>
      )}
    </motion.div>
  );
};

const quickPrompts = [
  { icon: <Map size={16} />, label: 'Regions & geography' },
  { icon: <Mountain size={16} />, label: 'Wildlife & nature' },
  { icon: <Landmark size={16} />, label: 'History & independence' },
  { icon: <UtensilsCrossed size={16} />, label: 'Food & traditions' },
  { icon: <Users size={16} />, label: 'People & culture' },
  { icon: <Lightbulb size={16} />, label: 'General facts' },
];

const BrunoChat = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [clockTime, setClockTime] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const tick = () => setClockTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 500);
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput('');
    
    const userMsg: Msg = { role: 'user', text: msg, time: getTime() };
    const currentMessages = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    try {
      const apiHistoryPayload = currentMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const replyText = await getBrunoResponse(apiHistoryPayload);

      setMessages(prev => [...prev, { role: 'model', text: replyText, time: getTime() }]);
    } catch (err) {
      console.error("Bruno Error:", err);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I lost connection. Try asking me again!', time: getTime() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="chat-window relative z-10 flex flex-col overflow-hidden mx-auto"
      style={{
        width: '100%',
        maxWidth: '390px',
        height: 'min(780px, 85vh)',
        borderRadius: '52px',
        border: '10px solid #1a120b',
        boxShadow: '0 50px 120px rgba(0,0,0,0.25)',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
      }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: 'inherit', zIndex: 0 }}>
        <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full opacity-15" style={{ background: '#1F2937', filter: 'blur(40px)' }} />
        <div className="absolute -bottom-8 -right-8 w-56 h-56 rounded-full opacity-10" style={{ background: '#1F2937', filter: 'blur(50px)' }} />
      </div>

      {/* Dynamic Island */}
      <div className="relative z-10 flex justify-center pt-3 pb-1 shrink-0">
        <div
          className="flex items-center justify-between px-4"
          style={{ width: 126, height: 34, background: '#1F2937', borderRadius: 20 }}
        >
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="relative z-10 flex items-center justify-between px-7 py-1 shrink-0">
        <span className="text-[#1F2937] text-[12px] font-bold tracking-tight">{clockTime}</span>
        <div className="flex items-center gap-1.5">
          <Signal size={12} style={{ color: '#1F2937' }} />
          <Wifi size={12} style={{ color: '#1F2937' }} />
          <Battery size={14} style={{ color: '#1F2937' }} />
        </div>
      </div>
      
      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {/* Welcome state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center pt-2 pb-2 space-y-5"
          >
            <Avatar size={64} />
            <div className="text-center space-y-1.5">
              <p className="font-bold text-[17px]" style={{ color: '#1F2937' }}>Mambo! I'm Bruno</p>
              <p className="text-[12.5px] leading-relaxed max-w-[280px] mx-auto" style={{ color: 'rgba(42,31,22,0.45)' }}>
                Your friendly companion who knows everything about Tanzania. Ask me anything.
              </p>
            </div>

            <div className="px-4 py-1.5 text-[10px] tracking-widest uppercase" style={{ background: 'rgba(42,31,22,0.06)', borderRadius: 20, color: 'rgba(42,31,22,0.35)' }}>
              Today
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-end gap-2 w-full max-w-[85%]"
            >
              <Avatar size={28} />
              <div
                className="px-4 py-2.5 text-[13.5px] leading-relaxed flex-1"
                style={{ background: 'transparent', color: '#1a1108', padding: '4px 4px 4px 0' }}
              >
                What would you like to know about Tanzania today?
              </div>
            </motion.div>

            {/* Quick prompts grid */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {quickPrompts.map((q, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.06 }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSend(q.label)}
                  className="flex items-center gap-2 px-3 py-2.5 text-left text-[11.5px] font-medium transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 14,
                    border: '1px solid rgba(42,31,22,0.09)',
                    color: '#1F2937',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  {q.icon}
                  <span className="leading-tight">{q.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.length > 0 && (
          <div className="flex justify-center">
            <div className="px-4 py-1.5 text-[10px] tracking-widest uppercase" style={{ background: 'rgba(42,31,22,0.06)', borderRadius: 20, color: 'rgba(42,31,22,0.35)' }}>
              Today
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <Bubble key={idx} msg={msg} isLast={idx === messages.length - 1} />
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
            <Avatar size={28} />
            <div className="px-2 py-2"><TypingDots /></div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div
        className="relative z-10 px-4 pt-3 shrink-0"
        style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(42,31,22,0.07)',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
        }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2"
          style={{ background: 'rgba(42,31,22,0.05)', borderRadius: 26, border: '1px solid rgba(42,31,22,0.09)' }}
        >
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-7 h-7 flex items-center justify-center" style={{ color: 'rgba(42,31,22,0.3)' }}>
            <Mic size={16} />
          </motion.button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask Bruno anything..."
            className="flex-1 bg-transparent text-[13.5px] outline-none"
            style={{ color: '#1F2937' }}
          />

          <AnimatePresence mode="wait">
            {input.trim() ? (
              <motion.button
                key="send"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 45 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSend()}
                disabled={isLoading}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
                style={{ background: '#1F2937' }}
              >
                <Send size={14} />
              </motion.button>
            ) : (
              <motion.span key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-[17px] select-none">
                🇹🇿
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-3 mb-1">
          <div className="w-28 h-[5px] rounded-full" style={{ background: 'rgba(42,31,22,0.18)' }} />
        </div>
      </div>
    </motion.div>
  );
};

export default BrunoChat;