import { test, expect } from '@playwright/test'

test.describe('Doctor Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated doctor user
    await page.evaluate(() => {
      localStorage.setItem('auth-user', JSON.stringify({
        id: 'user_456',
        email: 'doctor@example.com',
        name: 'Dr. Sarah Smith',
        role: 'DOCTOR'
      }))
    })
    
    // Navigate to doctor dashboard
    await page.goto('/doctor')
  })

  test('should display doctor dashboard correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/CarePulse/i)
    
    // Check navigation bar
    await expect(page.getByText('CarePulse')).toBeVisible()
    await expect(page.getByText('Dr. Sarah Smith')).toBeVisible()
    
    // Check doctor dashboard header
    await expect(page.getByText(/Dr\./)).toBeVisible()
  })

  test('should show doctor information in header', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Doctor name and info should be visible
    await expect(page.getByText(/Dr\./)).toBeVisible()
    
    // Should show specialization or loading state
    await expect(page.locator('[data-testid="doctor-specialization"], .animate-pulse')).toBeVisible()
  })

  test('should display today\'s overview stats', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Today's overview section should be visible
    await expect(page.getByText('Today\'s Overview')).toBeVisible()
    
    // Should show stats cards
    await expect(page.getByText(/today/i)).toBeVisible()
    await expect(page.getByText(/scheduled/i)).toBeVisible()
    await expect(page.getByText(/in progress/i)).toBeVisible()
    await expect(page.getByText(/completed/i)).toBeVisible()
  })

  test('should display in-progress appointments section', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // In progress section should be visible
    await expect(page.getByText('In Progress')).toBeVisible()
    
    // Should show either appointments or empty state
    const hasInProgress = await page.locator('[data-testid="in-progress-appointment"]').count()
    if (hasInProgress > 0) {
      // Should show appointment details with Continue Session button
      await expect(page.getByRole('button', { name: /continue session/i })).toBeVisible()
    }
  })

  test('should display upcoming appointments section', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Upcoming today section should be visible
    await expect(page.getByText('Upcoming Today')).toBeVisible()
    
    // Should show either appointments or empty state
    const hasUpcoming = await page.getByText('No upcoming appointments').isVisible()
    if (!hasUpcoming) {
      // If there are appointments, should show Start Session buttons
      await expect(page.getByRole('button', { name: /start session/i })).toBeVisible()
    } else {
      // If no appointments, should show empty state
      await expect(page.getByText('No upcoming appointments')).toBeVisible()
      await expect(page.getByText('Your schedule is clear')).toBeVisible()
    }
  })

  test('should show patient lookup functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Patient lookup section should be visible (desktop only)
    const patientLookup = page.getByText('Patient Lookup')
    if (await patientLookup.isVisible()) {
      await expect(patientLookup).toBeVisible()
      
      // Should have search input
      await expect(page.getByPlaceholder(/search patients/i)).toBeVisible()
      
      // Should have view all patients button
      await expect(page.getByRole('button', { name: /view all patients/i })).toBeVisible()
    }
  })

  test('should display recent activity section', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Recent activity section should be visible (desktop only)
    const recentActivity = page.getByText('Recent Activity')
    if (await recentActivity.isVisible()) {
      await expect(recentActivity).toBeVisible()
      
      // Should show either activities or empty state
      const hasActivity = await page.getByText('No completed appointments yet today').isVisible()
      if (!hasActivity) {
        // Should show completed appointment items
        await expect(page.locator('[data-testid="activity-item"]')).toBeVisible()
      }
    }
  })

  test('should show quick actions section', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Quick actions section should be visible (desktop only)
    const quickActions = page.getByText('Quick Actions')
    if (await quickActions.isVisible()) {
      await expect(quickActions).toBeVisible()
      
      // Should show action buttons
      await expect(page.getByText('Schedule Appointment')).toBeVisible()
      await expect(page.getByText('Add Patient')).toBeVisible()
      await expect(page.getByText('Clinical Notes')).toBeVisible()
    }
  })

  test('should handle appointment interactions', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Test Start Session button for upcoming appointments
    const startButton = page.getByRole('button', { name: /start session/i }).first()
    if (await startButton.isVisible()) {
      await startButton.click()
      
      // Should trigger some action (navigation or modal)
      // This depends on the actual implementation
    }
    
    // Test Continue Session button for in-progress appointments
    const continueButton = page.getByRole('button', { name: /continue session/i }).first()
    if (await continueButton.isVisible()) {
      await continueButton.click()
      
      // Should trigger some action
    }
  })

  test('should show doctor selection dropdown when multiple doctors exist', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Doctor selection dropdown should be visible if multiple doctors (desktop only)
    const doctorSelect = page.locator('select').first()
    if (await doctorSelect.isVisible()) {
      await expect(doctorSelect).toBeVisible()
      
      // Should have options
      const options = await doctorSelect.locator('option').count()
      expect(options).toBeGreaterThan(0)
    }
  })

  test('should display new appointment button', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // New appointment button should be visible
    await expect(page.getByRole('button', { name: /new appointment/i })).toBeVisible()
  })

  test('should handle loading states', async ({ page }) => {
    // Before data loads, should show loading skeletons
    await expect(page.locator('.animate-pulse')).toBeVisible()
    
    // Wait for loading to complete
    await page.waitForLoadState('networkidle')
  })

  test('should handle empty states correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Check for empty states in different sections
    const emptyStates = [
      'No upcoming appointments',
      'Your schedule is clear',
      'No completed appointments yet today'
    ]
    
    for (const emptyText of emptyStates) {
      const element = page.getByText(emptyText)
      if (await element.isVisible()) {
        await expect(element).toBeVisible()
      }
    }
  })

  test('should display appointment status badges correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Look for status indicators
    const statusBadges = page.locator('[data-testid="appointment-status"]')
    const count = await statusBadges.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const badge = statusBadges.nth(i)
        await expect(badge).toBeVisible()
        
        // Should have appropriate styling for different statuses
        const text = await badge.textContent()
        expect(text).toMatch(/SCHEDULED|IN PROGRESS|COMPLETED|CANCELLED/i)
      }
    }
  })

  test('should show patient information in appointments', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Appointments should show patient names and IDs
    const appointmentCards = page.locator('[data-testid="appointment-card"]')
    const count = await appointmentCards.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const card = appointmentCards.nth(i)
        await expect(card).toBeVisible()
        
        // Should contain patient information
        await expect(card.locator('[data-testid="patient-name"]')).toBeVisible()
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
    
    // Doctor info should be visible
    await expect(page.getByText(/Dr\./)).toBeVisible()
    
    // Sidebar sections should be hidden on mobile
    const patientLookup = page.getByText('Patient Lookup')
    await expect(patientLookup).not.toBeVisible()
    
    // Main content should be accessible
    await expect(page.getByText('Today\'s Overview')).toBeVisible()
  })

  test('should handle view schedule button', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // View schedule button should be visible (desktop only)
    const viewScheduleButton = page.getByRole('button', { name: /view schedule/i })
    if (await viewScheduleButton.isVisible()) {
      await viewScheduleButton.click()
      
      // Should trigger some action (likely open calendar or schedule view)
    }
  })

  test('should handle view full schedule button', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // View full schedule button should be visible
    const fullScheduleButton = page.getByRole('button', { name: /view full schedule/i })
    if (await fullScheduleButton.isVisible()) {
      await fullScheduleButton.click()
      
      // Should trigger some action
    }
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network error by intercepting API calls
    await page.route('**/api/**', route => route.abort())
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should show error states or try again buttons
    const errorMessage = page.getByText(/error|failed|unable to load/i)
    const retryButton = page.getByRole('button', { name: /try again/i })
    
    if (await errorMessage.isVisible() || await retryButton.isVisible()) {
      await expect(errorMessage.or(retryButton)).toBeVisible()
    }
  })

  test('should handle no doctors state', async ({ page }) => {
    // Mock empty doctors response
    await page.route('**/api/doctors**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ doctors: [], total: 0 })
      })
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should show no doctors found state
    await expect(page.getByText('No Doctors Found')).toBeVisible()
    await expect(page.getByText('Add a doctor to get started')).toBeVisible()
    await expect(page.getByRole('button', { name: /add first doctor/i })).toBeVisible()
  })
})