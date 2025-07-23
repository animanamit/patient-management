import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { AuthForm } from '../auth-form'
import { useAuth } from '@/hooks/use-auth'

// Mock the useAuth hook
vi.mock('@/hooks/use-auth')

describe('AuthForm', () => {
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render email/password form by default', () => {
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      sendSmsOtp: vi.fn(),
      verifySmsOtp: vi.fn(),
      isSigningIn: false,
      isSigningUp: false,
    } as any)

    render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should switch to phone authentication when phone tab is clicked', () => {
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      sendSmsOtp: vi.fn(),
      verifySmsOtp: vi.fn(),
      isSigningIn: false,
      isSigningUp: false,
    } as any)

    render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />)

    const phoneTab = screen.getByRole('tab', { name: /phone/i })
    fireEvent.click(phoneTab)

    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send code/i })).toBeInTheDocument()
  })

  it('should handle email sign in', async () => {
    const mockSignIn = vi.fn().mockResolvedValue(undefined)
    
    vi.mocked(useAuth).mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      sendSmsOtp: vi.fn(),
      verifySmsOtp: vi.fn(),
      isSigningIn: false,
      isSigningUp: false,
    } as any)

    render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />)

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('should handle email sign up', async () => {
    const mockSignUp = vi.fn().mockResolvedValue(undefined)
    
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(),
      signUp: mockSignUp,
      sendSmsOtp: vi.fn(),
      verifySmsOtp: vi.fn(),
      isSigningIn: false,
      isSigningUp: false,
    } as any)

    render(<AuthForm mode="signup" onSuccess={mockOnSuccess} />)

    // Fill in form
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'test@example.com',
        password: 'password123',
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('should handle SMS OTP flow', async () => {
    const mockSendSmsOtp = vi.fn().mockResolvedValue(undefined)
    const mockVerifySmsOtp = vi.fn().mockResolvedValue(undefined)
    
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      sendSmsOtp: mockSendSmsOtp,
      verifySmsOtp: mockVerifySmsOtp,
      isSigningIn: false,
      isSigningUp: false,
    } as any)

    render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />)

    // Switch to phone tab
    const phoneTab = screen.getByRole('tab', { name: /phone/i })
    fireEvent.click(phoneTab)

    // Enter phone number
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '+6512345678' }
    })

    // Send OTP
    fireEvent.click(screen.getByRole('button', { name: /send code/i }))

    await waitFor(() => {
      expect(mockSendSmsOtp).toHaveBeenCalledWith({
        phoneNumber: '+6512345678',
      })
    })

    // Enter OTP code
    const otpInputs = screen.getAllByRole('textbox')
    otpInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1).toString() } })
    })

    // Verify OTP
    fireEvent.click(screen.getByRole('button', { name: /verify/i }))

    await waitFor(() => {
      expect(mockVerifySmsOtp).toHaveBeenCalledWith({
        phoneNumber: '+6512345678',
        code: '123456',
      })
    })

    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it('should display error messages', async () => {
    const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    
    vi.mocked(useAuth).mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      sendSmsOtp: vi.fn(),
      verifySmsOtp: vi.fn(),
      isSigningIn: false,
      isSigningUp: false,
    } as any)

    render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />)

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong' }
    })

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('should show loading state', () => {
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      sendSmsOtp: vi.fn(),
      verifySmsOtp: vi.fn(),
      isSigningIn: true,
      isSigningUp: false,
    } as any)

    render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />)

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('should validate form inputs', async () => {
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      sendSmsOtp: vi.fn(),
      verifySmsOtp: vi.fn(),
      isSigningIn: false,
      isSigningUp: false,
    } as any)

    render(<AuthForm mode="signin" onSuccess={mockOnSuccess} />)

    // Try to submit without filling in required fields
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })
})