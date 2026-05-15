import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-16">
      <GoteraCard className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Onboarding</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-[var(--gotera-bark)]">Create your Gotera account</h1>
        <p className="mt-2 text-sm text-[var(--gotera-earth)]">Farmer and buyer flows collect the essentials for verification and logistics.</p>
      </GoteraCard>
      <div className="mx-auto mt-8 max-w-3xl">
        <RegisterForm />
      </div>
      <div className="mx-auto mt-8 max-w-3xl text-center">
        <Link href="/" className="text-sm font-semibold text-[var(--gotera-earth)] hover:underline">
          ← Back home
        </Link>
      </div>
    </div>
  );
}
