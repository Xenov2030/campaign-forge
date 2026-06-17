export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-40 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
        <div className="h-9 w-36 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden">
            <div className="h-24 bg-[var(--bg-elevated)]" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-[var(--bg-elevated)] rounded w-2/3" />
              <div className="h-3.5 bg-[var(--bg-elevated)] rounded w-1/2" />
              <div className="grid grid-cols-3 gap-2 pt-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
