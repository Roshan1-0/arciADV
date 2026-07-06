import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, DollarSign, Info } from 'lucide-react';
import { formatINR, formatINRShort } from '../utils/formatCost';

const CATEGORY_COLORS = {
  compute:    { bar: 'from-violet-500 to-violet-600',   text: 'text-violet-400'  },
  database:   { bar: 'from-cyan-500 to-cyan-600',       text: 'text-cyan-400'    },
  storage:    { bar: 'from-amber-500 to-amber-600',     text: 'text-amber-400'   },
  networking: { bar: 'from-emerald-500 to-emerald-600', text: 'text-emerald-400' },
  monitoring: { bar: 'from-pink-500 to-pink-600',       text: 'text-pink-400'    },
  security:   { bar: 'from-red-500 to-red-600',         text: 'text-red-400'     },
};

export default function CostBreakdown({ costData, runtimeMonths = 1 }) {
  if (!costData) return null;

  // Handle both old shape ({ monthly_inr }) and new API shape ({ summary, category_totals, breakdown })
  const summary = costData.summary || {};
  const categoryTotals = costData.category_totals || {};
  const breakdownRows = costData.breakdown || [];

  // Normalise values — prefer new shape, fall back to legacy
  const monthlyCost = summary.monthly_cost ?? costData.monthly_inr ?? 0;
  const totalRuntime = summary.total_runtime_cost ?? costData.total_runtime_inr ?? (monthlyCost * runtimeMonths);
  const baseCost = summary.base_cost ?? monthlyCost;
  const uptimeMultiplier = summary.uptime_multiplier ?? 1;
  const currency = summary.currency ?? costData.currency ?? 'INR';

  const maxCategory = Math.max(...Object.values(categoryTotals), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-5 border border-violet-500/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <DollarSign size={14} className="text-violet-400" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">Monthly Cost</span>
            </div>
            <p className="text-3xl font-black gradient-text">{formatINRShort(monthlyCost)}</p>
            <p className="text-xs text-slate-600 mt-1">{formatINR(monthlyCost)} / month</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5 border border-cyan-500/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Clock size={14} className="text-cyan-400" />
              </div>
              <span className="text-xs text-slate-500 uppercase tracking-wider">
                {runtimeMonths}-Month Total
              </span>
            </div>
            <p className="text-3xl font-black text-cyan-400">{formatINRShort(totalRuntime)}</p>
            <p className="text-xs text-slate-600 mt-1">{formatINR(totalRuntime)} total</p>
          </div>
        </motion.div>
      </div>

      {/* Uptime multiplier info */}
      {uptimeMultiplier > 1 && (
        <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
          <TrendingUp size={13} />
          Uptime SLA multiplier ×{uptimeMultiplier} applied (base: {formatINR(baseCost)}/mo)
        </div>
      )}

      {/* Category bars */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">By Category</h4>
          {Object.entries(categoryTotals)
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount], i) => {
              const config = CATEGORY_COLORS[cat] || CATEGORY_COLORS.compute;
              const pct = Math.round((amount / maxCategory) * 100);
              return (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className={`capitalize font-medium ${config.text}`}>{cat}</span>
                    <span className="text-slate-300 font-mono text-xs">{formatINR(amount)}</span>
                  </div>
                  <div className="h-1.5 bg-navy-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${config.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.07, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* Line items table */}
      {breakdownRows.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Line Items</h4>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-navy-950/50">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">Service</th>
                    <th className="text-center px-3 py-3 text-slate-500 font-medium">Qty</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">Unit/mo</th>
                    <th className="text-right px-4 py-3 text-slate-500 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownRows.map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="text-slate-200 font-medium">{row.service || row.name}</p>
                        {row.service !== row.name && <p className="text-slate-600 text-[10px]">{row.name}</p>}
                      </td>
                      <td className="px-3 py-3 text-center text-slate-400">{row.count}</td>
                      <td className="px-4 py-3 text-right text-slate-400 font-mono">{formatINR(row.unit_cost_inr)}</td>
                      <td className="px-4 py-3 text-right text-slate-200 font-mono font-medium">{formatINR(row.subtotal_inr)}</td>
                    </motion.tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/[0.08] bg-navy-950/50">
                    <td colSpan={3} className="px-4 py-3 text-slate-400 font-semibold text-right">Monthly Total</td>
                    <td className="px-4 py-3 text-right font-black font-mono gradient-text">{formatINR(monthlyCost)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-slate-600 bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
        <Info size={12} className="mt-0.5 shrink-0" />
        <p>Estimates based on {currency} on-demand pricing. Actual costs may vary based on usage patterns, reserved instances, and regional pricing.</p>
      </div>
    </div>
  );
}
