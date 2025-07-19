/**
 * DOCTOR ENTITY - Simple PRD Implementation
 *
 * Based on CarePulse PRD requirements:
 * - Doctors can view their appointments
 * - Staff can assign appointments to doctors
 * - Simple doctor profiles (no complex scheduling rules)
 */

import { DoctorId, EmailAddress } from "./shared-types.js";

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

// Helper function for display
export const getDoctorFullName = (doctor: Doctor): string => {
  return `Dr. ${doctor.firstName} ${doctor.lastName}`;
};
