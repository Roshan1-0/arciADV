import React, { useState } from 'react';

const InputForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    app_type: 'Web app',
    users_daily: 'Less than 1,000',
    db_type: 'SQL',
    storage_gb: '10-50GB',
    region: 'us-east-1',
    high_availability: 'No',
    security_level: 'Basic',
    budget: '$100-$500/month',
    cloud_provider: 'AWS'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formFields = [
    { name: 'cloud_provider', label: 'Cloud Provider', options: ['AWS', 'Azure'] },
    { name: 'app_type', label: 'Application Type', options: ['Web app', 'API', 'ML system', 'Mobile backend'] },
    { name: 'users_daily', label: 'Expected Daily Users', options: ['Less than 1,000', '1K - 10K', '10K - 100K', '100K+'] },
    { name: 'db_type', label: 'Database Type', options: ['SQL', 'NoSQL', 'None'] },
    { name: 'storage_gb', label: 'Storage Requirement', options: ['< 10GB', '10-50GB', '50-500GB', '500GB+'] },
    { name: 'region', label: 'Region', options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1', 'East US', 'West Europe'] },
    { name: 'high_availability', label: 'High Availability Required', options: ['Yes', 'No'] },
    { name: 'security_level', label: 'Security Level', options: ['Basic', 'High', 'Compliance-focused (e.g. HIPAA)'] },
    { name: 'budget', label: 'Monthly Budget', options: ['<$100', '$100-$500/month', '$500-$5000/month', '$5000+'] },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">1</span>
        Define Requirements
      </h2>

      <div className="space-y-4">
        {formFields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">{field.label}</label>
            <select
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-50"
            >
              {field.options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Generate Architecture'}
      </button>
    </form>
  );
};

export default InputForm;
