import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MedicalDocument,
  DocumentId,
  PatientId,
  DocumentQueryParams,
  CreateDocumentRequest,
  DocumentsResponse,
  DocumentApiResponse,
} from "@/lib/api-types";

// Query Keys
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (params?: DocumentQueryParams) => [...documentKeys.lists(), params] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: DocumentId) => [...documentKeys.details(), id] as const,
  byPatient: (patientId: PatientId) => [...documentKeys.all, "patient", patientId] as const,
};

// Mock documents data for demonstration
// TODO: Replace with real API calls when documents backend is implemented
const generateMockDocuments = (patientId: PatientId): MedicalDocument[] => [
  {
    id: "doc_001",
    patientId,
    name: "Blood Test Results",
    type: "LAB",
    status: "COMPLETE",
    fileSize: 245760, // 245 KB in bytes
    mimeType: "application/pdf",
    uploadedAt: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "doc_002",
    patientId,
    name: "X-Ray - Chest",
    type: "IMG",
    status: "COMPLETE",
    fileSize: 1258291, // 1.2 MB in bytes
    mimeType: "image/png",
    uploadedAt: "2024-01-10T14:15:00Z",
    createdAt: "2024-01-10T14:15:00Z",
    updatedAt: "2024-01-10T14:15:00Z",
  },
  {
    id: "doc_003",
    patientId,
    name: "Prescription",
    type: "RX",
    status: "ACTIVE",
    fileSize: 100352, // 98 KB in bytes
    mimeType: "application/pdf",
    uploadedAt: "2024-01-08T09:45:00Z",
    createdAt: "2024-01-08T09:45:00Z",
    updatedAt: "2024-01-08T09:45:00Z",
  },
];

// Hook to get documents for a specific patient
export const usePatientDocuments = (
  patientId?: PatientId, 
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: documentKeys.byPatient(patientId!),
    queryFn: async (): Promise<DocumentsResponse> => {
      // TODO: Replace with real API call
      // return documentsApi.getDocuments({ patientId });
      
      // Mock implementation for demonstration
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      
      const documents = patientId ? generateMockDocuments(patientId) : [];
      
      return {
        documents,
        totalCount: documents.length,
        pagination: {
          limit: 50,
          offset: 0,
          hasMore: false,
        },
      };
    },
    enabled: !!patientId && (options.enabled !== false),
    staleTime: 10 * 60 * 1000, // 10 minutes - documents don't change frequently
  });
};

// Hook to get all documents with optional filtering
export const useDocuments = (params?: DocumentQueryParams) => {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: async (): Promise<DocumentsResponse> => {
      // TODO: Replace with real API call
      // return documentsApi.getDocuments(params);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For now, return empty since we need a patientId for mock data
      return {
        documents: [],
        totalCount: 0,
        pagination: {
          limit: 50,
          offset: 0,
          hasMore: false,
        },
      };
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Hook to create a new document
export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentRequest): Promise<DocumentApiResponse> => {
      // TODO: Replace with real API call
      // return documentsApi.createDocument(data);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newDocument: MedicalDocument = {
        id: `doc_${Date.now()}`,
        patientId: data.patientId,
        name: data.name,
        type: data.type,
        status: "PENDING",
        fileSize: data.file?.size,
        mimeType: data.file?.type,
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return { document: newDocument };
    },
    onSuccess: (response, variables) => {
      // Set the new document data in cache
      queryClient.setQueryData(
        documentKeys.detail(response.document.id),
        response
      );
      
      // Invalidate patient documents list
      queryClient.invalidateQueries({ 
        queryKey: documentKeys.byPatient(variables.patientId) 
      });
    },
    onError: (error) => {
      console.error("Failed to create document:", error);
    },
  });
};

// Hook to delete a document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: DocumentId): Promise<void> => {
      // TODO: Replace with real API call
      // return documentsApi.deleteDocument(id);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
    },
    onSuccess: (_, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: documentKeys.detail(deletedId) });
      
      // Invalidate lists to remove the deleted document
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...documentKeys.all, "patient"] });
    },
    onError: (error) => {
      console.error("Failed to delete document:", error);
    },
  });
};

// Utility function to format file size
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "Unknown size";
  
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${Math.round(size * 10) / 10} ${units[unitIndex]}`;
};

// Utility function to get document type color classes
export const getDocumentTypeStyles = (type: string) => {
  switch (type) {
    case "LAB":
      return "text-purple-700 border-purple-200 bg-purple-50";
    case "IMG":
      return "text-blue-700 border-blue-200 bg-blue-50";
    case "RX":
      return "text-green-700 border-green-200 bg-green-50";
    case "REPORT":
      return "text-orange-700 border-orange-200 bg-orange-50";
    default:
      return "text-gray-700 border-gray-200 bg-gray-50";
  }
};