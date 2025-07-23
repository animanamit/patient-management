import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../use-auth'
import { authClient } from '@/lib/auth-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Mock the auth client
vi.mock('@/lib/auth-client')

// Mock useRouter
const mockPush = vi.fn()
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}))

describe('useAuth', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with unauthenticated state', () => {
    vi.mocked(authClient.useUser).mockReturnValue({
      data: null,
      error: null,
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
  })

  it('should return authenticated state when user exists', () => {
    const mockUser = {
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'PATIENT',
    }

    vi.mocked(authClient.useUser).mockReturnValue({
      data: mockUser,
      error: null,
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should handle sign in successfully', async () => {
    const mockUser = {
      id: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'PATIENT',
    }

    vi.mocked(authClient.useUser).mockReturnValue({
      data: null,
      error: null,
    } as any)

    vi.mocked(authClient.signIn.email).mockResolvedValue({
      data: {
        user: mockUser,
        session: { id: 'session_123' },
      },
      error: null,
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.signIn({ 
        email: 'test@example.com', 
        password: 'password123' 
      })
    })

    expect(authClient.signIn.email).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('should handle sign in error', async () => {
    const mockError = new Error('Invalid credentials')
    
    vi.mocked(authClient.useUser).mockReturnValue({
      data: null,
      error: null,
    } as any)

    vi.mocked(authClient.signIn.email).mockResolvedValue({
      data: null,
      error: mockError,
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    await expect(
      act(async () => {
        await result.current.signIn({ 
          email: 'test@example.com', 
          password: 'wrong' 
        })
      })
    ).rejects.toThrow('Invalid credentials')
  })

  it('should handle sign out successfully', async () => {
    vi.mocked(authClient.useUser).mockReturnValue({
      data: { id: 'user_123', email: 'test@example.com' },
      error: null,
    } as any)

    vi.mocked(authClient.signOut).mockResolvedValue({
      data: {},
      error: null,
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(authClient.signOut).toHaveBeenCalled()
    expect(mockReplace).toHaveBeenCalledWith('/sign-in')
  })

  it('should handle SMS OTP flow', async () => {
    vi.mocked(authClient.useUser).mockReturnValue({
      data: null,
      error: null,
    } as any)

    vi.mocked(authClient.phoneNumber.sendOtp).mockResolvedValue({
      data: { success: true },
      error: null,
    } as any)

    vi.mocked(authClient.phoneNumber.verify).mockResolvedValue({
      data: {
        user: { id: 'user_123', phoneNumber: '+6512345678' },
        session: { id: 'session_123' },
      },
      error: null,
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    // Send OTP
    await act(async () => {
      await result.current.sendSmsOtp({ phoneNumber: '+6512345678' })
    })

    expect(authClient.phoneNumber.sendOtp).toHaveBeenCalledWith({
      phoneNumber: '+6512345678',
    })

    // Verify OTP
    await act(async () => {
      await result.current.verifySmsOtp({ 
        phoneNumber: '+6512345678', 
        code: '123456' 
      })
    })

    expect(authClient.phoneNumber.verify).toHaveBeenCalledWith({
      phoneNumber: '+6512345678',
      code: '123456',
    })
  })

  it('should handle role checking correctly', () => {
    const mockUser = {
      id: 'user_123',
      email: 'test@example.com',
      role: 'DOCTOR',
    }

    vi.mocked(authClient.useUser).mockReturnValue({
      data: mockUser,
      error: null,
    } as any)

    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isDoctor).toBe(true)
    expect(result.current.isPatient).toBe(false)
    expect(result.current.isStaff).toBe(false)
  })
})