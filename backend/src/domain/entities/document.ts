import { nanoid } from 'nanoid';

// Document ID branded type for type safety
export type DocumentId = string & { readonly __brand: 'DocumentId' };

// Smart constructor for DocumentId
export const createDocumentId = (id?: string): DocumentId => {
  if (id) {
    const regex = /^doc_[a-zA-Z0-9_]+$/;
    if (regex.test(id)) return id as DocumentId;
    throw new Error('Invalid DocumentId format (expected: doc_<alphanumeric>)');
  }
  return `doc_${nanoid(8)}` as DocumentId;
};

// Helper function to ensure valid DocumentId format
export const ensureValidDocumentId = (id: string): DocumentId => {
  if (id.match(/^doc_[a-zA-Z0-9_]+$/)) {
    return id as DocumentId;
  }
  return `doc_${id}` as DocumentId;
};

// Document categories enum
export enum DocumentCategory {
  MEDICAL_HISTORY = 'MEDICAL_HISTORY',
  LAB_RESULTS = 'LAB_RESULTS',
  PRESCRIPTION = 'PRESCRIPTION',
  IMAGING = 'IMAGING',
  CLINICAL_NOTES = 'CLINICAL_NOTES',
  CONSENT_FORM = 'CONSENT_FORM',
  INSURANCE = 'INSURANCE',
  OTHER = 'OTHER',
}

// Document category display names
export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  [DocumentCategory.MEDICAL_HISTORY]: 'Medical History',
  [DocumentCategory.LAB_RESULTS]: 'Lab Results',
  [DocumentCategory.PRESCRIPTION]: 'Prescription',
  [DocumentCategory.IMAGING]: 'Medical Imaging',
  [DocumentCategory.CLINICAL_NOTES]: 'Clinical Notes',
  [DocumentCategory.CONSENT_FORM]: 'Consent Form',
  [DocumentCategory.INSURANCE]: 'Insurance',
  [DocumentCategory.OTHER]: 'Other',
};

// Core Document entity
export interface Document {
  readonly id: DocumentId;
  
  // File information
  fileName: string;
  fileType: string; // MIME type
  fileSize: number; // Size in bytes
  s3Key: string; // S3 object key
  
  // Ownership and association
  uploadedBy: string; // userId of uploader
  patientId: string;
  doctorId?: string; // optional, for documents uploaded by doctors
  appointmentId?: string; // optional, for appointment-specific documents
  
  // Categorization and access
  category: DocumentCategory;
  description?: string;
  isSharedWithPatient: boolean;
  
  // System fields
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Document creation input (omits system-generated fields)
export interface CreateDocumentInput {
  fileName: string;
  fileType: string;
  fileSize: number;
  s3Key: string;
  uploadedBy: string;
  patientId: string;
  doctorId?: string;
  appointmentId?: string;
  category: DocumentCategory;
  description?: string;
  isSharedWithPatient?: boolean;
}

// Document update input
export interface UpdateDocumentInput {
  description?: string;
  isSharedWithPatient?: boolean;
  category?: DocumentCategory;
}

// Document with uploader information
export interface DocumentWithUploader extends Document {
  uploaderName: string;
  uploaderRole: 'PATIENT' | 'DOCTOR' | 'STAFF';
}

// Document filtering options
export interface DocumentFilter {
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
  category?: DocumentCategory;
  isSharedWithPatient?: boolean;
  uploadedBy?: string;
}

// Document sorting options
export type DocumentSortField = 'createdAt' | 'fileName' | 'category' | 'fileSize';
export type DocumentSortOrder = 'asc' | 'desc';

export interface DocumentSort {
  field: DocumentSortField;
  order: DocumentSortOrder;
}

// Utility functions for documents
export const DocumentUtils = {
  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Get file extension from filename
   */
  getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return fileName.substring(lastDotIndex + 1).toLowerCase();
  },

  /**
   * Check if file is an image
   */
  isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  },

  /**
   * Check if file is a PDF
   */
  isPdfFile(fileType: string): boolean {
    return fileType === 'application/pdf';
  },

  /**
   * Get appropriate icon for file type
   */
  getFileTypeIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType === 'text/plain') return '📃';
    return '📎';
  },

  /**
   * Validate document category
   */
  isValidCategory(category: string): category is DocumentCategory {
    return Object.values(DocumentCategory).includes(category as DocumentCategory);
  },

  /**
   * Get display name for category
   */
  getCategoryDisplayName(category: DocumentCategory): string {
    return DOCUMENT_CATEGORY_LABELS[category];
  },
};