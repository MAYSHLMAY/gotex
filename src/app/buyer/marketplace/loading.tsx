import SkeletonCard from '@/components/shared/SkeletonCard'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Marketplace</p>
            <h1 className="text-2xl font-bold" style={{ color: '#3d2914' }}>Browse verified supply</h1>
          </div>
        </div>
        
        {/* Search skeleton */}
        <div className="mt-6 grid gap-3 rounded-xl border p-4 sm:grid-cols-5 animate-pulse" style={{ background: '#FFFDF8', borderColor: '#D4A01730' }}>
          <div className="h-10 rounded-lg sm:col-span-2" style={{ background: '#8B451320' }} />
          <div className="h-10 rounded-lg" style={{ background: '#8B451320' }} />
          <div className="h-10 rounded-lg" style={{ background: '#8B451320' }} />
          <div className="h-10 rounded-lg sm:col-span-5" style={{ background: '#D4A01730' }} />
        </div>
        
        {/* Skeleton cards grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
