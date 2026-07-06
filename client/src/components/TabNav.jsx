import React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, DollarSign, Code2, Layout } from 'lucide-react';

const TABS = [
  { id: 'summary', label: 'Summary', icon: Layout },
  { id: 'diagram', label: 'Diagram', icon: GitBranch },
  { id: 'cost', label: 'Cost', icon: DollarSign },
  { id: 'terraform', label: 'Terraform', icon: Code2 },
];

export default function TabNav({ activeTab, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-navy-950/50 rounded-xl border border-white/[0.06]">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
            activeTab === id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {activeTab === id && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 bg-violet-600/20 border border-violet-500/30 rounded-lg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <Icon size={13} className="relative z-10" />
          <span className="relative z-10 hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
