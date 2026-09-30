import { agency } from "@/lib/config/agency";

/**
 * The app's own public URL -- for links in outbound notifications (SMS,
 * email) that need a full URL, not just a path. Prefers the configured
 * deploy URL; falls back to the agency's own domain over https so this
 * still produces a valid (if not necessarily correct pre-DNS-cutover) link
 * when NEXT_PUBLIC_SITE_URL isn't set (see .env.example).
 */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || `https://${agency.primaryDomain}`;
}
