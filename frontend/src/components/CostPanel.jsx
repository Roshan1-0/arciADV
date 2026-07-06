import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const fmt = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const UPTIME_MULTIPLIERS = [
  { uptime: 90,   multiplier: 1.0 },
  { uptime: 91,   multiplier: 1.0 },
  { uptime: 92,   multiplier: 1.0 },
  { uptime: 93,   multiplier: 1.0 },
  { uptime: 94,   multiplier: 1.0 },
  { uptime: 95,   multiplier: 1.0 },
  { uptime: 96,   multiplier: 1.0 },
  { uptime: 97,   multiplier: 1.0 },
  { uptime: 98,   multiplier: 1.0 },
  { uptime: 99,   multiplier: 1.15 },
  { uptime: 99.5, multiplier: 1.3 },
  { uptime: 99.9, multiplier: 1.5 },
  { uptime: 100,  multiplier: 1.5 },
];

const StatCard = ({ label, value, sub, color = 'text-parchment' }) => (
  <div className="bg-space-indigo-500 border border-dusty-grape-400 rounded-xl p-4 flex flex-col gap-1">
    <p className="text-xs text-lilac-ash-500 uppercase tracking-wider">{label}</p>
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    {sub && <p className="text-xs text-lilac-ash-400">{sub}</p>}
  </div>
);

const CostPanel = ({ costBreakdown, costTable, totalMonthlyCost }) => {
  if (!costBreakdown) return null;

  const {
    base_cost,
    uptime_multiplier,
    monthly_final_cost,
    runtime_months,
    total_runtime_cost
  } = costBreakdown;

  const runtimeLabel =
    runtime_months >= 12 && runtime_months % 12 === 0
      ? `${runtime_months / 12} Year${runtime_months / 12 > 1 ? 's' : ''}`
      : `${runtime_months} Month${runtime_months > 1 ? 's' : ''}`;

  const chartData = UPTIME_MULTIPLIERS.map(({ uptime, multiplier }) => ({
    uptime: `${uptime}%`,
    cost: Math.round(base_cost * multiplier),
  }));

  return (
    <div className="space-y-5">
      {/* Breakdown Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Base Cost / Month"
          value={fmt(base_cost)}
          color="text-parchment"
        />
        <StatCard
          label="Uptime Factor"
          value={`×${uptime_multiplier}`}
          sub={uptime_multiplier >= 1.5 ? 'Multi-AZ (×1.5)' : uptime_multiplier >= 1.3 ? 'Active-Standby (×1.3)' : uptime_multiplier >= 1.15 ? 'Basic HA (×1.15)' : 'Single Zone (×1.0)'}
          color="text-almond-silk-400"
        />
        <StatCard
          label="Monthly Final Cost"
          value={fmt(monthly_final_cost)}
          color="text-lilac-ash-700"
        />
        <StatCard
          label={`Total (${runtimeLabel})`}
          value={fmt(total_runtime_cost)}
          sub={`${runtimeLabel} × ${fmt(monthly_final_cost)}/mo`}
          color="text-almond-silk"
        />
      </div>

      {/* Cost Fluctuation Chart */}
      <div className="bg-space-indigo-300 border border-dusty-grape-400 rounded-xl p-4">
        <p className="text-sm font-medium text-lilac-ash-500 mb-4">
          Cost Fluctuation by Uptime SLA
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2c2f3f" />
            <XAxis dataKey="uptime" tick={{ fill: '#9a8c98', fontSize: 11 }} />
            <YAxis
              tick={{ fill: '#9a8c98', fontSize: 11 }}
              tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'K' : v}`}
            />
            <Tooltip
              contentStyle={{ background: '#1b1b2f', border: '1px solid #3b3e54', borderRadius: 8 }}
              labelStyle={{ color: '#9a8c98' }}
              formatter={(v) => [fmt(v), 'Monthly Cost']}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#c9ada7"
              strokeWidth={2}
              dot={{ fill: '#c9ada7', r: 4 }}
              activeDot={{ r: 6, fill: '#f2e9e4' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cost Breakdown Table */}
      <div className="bg-space-indigo-300 border border-dusty-grape-400 rounded-xl p-4 overflow-x-auto">
        <p className="text-sm font-medium text-lilac-ash-500 mb-3">Component Breakdown</p>
        <pre className="text-sm text-parchment-400 font-mono whitespace-pre">{costTable}</pre>
      </div>
    </div>
  );
};

export default CostPanel;
