import { http, HttpResponse } from 'msw'
import { createMockUser } from '../data'

const AUTH_BASE_URL = 'http://localhost:8000/api/auth'

// Mock session storage
let mockSession: any = null
let mockUsers: any[] = [
  createMockUser({
    id: 'user_patient',
    email: 'patient@example.com',
    name: 'John Doe',
    role: 'PATIENT',
  }),
  createMockUser({
    id: 'user_doctor',
    email: 'doctor@example.com',
    name: 'Dr. Sarah Smith',
    role: 'DOCTOR',
  }),
  createMockUser({
    id: 'user_staff',
    email: 'staff@example.com',
    name: 'Alice Johnson',
    role: 'STAFF',
  }),
]

export const authHandlers = [
  // Get current session/user
  http.get(`${AUTH_BASE_URL}/session`, () => {
    if (mockSession) {
      return HttpResponse.json({
        user: mockSession.user,
        session: mockSession.session,
      })
    }

    return HttpResponse.json(
      { error: 'No active session' },
      { status: 401 }
    )
  }),

  // Email sign in
  http.post(`${AUTH_BASE_URL}/sign-in/email`, async ({ request }) => {
    const { email, password } = await request.json() as any

    // Simple mock validation
    if (!email || !password) {
      return HttpResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = mockUsers.find(u => u.email === email)
    
    if (!user) {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Mock password validation (in real app, this would be hashed)
    if (password.length < 8) {
      return HttpResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create mock session
    mockSession = {
      user,
      session: {
        id: `session_${Date.now()}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    }

    return HttpResponse.json({
      user: mockSession.user,
      session: mockSession.session,
    })
  }),

  // Email sign up
  http.post(`${AUTH_BASE_URL}/sign-up/email`, async ({ request }) => {
    const { email, password, name } = await request.json() as any

    // Simple validation
    if (!email || !password || !name) {
      return HttpResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return HttpResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email)
    if (existingUser) {
      return HttpResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = createMockUser({
      id: `user_${Date.now()}`,
      email,
      name,
      role: 'PATIENT', // Default role
    })

    mockUsers.push(newUser)

    // Create session
    mockSession = {
      user: newUser,
      session: {
        id: `session_${Date.now()}`,
        userId: newUser.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    }

    return HttpResponse.json({
      user: mockSession.user,
      session: mockSession.session,
    }, { status: 201 })
  }),

  // Phone OTP send
  http.post(`${AUTH_BASE_URL}/phone-number/send-otp`, async ({ request }) => {
    const { phoneNumber } = await request.json() as any

    if (!phoneNumber) {
      return HttpResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Mock Singapore phone number validation
    if (!phoneNumber.startsWith('+65') || phoneNumber.length !== 11) {
      return HttpResponse.json(
        { error: 'Please enter a valid Singapore phone number' },
        { status: 400 }
      )
    }

    // In real app, this would send SMS
    return HttpResponse.json({
      success: true,
      message: 'OTP sent successfully',
    })
  }),

  // Phone OTP verify
  http.post(`${AUTH_BASE_URL}/phone-number/verify`, async ({ request }) => {
    const { phoneNumber, code } = await request.json() as any

    if (!phoneNumber || !code) {
      return HttpResponse.json(
        { error: 'Phone number and code are required' },
        { status: 400 }
      )
    }

    // Mock OTP validation
    if (code !== '123456') {
      return HttpResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      )
    }

    // Find or create user by phone number
    let user = mockUsers.find(u => u.phoneNumber === phoneNumber)
    
    if (!user) {
      user = createMockUser({
        id: `user_${Date.now()}`,
        email: `${phoneNumber.replace('+', '')}@phone.local`,
        name: 'Phone User',
        phoneNumber,
        role: 'PATIENT',
      })
      mockUsers.push(user)
    }

    // Create session
    mockSession = {
      user,
      session: {
        id: `session_${Date.now()}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    }

    return HttpResponse.json({
      user: mockSession.user,
      session: mockSession.session,
    })
  }),

  // Sign out
  http.post(`${AUTH_BASE_URL}/sign-out`, () => {
    mockSession = null
    
    return HttpResponse.json({
      success: true,
      message: 'Signed out successfully',
    })
  }),

  // Google OAuth (simplified mock)
  http.get(`${AUTH_BASE_URL}/oauth/google`, () => {
    // Mock Google OAuth user
    const googleUser = createMockUser({
      id: `user_google_${Date.now()}`,
      email: 'google.user@gmail.com',
      name: 'Google User',
      role: 'PATIENT',
    })

    mockUsers.push(googleUser)

    mockSession = {
      user: googleUser,
      session: {
        id: `session_${Date.now()}`,
        userId: googleUser.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    }

    return HttpResponse.json({
      user: mockSession.user,
      session: mockSession.session,
    })
  }),

  // Get user profile
  http.get(`${AUTH_BASE_URL}/user`, () => {
    if (!mockSession) {
      return HttpResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    return HttpResponse.json({
      user: mockSession.user,
    })
  }),
]

// Helper functions for tests
export const setMockSession = (user: any) => {
  mockSession = {
    user,
    session: {
      id: `session_${Date.now()}`,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  }
}

export const clearMockSession = () => {
  mockSession = null
}

export const getMockSession = () => mockSession