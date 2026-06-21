import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  Wifi,
  Battery,
  Signal,
  Landmark,
  Users,
  Lightbulb,
  PenTool,
  Pyramid,
  ChefHat
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBrunoResponse } from '@/lib/deepseek';

type Msg = { role: 'user' | 'model'; text: string; time: string };

const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ── Typing dots ── */
const TypingDots = () => (
  <div className="flex items-center gap-[5px] px-1 py-0.5">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-[7px] h-[7px] rounded-full bg-tz-earth/35"
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
      className="absolute inset-[2px] rounded-full flex items-center justify-center bg-white/92 backdrop-blur-sm overflow-hidden"
    >
      <img src="/bot.png" alt="Bruno" className="w-full h-full object-cover" />
    </div>
  </div>
);

/* ── Streaming message bubble ── */
const StreamingBubble = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayText('');
    indexRef.current = 0;
    setIsComplete(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(prev => prev + text[indexRef.current]);
        indexRef.current++;
      } else {
        setIsComplete(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        onComplete();
      }
    }, 15);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.23, 1, 0.32, 1] }}
      className="flex items-end gap-2 justify-start"
    >
      <Avatar size={28} />
      <div className="flex flex-col items-start gap-0.5 max-w-[85%]">
        <div
          className="px-4 py-2.5 text-[13.5px] leading-[1.55] shadow-sm w-full bg-transparent text-[#1a1108] rounded-[20px_20px_20px_5px] pl-0"
        >
          <div className="whitespace-pre-wrap break-words">
            {displayText}
            {!isComplete && (
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-tz-dark animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-tz-earth/30">{getTime()}</span>
        </div>
      </div>
    </motion.div>
  );
};

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
      <div className={cn('flex flex-col gap-0.5 max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2.5 text-[13.5px] leading-[1.55] shadow-sm w-full',
            isUser
              ? 'bg-tz-dark text-white rounded-[20px_20px_5px_20px]'
              : 'bg-transparent text-[#1a1108] rounded-[20px_20px_20px_5px] pl-0'
          )}
        >
          <div className="whitespace-pre-wrap break-words">{msg.text}</div>
        </div>
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-tz-earth/30">{msg.time}</span>
          {isUser && isLast && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] text-tz-earth/40"
            >
              ✓✓
            </motion.span>
          )}
        </div>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-tz-earth/8 border border-tz-earth/10">
          <img src="/user.png" alt="User" className="w-full h-full object-cover" />
        </div>
      )}
    </motion.div>
  );
};

const quickPrompts = [
  { icon: <Pyramid size={16} />, label: 'Jiografia ya Tanzania', query: 'Bruno, Niambie kuhusu jiografia ya Tanzania' },
  { icon: <PenTool size={16} />, label: 'Shairi', query: 'Niandikie Shairi kuhusu Tanzania?' },
  { icon: <Landmark size={16} />, label: 'Historia na uhuru', query: 'Niambie Kuhusu Historia na Uhuru wa Tanzania' },
  { icon: <ChefHat size={16} />, label: 'Chakula na mila', query: 'Chakula Gani Kinapendwa sana Tanzania?' },
  { icon: <Users size={16} />, label: 'Watu na utamaduni', query: 'Nambie Kuhusu Watu na Utamaduni wa Kitanzania' },
  { icon: <Lightbulb size={16} />, label: 'Mambo ya kuvutia', query: 'Bruno Nipe facts 10 kuhusu Tanzania' },
];

const BrunoChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
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
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, streamingText, isStreaming]);

  const resetLoadingStates = useCallback(() => {
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const handleStreamComplete = useCallback(() => {
    if (streamingText) {
      setMessages(prev => [...prev, { role: 'model', text: streamingText, time: getTime() }]);
      setStreamingText('');
    }
    resetLoadingStates();
  }, [streamingText, resetLoadingStates]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;
    setInput('');
    
    const userMsg: Msg = { role: 'user', text: msg, time: getTime() };
    const currentMessages = [...messages, userMsg];
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingText('');
    
    try {
      const apiHistoryPayload = currentMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const fullReply = await getBrunoResponse(apiHistoryPayload);
      setStreamingText(fullReply);
      
    } catch (err) {
      console.error("Bruno Error:", err);
      const errorMsg = 'Samahani, nimepoteza muunganisho. Jaribu kuuliza tena!';
      setMessages(prev => [...prev, { role: 'model', text: errorMsg, time: getTime() }]);
      resetLoadingStates();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative z-10 flex flex-col overflow-hidden mx-auto w-full max-w-[390px] bg-white/55 backdrop-blur-[40px] border-[10px] border-[#1a120b] shadow-[0_50px_120px_rgba(0,0,0,0.25)]"
      style={{
        height: 'min(780px, 85vh)',
        borderRadius: '52px',
      }}
    >
      {/* Subtle Kitenge pattern overlay inside phone */}
      <div className="absolute inset-0 kitenge-bg opacity-[0.025] pointer-events-none" style={{ borderRadius: 'inherit', zIndex: 0 }} />

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ borderRadius: 'inherit', zIndex: 0 }}>
        <div className="absolute -top-8 -left-8 w-48 h-48 rounded-full bg-tz-dark/15 blur-[40px]" />
        <div className="absolute -bottom-8 -right-8 w-56 h-56 rounded-full bg-tz-dark/10 blur-[50px]" />
      </div>

      {/* Dynamic Island */}
      <div className="relative z-10 flex justify-center pt-3 pb-1 shrink-0">
        <div
          className="flex items-center justify-between px-4 w-[126px] h-[34px] bg-tz-dark rounded-[20px]"
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
        <span className="text-tz-dark text-[12px] font-bold tracking-tight">{clockTime}</span>
        <div className="flex items-center gap-1.5 text-tz-dark">
          <Signal size={12} />
          <Wifi size={12} />
          <Battery size={14} />
        </div>
      </div>
      
      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {/* Welcome state */}
        {messages.length === 0 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center pt-2 pb-2 space-y-5"
          >
            <div className="text-center space-y-1.5">
              <p className="font-bold text-[22px] text-tz-dark">Mambo! Mimi ni Bruno</p>
              <p className="text-[12.5px] leading-relaxed max-w-[280px] mx-auto text-tz-earth/45">
                Rafiki yako anayejua yote kuhusu Tanzania. We niulize chochote.
              </p>
            </div>

            <div className="px-4 py-1.5 text-[10px] tracking-widest uppercase bg-tz-earth/6 rounded-[20px] text-tz-earth/35">
              Leo
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex items-end gap-2 w-full max-w-[85%]"
            >
              <Avatar size={28} />
              <div className="px-4 py-2.5 text-[13.5px] leading-relaxed flex-1 bg-transparent text-[#1a1108] pl-0">
                Ungependa kujua nini kuhusu Tanzania leo?
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
                  onClick={() => handleSend(q.query)}
                  className="flex items-center gap-2 px-3 py-2.5 text-left text-[11.5px] font-medium transition-all bg-white/70 backdrop-blur-sm rounded-[14px] border border-tz-earth/9 text-tz-dark shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
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
            <div className="px-4 py-1.5 text-[10px] tracking-widest uppercase bg-tz-earth/6 rounded-[20px] text-tz-earth/35">
              Leo
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <Bubble key={idx} msg={msg} isLast={idx === messages.length - 1} />
        ))}

        {/* Streaming response */}
        {isStreaming && streamingText && (
          <StreamingBubble text={streamingText} onComplete={handleStreamComplete} />
        )}

        {/* Loading indicator */}
        {isLoading && !isStreaming && !streamingText && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
            <Avatar size={28} />
            <div className="px-2 py-2"><TypingDots /></div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div
        className="relative z-10 px-4 pt-3 shrink-0 bg-white/60 backdrop-blur-[20px] border-t border-tz-earth/7"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 bg-tz-earth/5 rounded-[26px] border border-tz-earth/9"
        >
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="w-7 h-7 flex items-center justify-center text-tz-earth/30">
            <Mic size={16} />
          </motion.button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Muulize Bruno chochote..."
            className="flex-1 bg-transparent text-[13.5px] outline-none text-tz-dark placeholder:text-tz-earth/40"
            disabled={isLoading || isStreaming}
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
                disabled={isLoading || isStreaming}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md bg-tz-dark"
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
          <div className="w-28 h-[5px] rounded-full bg-tz-earth/18" />
        </div>
      </div>
    </motion.div>
  );
};

export default BrunoChat;