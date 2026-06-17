export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-28 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
        <div className="h-9 w-32 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-7 w-20 bg-[var(--bg-elevated)] rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-[var(--bg-elevated)] rounded" />
              <div className="h-5 bg-[var(--bg-elevated)] rounded flex-1 w-2/3" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 bg-[var(--bg-elevated)] rounded w-full" />
              <div className="h-3 bg-[var(--bg-elevated)] rounded w-4/5" />
            </div>
            <div className="h-4 w-16 bg-[var(--bg-elevated)] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
