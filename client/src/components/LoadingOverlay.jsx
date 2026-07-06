import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const steps = [
  'Analyzing your requirements...',
  'Consulting GPT-4o architecture engine...',
  'Selecting optimal cloud services...',
  'Calculating INR cost breakdown...',
  'Generating Terraform IaC code...',
  'Assembling your architecture plan...',
];

export default function LoadingOverlay() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-[500px] py-16"
    >
      {/* Animated rings */}
      <div className="relative w-24 h-24 mb-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{
              borderColor: i === 0 ? '#7C3AED' : i === 1 ? '#06B6D4' : '#F59E0B',
              borderTopColor: 'transparent',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.2 + i * 0.4,
              repeat: Infinity,
              ease: 'linear',
            }}
            initial={{ scale: 1 - i * 0.15, opacity: 1 - i * 0.2 }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-3">Designing Your Infrastructure</h3>

      <motion.p
        key={stepIndex}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="text-slate-400 text-sm mb-8"
      >
        {steps[stepIndex]}
      </motion.p>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-navy-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <p className="text-[11px] text-slate-700 mt-6">This may take 10-30 seconds</p>
    </motion.div>
  );
}
