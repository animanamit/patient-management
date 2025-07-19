/**
 * PATIENT ENTITY - Simple PRD Implementation
 * 
 * Based on CarePulse PRD requirements:
 * - Patients can register and update their profile
 * - Patients can book and manage appointments
 * - Staff can view patient information
 */

import { 
  PatientId, 
  PhoneNumber,
  EmailAddress
} from './shared-types.js';

// Simple Patient entity focused on PRD requirements
export interface Patient {
  readonly id: PatientId;
  readonly clerkUserId: string; // Links to Clerk authentication
  
  // Basic contact information
  firstName: string;
  lastName: string;
  email: EmailAddress;
  phone: PhoneNumber;
  dateOfBirth: Date;
  
  // Simple address (no over-engineering)
  address?: string;
  
  // System fields
  createdAt: Date;
  updatedAt: Date;
}

// Simple patient creation - no complex business rules
export const createPatient = (
  clerkUserId: string,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  dateOfBirth: Date
): Omit<Patient, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    clerkUserId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: new EmailAddress(email),
    phone: new PhoneNumber(phone),
    dateOfBirth,
  };
};