import { conditionColor } from "@/lib/conditions";

/** Badges animados de condiciones de estado. Solo visual (sin interacción). */
export function ConditionBadges({
  conditions,
  size = "sm",
}: {
  conditions: string[];
  size?: "sm" | "xs";
}) {
  if (!conditions || conditions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {conditions.map((c) => {
        const color = conditionColor(c);
        return (
          <span
            key={c}
            className={`inline-flex items-center rounded-full border animate-pulse ${
              size === "xs" ? "text-[9px] px-1 py-0.5" : "text-[10px] px-1.5 py-0.5"
            }`}
            style={{ color, borderColor: `${color}55`, background: `${color}1a` }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
}
