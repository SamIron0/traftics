// Works on both server and client: DEMO_USER_EMAIL is only defined
// server-side, NEXT_PUBLIC_DEMO_USER_EMAIL is inlined into the client bundle.
export const DEMO_USER_EMAIL =
  process.env.DEMO_USER_EMAIL ??
  process.env.NEXT_PUBLIC_DEMO_USER_EMAIL ??
  "samuelironkwec@gmail.com";

/**
 * The shared demo account is read-only: visitors signed into it must not be
 * able to change billing, settings, or project configuration.
 */
export function isDemoUser(
  user: { email?: string | null } | null | undefined
): boolean {
  return user?.email?.toLowerCase() === DEMO_USER_EMAIL.toLowerCase();
}
