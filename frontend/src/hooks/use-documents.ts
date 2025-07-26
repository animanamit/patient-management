import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';

// Document types - matching backend
export interface Document {
  id: string;
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
  isSharedWithPatient: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentWithUploader extends Document {
  uploaderName: string;
  uploaderRole: 'PATIENT' | 'DOCTOR' | 'STAFF';
}

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

// API interfaces
interface UploadUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  patientId: string;
  category: DocumentCategory;
  appointmentId?: string;
  description?: string;
}

interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  fileId: string;
}

interface ConfirmUploadRequest {
  s3Key: string;
  fileId: string;
  patientId: string;
  category: DocumentCategory;
  appointmentId?: string;
  description?: string;
  isSharedWithPatient?: boolean;
}

interface DocumentFilter {
  patientId?: string;
  doctorId?: string;
  appointmentId?: string;
  category?: DocumentCategory;
  isSharedWithPatient?: boolean;
}

interface DocumentListResponse {
  documents: DocumentWithUploader[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Query Keys
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filter?: DocumentFilter) => [...documentKeys.lists(), filter] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  byPatient: (patientId: string) => [...documentKeys.all, "patient", patientId] as const,
};

// API functions
const documentsAPI = {
  // Get upload URL
  getUploadUrl: async (request: UploadUrlRequest): Promise<UploadUrlResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    return response.json();
  },

  // Upload file to S3
  uploadToS3: async (uploadUrl: string, file: File): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to S3');
    }
  },

  // Confirm upload
  confirmUpload: async (request: ConfirmUploadRequest): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to confirm upload');
    }

    return response.json();
  },

  // Get documents
  getDocuments: async (filter?: DocumentFilter): Promise<DocumentListResponse> => {
    const params = new URLSearchParams();
    if (filter?.patientId) params.append('patientId', filter.patientId);
    if (filter?.doctorId) params.append('doctorId', filter.doctorId);
    if (filter?.appointmentId) params.append('appointmentId', filter.appointmentId);
    if (filter?.category) params.append('category', filter.category);
    if (filter?.isSharedWithPatient !== undefined) {
      params.append('isSharedWithPatient', filter.isSharedWithPatient.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/documents?${params}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return response.json();
  },

  // Get download URL
  getDownloadUrl: async (documentId: string): Promise<{ downloadUrl: string; fileName: string }> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/download-url`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }

    return response.json();
  },

  // Update document
  updateDocument: async (documentId: string, updates: {
    description?: string;
    category?: DocumentCategory;
    isSharedWithPatient?: boolean;
  }): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update document');
    }

    return response.json();
  },

  // Delete document
  deleteDocument: async (documentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }
  },

  // Toggle sharing
  toggleSharing: async (documentId: string, isShared: boolean): Promise<Document> => {
    const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/share`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ isSharedWithPatient: isShared }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle sharing');
    }

    return response.json();
  },
};

// React Query hooks
export const useDocuments = (filter?: DocumentFilter) => {
  return useQuery({
    queryKey: documentKeys.list(filter),
    queryFn: () => documentsAPI.getDocuments(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePatientDocuments = (
  patientId?: string, 
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: documentKeys.byPatient(patientId!),
    queryFn: () => documentsAPI.getDocuments({ patientId }),
    enabled: !!patientId && (options.enabled !== false),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      patientId,
      category,
      appointmentId,
      description,
      isSharedWithPatient = false,
    }: {
      file: File;
      patientId: string;
      category: DocumentCategory;
      appointmentId?: string;
      description?: string;
      isSharedWithPatient?: boolean;
    }) => {
      // Step 1: Get upload URL
      const uploadUrlResponse = await documentsAPI.getUploadUrl({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        patientId,
        category,
        appointmentId,
        description,
      });

      // Step 2: Upload to S3
      await documentsAPI.uploadToS3(uploadUrlResponse.uploadUrl, file);

      // Step 3: Confirm upload
      const document = await documentsAPI.confirmUpload({
        s3Key: uploadUrlResponse.s3Key,
        fileId: uploadUrlResponse.fileId,
        patientId,
        category,
        appointmentId,
        description,
        isSharedWithPatient,
      });

      return document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
    },
  });
};

export const useDownloadDocument = () => {
  return useMutation({
    mutationFn: async (documentId: string) => {
      const { downloadUrl, fileName } = await documentsAPI.getDownloadUrl(documentId);
      
      // Open download URL in new tab
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { downloadUrl, fileName };
    },
    onError: (error) => {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, updates }: {
      documentId: string;
      updates: {
        description?: string;
        category?: DocumentCategory;
        isSharedWithPatient?: boolean;
      };
    }) => documentsAPI.updateDocument(documentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Document updated successfully');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Failed to update document');
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsAPI.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    },
  });
};

export const useToggleSharing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, isShared }: { documentId: string; isShared: boolean }) =>
      documentsAPI.toggleSharing(documentId, isShared),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      toast.success('Sharing updated successfully');
    },
    onError: (error) => {
      console.error('Toggle sharing error:', error);
      toast.error('Failed to update sharing');
    },
  });
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileTypeIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType === 'text/plain') return '📃';
  return '📎';
};

export const isImageFile = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

export const isPdfFile = (fileType: string): boolean => {
  return fileType === 'application/pdf';
};

export const getDocumentCategoryStyles = (category: DocumentCategory) => {
  switch (category) {
    case DocumentCategory.LAB_RESULTS:
      return "text-purple-700 border-purple-200 bg-purple-50";
    case DocumentCategory.IMAGING:
      return "text-blue-700 border-blue-200 bg-blue-50";
    case DocumentCategory.PRESCRIPTION:
      return "text-green-700 border-green-200 bg-green-50";
    case DocumentCategory.CLINICAL_NOTES:
      return "text-orange-700 border-orange-200 bg-orange-50";
    case DocumentCategory.MEDICAL_HISTORY:
      return "text-red-700 border-red-200 bg-red-50";
    case DocumentCategory.CONSENT_FORM:
      return "text-indigo-700 border-indigo-200 bg-indigo-50";
    case DocumentCategory.INSURANCE:
      return "text-teal-700 border-teal-200 bg-teal-50";
    default:
      return "text-gray-700 border-gray-200 bg-gray-50";
  }
};