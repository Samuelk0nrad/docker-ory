/**
 * Integration test utilities for Ory Hydra and Kratos flows
 */

export interface TestUser {
  email: string
  password: string
}

export interface OAuthTokens {
  access_token: string
  refresh_token: string
  id_token: string
  token_type: string
  expires_in: number
}

export interface KratosIdentity {
  id: string
  schema_id: string
  traits: {
    email: string
  }
}

/**
 * Create a test user in Kratos via registration flow
 */
export async function createTestUser(user: TestUser): Promise<KratosIdentity> {
  const kratosUrl = process.env.NEXT_PUBLIC_KRATOS_URL || 'http://localhost:6545'
  
  // Initialize registration flow
  const flowResponse = await fetch(`${kratosUrl}/self-service/registration/api`, {
    method: 'GET',
  })
  
  if (!flowResponse.ok) {
    throw new Error(`Failed to initialize registration flow: ${flowResponse.statusText}`)
  }
  
  const flowData = await flowResponse.json()
  
  // Submit registration
  const submitResponse = await fetch(`${kratosUrl}/self-service/registration?flow=${flowData.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method: 'password',
      traits: { email: user.email },
      password: user.password,
    }),
  })
  
  const result = await submitResponse.json()
  
  // Check if registration failed
  if (!submitResponse.ok) {
    console.error('Registration failed:', result)
    throw new Error(`Registration failed: ${JSON.stringify(result.ui?.messages || result)}`)
  }
  
  // Kratos returns the identity inside the session object for API flows
  const identity = result.identity || result.session?.identity
  
  if (!identity) {
    console.error('No identity in response:', result)
    throw new Error('Failed to extract identity from registration response')
  }
  
  return identity
}

/**
 * Initiate OAuth2 authorization code flow with PKCE
 */
export async function initiateOAuthFlow(clientId: string, redirectUri: string) {
  const hydraUrl = process.env.NEXT_PUBLIC_HYDRA_URL || 'http://localhost:6444'
  
  // Generate PKCE verifier and challenge
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid offline_access email profile',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: generateRandomString(16),
  })
  
  const authUrl = `${hydraUrl}/oauth2/auth?${params.toString()}`
  
  return { authUrl, codeVerifier, state: params.get('state')! }
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<OAuthTokens> {
  const hydraUrl = process.env.NEXT_PUBLIC_HYDRA_URL || 'http://localhost:6444'
  
  const response = await fetch(`${hydraUrl}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
      code_verifier: codeVerifier,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token exchange failed: ${error}`)
  }
  
  return response.json()
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<OAuthTokens> {
  const hydraUrl = process.env.NEXT_PUBLIC_HYDRA_URL || 'http://localhost:6444'
  
  const response = await fetch(`${hydraUrl}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }
  
  return response.json()
}

/**
 * Revoke a token (access or refresh)
 */
export async function revokeToken(
  token: string,
  clientId: string,
  clientSecret: string
): Promise<void> {
  const hydraUrl = process.env.NEXT_PUBLIC_HYDRA_URL || 'http://localhost:6444'
  
  const response = await fetch(`${hydraUrl}/oauth2/revoke`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      token,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token revocation failed: ${error}`)
  }
}

/**
 * Get Kratos session information
 */
export async function getKratosSession(sessionToken: string): Promise<any> {
  const kratosUrl = process.env.NEXT_PUBLIC_KRATOS_URL || 'http://localhost:6545'
  
  const response = await fetch(`${kratosUrl}/sessions/whoami`, {
    headers: { 'Cookie': `ory_kratos_session_test=${sessionToken}` },
  })
  
  if (!response.ok) {
    throw new Error('Session not found or invalid')
  }
  
  return response.json()
}

/**
 * Delete a Kratos identity (cleanup)
 */
export async function deleteKratosIdentity(identityId: string): Promise<void> {
  const kratosAdminUrl = process.env.KRATOS_ADMIN_URL || 'http://localhost:6544'
  
  await fetch(`${kratosAdminUrl}/admin/identities/${identityId}`, {
    method: 'DELETE',
  })
}

// Helper functions for PKCE
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64UrlEncode(array)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(hash))
}

function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = Buffer.from(buffer).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
