import { 
  Document, 
  DocumentId, 
  CreateDocumentInput, 
  UpdateDocumentInput, 
  DocumentFilter,
  DocumentSort,
  DocumentWithUploader
} from '../../entities/document.js';

// Repository result type for error handling
export type DocumentRepositoryResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

// Document repository interface
export interface IDocumentRepository {
  /**
   * Create a new document record
   */
  create(input: CreateDocumentInput): Promise<DocumentRepositoryResult<Document>>;

  /**
   * Find document by ID
   */
  findById(id: DocumentId): Promise<DocumentRepositoryResult<Document | null>>;

  /**
   * Find documents with filtering and sorting
   */
  findMany(
    filter?: DocumentFilter,
    sort?: DocumentSort,
    limit?: number,
    offset?: number
  ): Promise<DocumentRepositoryResult<Document[]>>;

  /**
   * Find documents with uploader information
   */
  findManyWithUploader(
    filter?: DocumentFilter,
    sort?: DocumentSort,
    limit?: number,
    offset?: number
  ): Promise<DocumentRepositoryResult<DocumentWithUploader[]>>;

  /**
   * Update document metadata
   */
  update(id: DocumentId, input: UpdateDocumentInput): Promise<DocumentRepositoryResult<Document>>;

  /**
   * Soft delete document (mark as deleted)
   */
  delete(id: DocumentId): Promise<DocumentRepositoryResult<boolean>>;

  /**
   * Get documents for a specific patient
   */
  findByPatientId(patientId: string, includePrivate?: boolean): Promise<DocumentRepositoryResult<Document[]>>;

  /**
   * Get documents for a specific appointment
   */
  findByAppointmentId(appointmentId: string): Promise<DocumentRepositoryResult<Document[]>>;

  /**
   * Get documents uploaded by a specific user
   */
  findByUploaderId(uploaderId: string): Promise<DocumentRepositoryResult<Document[]>>;

  /**
   * Check if document exists and user has access
   */
  checkAccess(id: DocumentId, userId: string, userRole: 'PATIENT' | 'DOCTOR' | 'STAFF'): Promise<DocumentRepositoryResult<boolean>>;

  /**
   * Toggle document sharing with patient
   */
  togglePatientSharing(id: DocumentId, isShared: boolean): Promise<DocumentRepositoryResult<Document>>;

  /**
   * Count documents matching filter
   */
  count(filter?: DocumentFilter): Promise<DocumentRepositoryResult<number>>;

  /**
   * Get document statistics for a patient
   */
  getPatientDocumentStats(patientId: string): Promise<DocumentRepositoryResult<{
    totalDocuments: number;
    documentsByCategory: Record<string, number>;
    totalFileSize: number;
    recentDocuments: Document[];
  }>>;
}