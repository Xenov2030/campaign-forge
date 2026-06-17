export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-36 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
        <div className="h-9 w-36 bg-[var(--bg-elevated)] rounded-[var(--radius-md)]" />
      </div>
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-24 bg-[var(--bg-elevated)] rounded-full" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-[var(--bg-elevated)] rounded-full" />
                  <div className="h-5 w-20 bg-[var(--bg-elevated)] rounded-full" />
                </div>
                <div className="h-5 bg-[var(--bg-elevated)] rounded w-1/2" />
                <div className="h-3.5 bg-[var(--bg-elevated)] rounded w-2/3" />
              </div>
              <div className="h-8 w-20 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
