import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, DollarSign, Code2, ArrowDown } from 'lucide-react';

const features = [
  { icon: Zap, label: 'AI-Powered', desc: 'GPT-4o architecture planning' },
  { icon: Shield, label: 'Production-Ready', desc: 'Industry-grade configurations' },
  { icon: DollarSign, label: 'INR Cost Estimates', desc: 'Transparent pricing breakdown' },
  { icon: Code2, label: 'Terraform IaC', desc: 'Ready-to-deploy HCL code' },
];

export default function HeroSection({ onGetStarted }) {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 pt-12 pb-8 overflow-hidden">
      {/* Background orbs */}
      <div className="hero-orb w-[600px] h-[600px] bg-violet-600 -top-32 left-1/2 -translate-x-1/2" />
      <div className="hero-orb w-[400px] h-[400px] bg-cyan-500 top-1/2 -right-48" />
      <div className="hero-orb w-[300px] h-[300px] bg-violet-800 bottom-0 -left-32" />

      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-6"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
        Powered by GPT-4o · AWS & Azure Support
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-5xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 max-w-5xl"
      >
        Design Cloud
        <br />
        <span className="gradient-text">Infrastructure</span>
        <br />
        with{' '}
        <span className="relative">
          <span className="text-white">AI</span>
          <motion.span
            className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10"
      >
        Describe your application requirements. InfraGen AI generates a complete
        production-ready cloud architecture, INR cost breakdown, and Terraform
        Infrastructure-as-Code — instantly.
      </motion.p>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 max-w-3xl w-full"
      >
        {features.map(({ icon: Icon, label, desc }, i) => (
          <motion.div
            key={label}
            whileHover={{ y: -3, scale: 1.02 }}
            className="glass-card p-4 text-left cursor-default"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/30 to-cyan-500/20 flex items-center justify-center mb-3">
              <Icon size={16} className="text-violet-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">{label}</p>
            <p className="text-[11px] text-slate-500">{desc}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onGetStarted}
        className="btn-primary text-base px-8 py-4 flex items-center gap-2"
      >
        Start Designing
        <ArrowDown size={18} className="animate-bounce" />
      </motion.button>
    </section>
  );
}
