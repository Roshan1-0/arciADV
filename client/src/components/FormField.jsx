import React from 'react';

export default function FormField({
  label,
  name,
  type = 'select',
  value,
  onChange,
  options = [],
  disabled = false,
  helper,
  placeholder,
  min,
  max,
  step,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-slate-300">
        {label}
      </label>

      {type === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="select-field"
        >
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      ) : type === 'number' ? (
        <input
          id={name}
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="input-field"
        />
      ) : type === 'range' ? (
        <div className="space-y-2">
          <input
            id={name}
            type="range"
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7C3AED ${((value - min) / (max - min)) * 100}%, #1E293B ${((value - min) / (max - min)) * 100}%)`,
            }}
          />
        </div>
      ) : null}

      {helper && (
        <p className="text-[11px] text-slate-600">{helper}</p>
      )}
    </div>
  );
}
