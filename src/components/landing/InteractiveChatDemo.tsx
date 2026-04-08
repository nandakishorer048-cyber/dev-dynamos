import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Sparkles, User, Brain, HeartPulse } from 'lucide-react';

export const InteractiveChatDemo: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const demoScript = [
    { role: 'user', text: "I've been having mild headaches and feeling a bit warm lately. Should I be concerned?", delay: 1000 },
    { role: 'ai', text: "I understand you're feeling unwell. Headaches combined with a warm sensation (feverishness) can be caused by many factors, from simple dehydration to mild viral infections.", delay: 2000 },
    { role: 'ai', text: "Based on common patterns, I recommend checking your temperature and ensuring you're drinking plenty of fluids. Have you noticed any other symptoms like a sore throat or fatigue?", delay: 1500 },
    { role: 'user', text: "Actually, yes, I'm feeling quite tired and my throat is a bit scratchy.", delay: 2000 },
    { role: 'ai', text: "Thank you for that detail. The combination of headache, feverishness, fatigue, and sore throat suggests a possible upper respiratory concern.", delay: 2000 },
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentIdx = 0;

    const runDemo = () => {
      if (currentIdx >= demoScript.length) return;

      const nextMsg = demoScript[currentIdx];
      setIsTyping(true);

      timeout = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { role: nextMsg.role as 'user' | 'ai', text: nextMsg.text }]);
        currentIdx++;
        if (currentIdx < demoScript.length) {
          setTimeout(runDemo, demoScript[currentIdx].delay);
        }
      }, 1500);
    };

    const initialDelay = setTimeout(runDemo, 2000);

    return () => {
        clearTimeout(timeout);
        clearTimeout(initialDelay);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
           <div className="text-center mb-12 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2"
              >
                <Brain className="w-3.5 h-3.5" />
                Live Demo Preview
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tight">
                Try clinical-grade <span className="text-primary italic">AI Conversations.</span>
              </h2>
              <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
                No appointment needed. Talk to Diagnyx AI about your symptoms or medical questions in an instant, natural dialogue.
              </p>
           </div>

           <div className="relative p-1 rounded-[40px] bg-gradient-to-br from-primary/20 via-blue-200 to-emerald-200 shadow-2xl">
              <div className="bg-slate-50 rounded-[38px] border border-white/50 overflow-hidden flex flex-col h-[600px]">
                 {/* Chat Header */}
                 <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                          <Sparkles className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="font-black text-slate-900">Diagnyx Clinical AI</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Available 24/7</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                          <HeartPulse className="w-5 h-5" />
                       </button>
                    </div>
                 </div>

                 {/* Chat Body */}
                 <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                    <AnimatePresence mode="popLayout">
                       {messages.map((msg, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
                          >
                             {msg.role === 'ai' && (
                               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-1">
                                  <Sparkles className="w-4 h-4 text-primary" />
                               </div>
                             )}
                             <div className={`max-w-[80%] p-4 rounded-2xl font-medium text-sm leading-relaxed ${
                                msg.role === 'user' 
                                ? 'bg-slate-900 text-white rounded-br-none shadow-lg' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                             }`}>
                                {msg.text}
                             </div>
                             {msg.role === 'user' && (
                               <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center mb-1">
                                  <User className="w-4 h-4 text-slate-500" />
                               </div>
                             )}
                          </motion.div>
                       ))}
                       {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex justify-start gap-3"
                          >
                             <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                             </div>
                             <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none flex gap-1">
                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>

                 {/* Chat Footer */}
                 <div className="p-6 bg-white border-t border-slate-200">
                    <div className="relative group">
                       <input 
                        readOnly 
                        type="text" 
                        placeholder="Ask anything about your health..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 pr-14 text-sm font-semibold text-slate-400 cursor-not-allowed focus:outline-none transition-all group-hover:border-primary/30"
                       />
                       <button className="absolute right-2 top-2 p-3 bg-primary rounded-xl text-white shadow-lg shadow-primary/20 opacity-50 cursor-pointer">
                          <Send className="w-5 h-5" />
                       </button>
                    </div>
                    <p className="mt-4 text-[10px] text-center font-bold text-slate-300 uppercase tracking-widest">
                       Secure & Encrypted health consultation
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
