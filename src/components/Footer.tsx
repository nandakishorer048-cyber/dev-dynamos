import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a1128] to-black text-slate-300 py-16 md:py-24 border-t border-blue-900/30">
      {/* Soft Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="container relative z-10 px-4 md:px-6 mx-auto"
      >
        {/* Top 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Column 1 (Brand) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                 <img src="/logo.png" alt="Diagnyx Logo" className="w-7 h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
               </div>
               <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                 Diagnyx AI
               </h3>
            </div>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base pr-4">
              Diagnyx AI leverages advanced artificial intelligence and multimodal data analysis to deliver accurate, fast, and reliable medical insights. Built to assist clinicians and enhance diagnostic precision, it acts as a smart companion in modern healthcare.
            </p>
          </div>

          {/* Column 2 (Founder) */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-6">Founder</h4>
            <div className="space-y-3">
              <p className="text-slate-300 font-medium">Nanda Kishore Routhu</p>
              <a href="mailto:nandakishorer048@email.com" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group w-fit">
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm">nandakishorer048@email.com</span>
              </a>
              <a href="https://www.linkedin.com/in/nanda-kishore-800b03383?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group w-fit">
                <Linkedin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Connect on LinkedIn</span>
              </a>
              <a href="https://www.instagram.com/diagnyx.ai/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors group w-fit">
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm">Connect on Instagram</span>
              </a>
            </div>
          </div>

          {/* Column 3 (Company) */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
            <div className="flex flex-col space-y-3">
              <Link to="/about" className="text-sm text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all w-fit">About</Link>
              <a href="mailto:contact@diagnyx.ai" className="text-sm text-slate-400 hover:text-blue-400 hover:translate-x-1 transition-all w-fit">
                Contact
              </a>
            </div>
          </div>
        </div>

        {/* Center Tagline */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 mb-12">
          <p className="text-xl md:text-2xl font-medium text-blue-100/90 tracking-wide">
            Smarter diagnostics. Better decisions.
          </p>
          <p className="text-sm text-blue-300/60 font-medium">
            ~ Diagnyx AI
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-center md:justify-between text-sm text-slate-500">
          <p className="text-center md:text-left w-full">
            &copy; 2026 Diagnyx AI Solutions Pvt Ltd. All rights reserved.
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
