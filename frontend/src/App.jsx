import React, { useState } from 'react';
import InputForm from './components/InputForm';
import DiagramViewer from './components/DiagramViewer';
import TerraformViewer from './components/TerraformViewer';
import CostPanel from './components/CostPanel';
import { Server, CloudCog, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('diagram');

  const handleGenerate = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/generate`, formData);
      setResult(response.data);
      setActiveTab('diagram');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to generate architecture.");
    } finally {
      setLoading(false);
    }
  };

  const fmtINR = (amount) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const TABS = ['diagram', 'explanation', 'cost', 'terraform'];

  return (
    <div className="min-h-screen bg-space-indigo-400 text-parchment">
      {/* Header */}
      <header className="border-b border-dusty-grape-400 bg-space-indigo-500/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-almond-silk-100/40 rounded-lg text-almond-silk-500">
              <CloudCog size={28} />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-almond-silk-500 to-parchment bg-clip-text text-transparent">
              InfraGen AI
            </h1>
          </div>
          <div className="text-sm font-medium text-lilac-ash-500 flex items-center gap-2">
            <Server size={16} /> Production-Ready Architecture
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/3">
          <InputForm onSubmit={handleGenerate} isLoading={loading} />
        </div>

        {/* Right Side: Results */}
        <div className="w-full lg:w-2/3">
          {loading ? (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border border-dusty-grape-400 rounded-2xl bg-space-indigo-500/50 backdrop-blur-sm">
              <Loader2 className="w-12 h-12 text-almond-silk animate-spin mb-4" />
              <p className="text-lg text-parchment-400 font-medium animate-pulse">Designing your infrastructure...</p>
              <p className="text-sm text-lilac-ash-500 mt-2">Generating architecture and calculating costs</p>
            </div>
          ) : error ? (
            <div className="h-full min-h-[500px] flex items-center justify-center border border-almond-silk-300/50 rounded-2xl bg-almond-silk-100/10 p-8">
              <div className="text-center">
                <p className="text-almond-silk-400 font-medium text-lg mb-2">Error generating architecture</p>
                <p className="text-lilac-ash-500 text-sm whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          ) : result ? (
            <div className="flex flex-col h-full bg-space-indigo-500 border border-dusty-grape-400 rounded-2xl overflow-hidden shadow-xl">
              {/* Tabs */}
              <div className="flex border-b border-dusty-grape-400 bg-space-indigo-400/60 px-2 pt-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors capitalize ${
                      activeTab === tab
                        ? 'bg-dusty-grape-400 text-almond-silk border-b-2 border-almond-silk-500'
                        : 'text-lilac-ash-500 hover:text-parchment hover:bg-dusty-grape-300/40'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-6 overflow-y-auto" style={{ maxHeight: '800px' }}>
                {activeTab === 'diagram' && (
                  <DiagramViewer generatedMermaid={result.diagram_mermaid} />
                )}
                {activeTab === 'explanation' && (
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-xl font-semibold mb-4 text-parchment">Architecture Explanation</h3>
                    <p className="text-parchment-400 leading-relaxed">{result.explanation}</p>
                  </div>
                )}
                {activeTab === 'cost' && (
                  <div>
                    <h3 className="text-xl font-semibold mb-5 text-parchment flex items-center justify-between">
                      Cost Estimation
                      <span className="text-2xl font-bold text-almond-silk">
                        {fmtINR(result.cost_breakdown?.total_runtime_cost ?? result.total_monthly_cost.amount)}/project
                      </span>
                    </h3>
                    <CostPanel
                      costBreakdown={result.cost_breakdown}
                      costTable={result.cost_estimation_table}
                      totalMonthlyCost={result.total_monthly_cost}
                    />
                  </div>
                )}
                {activeTab === 'terraform' && (
                  <TerraformViewer files={result.terraform_files} />
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center border border-dashed border-dusty-grape-400 rounded-2xl bg-space-indigo-500/20 text-center p-8">
              <div className="w-20 h-20 bg-dusty-grape-300 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CloudCog className="w-10 h-10 text-lilac-ash-500" />
              </div>
              <h2 className="text-2xl font-semibold text-parchment-400 mb-2">Ready to Design</h2>
              <p className="text-lilac-ash-500 max-w-md">
                Fill out your application requirements on the left, and our system will generate a complete cloud architecture, cost estimate, and deployment code.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
