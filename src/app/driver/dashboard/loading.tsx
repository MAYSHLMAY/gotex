export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: '#F5F0E8' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#D4A017', borderTopColor: 'transparent' }} />
        <p style={{ color: '#8B4513', fontWeight: 600 }}>Loading driver portal...</p>
      </div>
    </div>
  )
}
