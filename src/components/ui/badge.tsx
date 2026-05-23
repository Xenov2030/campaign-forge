import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:    "bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30",
        secondary:  "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]",
        destructive:"bg-red-900/30 text-red-400 border border-red-800/50",
        outline:    "border border-[var(--border-default)] text-[var(--text-secondary)]",
        arcane:     "bg-[var(--accent-arcane)]/20 text-[var(--accent-arcane)] border border-[var(--accent-arcane)]/30",
        success:    "bg-green-900/30 text-green-400 border border-green-800/50",
        // Rarities
        common:     "bg-gray-800/50 text-gray-400 border border-gray-700/50",
        uncommon:   "bg-green-900/30 text-green-400 border border-green-800/50",
        rare:       "bg-blue-900/30 text-blue-400 border border-blue-800/50",
        veryRare:   "bg-purple-900/30 text-purple-400 border border-purple-800/50",
        legendary:  "bg-orange-900/30 text-orange-400 border border-orange-800/50",
        artifact:   "bg-yellow-900/30 text-yellow-400 border border-yellow-800/50",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
