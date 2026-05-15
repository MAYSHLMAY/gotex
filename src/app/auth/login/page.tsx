import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-16">
      <GoteraCard className="mx-auto max-w-xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Auth</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--gotera-bark)]">Log in to Gotera</h1>
        <p className="mt-2 text-sm text-[var(--gotera-earth)]">Phone-based credentials backed by NextAuth.js and Prisma.</p>
      </GoteraCard>
      <div className="mx-auto mt-8 max-w-xl">
        <LoginForm />
      </div>
      <div className="mx-auto mt-8 max-w-xl text-center">
        <Link href="/" className="text-sm font-semibold text-[var(--gotera-earth)] hover:underline">
          ← Back home
        </Link>
      </div>
    </div>
  );
}
