import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, EyeOff, FileCheck, CircleCheck } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const trustItems = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'Your medical data is encrypted at rest and in transit, accessible only to you.',
      color: 'blue'
    },
    {
      icon: EyeOff,
      title: 'Privacy-First Architecture',
      description: 'We never sell your data. Your health information is private property.',
      color: 'teal'
    },
    {
      icon: FileCheck,
      title: 'Medical Transparency',
      description: 'AI-assisted insights designed to complement, not replace, clinical advice.',
      color: 'emerald'
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-white/30">
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Reliability & Security
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 tracking-tight">
            Built on <span className="text-primary italic">Absolute Trust</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium">
            We handle your most sensitive data with bank-grade security and a privacy-first mindset.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-7 h-7 text-${item.color}-600`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                {item.title}
                <CircleCheck className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
           {/* Placeholder for security badges/logos */}
           <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-slate-200" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
           </div>
           <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-slate-200" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
           </div>
           <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-slate-200" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
           </div>
        </div>
      </div>
    </section>
  );
};
