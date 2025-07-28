import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileTypeFromBuffer } from 'file-type';
import { s3Client, S3_CONFIG, isAWSConfigured } from '../config/s3.js';
import { mockS3StorageService } from './mock-s3-storage.service.js';
import { nanoid } from 'nanoid';

export interface UploadUrlRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  patientId: string;
  category: string;
  appointmentId?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  s3Key: string;
  fileId: string;
}

export interface DownloadUrlRequest {
  s3Key: string;
  fileName?: string;
}

export class S3StorageService {
  /**
   * Generate a pre-signed URL for file upload
   */
  async generateUploadUrl(request: UploadUrlRequest): Promise<UploadUrlResponse> {
    // Use mock service if AWS is not configured
    if (!isAWSConfigured) {
      return mockS3StorageService.generateUploadUrl(request);
    }
    // Validate file type
    if (!S3_CONFIG.allowedFileTypes.includes(request.fileType)) {
      throw new Error(`File type ${request.fileType} is not allowed`);
    }

    // Validate file size
    if (request.fileSize > S3_CONFIG.maxFileSize) {
      throw new Error(`File size ${request.fileSize} exceeds maximum allowed size of ${S3_CONFIG.maxFileSize} bytes`);
    }

    // Generate unique file ID and S3 key
    const fileId = nanoid();
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileExtension = this.getFileExtension(request.fileName);
    const s3Key = `documents/${request.patientId}/${timestamp}/${fileId}${fileExtension}`;

    // Create upload command
    const command = new PutObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: s3Key,
      ContentType: request.fileType,
      ContentLength: request.fileSize,
      Metadata: {
        originalName: request.fileName,
        category: request.category,
        patientId: request.patientId,
        appointmentId: request.appointmentId || '',
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate pre-signed URL
    const uploadUrl = await getSignedUrl(s3Client!, command, {
      expiresIn: S3_CONFIG.uploadUrlExpiration,
    });

    return {
      uploadUrl,
      s3Key,
      fileId,
    };
  }

  /**
   * Generate a pre-signed URL for file download
   */
  async generateDownloadUrl(request: DownloadUrlRequest): Promise<string> {
    // Use mock service if AWS is not configured
    if (!isAWSConfigured) {
      return mockS3StorageService.generateDownloadUrl(request);
    }
    const command = new GetObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: request.s3Key,
      ResponseContentDisposition: request.fileName 
        ? `attachment; filename="${request.fileName}"`
        : undefined,
    });

    return await getSignedUrl(s3Client!, command, {
      expiresIn: S3_CONFIG.downloadUrlExpiration,
    });
  }

  /**
   * Validate file type from buffer (for additional security)
   */
  async validateFileType(buffer: Buffer, expectedMimeType: string): Promise<boolean> {
    try {
      const detectedType = await fileTypeFromBuffer(buffer);
      
      if (!detectedType) {
        // For text files and some other types that file-type can't detect
        return expectedMimeType === 'text/plain' || 
               expectedMimeType === 'application/json';
      }

      return detectedType.mime === expectedMimeType;
    } catch (error) {
      console.error('Error validating file type:', error);
      return false;
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return fileName.substring(lastDotIndex);
  }

  /**
   * Generate S3 key for a document
   */
  static generateS3Key(patientId: string, fileName: string, fileId: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    return `documents/${patientId}/${timestamp}/${fileId}${fileExtension}`;
  }

  /**
   * Check if file type is allowed
   */
  static isFileTypeAllowed(mimeType: string): boolean {
    return S3_CONFIG.allowedFileTypes.includes(mimeType);
  }

  /**
   * Check if file size is within limits
   */
  static isFileSizeAllowed(size: number): boolean {
    return size <= S3_CONFIG.maxFileSize;
  }
}

export const s3StorageService = new S3StorageService();