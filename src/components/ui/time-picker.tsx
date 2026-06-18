"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const selectClass = cn(
  "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)]",
  "h-10 rounded-[var(--radius-md)] text-sm px-3",
  "hover:border-[var(--border-strong)] focus:outline-none",
  "focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)]",
  "transition-colors cursor-pointer",
);

export function TimePicker({ value, onChange, label, className }: TimePickerProps) {
  const parts = value ? value.split(":") : [];
  const h = parts[0] ?? "";
  const m = parts[1] ?? "";

  const handleHour = (newH: string) => {
    if (!newH) { onChange(""); return; }
    onChange(`${newH}:${m || "00"}`);
  };

  const handleMinute = (newM: string) => {
    onChange(`${h || "00"}:${newM || "00"}`);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
          <select
            value={h}
            onChange={(e) => handleHour(e.target.value)}
            className={cn(selectClass, "pl-9 w-full")}
          >
            <option value="">HH</option>
            {HOURS.map((hr) => (
              <option key={hr} value={hr}>
                {hr}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[var(--text-muted)] font-bold shrink-0 select-none">:</span>
        <select
          value={m}
          onChange={(e) => handleMinute(e.target.value)}
          className={cn(selectClass, "flex-1")}
        >
          <option value="">MM</option>
          {MINUTES.map((min) => (
            <option key={min} value={min}>
              {min}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
