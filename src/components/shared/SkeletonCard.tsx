export default function SkeletonCard() {
  return (
    <div className="rounded-xl p-4 animate-pulse" style={{background:'#F5F0E8',border:'1px solid #D4A01730'}}>
      <div className="h-36 rounded-lg mb-3" style={{background:'#8B451320'}} />
      <div className="h-4 rounded mb-2 w-3/4" style={{background:'#8B451320'}} />
      <div className="h-4 rounded mb-2 w-1/2" style={{background:'#8B451320'}} />
      <div className="h-4 rounded w-1/3" style={{background:'#8B451320'}} />
    </div>
  )
}
