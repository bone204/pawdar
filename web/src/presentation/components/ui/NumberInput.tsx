"use client";

import React from "react";

interface NumberInputProps {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  placeholder,
  className = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value) || 0);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && <label className="text-sm font-bold text-foreground">{label}</label>}
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="px-4 py-3 rounded-xl border border-border/50 dark:border-border/20 bg-background text-foreground text-sm font-semibold focus:outline-none focus:border-primary/50"
        placeholder={placeholder}
      />
    </div>
  );
};

export default NumberInput;
