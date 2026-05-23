import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            "w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)]",
            "min-h-[100px] px-3 py-2 rounded-[var(--radius-md)] text-sm",
            "placeholder:text-[var(--text-muted)]",
            "focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)]",
            "transition-colors duration-150 resize-y",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-700",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
