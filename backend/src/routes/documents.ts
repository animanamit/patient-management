import { Hono } from 'hono';
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
import { validateRequest, validateParams, validateQuery } from '../utils/validation.js';

const app = new Hono();

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
async function getUserFromSession(c: any) {
  const sessionHeader = c.req.header('authorization')?.replace('Bearer ', '') || 
                       c.req.header('cookie')?.split('better-auth.session_token=')[1]?.split(';')[0];
  
  if (!sessionHeader) {
    throw new Error('No session found');
  }

  // Use Better Auth to verify session and get user
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session?.user) {
    throw new Error('Invalid session');
  }

  return session.user;
}

// POST /documents/upload-url - Generate pre-signed upload URL
app.post(
  '/upload-url',
  validateRequest(uploadUrlRequestSchema),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const body = c.req.valid('json');

      // Validate file type
      if (!validateFileType(body.fileType)) {
        return c.json({
          error: 'Invalid file type',
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', '.doc', '.docx', 'text/plain'],
        }, 400);
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

      return c.json(uploadResult);
    } catch (error: any) {
      console.error('Error generating upload URL:', error);
      return c.json({ 
        error: error.message || 'Failed to generate upload URL' 
      }, 500);
    }
  }
);

// POST /documents/confirm - Confirm successful upload and save metadata
app.post(
  '/confirm',
  validateRequest(confirmUploadSchema),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const body = c.req.valid('json');

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
        return c.json({ error: result.error }, 500);
      }

      return c.json(result.data);
    } catch (error: any) {
      console.error('Error confirming upload:', error);
      return c.json({ 
        error: error.message || 'Failed to confirm upload' 
      }, 500);
    }
  }
);

// GET /documents - Get documents with filtering and pagination
app.get(
  '/',
  validateQuery(z.object({
    ...documentFilterSchema.shape,
    ...documentSortSchema.shape,
    ...paginationSchema.shape,
  })),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const query = c.req.valid('query');
      
      const filter = documentFilterSchema.parse(query);
      const sort = documentSortSchema.parse(query);
      const pagination = paginationSchema.parse(query);

      // Apply role-based filtering
      if (user.role === 'PATIENT') {
        // Patients can only see their own shared documents
        const patientResult = await documentRepository.findByPatientId(user.id, false);
        if (!patientResult.success) {
          return c.json({ error: patientResult.error }, 500);
        }
        return c.json(patientResult.data);
      }

      // For doctors and staff, use regular filtering
      const result = await documentRepository.findManyWithUploader(
        filter,
        sort,
        pagination.limit,
        pagination.offset
      );

      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      // Also get total count for pagination
      const countResult = await documentRepository.count(filter);
      const totalCount = countResult.success ? countResult.data : 0;

      return c.json({
        documents: result.data,
        pagination: {
          limit: pagination.limit,
          offset: pagination.offset,
          total: totalCount,
        },
      });
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      return c.json({ 
        error: error.message || 'Failed to fetch documents' 
      }, 500);
    }
  }
);

// GET /documents/:id - Get single document by ID
app.get(
  '/:id',
  validateParams(z.object({ id: z.string() })),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const { id } = c.req.valid('param');
      const documentId = ensureValidDocumentId(id);

      // Check access permissions
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return c.json({ error: 'Access denied' }, 403);
      }

      const result = await documentRepository.findById(documentId);
      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      if (!result.data) {
        return c.json({ error: 'Document not found' }, 404);
      }

      return c.json(result.data);
    } catch (error: any) {
      console.error('Error fetching document:', error);
      return c.json({ 
        error: error.message || 'Failed to fetch document' 
      }, 500);
    }
  }
);

// PATCH /documents/:id - Update document metadata
app.patch(
  '/:id',
  validateParams(z.object({ id: z.string() })),
  validateRequest(updateDocumentSchema),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const { id } = c.req.valid('param');
      const documentId = ensureValidDocumentId(id);
      const body = c.req.valid('json');

      // Check access permissions
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return c.json({ error: 'Access denied' }, 403);
      }

      const result = await documentRepository.update(documentId, body);
      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      return c.json(result.data);
    } catch (error: any) {
      console.error('Error updating document:', error);
      return c.json({ 
        error: error.message || 'Failed to update document' 
      }, 500);
    }
  }
);

// DELETE /documents/:id - Delete document
app.delete(
  '/:id',
  validateParams(z.object({ id: z.string() })),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const { id } = c.req.valid('param');
      const documentId = ensureValidDocumentId(id);

      // Check access permissions (only uploader or staff can delete)
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return c.json({ error: 'Access denied' }, 403);
      }

      const result = await documentRepository.delete(documentId);
      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      return c.body(null, 204);
    } catch (error: any) {
      console.error('Error deleting document:', error);
      return c.json({ 
        error: error.message || 'Failed to delete document' 
      }, 500);
    }
  }
);

// GET /documents/:id/download-url - Generate download URL
app.get(
  '/:id/download-url',
  validateParams(z.object({ id: z.string() })),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const { id } = c.req.valid('param');
      const documentId = ensureValidDocumentId(id);

      // Check access permissions
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return c.json({ error: 'Access denied' }, 403);
      }

      // Get document details
      const documentResult = await documentRepository.findById(documentId);
      if (!documentResult.success || !documentResult.data) {
        return c.json({ error: 'Document not found' }, 404);
      }

      const document = documentResult.data;

      // Generate download URL
      const downloadUrl = await s3StorageService.generateDownloadUrl({
        s3Key: document.s3Key,
        fileName: document.fileName,
      });

      return c.json({
        downloadUrl,
        fileName: document.fileName,
      });
    } catch (error: any) {
      console.error('Error generating download URL:', error);
      return c.json({ 
        error: error.message || 'Failed to generate download URL' 
      }, 500);
    }
  }
);

// PATCH /documents/:id/share - Toggle patient sharing
app.patch(
  '/:id/share',
  validateParams(z.object({ id: z.string() })),
  validateRequest(toggleSharingSchema),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const { id } = c.req.valid('param');
      const documentId = ensureValidDocumentId(id);
      const body = c.req.valid('json');

      // Only doctors and staff can toggle sharing
      if (user.role === 'PATIENT') {
        return c.json({ error: 'Patients cannot modify document sharing' }, 403);
      }

      // Check access permissions
      const accessResult = await documentRepository.checkAccess(documentId, user.id, user.role);
      if (!accessResult.success || !accessResult.data) {
        return c.json({ error: 'Access denied' }, 403);
      }

      const result = await documentRepository.togglePatientSharing(documentId, body.isSharedWithPatient);
      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      return c.json(result.data);
    } catch (error: any) {
      console.error('Error toggling patient sharing:', error);
      return c.json({ 
        error: error.message || 'Failed to toggle sharing' 
      }, 500);
    }
  }
);

// GET /documents/patient/:patientId/stats - Get patient document statistics
app.get(
  '/patient/:patientId/stats',
  validateParams(z.object({ patientId: z.string() })),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const { patientId } = c.req.valid('param');

      // Patients can only view their own stats
      if (user.role === 'PATIENT' && user.id !== patientId) {
        return c.json({ error: 'Access denied' }, 403);
      }

      const result = await documentRepository.getPatientDocumentStats(patientId);
      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      return c.json(result.data);
    } catch (error: any) {
      console.error('Error fetching document stats:', error);
      return c.json({ 
        error: error.message || 'Failed to fetch document statistics' 
      }, 500);
    }
  }
);

// GET /documents/patient/:patientId - Get documents for a specific patient
app.get(
  '/patient/:patientId',
  validateParams(z.object({ patientId: z.string() })),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const { patientId } = c.req.valid('param');

      // Patients can only view their own documents
      if (user.role === 'PATIENT' && user.id !== patientId) {
        return c.json({ error: 'Access denied' }, 403);
      }

      // For patients, only show shared documents
      const showOnlyShared = user.role === 'PATIENT';
      
      const result = await documentRepository.findByPatientId(patientId, showOnlyShared);
      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      return c.json({
        documents: result.data,
        patientId,
        totalCount: result.data.length,
        showOnlyShared,
      });
    } catch (error: any) {
      console.error('Error fetching patient documents:', error);
      return c.json({ 
        error: error.message || 'Failed to fetch patient documents' 
      }, 500);
    }
  }
);

// GET /documents/appointment/:appointmentId - Get documents for a specific appointment
app.get(
  '/appointment/:appointmentId',
  validateParams(z.object({ appointmentId: z.string() })),
  async (c) => {
    try {
      const user = await getUserFromSession(c);
      const { appointmentId } = c.req.valid('param');

      const result = await documentRepository.findByAppointmentId(appointmentId);
      if (!result.success) {
        return c.json({ error: result.error }, 500);
      }

      return c.json({
        documents: result.data,
        appointmentId,
        totalCount: result.data.length,
      });
    } catch (error: any) {
      console.error('Error fetching appointment documents:', error);
      return c.json({ 
        error: error.message || 'Failed to fetch appointment documents' 
      }, 500);
    }
  }
);

// GET /documents/categories - Get list of document categories
app.get('/categories', async (c) => {
  try {
    const categories = [
      'MEDICAL_RECORD',
      'TEST_RESULT',
      'PRESCRIPTION',
      'INSURANCE',
      'CONSENT_FORM',
      'REFERRAL',
      'OTHER'
    ];

    return c.json({ 
      categories,
      descriptions: {
        'MEDICAL_RECORD': 'General medical records and charts',
        'TEST_RESULT': 'Lab results, imaging, and diagnostic tests',
        'PRESCRIPTION': 'Prescriptions and medication records',
        'INSURANCE': 'Insurance documents and claims',
        'CONSENT_FORM': 'Consent forms and legal documents',
        'REFERRAL': 'Referral letters and specialist communications',
        'OTHER': 'Other medical documents'
      }
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return c.json({ 
      error: error.message || 'Failed to fetch categories' 
    }, 500);
  }
});

// GET /documents/health - Document service health check
app.get('/health', async (c) => {
  try {
    // Check S3 configuration
    const s3Configured = !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET_NAME
    );

    return c.json({
      status: s3Configured ? 'healthy' : 'misconfigured',
      service: 'Document Service',
      timestamp: new Date().toISOString(),
      configuration: {
        s3Bucket: process.env.S3_BUCKET_NAME ? 'configured' : 'missing',
        awsRegion: process.env.AWS_REGION || 'us-east-1',
        useMockS3: process.env.USE_MOCK_S3 === 'true',
      },
      features: [
        'file_uploads',
        'pre_signed_urls',
        'document_metadata',
        'access_control',
        'patient_sharing',
        'download_links'
      ]
    });
  } catch (error: any) {
    console.error('Document health check error:', error);
    return c.json({
      status: 'error',
      service: 'Document Service',
      timestamp: new Date().toISOString(),
      error: error.message,
    }, 500);
  }
});

export default app;