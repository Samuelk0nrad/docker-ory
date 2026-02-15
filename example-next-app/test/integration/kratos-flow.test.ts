/**
 * Integration tests for Kratos Self-Service flows
 * Tests registration, login, recovery, verification, and settings flows
 */

import { createTestUser, getKratosSession, deleteKratosIdentity, type TestUser } from '../helpers/flow-helpers'

describe('Kratos Flow Integration', () => {
  const kratosUrl = process.env.NEXT_PUBLIC_KRATOS_URL || 'http://localhost:6545'
  const kratosAdminUrl = process.env.KRATOS_ADMIN_URL || 'http://localhost:6544'
  
  let testUser: TestUser
  let identityId: string

  beforeAll(() => {
    testUser = {
      email: `kratos-test-${Date.now()}@example.com`,
      password: 'KratosTest123!',
    }
  })

  afterAll(async () => {
    // Cleanup
    if (identityId) {
      try {
        await deleteKratosIdentity(identityId)
      } catch (error) {
        console.warn('Failed to cleanup test identity:', error)
      }
    }
  })

  describe('Kratos Public API Health', () => {
    it('should verify Kratos public endpoint is accessible', async () => {
      const response = await fetch(`${kratosUrl}/health/ready`)
      
      expect(response.ok).toBe(true)
      const data = await response.json()
      expect(data.status).toBe('ok')
    })
  })

  describe('Registration Flow', () => {
    it('should initialize a registration flow', async () => {
      const response = await fetch(`${kratosUrl}/self-service/registration/api`, {
        method: 'GET',
      })
      
      expect(response.ok).toBe(true)
      const flow = await response.json()
      
      expect(flow.id).toBeDefined()
      expect(flow.ui).toBeDefined()
      expect(flow.ui.nodes).toBeDefined()
      expect(Array.isArray(flow.ui.nodes)).toBe(true)
    })

    it('should complete registration with password method', async () => {
      const identity = await createTestUser(testUser)
      
      expect(identity).toBeDefined()
      expect(identity.id).toBeDefined()
      expect(identity.traits.email).toBe(testUser.email)
      expect(identity.schema_id).toBe('default')
      
      identityId = identity.id
    })

    it('should verify identity exists in Kratos admin', async () => {
      expect(identityId).toBeDefined()
      
      const response = await fetch(`${kratosAdminUrl}/admin/identities/${identityId}`)
      
      expect(response.ok).toBe(true)
      const identity = await response.json()
      expect(identity.traits.email).toBe(testUser.email)
    })
  })

  describe('Login Flow', () => {
    it('should initialize a login flow', async () => {
      const response = await fetch(`${kratosUrl}/self-service/login/api`, {
        method: 'GET',
      })
      
      expect(response.ok).toBe(true)
      const flow = await response.json()
      
      expect(flow.id).toBeDefined()
      expect(flow.ui).toBeDefined()
      expect(flow.type).toBe('api')
    })

    it('should authenticate with password method', async () => {
      // Initialize flow
      const flowResponse = await fetch(`${kratosUrl}/self-service/login/api`, {
        method: 'GET',
      })
      const flowData = await flowResponse.json()
      
      // Submit login
      const submitResponse = await fetch(`${kratosUrl}/self-service/login?flow=${flowData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'password',
          identifier: testUser.email,
          password: testUser.password,
        }),
      })
      
      expect(submitResponse.ok).toBe(true)
      const result = await submitResponse.json()
      expect(result.session).toBeDefined()
      expect(result.session_token).toBeDefined()
    })
  })

  describe('Recovery Flow', () => {
    it('should initialize a recovery flow', async () => {
      const response = await fetch(`${kratosUrl}/self-service/recovery/api`, {
        method: 'GET',
      })
      
      expect(response.ok).toBe(true)
      const flow = await response.json()
      
      expect(flow.id).toBeDefined()
      expect(flow.ui).toBeDefined()
      expect(flow.state).toBeDefined()
    })
  })

  describe('Verification Flow', () => {
    it('should initialize a verification flow', async () => {
      const response = await fetch(`${kratosUrl}/self-service/verification/api`, {
        method: 'GET',
      })
      
      expect(response.ok).toBe(true)
      const flow = await response.json()
      
      expect(flow.id).toBeDefined()
      expect(flow.ui).toBeDefined()
      expect(flow.state).toBeDefined()
    })
  })

  describe('Settings Flow', () => {
    it('should initialize a settings flow', async () => {
      // Note: Settings flow requires authentication
      // This test demonstrates the flow initialization without auth
      const response = await fetch(`${kratosUrl}/self-service/settings/api`, {
        method: 'GET',
        redirect: 'manual',
      })
      
      // Without auth, should redirect or return 401
      expect([302, 401, 403]).toContain(response.status)
    })
  })

  describe('Session Management', () => {
    it('should return 401 for whoami without session', async () => {
      const response = await fetch(`${kratosUrl}/sessions/whoami`)
      
      expect(response.status).toBe(401)
    })

    it('should return session info with valid session token', async () => {
      // First, create a session via login
      const flowResponse = await fetch(`${kratosUrl}/self-service/login/api`, {
        method: 'GET',
      })
      const flowData = await flowResponse.json()
      
      const submitResponse = await fetch(`${kratosUrl}/self-service/login?flow=${flowData.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'password',
          identifier: testUser.email,
          password: testUser.password,
        }),
      })
      
      const loginResult = await submitResponse.json()
      
      // Kratos returns session in the response body for API flows
      expect(loginResult.session).toBeDefined()
      expect(loginResult.session.identity).toBeDefined()
      expect(loginResult.session.identity.traits.email).toBe(testUser.email)
      
      // Also verify we can use the session token from cookie
      const setCookie = submitResponse.headers.get('set-cookie')
      if (setCookie) {
        const sessionToken = setCookie.match(/ory_kratos_session[^=]*=([^;]+)/)?.[1]
        
        if (sessionToken) {
          const sessionResponse = await fetch(`${kratosUrl}/sessions/whoami`, {
            headers: { 'Cookie': `ory_kratos_session=${sessionToken}` },
          })
          
          expect(sessionResponse.ok).toBe(true)
          const session = await sessionResponse.json()
          expect(session.identity.traits.email).toBe(testUser.email)
        }
      }
    })
  })
})
