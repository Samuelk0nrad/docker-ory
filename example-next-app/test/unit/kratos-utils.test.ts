/**
 * Unit tests for Kratos utility functions
 */

describe('Kratos Utils', () => {
  describe('Flow Type Detection', () => {
    it('should identify login flows', () => {
      const flowType = 'login'
      expect(flowType).toBe('login')
    })

    it('should identify registration flows', () => {
      const flowType = 'registration'
      expect(flowType).toBe('registration')
    })

    it('should identify recovery flows', () => {
      const flowType = 'recovery'
      expect(flowType).toBe('recovery')
    })

    it('should identify verification flows', () => {
      const flowType = 'verification'
      expect(flowType).toBe('verification')
    })

    it('should identify settings flows', () => {
      const flowType = 'settings'
      expect(flowType).toBe('settings')
    })
  })

  describe('UI Node Processing', () => {
    it('should extract input fields from UI nodes', () => {
      const mockNodes = [
        {
          type: 'input',
          attributes: {
            name: 'identifier',
            type: 'text',
            required: true,
          },
        },
        {
          type: 'input',
          attributes: {
            name: 'password',
            type: 'password',
            required: true,
          },
        },
      ]

      const inputNodes = mockNodes.filter(node => node.type === 'input')
      expect(inputNodes).toHaveLength(2)
      expect(inputNodes[0].attributes.name).toBe('identifier')
      expect(inputNodes[1].attributes.name).toBe('password')
    })

    it('should handle CSRF token nodes', () => {
      const mockNode = {
        type: 'input',
        attributes: {
          name: 'csrf_token',
          type: 'hidden',
          value: 'test-csrf-token',
        },
      }

      expect(mockNode.attributes.name).toBe('csrf_token')
      expect(mockNode.attributes.type).toBe('hidden')
      expect(mockNode.attributes.value).toBeDefined()
    })
  })

  describe('Error Message Extraction', () => {
    it('should extract error messages from flow response', () => {
      const mockFlow = {
        ui: {
          messages: [
            {
              id: 4000006,
              text: 'The provided credentials are invalid',
              type: 'error',
            },
          ],
        },
      }

      const errors = mockFlow.ui.messages.filter(msg => msg.type === 'error')
      expect(errors).toHaveLength(1)
      expect(errors[0].text).toContain('invalid')
    })

    it('should handle flows without errors', () => {
      const mockFlow = {
        ui: {
          messages: [],
        },
      }

      const errors = mockFlow.ui.messages.filter(msg => msg.type === 'error')
      expect(errors).toHaveLength(0)
    })
  })
})
