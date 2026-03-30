/**
 * Verifies if the provided email matches the configured admin email.
 * This checks both the secure server-only ADMIN_EMAIL and the public
 * NEXT_PUBLIC_ADMIN_EMAIL as a fallback.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  
  // Prefer the purely server-side env variable, fallback to the public one
  const configuredAdminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  
  return email === configuredAdminEmail;
}
