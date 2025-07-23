import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sign-in page
    await page.goto('/sign-in')
  })

  test('should display sign-in page correctly', async ({ page }) => {
    // Check page title and elements
    await expect(page).toHaveTitle(/CarePulse/i)
    await expect(page.getByText('Sign in to CarePulse')).toBeVisible()
    await expect(page.getByText('Access your healthcare management dashboard')).toBeVisible()
    
    // Check auth form is present
    await expect(page.getByRole('tablist')).toBeVisible()
    await expect(page.getByRole('tab', { name: /email/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /phone/i })).toBeVisible()
  })

  test('should show email authentication form by default', async ({ page }) => {
    // Email tab should be active
    await expect(page.getByRole('tab', { name: /email/i })).toHaveAttribute('data-state', 'active')
    
    // Email form elements should be visible
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should switch to phone authentication', async ({ page }) => {
    // Click phone tab
    await page.getByRole('tab', { name: /phone/i }).click()
    
    // Phone tab should be active
    await expect(page.getByRole('tab', { name: /phone/i })).toHaveAttribute('data-state', 'active')
    
    // Phone form elements should be visible
    await expect(page.getByLabel(/phone number/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /send code/i })).toBeVisible()
  })

  test('should validate email form inputs', async ({ page }) => {
    // Try to submit without filling in fields
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/password/i).fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show email format error
    await expect(page.getByText(/please enter a valid email/i)).toBeVisible()
  })

  test('should validate password length', async ({ page }) => {
    // Enter valid email but short password
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('short')
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Should show password length error
    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible()
  })

  test('should validate phone number format', async ({ page }) => {
    // Switch to phone tab
    await page.getByRole('tab', { name: /phone/i }).click()
    
    // Enter invalid phone number
    await page.getByLabel(/phone number/i).fill('123')
    await page.getByRole('button', { name: /send code/i }).click()
    
    // Should show phone format error
    await expect(page.getByText(/please enter a valid singapore phone number/i)).toBeVisible()
  })

  test('should handle sign-in form submission', async ({ page }) => {
    // Fill in valid credentials
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('password123')
    
    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()
    
    // Button should show loading state
    await expect(page.getByRole('button', { name: /signing in/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  test('should handle phone OTP flow', async ({ page }) => {
    // Switch to phone tab
    await page.getByRole('tab', { name: /phone/i }).click()
    
    // Enter valid phone number
    await page.getByLabel(/phone number/i).fill('+6512345678')
    
    // Send OTP
    await page.getByRole('button', { name: /send code/i }).click()
    
    // Should show loading state
    await expect(page.getByRole('button', { name: /sending/i })).toBeVisible()
    
    // After sending, should show OTP input
    await expect(page.getByText(/enter verification code/i)).toBeVisible()
    await expect(page.getByRole('textbox').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /verify/i })).toBeVisible()
  })

  test('should handle OTP input', async ({ page }) => {
    // Switch to phone tab and send OTP
    await page.getByRole('tab', { name: /phone/i }).click()
    await page.getByLabel(/phone number/i).fill('+6512345678')
    await page.getByRole('button', { name: /send code/i }).click()
    
    // Wait for OTP input to appear
    await expect(page.getByText(/enter verification code/i)).toBeVisible()
    
    // Fill in OTP (assuming 6-digit OTP)
    const otpInputs = page.getByRole('textbox')
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill((i + 1).toString())
    }
    
    // Verify button should be enabled
    await expect(page.getByRole('button', { name: /verify/i })).toBeEnabled()
    
    // Submit OTP
    await page.getByRole('button', { name: /verify/i }).click()
    
    // Should show verifying state
    await expect(page.getByRole('button', { name: /verifying/i })).toBeVisible()
  })

  test('should display authentication methods help section', async ({ page }) => {
    // Help section should be visible
    await expect(page.getByText('Authentication Methods')).toBeVisible()
    await expect(page.getByText(/email.*sign up with email and password/i)).toBeVisible()
    await expect(page.getByText(/phone.*singapore phone number/i)).toBeVisible()
  })

  test('should redirect authenticated users to dashboard', async ({ page }) => {
    // Mock authenticated state by setting localStorage/sessionStorage
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PATIENT'
      }))
    })
    
    // Navigate to sign-in page
    await page.goto('/sign-in')
    
    // Should show authenticated user info instead of sign-in form
    await expect(page.getByText('Welcome back!')).toBeVisible()
    await expect(page.getByText('You are successfully signed in to CarePulse')).toBeVisible()
    await expect(page.getByText('Test User')).toBeVisible()
    await expect(page.getByRole('button', { name: /go to dashboard/i })).toBeVisible()
  })

  test('should handle sign out from authenticated state', async ({ page }) => {
    // Mock authenticated state
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PATIENT'
      }))
    })
    
    await page.goto('/sign-in')
    
    // Click sign out
    await page.getByRole('button', { name: /sign out/i }).click()
    
    // Should show signing out state
    await expect(page.getByRole('button', { name: /signing out/i })).toBeVisible()
  })

  test('should navigate to dashboard from authenticated state', async ({ page }) => {
    // Mock authenticated state
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PATIENT'
      }))
    })
    
    await page.goto('/sign-in')
    
    // Click go to dashboard
    await page.getByRole('button', { name: /go to dashboard/i }).click()
    
    // Should navigate to home page
    await expect(page).toHaveURL('/')
  })
})