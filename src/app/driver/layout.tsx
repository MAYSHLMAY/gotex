// import "@/app/globals.css"

export const metadata = {
  title: "Driver Portal | Gotera",
  description: "Gotera driver delivery management",
}

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#F5F0E8' }}>
      <header className="px-6 py-4 flex items-center justify-between" style={{ background: '#FFFDF8', borderBottom: '1px solid #D4A01730' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#D4A017' }}>
            <span className="text-lg font-bold" style={{ color: '#1A1A2E' }}>G</span>
          </div>
          <div>
            <p className="font-bold" style={{ color: '#3d2914' }}>Gotera Driver</p>
            <p className="text-xs" style={{ color: '#8B4513' }}>Delivery Portal</p>
          </div>
        </div>
        <a href="/" className="text-sm font-medium hover:underline" style={{ color: '#8B4513' }}>
          Back to Home
        </a>
      </header>
      <main>{children}</main>
    </div>
  )
}
