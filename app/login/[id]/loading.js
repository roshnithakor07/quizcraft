export default function ResultsLoading() {
  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-[var(--cream)] rounded animate-pulse"/>
            <div className="h-7 w-52 bg-[var(--cream)] rounded-lg animate-pulse"/>
            <div className="h-4 w-72 bg-[var(--cream)] rounded animate-pulse"/>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-8  bg-[var(--cream)] rounded-xl animate-pulse"/>
            <div className="h-8 w-24 bg-[var(--cream)] rounded-xl animate-pulse"/>
            <div className="h-8 w-28 bg-[var(--cream)] rounded-xl animate-pulse"/>
          </div>
        </div>
        {/* Share link skeleton */}
        <div className="card mb-6">
          <div className="h-3 w-20 bg-[var(--cream)] rounded mb-3 animate-pulse"/>
          <div className="h-10 bg-[var(--cream)] rounded-xl animate-pulse"/>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[0,1,2,3].map(i => (
            <div key={i} className="card py-4 text-center">
              <div className="h-7 w-12 bg-[var(--cream)] rounded mx-auto mb-2 animate-pulse"/>
              <div className="h-3 w-16 bg-[var(--cream)] rounded mx-auto animate-pulse"/>
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="card">
          <div className="h-5 w-28 bg-[var(--cream)] rounded mb-4 animate-pulse"/>
          {[0,1,2].map(i => (
            <div key={i} className="flex items-center gap-3 py-3 border-t border-[var(--border)]">
              <div className="w-7 h-7 rounded-full bg-[var(--cream)] animate-pulse shrink-0"/>
              <div className="h-4 flex-1 bg-[var(--cream)] rounded animate-pulse"/>
              <div className="h-4 w-12 bg-[var(--cream)] rounded animate-pulse"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}