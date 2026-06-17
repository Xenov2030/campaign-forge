"use client";

interface TagOption {
  value: string;
  label: string;
  color: string;
}

interface TagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
  options: TagOption[];
  label?: string;
  className?: string;
}

export function TagPicker({ value, onChange, options, label, className }: TagPickerProps) {
  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  return (
    <div className={className}>
      {label && (
        <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className="inline-flex items-center h-7 px-2.5 rounded-full text-xs font-medium border transition-all duration-100 hover:scale-105 active:scale-95"
              style={{
                borderColor: selected ? opt.color : `${opt.color}35`,
                background: selected ? `${opt.color}20` : "transparent",
                color: selected ? opt.color : "var(--text-muted)",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
