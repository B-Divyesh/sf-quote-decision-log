const SLUG = 'quote-decision-log';
const KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `${KEY}:verdict`;
const API = location.hostname === 'quote-decision-log.sociobot.in'
  ? 'https://api.sociobot.in/api/v1'
  : 'https://pilot-api.sociobot.in/api/v1';

interface CachedVerdict { valid: boolean; checkedAt: number }

export function captureReturnedLicense(): boolean {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  localStorage.setItem(KEY, token.trim());
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function saveLicense(token: string): void {
  localStorage.setItem(KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(VERDICT_KEY);
}

export function licenseToken(): string | null {
  return localStorage.getItem(KEY);
}

export function isUnlocked(): boolean {
  if (!licenseToken()) return false;
  try {
    const verdict = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as CachedVerdict;
    return verdict.valid;
  } catch {
    return true;
  }
}

export async function verifyLicense(force = false): Promise<{ valid: boolean; reason: string }> {
  const token = licenseToken();
  if (!token) return { valid: false, reason: 'missing' };
  try {
    const cached = JSON.parse(localStorage.getItem(VERDICT_KEY) ?? '') as CachedVerdict;
    if (!force && Date.now() - cached.checkedAt < 86_400_000) return { valid: cached.valid, reason: 'cached' };
  } catch { /* verify below */ }

  const response = await fetch(`${API}/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('License verification is temporarily unavailable.');
  const result = await response.json() as { valid: boolean; reason: string };
  localStorage.setItem(VERDICT_KEY, JSON.stringify({ valid: result.valid, checkedAt: Date.now() }));
  return result;
}

export const checkoutUrl = `${API}/products/${SLUG}/checkout`;
