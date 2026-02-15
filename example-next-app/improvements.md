> a lot of these issues are already fixed or they are not relevant anymore. make sure to check the codebase the the current architecuture before fixing any of these issues. 

> make sure after every fix to run the tests and check if they are still passing, + run linting and type checks + build the app to ensure there are no errors.

> after fixing one issue mark them as fixed in this list!!

## **🔴 CRITICAL SECURITY ISSUES**

### ✅ 4. **Missing Nonce Parameter for OIDC** - FIXED
- ✅ Added `nonce` parameter generation in OAuth flow initiation
- ✅ Stored nonce in secure httpOnly cookie
- ✅ Implemented nonce validation in ID token before storing
- ✅ Prevents replay attacks in OIDC flow

### ✅ 5. **No JWT Signature Verification** - FIXED
- ✅ Installed `jose` library for secure JWT operations
- ✅ Replaced unsafe JWT decoding with proper signature verification
- ✅ Implemented verification against Hydra's JWKS endpoint
- ✅ Added issuer validation to ensure token is from Hydra
- ✅ Invalid tokens are rejected with 401 and cleared from cookies
- ✅ **CRITICAL FIX**: Now impossible to craft fake tokens

### ✅ 6. **Potential Open Redirect Vulnerability** - FIXED
- ✅ Implemented origin validation for `returnTo` parameter
- ✅ Only allows redirects to same origin (protocol, host, port)
- ✅ Falls back to root path ("/") for invalid or external URLs
- ✅ Added error handling for malformed URLs
- ✅ Prevents attackers from redirecting users to phishing sites

## **🟠 HIGH SEVERITY ISSUES**

### 🔴 ✅ 🔴 7. **Missing Rate Limiting** - Later with proxy / other infra
- No rate limiting on OAuth endpoints (`/api/auth/login`, `/api/hydra/login`, etc.)
- Vulnerable to brute force and DoS attacks
- **Recommendation**: Implement rate limiting Proxy-level (e.g. Nginx)

### ✅ 8. **Insufficient Token Expiry Validation** - FIXED
- ✅ Added explicit server-side token expiry validation using `exp` claim
- ✅ `jwtVerify` from jose library automatically validates expiry
- ✅ Added additional explicit expiry check with clear logging
- ✅ Expired tokens return 401 with `expired: true` flag
- ✅ All token cookies (id_token, access_token, token_meta) are cleared on expiry
- ✅ Client receives clear indication when token has expired for proper refresh logic

### 9. **No Hydra Admin API Authentication**
ory/hydra/hydra.ts shows the Hydra Admin API has no authentication:
```typescript
export const hydraAdmin = new OAuth2Api(
  new Configuration({
    basePath: HydraAdminUrl,
  })
);
```
- If exposed, anyone could accept login/consent requests
- **Recommendation**: Ensure Admin API is only accessible from Next.js backend (network isolation)

### ✅ 10. **State Cookie Not Cleared on Error** - FIXED
- ✅ Moved cookie clearing to happen immediately after retrieving values
- ✅ State, nonce, PKCE verifier, and returnTo cookies now cleared before validation
- ✅ Prevents cookie reuse even when validation fails
- ✅ Protects against CSRF attacks by ensuring one-time use of state values
- ✅ All temporary OAuth cookies cleared regardless of success or error

## **🟡 MEDIUM SEVERITY ISSUES**

### 11. **Missing Security Headers**
No security headers are configured:
- Missing `Content-Security-Policy`
- Missing `X-Frame-Options: DENY`
- Missing `X-Content-Type-Options: nosniff`
- Missing `Strict-Transport-Security` (HSTS)
- **Recommendation**: Add security headers in Next.js middleware or config

### 12. **Logout Doesn't Revoke Hydra Session**
app/api/auth/logout/route.ts only revokes access tokens but doesn't:
- Call Hydra's logout endpoint to terminate the SSO session
- Clear Kratos session cookies
- **Recommendation**: Implement proper logout flow with Hydra's logout URL

### 13. **Error Messages Leak Implementation Details**
Multiple files expose internal error messages:
- `"Failed to fetch login request: ${loginReqRes.statusText}"`
- **Recommendation**: Generic error messages for users, detailed logging for developers

### 14. **Hardcoded Credentials in Docker Setup**
docker-compose.yaml has hardcoded credentials:
```yaml
PGADMIN_DEFAULT_PASSWORD: Kennwort1
POSTGRES_PASSWORD: Kennwort1
```
- **Recommendation**: Use Docker secrets or environment variables

### 15. **Token Metadata Exposed to Client**
app/auth/callback/route.ts exposes token metadata in non-httpOnly cookie:
```typescript
cookieStore.set("oauth_token_meta", JSON.stringify({...}), {
  httpOnly: false,
  ...
});
```
- Exposes scope and expiry information
- **Recommendation**: Keep this server-side only

## **🟢 LOW SEVERITY / BEST PRACTICES**

### 16. **Missing Middleware Protection**
- No Next.js middleware to protect routes
- All auth checks happen in individual pages/API routes
- **Recommendation**: Create middleware.ts for centralized auth

### 17. **No Token Rotation on Refresh**
app/api/auth/refresh/route.ts doesn't enforce refresh token rotation
- **Recommendation**: Configure Hydra to rotate refresh tokens

### 18. **Console.log Statements in Production**
Multiple `console.log` and `console.error` statements throughout the codebase could leak sensitive information

### 19. **No Audit Logging**
No audit trail for authentication events (login, logout, token refresh)
- **Recommendation**: Implement structured logging for security events

### 20. **Missing Request ID / Correlation ID**
No request tracking across the OAuth flow for debugging
