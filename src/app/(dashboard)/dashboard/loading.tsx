export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-10">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-[var(--bg-elevated)] rounded" />
          <div className="h-10 w-48 bg-[var(--bg-elevated)] rounded" />
        </div>
        <div className="h-11 w-36 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 bg-[var(--bg-elevated)] rounded" />
              <div className="h-3 w-24 bg-[var(--bg-elevated)] rounded" />
            </div>
            <div className="h-9 w-12 bg-[var(--bg-elevated)] rounded" />
          </div>
        ))}
      </div>

      {/* Campaign cards skeleton */}
      <div className="mb-10">
        <div className="h-6 w-32 bg-[var(--bg-elevated)] rounded mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
              <div className="h-28 bg-[var(--bg-elevated)]" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-[var(--bg-elevated)] rounded" />
                <div className="h-3 w-full bg-[var(--bg-elevated)] rounded" />
                <div className="h-3 w-2/3 bg-[var(--bg-elevated)] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
