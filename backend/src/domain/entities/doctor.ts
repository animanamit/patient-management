/**
 * DOCTOR ENTITY - Simple PRD Implementation
 * 
 * Based on CarePulse PRD requirements:
 * - Doctors can view their appointments
 * - Staff can assign appointments to doctors
 * - Simple doctor profiles (no complex scheduling rules)
 */

import { 
  DoctorId, 
  UserRole,
  EmailAddress
} from './shared-types';

// Simple Doctor entity focused on PRD requirements
export interface Doctor {
  readonly id: DoctorId;
  readonly clerkUserId: string; // Links to Clerk authentication
  
  // Basic information
  firstName: string;
  lastName: string;
  email: EmailAddress;
  
  // Professional info (simplified)
  specialization?: string; // Optional, simple string (e.g., "Physiotherapy")
  
  // System fields
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Simple doctor creation - no complex business rules
export const createDoctor = (
  clerkUserId: string,
  firstName: string,
  lastName: string,
  email: string,
  specialization?: string
): Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    clerkUserId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: new EmailAddress(email),
    specialization: specialization?.trim(),
    isActive: true,
  };
};

// Helper function for display
export const getDoctorFullName = (doctor: Doctor): string => {
  return `Dr. ${doctor.firstName} ${doctor.lastName}`;
};