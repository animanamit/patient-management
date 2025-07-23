import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

// Create a custom render function that includes providers
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
})

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const testQueryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Mock auth context for tests
export const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  isSigningIn: false,
  isSigningOut: false,
  isSigningUp: false,
  sendSmsOtp: vi.fn(),
  verifySmsOtp: vi.fn(),
  isLoading: false,
}

// MSW Test helpers
export { setMockSession, clearMockSession, getMockSession } from './mocks/handlers/auth-handlers'
export { server } from './mocks/server'

// Mock user data
export const mockUser = {
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'PATIENT' as const,
  phoneNumber: '+6512345678',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

// Mock patient data
export const mockPatient = {
  id: 'patient_123',
  userId: 'user_123',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'MALE' as const,
  phoneNumber: '+6512345678',
  email: 'john.doe@example.com',
  address: '123 Main St',
  nric: 'S1234567A',
  allergies: [],
  emergencyContact: {
    name: 'Jane Doe',
    phoneNumber: '+6587654321',
    relationship: 'Spouse',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

// Mock doctor data
export const mockDoctor = {
  id: 'doctor_123',
  userId: 'user_456',
  firstName: 'Sarah',
  lastName: 'Smith',
  specialization: 'General Practice',
  licenseNumber: 'M12345',
  phoneNumber: '+6598765432',
  email: 'dr.smith@clinic.com',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

// Mock appointment data
export const mockAppointment = {
  id: 'appointment_123',
  patientId: 'patient_123',
  doctorId: 'doctor_123',
  scheduledDateTime: new Date().toISOString(),
  durationMinutes: 30,
  type: 'CONSULTATION' as const,
  status: 'SCHEDULED' as const,
  reasonForVisit: 'Regular checkup',
  notes: '',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

// Mock appointment with details
export const mockAppointmentWithDetails = {
  ...mockAppointment,
  patient: mockPatient,
  doctor: mockDoctor,
}

// re-export everything
export * from '@testing-library/react'
export { customRender as render, createTestQueryClient }