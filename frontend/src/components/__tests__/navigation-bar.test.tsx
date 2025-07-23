import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/test-utils'
import { NavigationBar } from '../navigation-bar'
import { useAuth } from '@/hooks/use-auth'

// Mock the useAuth hook
vi.mock('@/hooks/use-auth')

// Mock usePathname
const mockPathname = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => mockPathname(),
}))

describe('NavigationBar', () => {
  it('should render CarePulse logo', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      signOut: vi.fn(),
      isSigningOut: false,
    } as any)
    
    mockPathname.mockReturnValue('/')

    render(<NavigationBar />)

    expect(screen.getByText('CarePulse')).toBeInTheDocument()
  })

  it('should show sign-in button when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      signOut: vi.fn(),
      isSigningOut: false,
    } as any)
    
    mockPathname.mockReturnValue('/')

    render(<NavigationBar />)

    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('should show user menu when authenticated', () => {
    const mockUser = {
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'PATIENT',
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      signOut: vi.fn(),
      isSigningOut: false,
    } as any)
    
    mockPathname.mockReturnValue('/')

    render(<NavigationBar />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('PATIENT')).toBeInTheDocument()
  })

  it('should show navigation links for authenticated users', () => {
    const mockUser = {
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'PATIENT',
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      signOut: vi.fn(),
      isSigningOut: false,
    } as any)
    
    mockPathname.mockReturnValue('/')

    render(<NavigationBar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Check In')).toBeInTheDocument()
  })

  it('should highlight active navigation item', () => {
    const mockUser = {
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'PATIENT',
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      signOut: vi.fn(),
      isSigningOut: false,
    } as any)
    
    mockPathname.mockReturnValue('/check-in')

    render(<NavigationBar />)

    const checkInLink = screen.getByText('Check In').closest('a')
    expect(checkInLink).toHaveStyle({ fontWeight: '600' })
  })

  it('should call signOut when sign out button is clicked', async () => {
    const mockSignOut = vi.fn()
    const mockUser = {
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'PATIENT',
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      signOut: mockSignOut,
      isSigningOut: false,
    } as any)
    
    mockPathname.mockReturnValue('/')

    render(<NavigationBar />)

    // Open the user menu
    const userButton = screen.getByText('John Doe')
    fireEvent.click(userButton)

    // Click sign out
    const signOutButton = screen.getByText('Sign Out')
    fireEvent.click(signOutButton)

    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should show different navigation items based on user role', () => {
    const mockUser = {
      id: 'user_123',
      name: 'Dr. Smith',
      email: 'dr.smith@clinic.com',
      role: 'DOCTOR',
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      signOut: vi.fn(),
      isSigningOut: false,
    } as any)
    
    mockPathname.mockReturnValue('/')

    render(<NavigationBar />)

    expect(screen.getByText('Doctor Dashboard')).toBeInTheDocument()
    expect(screen.queryByText('Patient Dashboard')).not.toBeInTheDocument()
  })

  it('should handle loading state for sign out', () => {
    const mockUser = {
      id: 'user_123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'PATIENT',
    }

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      signOut: vi.fn(),
      isSigningOut: true,
    } as any)
    
    mockPathname.mockReturnValue('/')

    render(<NavigationBar />)

    // Open the user menu
    const userButton = screen.getByText('John Doe')
    fireEvent.click(userButton)

    expect(screen.getByText('Signing out...')).toBeInTheDocument()
  })
})