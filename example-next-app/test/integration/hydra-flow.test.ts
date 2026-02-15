/**
 * Integration tests for Hydra Login and Consent flows
 * Tests the UI callback handlers that Hydra redirects to
 */

describe('Hydra Flow Integration', () => {
  const hydraAdminUrl = process.env.HYDRA_ADMIN_URL || 'http://localhost:6445'

  describe('API Route: /api/hydra/login', () => {
    it('should handle GET request for login challenge', async () => {
      // Without a real challenge, we expect an error or redirect
      const response = await fetch('http://localhost:3001/api/hydra/login', {
        method: 'GET',
        redirect: 'manual',
      })
      
      // Should return error or redirect when no challenge provided
      expect([302, 400, 422]).toContain(response.status)
    })

    it('should require login_challenge parameter', async () => {
      const response = await fetch('http://localhost:3001/api/hydra/login', {
        method: 'GET',
        redirect: 'manual',
      })
      
      // Should fail without challenge
      expect(response.status).not.toBe(200)
    })
  })

  describe('API Route: /api/hydra/consent', () => {
    it('should handle GET request for consent challenge', async () => {
      // Without a real challenge, we expect an error or redirect
      const response = await fetch('http://localhost:3001/api/hydra/consent', {
        method: 'GET',
        redirect: 'manual',
      })
      
      // Should return error or redirect when no challenge provided
      expect([302, 400, 422]).toContain(response.status)
    })

    it('should require consent_challenge parameter', async () => {
      const response = await fetch('http://localhost:3001/api/hydra/consent', {
        method: 'GET',
        redirect: 'manual',
      })
      
      // Should fail without challenge
      expect(response.status).not.toBe(200)
    })
  })

  describe('API Route: /api/hydra/logout', () => {
    it('should handle GET request for logout challenge', async () => {
      // Without a real challenge, we expect an error or redirect
      const response = await fetch('http://localhost:3001/api/hydra/logout', {
        method: 'GET',
        redirect: 'manual',
      })
      
      // Should return error or redirect when no challenge provided
      expect([302, 400, 422]).toContain(response.status)
    })
  })

  describe('Hydra Admin API Health', () => {
    it('should verify Hydra admin endpoint is accessible', async () => {
      const response = await fetch(`${hydraAdminUrl}/health/ready`)
      
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.status).toBe('ok')
    })

    it('should list OAuth2 clients', async () => {
      const response = await fetch(`${hydraAdminUrl}/admin/clients`)
      
      expect(response.ok).toBe(true)
      const clients = await response.json()
      expect(Array.isArray(clients)).toBe(true)
      
      // Should include our test client
      const testClient = clients.find((c: any) => c.client_id === 'test-client-id')
      expect(testClient).toBeDefined()
    })
  })

  describe('Hydra Flow Sequence', () => {
    it('should maintain proper redirect chain during login', async () => {
      // 1. App initiates login
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'GET',
      })
      expect(loginResponse.status).toBe(200)
      
      const loginData = await loginResponse.json()
      expect(loginData.authorizationUrl).toBeDefined()
      expect(loginData.authorizationUrl).toContain('/oauth2/auth')
      
      // Extract expected parameters from the authorization URL
      const authUrl = new URL(loginData.authorizationUrl)
      expect(authUrl.searchParams.get('client_id')).toBeDefined()
      expect(authUrl.searchParams.get('code_challenge')).toBeDefined()
      expect(authUrl.searchParams.get('state')).toBeDefined()
      
      // In a real flow, Hydra would redirect to /api/hydra/login with login_challenge
    })
  })
})
