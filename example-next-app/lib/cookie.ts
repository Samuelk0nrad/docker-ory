/**
 * Cookie security utilities.
 *
 * The `secure` attribute on a cookie instructs the browser to only transmit the
 * cookie over HTTPS connections. We want it enabled whenever the application is
 * reachable via HTTPS — including local Docker development where an nginx proxy
 * terminates TLS while Node.js itself runs over plain HTTP.
 *
 * Use the `COOKIE_SECURE` environment variable to override the default
 * behaviour (which falls back to `NODE_ENV === 'production'`).
 *
 * Examples:
 *   COOKIE_SECURE=true   → secure cookies (recommended behind an HTTPS proxy)
 *   COOKIE_SECURE=false  → insecure cookies (plain HTTP dev without proxy)
 *   (unset)              → secure only when NODE_ENV=production
 */
export function isCookieSecure(): boolean {
  const override = process.env.COOKIE_SECURE;
  if (override !== undefined) {
    return override === 'true' || override === '1';
  }
  return process.env.NODE_ENV === 'production';
}
