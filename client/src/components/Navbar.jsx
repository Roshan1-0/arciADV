import React from 'react';
import { motion } from 'framer-motion';
import { Cloud } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-navy-950/80 border-b border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-glow-violet">
                <Cloud size={18} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-navy-950 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold gradient-text">InfraGen AI</h1>
              <p className="text-[10px] text-slate-500 -mt-0.5 leading-none">Cloud Design Studio</p>
            </div>
          </div>

          {/* Center badges */}
          <div className="hidden md:flex items-center gap-2">
            {['AWS', 'Azure', 'Terraform', 'GPT-4o'].map((badge) => (
              <span
                key={badge}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400"
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Connected
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
