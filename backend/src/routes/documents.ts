import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { auth } from '../auth.js';
import { PrismaDocumentRepository } from '../domain/repositories/implementations/prisma-document-repository.js';
import { s3StorageService } from '../services/s3-storage.service.js';
import { 
  uploadUrlRequestSchema,
  confirmUploadSchema,
  updateDocumentSchema,
  documentFilterSchema,
  documentSortSchema,
  paginationSchema,
  toggleSharingSchema,
  validateFileType
} from '../schemas/document-schemas.js';
import { DocumentId, ensureValidDocumentId } from '../domain/entities/document.js';

// Initialize repository
const documentRepository = new PrismaDocumentRepository();

// Type definitions for request bodies
type UploadUrlRequest = z.infer<typeof uploadUrlRequestSchema>;
type ConfirmUploadRequest = z.infer<typeof confirmUploadSchema>;
type UpdateDocumentRequest = z.infer<typeof updateDocumentSchema>;
type ToggleSharingRequest = z.infer<typeof toggleSharingSchema>;

// Type definitions for query parameters
type DocumentFilterQuery = z.infer<typeof documentFilterSchema>;
type DocumentSortQuery = z.infer<typeof documentSortSchema>;
type PaginationQuery = z.infer<typeof paginationSchema>;

// Helper function to get user info from session
async function getUserFromSession(request: FastifyRequest) {
  const sessionHeader = request.headers.authorization?.replace('Bearer ', '') || 
                       request.headers.cookie?.split('better-auth.session_token=')[1]?.split(';')[0];
  
  if (!sessionHeader) {
    throw new Error('No session found');
  }

  // Use Better Auth to verify session and get user
  const session = await auth.api.getSession({
    headers: request.headers as any,
  });

  if (!session?.user) {
    throw new Error('Invalid session');
  }

  return session.user;
}

export async function documentRoutes(fastify: FastifyInstance) {
  // Generate pre-signed upload URL
  fastify.post<{
    Body: UploadUrlRequest;
  }>('/upload-url', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUserFromSession(request);
      const body = uploadUrlRequestSchema.parse(request.body);

      // Validate file type
      if (!validateFileType(body.fileType)) {
        return reply.code(400).send({
          error: 'Invalid file type',
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', '.doc', '.docx', 'text/plain'],
        });
      }

      // Generate upload URL
      const uploadResult = await s3StorageService.generateUploadUrl({
        fileName: body.fileName,
        fileType: body.fileType,
        fileSize: body.fileSize,
        patientId: body.patientId,
        category: body.category,
        appointmentId: body.appointmentId,
      });

      return reply.send(uploadResult);
    } catch (error) {
      console.error('Error generating upload URL:', error);
      return reply.code(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to generate upload URL' 
      });
    }
  });

  // Confirm successful upload and save metadata
  fastify.post<{
    Body: ConfirmUploadRequest;
  }>('/confirm', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUserFromSession(request);
      const body = confirmUploadSchema.parse(request.body);

      // Create document record
      const result = await documentRepository.create({
        fileName: body.fileId, // We'll update this with actual filename
        fileType: 'application/octet-stream', // We'll update this
        fileSize: 0, // We'll update this
        s3Key: body.s3Key,
        uploadedBy: user.id,
        patientId: body.patientId,
        appointmentId: body.appointmentId,
        category: body.category,
        description: body.description,
        isSharedWithPatient: body.isSharedWithPatient,
      });

      if (!result.success) {
        return reply.code(500).send({ error: result.error });
      }

      return reply.send(result.data);
    } catch (error) {
      console.error('Error confirming upload:', error);
      return reply.code(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to confirm upload' 
      });
    }
  });

  // Get documents with filtering and pagination
  fastify.get<{
    Querystring: DocumentFilterQuery & DocumentSortQuery & PaginationQuery;
  }>('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUserFromSession(request);
      const query = request.query as any;
      
      const filter = documentFilterSchema.parse(query);
      const sort = documentSortSchema.parse(query);
      const pagination = paginationSchema.parse(query);

      // Apply role-based filtering
      if (user.role === 'PATIENT') {
        // Patients can only see their own shared documents
        const patientResult = await documentRepository.findByPatientId(user.id, false);
        if (!patientResult.success) {
          return reply.code(500).send({ error: patientResult.error });
        }
        return reply.send(patientResult.data);
      }

      // For doctors and staff, use regular filtering
      const result = await documentRepository.findManyWithUploader(
        filter,
        sort,
        pagination.limit,
        pagination.offset
      );

      if (!result.success) {
        return reply.code(500).send({ error: result.error });
      }

      // Also get total count for pagination
      const countResult = await documentRepository.count(filter);
      const totalCount = countResult.success ? countResult.data : 0;

      return reply.send({
        documents: result.data,
        pagination: {
          limit: pagination.limit,
          offset: pagination.offset,
          total: totalCount,
        },
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
      return reply.code(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to fetch documents' 
      });
    }
  });

  // Get single document by ID
  fastify.get<{
    Params: { id: string };
  }>('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUserFromSession(request);
      const { id } = request.params as { id: string };
      const documentId = ensureValidDocumentId(id);

      // Check access permissions
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      const result = await documentRepository.findById(documentId);
      if (!result.success) {
        return reply.code(500).send({ error: result.error });
      }

      if (!result.data) {
        return reply.code(404).send({ error: 'Document not found' });
      }

      return reply.send(result.data);
    } catch (error) {
      console.error('Error fetching document:', error);
      return reply.code(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to fetch document' 
      });
    }
  });

  // Update document metadata
  fastify.patch<{
    Params: { id: string };
    Body: UpdateDocumentRequest;
  }>('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUserFromSession(request);
      const { id } = request.params as { id: string };
      const documentId = ensureValidDocumentId(id);
      const body = updateDocumentSchema.parse(request.body);

      // Check access permissions
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      const result = await documentRepository.update(documentId, body);
      if (!result.success) {
        return reply.code(500).send({ error: result.error });
      }

      return reply.send(result.data);
    } catch (error) {
      console.error('Error updating document:', error);
      return reply.code(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to update document' 
      });
    }
  });

  // Delete document
  fastify.delete<{
    Params: { id: string };
  }>('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUserFromSession(request);
      const { id } = request.params as { id: string };
      const documentId = ensureValidDocumentId(id);

      // Check access permissions (only uploader or staff can delete)
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      const result = await documentRepository.delete(documentId);
      if (!result.success) {
        return reply.code(500).send({ error: result.error });
      }

      return reply.send({ success: true });
    } catch (error) {
      console.error('Error deleting document:', error);
      return reply.code(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to delete document' 
      });
    }
  });

  // Generate download URL
  fastify.get<{
    Params: { id: string };
  }>('/:id/download-url', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUserFromSession(request);
      const { id } = request.params as { id: string };
      const documentId = ensureValidDocumentId(id);

      // Check access permissions
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      // Get document details
      const documentResult = await documentRepository.findById(documentId);
      if (!documentResult.success || !documentResult.data) {
        return reply.code(404).send({ error: 'Document not found' });
      }

      const document = documentResult.data;

      // Generate download URL
      const downloadUrl = await s3StorageService.generateDownloadUrl({
        s3Key: document.s3Key,
        fileName: document.fileName,
      });

      return reply.send({
        downloadUrl,
        fileName: document.fileName,
      });
    } catch (error) {
      console.error('Error generating download URL:', error);
      return reply.code(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to generate download URL' 
      });
    }
  });

  // Toggle patient sharing
  fastify.patch<{
    Params: { id: string };
    Body: ToggleSharingRequest;
  }>('/:id/share', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUserFromSession(request);
      const { id } = request.params as { id: string };
      const documentId = ensureValidDocumentId(id);
      const body = toggleSharingSchema.parse(request.body);

      // Only doctors and staff can toggle sharing
      if (user.role === 'PATIENT') {
        return reply.code(403).send({ error: 'Patients cannot modify document sharing' });
      }

      // Check access permissions
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      const result = await documentRepository.togglePatientSharing(documentId, body.isSharedWithPatient);
      if (!result.success) {
        return reply.code(500).send({ error: result.error });
      }

      return reply.send(result.data);
    } catch (error) {
      console.error('Error toggling patient sharing:', error);
      return reply.code(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to toggle sharing' 
      });
    }
  });

  // Get patient document statistics
  fastify.get<{
    Params: { patientId: string };
  }>('/patient/:patientId/stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await getUserFromSession(request);
      const { patientId } = request.params as { patientId: string };

      // Patients can only view their own stats
      if (user.role === 'PATIENT' && user.id !== patientId) {
        return reply.code(403).send({ error: 'Access denied' });
      }

      const result = await documentRepository.getPatientDocumentStats(patientId);
      if (!result.success) {
        return reply.code(500).send({ error: result.error });
      }

      return reply.send(result.data);
    } catch (error) {
      console.error('Error fetching document stats:', error);
      return reply.code(500).send({ 
        error: error instanceof Error ? error.message : 'Failed to fetch document statistics' 
      });
    }
  });
}