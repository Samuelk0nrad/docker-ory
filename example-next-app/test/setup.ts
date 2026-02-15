import '@testing-library/jest-dom'
import fetch from 'node-fetch'
import { webcrypto } from 'crypto'
import { TextDecoder, TextEncoder } from 'util'

// Polyfill fetch for Node.js environment (Jest with coverage)
if (!globalThis.fetch) {
  globalThis.fetch = fetch as unknown as typeof globalThis.fetch
}

// Polyfill TextEncoder/TextDecoder for Node.js environment
if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder as unknown as typeof globalThis.TextEncoder
  globalThis.TextDecoder = TextDecoder as unknown as typeof globalThis.TextDecoder
}

// Polyfill Web Crypto API for Node.js environment
if (!globalThis.crypto?.subtle) {
  if (!globalThis.crypto) {
    globalThis.crypto = webcrypto as Crypto
  } else {
    // Use Object.defineProperty to override the read-only subtle property
    Object.defineProperty(globalThis.crypto, 'subtle', {
      value: webcrypto.subtle,
      writable: true,
      configurable: true
    })
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

