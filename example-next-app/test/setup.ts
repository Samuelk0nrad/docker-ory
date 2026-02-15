import '@testing-library/jest-dom'

// Polyfill fetch for Node.js environment (Jest with coverage)
if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch')
}

// Polyfill TextEncoder/TextDecoder for Node.js environment
if (!globalThis.TextEncoder) {
  const util = require('util')
  globalThis.TextEncoder = util.TextEncoder
  globalThis.TextDecoder = util.TextDecoder
}

// Polyfill Web Crypto API for Node.js environment
if (!globalThis.crypto?.subtle) {
  const { webcrypto } = require('crypto')
  if (!globalThis.crypto) {
    globalThis.crypto = webcrypto
  } else {
    globalThis.crypto.subtle = webcrypto.subtle
  }
}

// Mock environment variables for tests
process.env.NEXT_PUBLIC_KRATOS_URL = 'http://localhost:6545'
process.env.NEXT_PUBLIC_HYDRA_URL = 'http://localhost:6444'
process.env.HYDRA_ADMIN_URL = 'http://localhost:6445'
process.env.KRATOS_ADMIN_URL = 'http://localhost:6544'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Global test timeout
jest.setTimeout(30000)

