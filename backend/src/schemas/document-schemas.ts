import { z } from 'zod';
import { DocumentCategory } from '../domain/entities/document.js';

// File upload request schema
export const uploadUrlRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().int().positive('File size must be positive').max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  patientId: z.string().min(1, 'Patient ID is required'),
  category: z.nativeEnum(DocumentCategory, { errorMap: () => ({ message: 'Invalid document category' }) }),
  appointmentId: z.string().optional(),
  description: z.string().optional(),
});

// Confirm upload schema
export const confirmUploadSchema = z.object({
  s3Key: z.string().min(1, 'S3 key is required'),
  fileId: z.string().min(1, 'File ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  category: z.nativeEnum(DocumentCategory),
  appointmentId: z.string().optional(),
  description: z.string().optional(),
  isSharedWithPatient: z.boolean().default(false),
});

// Document update schema
export const updateDocumentSchema = z.object({
  description: z.string().optional(),
  category: z.nativeEnum(DocumentCategory).optional(),
  isSharedWithPatient: z.boolean().optional(),
});

// Document filter schema for queries
export const documentFilterSchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  appointmentId: z.string().optional(),
  category: z.nativeEnum(DocumentCategory).optional(),
  isSharedWithPatient: z.coerce.boolean().optional(),
  uploadedBy: z.string().optional(),
});

// Document sort schema
export const documentSortSchema = z.object({
  field: z.enum(['createdAt', 'fileName', 'category', 'fileSize']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Pagination schema
export const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Document sharing toggle schema
export const toggleSharingSchema = z.object({
  isSharedWithPatient: z.boolean(),
});

// File type validation - server-side validation of allowed MIME types
export const allowedFileTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export const validateFileType = (fileType: string): boolean => {
  return allowedFileTypes.includes(fileType as any);
};

// Response schemas for API documentation
export const documentResponseSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  s3Key: z.string(),
  uploadedBy: z.string(),
  patientId: z.string(),
  doctorId: z.string().nullable(),
  appointmentId: z.string().nullable(),
  category: z.nativeEnum(DocumentCategory),
  description: z.string().nullable(),
  isSharedWithPatient: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const documentWithUploaderResponseSchema = documentResponseSchema.extend({
  uploaderName: z.string(),
  uploaderRole: z.enum(['PATIENT', 'DOCTOR', 'STAFF']),
});

export const uploadUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  s3Key: z.string(),
  fileId: z.string(),
});

export const downloadUrlResponseSchema = z.object({
  downloadUrl: z.string().url(),
  fileName: z.string(),
});

export const documentStatsResponseSchema = z.object({
  totalDocuments: z.number(),
  documentsByCategory: z.record(z.string(), z.number()),
  totalFileSize: z.number(),
  recentDocuments: z.array(documentResponseSchema),
});