import React, { useState } from 'react';
import { Info } from 'lucide-react';

const InputForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    app_type: 'Web app',
    users_daily: 'Less than 1,000',
    db_type: 'SQL',
    storage_gb: '10-50GB',
    region: 'us-east-1',
    high_availability: 'No',
    security_level: 'Basic',
    cloud_provider: 'AWS',
    uptime: 99,
    runtime_value: 1,
    runtime_unit: 'Months',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const runtimeMonths =
      formData.runtime_unit === 'Years'
        ? Math.round(Number(formData.runtime_value) * 12)
        : Math.round(Number(formData.runtime_value));

    const { runtime_value, runtime_unit, ...rest } = formData;
    onSubmit({ ...rest, uptime: Number(formData.uptime), runtime_months: runtimeMonths });
  };

  const selectFields = [
    { name: 'cloud_provider', label: 'Cloud Provider', options: ['AWS', 'Azure'] },
    { name: 'app_type', label: 'Application Type', options: ['Web app', 'API', 'ML system', 'Mobile backend'] },
    { name: 'users_daily', label: 'Expected Daily Users', options: ['Less than 1,000', '1K - 10K', '10K - 100K', '100K+'] },
    { name: 'db_type', label: 'Database Type', options: ['SQL', 'NoSQL', 'None'] },
    { name: 'storage_gb', label: 'Storage Requirement', options: ['< 10GB', '10-50GB', '50-500GB', '500GB+'] },
    { name: 'region', label: 'Region', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'East US', 'West Europe'] },
    { name: 'high_availability', label: 'High Availability Required', options: ['Yes', 'No'] },
    { name: 'security_level', label: 'Security Level', options: ['Basic', 'High', 'Compliance-focused (e.g. HIPAA)'] },
  ];

  const uptimeFloat = Number(formData.uptime);
  const showUptimeWarning = uptimeFloat >= 99.9;

  return (
    <form onSubmit={handleSubmit} className="bg-space-indigo-500 border border-dusty-grape-400 rounded-2xl p-6 shadow-xl sticky top-24">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-parchment">
        <span className="w-8 h-8 rounded-lg bg-almond-silk-100/30 text-almond-silk flex items-center justify-center">1</span>
        Define Requirements
      </h2>

      <div className="space-y-4">
        {selectFields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-lilac-ash-500 mb-1.5">{field.label}</label>
            <select
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-space-indigo-300 border border-dusty-grape-400 rounded-lg px-4 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-almond-silk-500 transition-shadow disabled:opacity-50"
            >
              {field.options.map(opt => (
                <option key={opt} value={opt} className="bg-space-indigo-500 text-parchment">{opt}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Uptime Slider */}
        <div>
          <label className="block text-sm font-medium text-lilac-ash-500 mb-1.5 flex items-center gap-2">
            Expected Uptime (%)
            <span className="text-xs text-lilac-ash-400 flex items-center gap-1">
              <Info size={12} /> Higher uptime increases redundancy and cost
            </span>
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              name="uptime"
              min="90"
              max="100"
              step="0.1"
              value={formData.uptime}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full accent-almond-silk disabled:opacity-50"
            />
            <span className="text-almond-silk font-bold text-sm w-16 text-right shrink-0">
              {Number(formData.uptime).toFixed(1)}%
            </span>
          </div>
          {showUptimeWarning && (
            <div className="mt-2 flex items-center gap-2 text-xs text-almond-silk-400 bg-almond-silk-100/20 border border-almond-silk-300/30 rounded-lg px-3 py-2">
              ⚠️ High availability architecture will increase cost significantly (×1.5 multiplier)
            </div>
          )}
        </div>

        {/* Project Runtime */}
        <div>
          <label className="block text-sm font-medium text-lilac-ash-500 mb-1.5">Project Runtime</label>
          <div className="flex gap-2">
            <input
              type="number"
              name="runtime_value"
              min="1"
              max="120"
              value={formData.runtime_value}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-space-indigo-300 border border-dusty-grape-400 rounded-lg px-4 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-almond-silk-500 disabled:opacity-50"
            />
            <select
              name="runtime_unit"
              value={formData.runtime_unit}
              onChange={handleChange}
              disabled={isLoading}
              className="bg-space-indigo-300 border border-dusty-grape-400 rounded-lg px-3 py-2.5 text-parchment focus:outline-none focus:ring-2 focus:ring-almond-silk-500 disabled:opacity-50"
            >
              <option className="bg-space-indigo-500">Months</option>
              <option className="bg-space-indigo-500">Years</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-8 w-full bg-almond-silk hover:bg-almond-silk-600 text-space-indigo-500 font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-almond-silk/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Generate Architecture'}
      </button>
    </form>
  );
};

export default InputForm;
