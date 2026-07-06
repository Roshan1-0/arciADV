import React from 'react';
import { motion } from 'framer-motion';
import { Server, Database, HardDrive, Shield, Network, Activity, Cpu } from 'lucide-react';

const TYPE_CONFIG = {
  compute:     { icon: Cpu,      color: 'from-violet-600/20 to-violet-700/10', border: 'border-violet-500/30', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  database:    { icon: Database, color: 'from-cyan-600/20 to-cyan-700/10',    border: 'border-cyan-500/30',   text: 'text-cyan-400',   bg: 'bg-cyan-500/10'   },
  storage:     { icon: HardDrive,color: 'from-amber-600/20 to-amber-700/10',  border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/10'  },
  network:     { icon: Network,  color: 'from-emerald-600/20 to-emerald-700/10', border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  loadbalancer:{ icon: Server,   color: 'from-blue-600/20 to-blue-700/10',    border: 'border-blue-500/30',  text: 'text-blue-400',  bg: 'bg-blue-500/10'  },
  security:    { icon: Shield,   color: 'from-red-600/20 to-red-700/10',      border: 'border-red-500/30',   text: 'text-red-400',   bg: 'bg-red-500/10'   },
  monitoring:  { icon: Activity, color: 'from-pink-600/20 to-pink-700/10',    border: 'border-pink-500/30',  text: 'text-pink-400',  bg: 'bg-pink-500/10'  },
  cdn:         { icon: Network,  color: 'from-orange-600/20 to-orange-700/10',border: 'border-orange-500/30',text: 'text-orange-400',bg: 'bg-orange-500/10'},
  cache:       { icon: Cpu,      color: 'from-teal-600/20 to-teal-700/10',   border: 'border-teal-500/30',  text: 'text-teal-400',  bg: 'bg-teal-500/10'  },
};

function ServiceChip({ component, index }) {
  const config = TYPE_CONFIG[component.type] || TYPE_CONFIG.compute;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2, scale: 1.02 }}
      className={`glass-card p-3 flex items-start gap-3 border ${config.border}`}
    >
      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
        <Icon size={14} className={config.text} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white truncate">{component.service_name}</p>
        <p className="text-[11px] text-slate-500 truncate">{component.notes}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.text}`}>
            {component.type}
          </span>
          {component.count > 1 && (
            <span className="text-[10px] text-slate-600">×{component.count}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ArchitectureSummary({ explanation, components = [], meta }) {
  return (
    <div className="space-y-6">
      {/* Meta badges */}
      {meta && (
        <div className="flex flex-wrap gap-2">
          {[meta.provider, meta.region, meta.ai_powered ? 'GPT-4o' : 'Rule-based Fallback'].map((badge) => (
            <span key={badge} className="text-xs px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-slate-400">
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Explanation */}
      <div className="glass-card p-5">
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Architecture Overview</h4>
        <p className="text-slate-300 leading-relaxed text-sm">{explanation}</p>
      </div>

      {/* Components grid */}
      <div>
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          Selected Services ({components.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {components.map((comp, i) => (
            <ServiceChip key={i} component={comp} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
