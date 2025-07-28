import { nanoid } from 'nanoid';
import { UploadUrlRequest, UploadUrlResponse } from './s3-storage.service.js';

/**
 * Mock S3 Storage Service for local development
 * 
 * This service simulates S3 functionality without requiring AWS credentials.
 * In a real implementation, files would be stored locally or in a temporary storage.
 */
export class MockS3StorageService {
  /**
   * Generate a mock pre-signed URL for file upload
   */
  async generateUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse> {
    // Generate unique file ID and mock S3 key
    const fileId = nanoid();
    const timestamp = new Date().toISOString().split('T')[0];
    const fileExtension = this.getFileExtension(request.fileName);
    const s3Key = `documents/${request.patientId}/${timestamp}/${fileId}${fileExtension}`;

    // In a real implementation, you might store file metadata in a local database
    // For now, we'll just return a mock URL
    const mockUploadUrl = `http://localhost:8000/mock-upload/${fileId}`;

    console.log('🔧 Mock S3 Upload URL generated:', {
      fileName: request.fileName,
      fileType: request.fileType,
      s3Key,
      mockUploadUrl
    });

    return {
      uploadUrl: mockUploadUrl,
      s3Key,
      fileId,
    };
  }

  /**
   * Generate a mock pre-signed URL for file download
   */
  async generateDownloadUrl(request: { s3Key: string; fileName?: string }): Promise<string> {
    // Extract fileId from s3Key
    const parts = request.s3Key.split('/');
    const fileWithExt = parts[parts.length - 1];
    const fileId = fileWithExt ? fileWithExt.split('.')[0] : 'unknown';

    // In a real implementation, you would retrieve the file from local storage
    const mockDownloadUrl = `http://localhost:8000/mock-download/${fileId}`;

    console.log('🔧 Mock S3 Download URL generated:', {
      s3Key: request.s3Key,
      fileName: request.fileName,
      mockDownloadUrl
    });

    return mockDownloadUrl;
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return fileName.substring(lastDotIndex);
  }
}

export const mockS3StorageService = new MockS3StorageService();