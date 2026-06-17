export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
        <div className="h-9 w-36 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-[var(--bg-elevated)] rounded w-1/3" />
                <div className="h-3.5 bg-[var(--bg-elevated)] rounded w-1/4" />
              </div>
              <div className="h-6 w-20 bg-[var(--bg-elevated)] rounded-full shrink-0" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-[var(--bg-elevated)] rounded w-full" />
              <div className="h-3 bg-[var(--bg-elevated)] rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
