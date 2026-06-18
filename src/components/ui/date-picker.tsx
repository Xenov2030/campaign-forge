"use client";

import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { format, parseISO, isValid } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Seleccionar fecha",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </label>
      )}
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              "w-full flex items-center gap-2 h-10 px-3 rounded-[var(--radius-md)] text-sm transition-colors text-left",
              "bg-[var(--bg-elevated)] border border-[var(--border-default)]",
              "hover:border-[var(--border-strong)] focus:outline-none",
              open && "border-[var(--accent-gold)] ring-1 ring-[var(--accent-gold)]",
            )}
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <span
              className={cn(
                "flex-1 truncate",
                selected ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
              )}
            >
              {selected ? format(selected, "d 'de' MMMM yyyy", { locale: es }) : placeholder}
            </span>
            {selected && (
              <X
                role="button"
                aria-label="Limpiar fecha"
                className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
              />
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            side="bottom"
            align="start"
            sideOffset={6}
            className="z-50 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-3 outline-none"
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(date) => {
                onChange(date ? format(date, "yyyy-MM-dd") : "");
                if (date) setOpen(false);
              }}
              locale={es}
              classNames={{
                root: "select-none text-sm",
                months: "flex",
                month: "space-y-2",
                month_caption:
                  "flex justify-center items-center relative px-8 h-9",
                caption_label:
                  "text-sm font-semibold text-[var(--text-primary)] capitalize",
                nav: "absolute inset-x-0 top-0 h-9 flex items-center justify-between",
                button_previous: cn(
                  "h-7 w-7 rounded flex items-center justify-center",
                  "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                  "hover:bg-[var(--bg-elevated)] transition-colors",
                ),
                button_next: cn(
                  "h-7 w-7 rounded flex items-center justify-center",
                  "text-[var(--text-muted)] hover:text-[var(--text-primary)]",
                  "hover:bg-[var(--bg-elevated)] transition-colors",
                ),
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday:
                  "w-8 h-7 flex items-center justify-center text-[10px] font-medium text-[var(--text-muted)] uppercase",
                week: "flex mt-1",
                day: "p-0",
                day_button: cn(
                  "h-8 w-8 rounded-[var(--radius-sm)] text-sm font-medium w-full",
                  "text-[var(--text-secondary)]",
                  "hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
                  "transition-colors focus-visible:outline-none",
                ),
                selected:
                  "!bg-[var(--accent-gold)] !text-[var(--bg-base)] hover:!bg-[var(--accent-gold)]",
                today: "!text-[var(--accent-gold)] !font-bold",
                outside: "!opacity-30",
                disabled: "!opacity-20 !cursor-not-allowed",
                hidden: "invisible",
              }}
              components={{
                Chevron: ({ orientation }) =>
                  orientation === "left" ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  ),
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
