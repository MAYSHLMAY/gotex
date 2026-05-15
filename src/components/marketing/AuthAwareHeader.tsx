"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useCallback, useTransition } from "react";
import { roleHomePath } from "@/lib/auth";

function GoteraMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden className="text-[var(--gotera-gold)]">
      <path
        d="M18 46 L18 22 Q18 12 32 10 Q46 12 46 22 L46 46 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M32 10 L32 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 18 Q32 14 38 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 40 Q8 34 14 30" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
      <path d="M52 40 Q56 34 50 30" fill="none" stroke="#2d6a4f" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function AuthAwareHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleNavigation = useCallback((href: string) => {
    setNavigatingTo(href);
    startTransition(() => {
      router.push(href);
    });
  }, [router]);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    setShowUserMenu(false);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }, [router]);

  const isNavigating = isPending || navigatingTo !== null;

  // Reset navigating state when transition completes
  if (!isPending && navigatingTo) {
    setNavigatingTo(null);
  }

  const user = session?.user;
  const dashboardPath = user?.role ? roleHomePath(user.role) : "/";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--gotera-earth)]/10 bg-[var(--gotera-cream)]/90 backdrop-blur-md overflow-visible">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 relative">
        <Link 
          href="/" 
          className="flex items-center gap-3 active:scale-[0.98] transition-transform" 
          aria-label="Gotera home"
          prefetch={true}
        >
          <GoteraMark />
          <div>
            <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">ጎተራ</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--gotera-earth)]">Gotera</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-[var(--gotera-bark)] md:flex">
          <a className="hover:text-[var(--gotera-green)] transition-colors" href="#how">How it works</a>
          <a className="hover:text-[var(--gotera-green)] transition-colors" href="#produce">Live produce</a>
          <a className="hover:text-[var(--gotera-green)] transition-colors" href="#map">Coverage</a>
        </nav>

        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="flex items-center gap-2 px-4 py-2">
              <Spinner />
            </div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full bg-[var(--gotera-gold)]/10 px-3 py-2 text-sm font-semibold text-[var(--gotera-bark)] transition-all hover:bg-[var(--gotera-gold)]/20 active:scale-[0.98]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gotera-gold)] text-sm font-bold text-[var(--gotera-charcoal)]">
                  {user.name?.charAt(0) || "U"}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
                <svg className={`h-4 w-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--gotera-earth)]/10 bg-white py-2 shadow-lg overflow-y-auto max-h-[calc(100vh-80px)]">
                    <div className="border-b border-[var(--gotera-earth)]/10 px-4 py-2">
                      <p className="text-sm font-semibold text-[var(--gotera-bark)]">{user.name}</p>
                      <p className="text-xs text-[var(--gotera-earth)]">{user.role}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleNavigation(dashboardPath);
                      }}
                      disabled={isNavigating}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-[var(--gotera-bark)] transition-colors hover:bg-[var(--gotera-mist)] disabled:opacity-50"
                    >
                      {navigatingTo === dashboardPath ? <Spinner /> : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      )}
                      Dashboard
                    </button>
                    
                    <Link
                      href="/notifications"
                      onClick={() => setShowUserMenu(false)}
                      prefetch={true}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-[var(--gotera-bark)] transition-colors hover:bg-[var(--gotera-mist)]"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      Notifications
                    </Link>
                    
                    <Link
                      href="/messages"
                      onClick={() => setShowUserMenu(false)}
                      prefetch={true}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-[var(--gotera-bark)] transition-colors hover:bg-[var(--gotera-mist)]"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Messages
                    </Link>
                    
                    <div className="border-t border-[var(--gotera-earth)]/10 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-[var(--gotera-red)] transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        {isSigningOut ? <Spinner /> : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        )}
                        {isSigningOut ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => handleNavigation("/auth/login")}
                disabled={isNavigating}
                className="btn-secondary hidden sm:inline-flex"
              >
                {navigatingTo === "/auth/login" ? (
                  <>
                    <Spinner />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Log in"
                )}
              </button>
              <button
                onClick={() => handleNavigation("/auth/register")}
                disabled={isNavigating}
                className="btn-primary"
              >
                {navigatingTo === "/auth/register" ? (
                  <>
                    <Spinner />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Get started"
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Global loading indicator */}
      {isNavigating && (
        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden bg-[var(--gotera-gold)]/20">
          <div className="h-full w-1/3 animate-[loading-bar_1s_ease-in-out_infinite] bg-[var(--gotera-gold)]" />
        </div>
      )}
    </header>
  );
}