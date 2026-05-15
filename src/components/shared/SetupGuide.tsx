"use client";

import { useEffect, useState } from "react";
import { GoteraCard } from "@/components/ui/GoteraCard";

interface EnvStatus {
  key: string;
  label: string;
  required: boolean;
  configured: boolean;
  fallback?: string;
}

interface HealthData {
  healthy: boolean;
  database: { connected: boolean; error: string | null };
  environment: EnvStatus[];
  readyForProduction: boolean;
}

export function SetupGuide() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("gotex_setup_dismissed");
    if (wasDismissed) {
      setDismissed(true);
      setLoading(false);
      return;
    }

    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || dismissed) return null;
  if (!health) return null;
  if (health.readyForProduction && health.database.connected) return null;

  const missingRequired = health.environment.filter((e) => e.required && !e.configured);
  const missingOptional = health.environment.filter((e) => !e.required && !e.configured);

  const handleDismiss = () => {
    localStorage.setItem("gotex_setup_dismissed", "true");
    setDismissed(true);
  };

  return (
    <GoteraCard className="mb-6 border-amber-500 bg-amber-50">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-amber-900 mb-2">Setup Guide</h3>
          
          {!health.database.connected && (
            <div className="mb-3 p-2 bg-red-100 rounded text-red-800 text-sm">
              Database not connected: {health.database.error}
            </div>
          )}

          {missingRequired.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-red-700 mb-1">Required (app will not work without these):</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {missingRequired.map((e) => (
                  <li key={e.key}>{e.label} ({e.key})</li>
                ))}
              </ul>
            </div>
          )}

          {missingOptional.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Optional (features will use fallbacks):</p>
              <ul className="text-sm text-amber-600 list-disc list-inside">
                {missingOptional.map((e) => (
                  <li key={e.key}>
                    {e.label} ({e.key}) - {e.fallback}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-amber-600 hover:text-amber-800 text-sm underline"
        >
          Dismiss
        </button>
      </div>
    </GoteraCard>
  );
}
