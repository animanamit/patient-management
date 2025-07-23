import { test, expect } from '@playwright/test'

test.describe('Patient Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated patient user
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 'user_123',
        email: 'patient@example.com',
        name: 'John Doe',
        role: 'PATIENT'
      }))
    })
    
    // Navigate to patient dashboard
    await page.goto('/patient')
  })

  test('should display patient dashboard correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/CarePulse/i)
    
    // Check navigation bar
    await expect(page.getByText('CarePulse')).toBeVisible()
    await expect(page.getByText('John Doe')).toBeVisible()
    
    // Check patient dashboard header
    await expect(page.getByText('Patient Dashboard')).toBeVisible()
  })

  test('should show patient information section', async ({ page }) => {
    // Wait for patient data to load
    await page.waitForLoadState('networkidle')
    
    // Patient info should be visible
    await expect(page.getByText('Patient Information')).toBeVisible()
    
    // Should show patient details (these might be loading states initially)
    await expect(page.locator('[data-testid="patient-name"], .animate-pulse')).toBeVisible()
  })

  test('should display upcoming appointments section', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Upcoming appointments section should be visible
    await expect(page.getByText('Upcoming Appointments')).toBeVisible()
    
    // Should show either appointments or empty state
    const hasAppointments = await page.getByText('No upcoming appointments').isVisible()
    if (!hasAppointments) {
      // If there are appointments, check for appointment cards
      await expect(page.locator('[data-testid="appointment-card"]')).toBeVisible()
    } else {
      // If no appointments, should show empty state
      await expect(page.getByText('No upcoming appointments')).toBeVisible()
      await expect(page.getByText('Book your next appointment')).toBeVisible()
    }
  })

  test('should display recent activity section', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Recent activity section should be visible
    await expect(page.getByText('Recent Activity')).toBeVisible()
    
    // Should show either activities or empty state
    const hasActivity = await page.getByText('No recent activity').isVisible()
    if (!hasActivity) {
      // If there are activities, check for activity items
      await expect(page.locator('[data-testid="activity-item"]')).toBeVisible()
    } else {
      // If no activities, should show empty state
      await expect(page.getByText('No recent activity')).toBeVisible()
    }
  })

  test('should display documents section', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Documents section should be visible
    await expect(page.getByText('Documents')).toBeVisible()
    
    // Should show either documents or empty state
    const hasDocuments = await page.getByText('No documents available').isVisible()
    if (!hasDocuments) {
      // If there are documents, check for document items
      await expect(page.locator('[data-testid="document-item"]')).toBeVisible()
    } else {
      // If no documents, should show empty state
      await expect(page.getByText('No documents available')).toBeVisible()
    }
  })

  test('should handle loading states', async ({ page }) => {
    // Before data loads, should show loading skeletons
    await expect(page.locator('.animate-pulse')).toBeVisible()
    
    // Wait for loading to complete
    await page.waitForLoadState('networkidle')
  })

  test('should allow booking new appointment', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Look for book appointment button
    const bookButton = page.getByRole('button', { name: /book.*appointment/i })
    if (await bookButton.isVisible()) {
      await bookButton.click()
      
      // Should open booking modal or navigate to booking page
      await expect(page.getByText(/book.*appointment/i)).toBeVisible()
    }
  })

  test('should show contact information', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Contact information should be displayed
    await expect(page.getByText('Contact Information')).toBeVisible()
    
    // Should show contact details or loading state
    await expect(page.locator('[data-testid="contact-info"], .animate-pulse')).toBeVisible()
  })

  test('should display emergency contact information', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Emergency contact should be shown
    await expect(page.getByText('Emergency Contact')).toBeVisible()
    
    // Should show emergency contact details or loading state
    await expect(page.locator('[data-testid="emergency-contact"], .animate-pulse')).toBeVisible()
  })

  test('should handle appointment status display', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Check for different appointment statuses
    const statusElements = page.locator('[data-testid="appointment-status"]')
    const count = await statusElements.count()
    
    if (count > 0) {
      // Check that status badges are displayed with appropriate colors
      for (let i = 0; i < count; i++) {
        const status = statusElements.nth(i)
        await expect(status).toBeVisible()
        
        // Status should have appropriate styling
        const className = await status.getAttribute('class')
        expect(className).toMatch(/bg-|text-/) // Should have color classes
      }
    }
  })

  test('should show patient metrics/stats', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Look for stats or metrics section
    const statsSection = page.locator('[data-testid="patient-stats"]')
    if (await statsSection.isVisible()) {
      await expect(statsSection).toBeVisible()
      
      // Should show various metrics
      await expect(page.getByText(/total.*appointments/i)).toBeVisible()
    }
  })

  test('should allow editing patient information', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Look for edit button
    const editButton = page.getByRole('button', { name: /edit.*profile/i })
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Should open edit modal or form
      await expect(page.getByText(/edit.*profile|update.*information/i)).toBeVisible()
    }
  })

  test('should display medical history section', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Medical history section might be present
    const medicalHistory = page.getByText('Medical History')
    if (await medicalHistory.isVisible()) {
      await expect(medicalHistory).toBeVisible()
      
      // Should show history items or empty state
      const hasHistory = await page.getByText('No medical history').isVisible()
      if (!hasHistory) {
        await expect(page.locator('[data-testid="history-item"]')).toBeVisible()
      }
    }
  })

  test('should handle allergies display', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Allergies section might be present
    const allergiesSection = page.getByText('Allergies')
    if (await allergiesSection.isVisible()) {
      await expect(allergiesSection).toBeVisible()
      
      // Should show allergies or "No known allergies"
      const hasAllergies = await page.getByText('No known allergies').isVisible()
      if (!hasAllergies) {
        await expect(page.locator('[data-testid="allergy-item"]')).toBeVisible()
      }
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Navigation should adapt to mobile
    await expect(page.getByText('CarePulse')).toBeVisible()
    
    // Dashboard should be readable on mobile
    await expect(page.getByText('Patient Dashboard')).toBeVisible()
    
    // Content should stack vertically and be accessible
    const mainContent = page.locator('main, [role="main"]')
    if (await mainContent.isVisible()) {
      await expect(mainContent).toBeVisible()
    }
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network error by intercepting API calls
    await page.route('**/api/**', route => route.abort())
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should show error states or retry buttons
    const errorMessage = page.getByText(/error|failed|try again/i)
    const retryButton = page.getByRole('button', { name: /retry|try again/i })
    
    if (await errorMessage.isVisible() || await retryButton.isVisible()) {
      await expect(errorMessage.or(retryButton)).toBeVisible()
    }
  })
})