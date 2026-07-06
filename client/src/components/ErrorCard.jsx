import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorCard({ error, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px] py-16 text-center px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
        <AlertCircle size={28} className="text-red-400" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">Generation Failed</h3>
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">{error}</p>

      <p className="text-xs text-slate-600 mb-4">
        The system will automatically use rule-based fallback if AI is unavailable.
      </p>

      {onRetry && (
        <button onClick={onRetry} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </motion.div>
  );
}
