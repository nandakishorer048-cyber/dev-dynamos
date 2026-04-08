import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Bell, MessageSquare, Shield, User, FileText, Heart, Clock } from 'lucide-react';

export const ProductPreview: React.FC = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-12 mb-20 px-4">
      {/* Glow Effect Background */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-blue-400/10 to-emerald-400/20 blur-3xl opacity-50 -z-10" />
      
      <motion.div 
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true }}
        className="relative rounded-3xl border border-white/20 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden"
      >
        {/* Mock OS Header */}
        <div className="h-10 border-b border-white/10 bg-white/5 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
          </div>
          <div className="mx-auto text-[10px] text-white/30 font-medium tracking-widest uppercase">Diagnyx Intelligence Dashboard</div>
        </div>

        <div className="grid grid-cols-12 h-[500px]">
          {/* Sidebar Mock */}
          <div className="col-span-3 border-r border-white/10 bg-white/5 p-4 space-y-6 hidden md:block">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400" />
              <div className="space-y-1">
                <div className="h-2 w-16 bg-white/20 rounded" />
                <div className="h-1.5 w-10 bg-white/10 rounded" />
              </div>
            </div>
            
            <div className="space-y-2">
              {[Activity, MessageSquare, FileText, Heart, Clock, Shield].map((Icon, i) => (
                <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${i === 0 ? 'bg-primary/20 text-primary' : 'text-white/40'}`}>
                  <Icon className="w-4 h-4" />
                  <div className={`h-2 rounded ${i === 0 ? 'w-20 bg-primary/40' : 'w-16 bg-white/10'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Mock */}
          <div className="col-span-12 md:col-span-9 bg-slate-950/50 p-6 overflow-hidden">
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Left Panel: Vitals/Summary */}
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-24 bg-white/20 rounded" />
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="h-8 w-32 bg-gradient-to-r from-white/20 to-transparent rounded" />
                  <div className="h-16 w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <svg viewBox="0 0 100 20" className="w-full h-8 px-4 stroke-emerald-400 fill-none stroke-[1.5]">
                          <path d="M0,10 L10,10 L15,5 L20,15 L25,10 L40,10 L45,2 L50,18 L55,10 L70,10 L75,13 L80,7 L85,10 L100,10" />
                       </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="h-3 w-20 bg-white/20 rounded" />
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-white/10 rounded" />
                    <div className="h-2 w-[90%] bg-white/10 rounded" />
                    <div className="h-2 w-[75%] bg-white/10 rounded" />
                  </div>
                </div>
              </div>

              {/* Right Panel: AI Insights */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <div className="w-4 h-4 bg-primary rounded-full animate-ping" />
                   </div>
                </div>
                
                <div className="space-y-4 h-full">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                       <MessageSquare className="w-3 h-3 text-primary" />
                    </div>
                    <div className="h-3 w-24 bg-primary/30 rounded" />
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-2">
                       <div className="w-6 h-6 rounded-full bg-white/5" />
                       <div className="h-10 flex-1 bg-white/5 rounded-xl rounded-tl-none" />
                    </div>
                    <div className="flex gap-2 justify-end">
                       <div className="h-14 w-[80%] bg-primary/20 border border-primary/30 rounded-xl rounded-tr-none p-2 space-y-2">
                          <div className="h-1.5 w-full bg-primary/30 rounded" />
                          <div className="h-1.5 w-[90%] bg-primary/30 rounded" />
                          <div className="h-1.5 w-[70%] bg-primary/30 rounded" />
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-6 h-6 rounded-full bg-white/5" />
                       <div className="h-16 flex-1 bg-white/5 rounded-xl rounded-tl-none p-2 space-y-2">
                          <div className="h-1.5 w-full bg-white/10 rounded" />
                          <div className="h-1.5 w-[85%] bg-white/10 rounded" />
                          <div className="h-1.5 w-full bg-white/10 rounded" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
