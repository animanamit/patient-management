'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/hooks/use-documents';

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export const FileDropzone = ({
  onFilesAccepted,
  maxFiles = 5,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedFileTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
  className = '',
}: FileDropzoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        // Handle rejected files
        rejectedFiles.forEach(({ file, errors }) => {
          console.warn(`File ${file.name} rejected:`, errors);
        });
      }

      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }
    },
    [onFilesAccepted]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    rejectedFiles,
  } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    disabled,
  });

  const getDropzoneClassName = () => {
    let baseClasses = `
      border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
      ${className}
    `;

    if (disabled) {
      baseClasses += ' border-gray-200 bg-gray-50 cursor-not-allowed';
    } else if (isDragReject) {
      baseClasses += ' border-red-300 bg-red-50';
    } else if (isDragActive) {
      baseClasses += ' border-blue-500 bg-blue-50';
    } else {
      baseClasses += ' border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50';
    }

    return baseClasses.trim();
  };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={getDropzoneClassName()}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          {isDragActive ? (
            <>
              <Upload className="w-12 h-12 text-blue-500" />
              <div>
                <p className="text-lg font-medium text-blue-700">
                  Drop files here...
                </p>
              </div>
            </>
          ) : (
            <>
              <FileText className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {disabled ? 'Upload disabled' : 'Drop files here or click to select'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Max {maxFiles} files, up to {formatFileSize(maxSize)} each
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports: PDF, Images, Word documents, Text files
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Show rejected files */}
      {rejectedFiles.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Some files were rejected:
              </h4>
              <ul className="text-sm text-red-700 space-y-1">
                {rejectedFiles.map(({ file, errors }) => (
                  <li key={file.name}>
                    <span className="font-medium">{file.name}</span>
                    <ul className="ml-4 text-xs text-red-600 mt-1">
                      {errors.map((error: any) => (
                        <li key={error.code}>
                          {error.code === 'file-too-large' && 
                            `File too large (${formatFileSize(file.size)} > ${formatFileSize(maxSize)})`}
                          {error.code === 'file-invalid-type' && 
                            'File type not supported'}
                          {error.code === 'too-many-files' && 
                            `Too many files (max ${maxFiles})`}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};