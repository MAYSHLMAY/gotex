/**
 * Chappa payment client — wire secret/public keys from env in Phase 10.
 */
export function chappaConfigured(): boolean {
  return Boolean(process.env.CHAPPA_SECRET_KEY && process.env.CHAPPA_PUBLIC_KEY);
}
