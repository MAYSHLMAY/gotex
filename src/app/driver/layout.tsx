import "@/styles/globals.css"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Driver Portal | Gotera",
  description: "Gotera driver delivery management - Accept jobs, track deliveries, earn more",
}

export default async function DriverLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  
  // Allow access for drivers or demo purposes
  if (session?.user?.role && session.user.role !== "DRIVER" && session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-50 border-b border-[var(--gotera-earth)]/10 bg-[var(--gotera-cream)]/95 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/driver/dashboard" className="flex items-center gap-3 active:scale-[0.98] transition-transform">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--gotera-gold)]">
              <svg className="w-5 h-5 text-[var(--gotera-charcoal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className="font-display font-bold text-[var(--gotera-bark)]">Gotera Driver</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--gotera-earth)]">Delivery Portal</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/notifications" 
              className="relative p-2 rounded-full hover:bg-[var(--gotera-earth)]/5 active:scale-[0.95] transition-all"
            >
              <svg className="w-5 h-5 text-[var(--gotera-bark)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--gotera-red)] rounded-full" />
            </Link>
            
            <Link 
              href="/" 
              className="text-sm font-semibold text-[var(--gotera-earth)] hover:text-[var(--gotera-bark)] active:scale-[0.98] transition-all"
            >
              Home
            </Link>
          </div>
        </div>
      </header>
      
      <main className="mx-auto max-w-4xl">{children}</main>
      
      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--gotera-earth)]/15 bg-[var(--gotera-cream)]/95 backdrop-blur md:hidden">
        <div className="mx-auto flex justify-around px-2 py-2">
          <Link 
            href="/driver/dashboard" 
            className="flex min-w-[72px] flex-col items-center rounded-lg px-3 py-2 text-[var(--gotera-bark)] active:bg-[var(--gotera-mist)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-semibold mt-0.5">Dashboard</span>
          </Link>
          
          <Link 
            href="/driver/earnings" 
            className="flex min-w-[72px] flex-col items-center rounded-lg px-3 py-2 text-[var(--gotera-earth)] active:bg-[var(--gotera-mist)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold mt-0.5">Earnings</span>
          </Link>
          
          <Link 
            href="/driver/history" 
            className="flex min-w-[72px] flex-col items-center rounded-lg px-3 py-2 text-[var(--gotera-earth)] active:bg-[var(--gotera-mist)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-semibold mt-0.5">History</span>
          </Link>
          
          <Link 
            href="/driver/profile" 
            className="flex min-w-[72px] flex-col items-center rounded-lg px-3 py-2 text-[var(--gotera-earth)] active:bg-[var(--gotera-mist)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-semibold mt-0.5">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
