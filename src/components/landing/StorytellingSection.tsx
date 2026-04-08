import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Sparkles, ChevronRight, Check } from 'lucide-react';

export const StorytellingSection: React.FC = () => {
  const [activeView, setActiveView] = useState<'before' | 'after'>('before');

  return (
    <section className="py-32 relative bg-slate-50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-[120px] -z-10" />

      <div className="container px-4 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 max-w-xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-xs"
          >
            <div className="h-px w-8 bg-primary/30" />
            Empowering Patients
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 leading-[1.1]">
            Medical reports are for doctors. <br />
            <span className="text-primary underline decoration-blue-100 underline-offset-8 italic">Diagnyx AI is for you.</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            We bridge the gap between complex clinical data and your understanding. Get instant, clear explanations of your health results without the medical jargon.
          </p>

          <div className="space-y-5">
             {[
               "Simplify medical terminology instantly",
               "Visualize your health trends over time",
               "Get actionable health recommendations",
               "Share summaries with your family effortlessly"
             ].map((text, i) => (
               <motion.div 
                 key={i} 
                 initial={{ opacity: 0, x: -10 }} 
                 whileInView={{ opacity: 1, x: 0 }} 
                 transition={{ delay: i * 0.1 }}
                 viewport={{ once: true }}
                 className="flex items-center gap-3"
               >
                 <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-emerald-600" />
                 </div>
                 <span className="font-semibold text-slate-700">{text}</span>
               </motion.div>
             ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group">
               Analyze Your First Report
               <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="relative group">
           <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           
           <div className="relative bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
              {/* Tab Switcher */}
              <div className="flex p-2 bg-slate-100/50">
                 <button 
                  onClick={() => setActiveView('before')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${activeView === 'before' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    <FileSearch className="w-4 h-4" />
                    Complex Report
                 </button>
                 <button 
                  onClick={() => setActiveView('after')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all ${activeView === 'after' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    <Sparkles className="w-4 h-4" />
                    Diagnyx Summary
                 </button>
              </div>

              <div className="p-8 flex-1 relative">
                 <AnimatePresence mode="wait">
                    {activeView === 'before' ? (
                      <motion.div
                        key="before"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6 font-mono text-[11px] leading-relaxed text-slate-400"
                      >
                         <div className="flex justify-between border-b border-slate-100 pb-2">
                            <span>PATIENT ID: DX-9204</span>
                            <span className="font-bold">LABORATORY RESULTS</span>
                         </div>
                         <div className="space-y-4">
                            {[
                               { l: "HEMOGLOBIN (HGB)", v: "14.2 g/dL", r: "13.5-17.5" },
                               { l: "GLUCOSE, FASTING", v: "108 mg/dL", r: "70-99", w: true },
                               { l: "BILIRUBIN, TOTAL", v: "0.8 mg/dL", r: "0.1-1.2" },
                               { l: "ALANINE AMINOTRANSFERASE (ALT)", v: "42 U/L", r: "7-56" },
                               { l: "CHOLESTEROL, TOTAL", v: "215 mg/dL", r: "<200", w: true },
                               { l: "LDL CHOLESTEROL", v: "134 mg/dL", r: "<100", w: true }
                            ].map((row, i) => (
                               <div key={i} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100">
                                  <div className="w-2/3">{row.l}</div>
                                  <div className={`w-1/6 font-bold text-right ${row.w ? 'text-red-400' : 'text-slate-600'}`}>{row.v}</div>
                                  <div className="w-1/6 text-right opacity-50">{row.r}</div>
                               </div>
                            ))}
                         </div>
                         <p className="text-[10px] leading-relaxed">
                            INTERPRETATION: Clinical correlation recommended. Elevated fasting plasma glucose and lipid profile (hyperlipidemia) noted. Possible metabolic syndrome markers. Verify glycemic status via HbA1c testing.
                         </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="after"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                      >
                         <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg">
                               <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                               <h4 className="font-black text-slate-900 leading-none">Your health at a glance</h4>
                               <p className="text-sm text-blue-700 mt-1 font-semibold">2 focus areas detected</p>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-2 opacity-5 text-amber-900 group-hover:opacity-10 transition-opacity">
                                  <FileSearch className="w-12 h-12" />
                               </div>
                               <h5 className="font-bold text-amber-900 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                  Sugar Levels (Fasting)
                               </h5>
                               <p className="text-sm text-amber-800 mt-1 font-medium leading-relaxed">
                                  Your fasting glucose is 108 mg/dL. This is slightly above the normal range (under 100). Consider reducing refined sugar intake this week.
                               </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 shadow-sm relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-2 opacity-5 text-red-900 group-hover:opacity-10 transition-opacity">
                                  <FileSearch className="w-12 h-12" />
                               </div>
                               <h5 className="font-bold text-red-900 flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                  Cholesterol (LDL)
                               </h5>
                               <p className="text-sm text-red-800 mt-1 font-medium leading-relaxed">
                                  Your "bad" cholesterol is at 134 mg/dL. Optimal level is below 100. Adding fiber-rich foods like oats can help lower this naturally.
                               </p>
                            </div>
                         </div>

                         <div className="pt-2">
                            <div className="bg-emerald-500 text-white p-3 rounded-xl text-center text-sm font-black shadow-lg shadow-emerald-500/20">
                               Score: 78/100 (Improving)
                            </div>
                         </div>
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
};
