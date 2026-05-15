/**
 * Environment variable checker for first-run experience
 * Shows helpful warnings instead of crashes when optional services aren't configured
 */

export interface EnvStatus {
  key: string;
  label: string;
  required: boolean;
  configured: boolean;
  fallback?: string;
}

export function checkEnvVariables(): EnvStatus[] {
  return [
    {
      key: "DATABASE_URL",
      label: "PostgreSQL Database",
      required: true,
      configured: !!process.env.DATABASE_URL,
    },
    {
      key: "NEXTAUTH_SECRET",
      label: "NextAuth Secret",
      required: true,
      configured: !!process.env.NEXTAUTH_SECRET,
    },
    {
      key: "NEXTAUTH_URL",
      label: "NextAuth URL",
      required: true,
      configured: !!process.env.NEXTAUTH_URL,
    },
    {
      key: "CHAPA_SECRET_KEY",
      label: "Chapa Payments",
      required: false,
      configured: !!process.env.CHAPA_SECRET_KEY,
      fallback: "Mock payment page will be used",
    },
    {
      key: "AFRICASTALKING_API_KEY",
      label: "Africa's Talking SMS",
      required: false,
      configured: !!process.env.AFRICASTALKING_API_KEY,
      fallback: "SMS will be logged to console",
    },
    {
      key: "GROQ_API_KEY",
      label: "Groq AI Features",
      required: false,
      configured: !!process.env.GROQ_API_KEY,
      fallback: "AI features will show helpful placeholders",
    },
  ];
}

export function getMissingRequired(): EnvStatus[] {
  return checkEnvVariables().filter((e) => e.required && !e.configured);
}

export function getMissingOptional(): EnvStatus[] {
  return checkEnvVariables().filter((e) => !e.required && !e.configured);
}

export function isReadyForProduction(): boolean {
  return getMissingRequired().length === 0;
}
