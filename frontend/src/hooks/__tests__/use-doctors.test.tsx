import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDoctors, useDoctor, useCreateDoctor, useUpdateDoctor, useDeleteDoctor } from '../use-doctors'
import { createTestQueryClient, mockDoctor } from '@/test/test-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { api } from '@/lib/api'

// Mock the API
vi.mock('@/lib/api')

describe('use-doctors hooks', () => {
  const createWrapper = () => {
    const queryClient = createTestQueryClient()
    
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useDoctors', () => {
    it('should fetch doctors successfully', async () => {
      const mockDoctorsData = {
        doctors: [mockDoctor],
        total: 1,
      }

      vi.mocked(api.doctors.list).mockResolvedValue(mockDoctorsData)

      const { result } = renderHook(() => useDoctors(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockDoctorsData)
      expect(api.doctors.list).toHaveBeenCalled()
    })

    it('should handle error when fetching doctors', async () => {
      const mockError = new Error('Failed to fetch doctors')
      vi.mocked(api.doctors.list).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDoctors(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useDoctor', () => {
    it('should fetch a single doctor successfully', async () => {
      const mockDoctorData = { doctor: mockDoctor }
      vi.mocked(api.doctors.get).mockResolvedValue(mockDoctorData)

      const { result } = renderHook(() => useDoctor('doctor_123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockDoctorData)
      expect(api.doctors.get).toHaveBeenCalledWith('doctor_123')
    })

    it('should not fetch if doctorId is not provided', () => {
      vi.mocked(api.doctors.get).mockResolvedValue({ doctor: mockDoctor })

      renderHook(() => useDoctor(''), {
        wrapper: createWrapper(),
      })

      expect(api.doctors.get).not.toHaveBeenCalled()
    })

    it('should not fetch if disabled', () => {
      vi.mocked(api.doctors.get).mockResolvedValue({ doctor: mockDoctor })

      renderHook(() => useDoctor('doctor_123', { enabled: false }), {
        wrapper: createWrapper(),
      })

      expect(api.doctors.get).not.toHaveBeenCalled()
    })
  })

  describe('useCreateDoctor', () => {
    it('should create a doctor successfully', async () => {
      const newDoctorData = {
        firstName: 'John',
        lastName: 'Doe',
        specialization: 'Cardiology',
        licenseNumber: 'M54321',
        phoneNumber: '+6591234567',
        email: 'dr.doe@clinic.com',
      }

      const createdDoctor = {
        ...mockDoctor,
        ...newDoctorData,
        id: 'doctor_456',
      }

      vi.mocked(api.doctors.create).mockResolvedValue({ doctor: createdDoctor })

      const { result } = renderHook(() => useCreateDoctor(), {
        wrapper: createWrapper(),
      })

      await result.current.mutateAsync(newDoctorData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.doctors.create).toHaveBeenCalledWith(newDoctorData)
      expect(result.current.data).toEqual({ doctor: createdDoctor })
    })

    it('should handle error when creating doctor', async () => {
      const mockError = new Error('Failed to create doctor')
      vi.mocked(api.doctors.create).mockRejectedValue(mockError)

      const { result } = renderHook(() => useCreateDoctor(), {
        wrapper: createWrapper(),
      })

      await expect(
        result.current.mutateAsync({
          firstName: 'John',
          lastName: 'Doe',
          specialization: 'Cardiology',
          licenseNumber: 'M54321',
          phoneNumber: '+6591234567',
          email: 'dr.doe@clinic.com',
        })
      ).rejects.toThrow('Failed to create doctor')
    })
  })

  describe('useUpdateDoctor', () => {
    it('should update a doctor successfully', async () => {
      const updates = {
        specialization: 'Neurology',
      }

      const updatedDoctor = {
        ...mockDoctor,
        ...updates,
      }

      vi.mocked(api.doctors.update).mockResolvedValue({ doctor: updatedDoctor })

      const { result } = renderHook(() => useUpdateDoctor(), {
        wrapper: createWrapper(),
      })

      await result.current.mutateAsync({
        doctorId: 'doctor_123',
        ...updates,
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.doctors.update).toHaveBeenCalledWith('doctor_123', updates)
      expect(result.current.data).toEqual({ doctor: updatedDoctor })
    })
  })

  describe('useDeleteDoctor', () => {
    it('should delete a doctor successfully', async () => {
      vi.mocked(api.doctors.delete).mockResolvedValue({ success: true })

      const { result } = renderHook(() => useDeleteDoctor(), {
        wrapper: createWrapper(),
      })

      await result.current.mutateAsync('doctor_123')

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(api.doctors.delete).toHaveBeenCalledWith('doctor_123')
      expect(result.current.data).toEqual({ success: true })
    })
  })
})