import { S3Client } from '@aws-sdk/client-s3';
import { env } from './environment.js';

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const S3_CONFIG = {
  bucket: env.AWS_S3_BUCKET_NAME,
  region: env.AWS_REGION,
  // Upload presigned URL expires in 30 minutes
  uploadUrlExpiration: 30 * 60,
  // Download presigned URL expires in 1 hour
  downloadUrlExpiration: 60 * 60,
  // Maximum file size: 10MB
  maxFileSize: 10 * 1024 * 1024,
  // Allowed file types
  allowedFileTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
} as const;