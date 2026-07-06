import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import TabNav from './TabNav';
import ArchitectureSummary from './ArchitectureSummary';
import DiagramViewer from './DiagramViewer';
import CostBreakdown from './CostBreakdown';
import TerraformViewer from './TerraformViewer';
import LoadingOverlay from './LoadingOverlay';
import ErrorCard from './ErrorCard';

export default function ResultsPanel({ result, loading, error, onReset, runtimeMonths }) {
  const [activeTab, setActiveTab] = useState('summary');

  if (loading) return <LoadingOverlay />;
  if (error) return <ErrorCard error={error} onRetry={onReset} />;

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] py-16 text-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/10 to-cyan-500/5 border border-white/[0.06] flex items-center justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-500/20 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Ready to Design</h3>
        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
          Fill in your requirements on the left and click <strong className="text-slate-400">Generate Architecture</strong> to get started.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">Architecture Ready</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {result.meta?.ai_powered ? 'GPT-4o generated' : 'Rule-based generated'} · {new Date().toLocaleTimeString()}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="btn-secondary flex items-center gap-1.5 text-xs"
        >
          <RotateCcw size={13} />
          New Design
        </motion.button>
      </div>

      {/* Tab navigation */}
      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'summary' && (
            <ArchitectureSummary
              explanation={result.explanation}
              components={result.components}
              meta={result.meta}
            />
          )}
          {activeTab === 'diagram' && (
            <DiagramViewer mermaidCode={result.diagram_mermaid} />
          )}
          {activeTab === 'cost' && (
            <CostBreakdown
              costData={result.cost_estimation}
              runtimeMonths={runtimeMonths || result.meta?.runtime_months || 1}
            />
          )}
          {activeTab === 'terraform' && (
            <TerraformViewer terraformFiles={result.terraform_files} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
