import React from 'react';
import { motion } from 'framer-motion';
import { Activity, MessageSquare, FileText, Heart, Clock, Shield, TrendingUp, Pill, Bell, ChevronRight, BarChart3 } from 'lucide-react';

export const ProductPreview: React.FC = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-12 mb-20 px-4">
      {/* Glow Effect Background */}
      <div className="absolute -inset-8 bg-gradient-to-r from-blue-200/40 via-primary/10 to-emerald-200/30 blur-3xl opacity-60 -z-10 rounded-[60px]" />
      
      <motion.div 
        initial={{ y: 60, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const }}
        viewport={{ once: true }}
        className="relative rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/50 overflow-hidden"
      >
        {/* Mock OS Header */}
        <div className="h-11 border-b border-slate-100 bg-slate-50/80 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto flex items-center gap-2 bg-white rounded-lg px-4 py-1 border border-slate-100 shadow-sm">
            <div className="w-3 h-3 rounded-full bg-emerald-400 flex items-center justify-center">
              <Shield className="w-2 h-2 text-white" />
            </div>
            <span className="text-[11px] text-slate-400 font-medium">diagnyx-ai.app/dashboard</span>
          </div>
        </div>

        <div className="grid grid-cols-12 min-h-[460px]">
          {/* Sidebar */}
          <div className="col-span-3 border-r border-slate-100 bg-slate-50/50 p-4 space-y-5 hidden md:flex md:flex-col">
            {/* User Profile */}
            <div className="flex items-center gap-3 px-2 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-primary/20">
                DA
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">Dashboard</div>
                <div className="text-[10px] text-slate-400">Welcome back</div>
              </div>
            </div>
            
            {/* Nav Items */}
            <div className="space-y-1 flex-1">
              {[
                { icon: Activity, label: 'Health Overview', active: true },
                { icon: FileText, label: 'My Reports', active: false },
                { icon: MessageSquare, label: 'AI Chat', active: false },
                { icon: Heart, label: 'Vitals', active: false },
                { icon: Pill, label: 'Medications', active: false },
                { icon: Bell, label: 'Reminders', active: false },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    item.active 
                      ? 'bg-primary/10 text-primary shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Bottom Card */}
            <div className="bg-gradient-to-br from-primary to-blue-500 rounded-xl p-3 text-white">
              <div className="text-[10px] font-semibold mb-1">AI Insights Ready</div>
              <div className="text-[9px] opacity-80 leading-relaxed">3 new health recommendations available</div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9 bg-slate-50/30 p-5 overflow-hidden">
            {/* Top Header Bar */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-base font-bold text-slate-800">Health Overview</div>
                <div className="text-[11px] text-slate-400">Last updated: Today, 2:30 PM</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold flex items-center gap-1.5 border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  All Normal
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Vitals Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Heart Rate</span>
                  <div className="flex items-center gap-1 text-emerald-500">
                    <TrendingUp className="w-3 h-3" />
                    <span className="text-[10px] font-bold">Normal</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900">72</span>
                  <span className="text-xs text-slate-400 font-medium">bpm</span>
                </div>
                {/* Pulse Line SVG */}
                <div className="h-12 w-full bg-gradient-to-b from-emerald-50 to-transparent rounded-xl relative overflow-hidden border border-emerald-100/50">
                  <svg viewBox="0 0 200 40" className="w-full h-full px-2" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,20 L20,20 L30,20 L35,8 L40,32 L45,12 L50,28 L55,20 L80,20 L90,20 L95,6 L100,34 L105,10 L110,30 L115,20 L140,20 L150,20 L155,7 L160,33 L165,11 L170,29 L175,20 L200,20" 
                      stroke="url(#pulseGrad)" 
                      fill="none" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* AI Summary Card */}
              <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-2xl border border-primary/10 p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
                    <MessageSquare className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">AI Health Summary</span>
                </div>
                
                <div className="space-y-2">
                  {/* Chat bubble - user */}
                  <div className="flex gap-2 justify-end">
                    <div className="bg-primary text-white rounded-xl rounded-tr-sm px-3 py-1.5 text-[10px] leading-relaxed max-w-[85%] shadow-sm">
                      What does my blood report say?
                    </div>
                  </div>
                  {/* Chat bubble - AI */}
                  <div className="flex gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-blue-400 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <Activity className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2 text-[10px] leading-relaxed text-slate-600 border border-slate-100 shadow-sm">
                      Your CBC results look great! Hemoglobin is 14.2 g/dL (normal range). White blood cells and platelets are all within healthy limits. ✨
                    </div>
                  </div>
                </div>
              </div>

              {/* Reports Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Recent Reports</span>
                  <span className="text-[10px] text-primary font-bold cursor-pointer flex items-center gap-0.5">
                    View all <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Blood Test Report', date: 'Apr 5', status: 'Analyzed', color: 'emerald' },
                    { name: 'Chest X-Ray', date: 'Mar 28', status: 'Normal', color: 'blue' },
                    { name: 'Lipid Profile', date: 'Mar 15', status: 'Review', color: 'amber' },
                  ].map((report, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          report.color === 'emerald' ? 'bg-emerald-50' : report.color === 'blue' ? 'bg-blue-50' : 'bg-amber-50'
                        }`}>
                          <FileText className={`w-3.5 h-3.5 ${
                            report.color === 'emerald' ? 'text-emerald-500' : report.color === 'blue' ? 'text-blue-500' : 'text-amber-500'
                          }`} />
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-slate-700">{report.name}</div>
                          <div className="text-[9px] text-slate-400">{report.date}</div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        report.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                        report.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medications Card */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Today's Medications</span>
                  <div className="text-[10px] text-slate-400 font-medium">2 of 3 taken</div>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'Vitamin D3', time: '8:00 AM', taken: true },
                    { name: 'Omega-3', time: '1:00 PM', taken: true },
                    { name: 'Multivitamin', time: '8:00 PM', taken: false },
                  ].map((med, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          med.taken 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-slate-50 border-slate-200'
                        }`}>
                          {med.taken ? (
                            <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className={`text-[11px] font-semibold ${med.taken ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {med.name}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-medium ${med.taken ? 'text-slate-300' : 'text-primary font-bold'}`}>
                        {med.time}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-primary to-emerald-400 h-1.5 rounded-full" style={{ width: '66%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
