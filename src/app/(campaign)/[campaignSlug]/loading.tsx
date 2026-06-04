export default function CampaignLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <div className="h-3 w-20 bg-[var(--bg-elevated)] rounded" />
          <div className="h-9 w-64 bg-[var(--bg-elevated)] rounded" />
          <div className="h-4 w-48 bg-[var(--bg-elevated)] rounded" />
        </div>
        <div className="h-9 w-28 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
            <div className="h-3 w-16 bg-[var(--bg-elevated)] rounded mb-2" />
            <div className="h-7 w-10 bg-[var(--bg-elevated)] rounded" />
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
              <div className="h-5 w-32 bg-[var(--bg-elevated)] rounded mb-4" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-12 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
              <div className="h-4 w-24 bg-[var(--bg-elevated)] rounded mb-3" />
              <div className="h-8 w-16 bg-[var(--bg-elevated)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
