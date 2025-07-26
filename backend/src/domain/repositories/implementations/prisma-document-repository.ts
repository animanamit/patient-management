import { prisma } from '../../../config/database.js';
import { 
  Document, 
  DocumentId, 
  CreateDocumentInput, 
  UpdateDocumentInput, 
  DocumentFilter,
  DocumentSort,
  DocumentWithUploader,
  DocumentCategory,
  ensureValidDocumentId
} from '../../entities/document.js';
import { IDocumentRepository, DocumentRepositoryResult } from '../interfaces/document-repository.js';

export class PrismaDocumentRepository implements IDocumentRepository {
  
  async create(input: CreateDocumentInput): Promise<DocumentRepositoryResult<Document>> {
    try {
      const documentId = ensureValidDocumentId(Date.now().toString());
      
      const prismaDocument = await prisma.document.create({
        data: {
          id: documentId,
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          s3Key: input.s3Key,
          uploadedBy: input.uploadedBy,
          patientId: input.patientId,
          doctorId: input.doctorId,
          appointmentId: input.appointmentId,
          category: input.category,
          description: input.description,
          isSharedWithPatient: input.isSharedWithPatient ?? false,
        },
      });

      return {
        success: true,
        data: this.transformPrismaToDocument(prismaDocument),
      };
    } catch (error) {
      console.error('Error creating document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create document',
      };
    }
  }

  async findById(id: DocumentId): Promise<DocumentRepositoryResult<Document | null>> {
    try {
      const prismaDocument = await prisma.document.findUnique({
        where: { id },
      });

      if (!prismaDocument) {
        return { success: true, data: null };
      }

      return {
        success: true,
        data: this.transformPrismaToDocument(prismaDocument),
      };
    } catch (error) {
      console.error('Error finding document by ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find document',
      };
    }
  }

  async findMany(
    filter?: DocumentFilter,
    sort?: DocumentSort,
    limit?: number,
    offset?: number
  ): Promise<DocumentRepositoryResult<Document[]>> {
    try {
      const whereClause = this.buildWhereClause(filter);
      const orderBy = sort ? { [sort.field]: sort.order } : { createdAt: 'desc' as const };

      const prismaDocuments = await prisma.document.findMany({
        where: whereClause,
        orderBy,
        take: limit,
        skip: offset,
      });

      return {
        success: true,
        data: prismaDocuments.map(doc => this.transformPrismaToDocument(doc)),
      };
    } catch (error) {
      console.error('Error finding documents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find documents',
      };
    }
  }

  async findManyWithUploader(
    filter?: DocumentFilter,
    sort?: DocumentSort,
    limit?: number,
    offset?: number
  ): Promise<DocumentRepositoryResult<DocumentWithUploader[]>> {
    try {
      const whereClause = this.buildWhereClause(filter);
      const orderBy = sort ? { [sort.field]: sort.order } : { createdAt: 'desc' as const };

      const prismaDocuments = await prisma.document.findMany({
        where: whereClause,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          uploadedByUser: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      });

      return {
        success: true,
        data: prismaDocuments.map(doc => this.transformPrismaToDocumentWithUploader(doc)),
      };
    } catch (error) {
      console.error('Error finding documents with uploader:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find documents',
      };
    }
  }

  async update(id: DocumentId, input: UpdateDocumentInput): Promise<DocumentRepositoryResult<Document>> {
    try {
      const prismaDocument = await prisma.document.update({
        where: { id },
        data: {
          description: input.description,
          isSharedWithPatient: input.isSharedWithPatient,
          category: input.category,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        data: this.transformPrismaToDocument(prismaDocument),
      };
    } catch (error) {
      console.error('Error updating document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update document',
      };
    }
  }

  async delete(id: DocumentId): Promise<DocumentRepositoryResult<boolean>> {
    try {
      await prisma.document.delete({
        where: { id },
      });

      return { success: true, data: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete document',
      };
    }
  }

  async findByPatientId(patientId: string, includePrivate = false): Promise<DocumentRepositoryResult<Document[]>> {
    try {
      const whereClause: any = { patientId };
      
      if (!includePrivate) {
        whereClause.isSharedWithPatient = true;
      }

      const prismaDocuments = await prisma.document.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: prismaDocuments.map(doc => this.transformPrismaToDocument(doc)),
      };
    } catch (error) {
      console.error('Error finding documents by patient ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find patient documents',
      };
    }
  }

  async findByAppointmentId(appointmentId: string): Promise<DocumentRepositoryResult<Document[]>> {
    try {
      const prismaDocuments = await prisma.document.findMany({
        where: { appointmentId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: prismaDocuments.map(doc => this.transformPrismaToDocument(doc)),
      };
    } catch (error) {
      console.error('Error finding documents by appointment ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find appointment documents',
      };
    }
  }

  async findByUploaderId(uploaderId: string): Promise<DocumentRepositoryResult<Document[]>> {
    try {
      const prismaDocuments = await prisma.document.findMany({
        where: { uploadedBy: uploaderId },
        orderBy: { createdAt: 'desc' },
      });

      return {
        success: true,
        data: prismaDocuments.map(doc => this.transformPrismaToDocument(doc)),
      };
    } catch (error) {
      console.error('Error finding documents by uploader ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to find uploader documents',
      };
    }
  }

  async checkAccess(
    id: DocumentId, 
    userId: string, 
    userRole: 'PATIENT' | 'DOCTOR' | 'STAFF'
  ): Promise<DocumentRepositoryResult<boolean>> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          patient: {
            include: { user: true },
          },
        },
      });

      if (!document) {
        return { success: true, data: false };
      }

      // Staff can access all documents
      if (userRole === 'STAFF') {
        return { success: true, data: true };
      }

      // Patients can only access their own shared documents
      if (userRole === 'PATIENT') {
        const hasAccess = document.patient.userId === userId && document.isSharedWithPatient;
        return { success: true, data: hasAccess };
      }

      // Doctors can access documents for their patients
      if (userRole === 'DOCTOR') {
        // Check if doctor uploaded the document or is associated with the patient
        const hasAccess = document.uploadedBy === userId || document.doctorId === userId;
        return { success: true, data: hasAccess };
      }

      return { success: true, data: false };
    } catch (error) {
      console.error('Error checking document access:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check document access',
      };
    }
  }

  async togglePatientSharing(id: DocumentId, isShared: boolean): Promise<DocumentRepositoryResult<Document>> {
    try {
      const prismaDocument = await prisma.document.update({
        where: { id },
        data: {
          isSharedWithPatient: isShared,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        data: this.transformPrismaToDocument(prismaDocument),
      };
    } catch (error) {
      console.error('Error toggling patient sharing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle patient sharing',
      };
    }
  }

  async count(filter?: DocumentFilter): Promise<DocumentRepositoryResult<number>> {
    try {
      const whereClause = this.buildWhereClause(filter);
      const count = await prisma.document.count({
        where: whereClause,
      });

      return { success: true, data: count };
    } catch (error) {
      console.error('Error counting documents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to count documents',
      };
    }
  }

  async getPatientDocumentStats(patientId: string): Promise<DocumentRepositoryResult<{
    totalDocuments: number;
    documentsByCategory: Record<string, number>;
    totalFileSize: number;
    recentDocuments: Document[];
  }>> {
    try {
      const [documents, recentDocuments] = await Promise.all([
        prisma.document.findMany({
          where: { patientId },
          select: {
            category: true,
            fileSize: true,
          },
        }),
        prisma.document.findMany({
          where: { patientId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      const documentsByCategory: Record<string, number> = {};
      let totalFileSize = 0;

      documents.forEach(doc => {
        documentsByCategory[doc.category] = (documentsByCategory[doc.category] || 0) + 1;
        totalFileSize += doc.fileSize;
      });

      return {
        success: true,
        data: {
          totalDocuments: documents.length,
          documentsByCategory,
          totalFileSize,
          recentDocuments: recentDocuments.map(doc => this.transformPrismaToDocument(doc)),
        },
      };
    } catch (error) {
      console.error('Error getting patient document stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get document statistics',
      };
    }
  }

  // Helper methods
  private buildWhereClause(filter?: DocumentFilter): any {
    if (!filter) return {};

    const where: any = {};

    if (filter.patientId) where.patientId = filter.patientId;
    if (filter.doctorId) where.doctorId = filter.doctorId;
    if (filter.appointmentId) where.appointmentId = filter.appointmentId;
    if (filter.category) where.category = filter.category;
    if (filter.isSharedWithPatient !== undefined) {
      where.isSharedWithPatient = filter.isSharedWithPatient;
    }
    if (filter.uploadedBy) where.uploadedBy = filter.uploadedBy;

    return where;
  }

  private transformPrismaToDocument(prismaDoc: any): Document {
    return {
      id: ensureValidDocumentId(prismaDoc.id),
      fileName: prismaDoc.fileName,
      fileType: prismaDoc.fileType,
      fileSize: prismaDoc.fileSize,
      s3Key: prismaDoc.s3Key,
      uploadedBy: prismaDoc.uploadedBy,
      patientId: prismaDoc.patientId,
      doctorId: prismaDoc.doctorId,
      appointmentId: prismaDoc.appointmentId,
      category: prismaDoc.category as DocumentCategory,
      description: prismaDoc.description,
      isSharedWithPatient: prismaDoc.isSharedWithPatient,
      createdAt: new Date(prismaDoc.createdAt),
      updatedAt: new Date(prismaDoc.updatedAt),
    };
  }

  private transformPrismaToDocumentWithUploader(prismaDoc: any): DocumentWithUploader {
    const document = this.transformPrismaToDocument(prismaDoc);
    return {
      ...document,
      uploaderName: prismaDoc.uploadedByUser?.name || 'Unknown',
      uploaderRole: prismaDoc.uploadedByUser?.role || 'STAFF',
    };
  }
}