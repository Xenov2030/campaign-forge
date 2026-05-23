"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-gold)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-gold)] text-[var(--bg-base)] hover:brightness-110 active:brightness-90 shadow-[var(--glow-gold)]",
        destructive:
          "bg-red-900/80 border border-red-700 text-red-100 hover:bg-red-800",
        outline:
          "border border-[var(--border-default)] bg-transparent text-[var(--text-primary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)]",
        ghost:
          "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
        arcane:
          "bg-[var(--accent-arcane)] text-white hover:brightness-110 shadow-[var(--glow-arcane)]",
        parchment:
          "bg-[#2a1f0a] border border-[#4a3520] text-[#e8d5a3] hover:bg-[#3a2a0e] font-[var(--font-display)] tracking-wider",
        link: "text-[var(--accent-gold)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2 text-sm rounded-[var(--radius-md)]",
        sm:      "h-8 px-3 text-xs rounded-[var(--radius-sm)]",
        lg:      "h-12 px-8 text-base rounded-[var(--radius-md)]",
        xl:      "h-14 px-10 text-lg rounded-[var(--radius-lg)]",
        icon:    "h-10 w-10 rounded-[var(--radius-md)]",
        "icon-sm": "h-8 w-8 rounded-[var(--radius-sm)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
