import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import InfraForm from './components/InfraForm';
import ResultsPanel from './components/ResultsPanel';
import { useGenerateArchitecture } from './hooks/useGenerateArchitecture';

export default function App() {
  const designRef = useRef(null);
  const { loading, result, error, generate, reset } = useGenerateArchitecture();
  const runtimeMonthsRef = useRef(1);

  const handleGetStarted = () => {
    designRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = (formData) => {
    runtimeMonthsRef.current = formData.runtime_months || 1;
    generate(formData);
    // Scroll to results after brief delay
    setTimeout(() => {
      designRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-navy-950">
      <Navbar />

      {/* Hero */}
      <AnimatePresence>
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <HeroSection onGetStarted={handleGetStarted} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main workspace */}
      <section
        ref={designRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        id="design-workspace"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
          {/* Left: Form */}
          <div className="lg:sticky lg:top-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6"
            >
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white">Configure Infrastructure</h2>
                <p className="text-xs text-slate-500 mt-1">Define your requirements and generate a production-ready architecture</p>
              </div>
              <InfraForm onSubmit={handleSubmit} isLoading={loading} />
            </motion.div>
          </div>

          {/* Right: Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6 min-h-[600px]"
          >
            <ResultsPanel
              result={result}
              loading={loading}
              error={error}
              onReset={reset}
              runtimeMonths={runtimeMonthsRef.current}
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-700">
            InfraGen AI · Powered by GPT-4o · AWS & Azure · Terraform IaC Generator
          </p>
        </div>
      </footer>
    </div>
  );
}
