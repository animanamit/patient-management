'use client';

import { useState } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DocumentCategory, 
  DOCUMENT_CATEGORY_LABELS, 
  useUploadDocument,
  formatFileSize,
  getFileTypeIcon 
} from '@/hooks/use-documents';
import { FileDropzone } from './file-dropzone';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  appointmentId?: string;
  onUploadComplete?: () => void;
}

interface FileWithMetadata {
  file: File;
  category: DocumentCategory;
  description: string;
  isSharedWithPatient: boolean;
}

export const DocumentUploadModal = ({
  isOpen,
  onClose,
  patientId,
  appointmentId,
  onUploadComplete,
}: DocumentUploadModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadMutation = useUploadDocument();

  if (!isOpen) return null;

  const handleFilesAccepted = (files: File[]) => {
    const newFiles = files.map(file => ({
      file,
      category: DocumentCategory.OTHER,
      description: '',
      isSharedWithPatient: false,
    }));
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileMetadata = (
    index: number, 
    updates: Partial<Omit<FileWithMetadata, 'file'>>
  ) => {
    setSelectedFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const fileData of selectedFiles) {
        await uploadMutation.mutateAsync({
          file: fileData.file,
          patientId,
          category: fileData.category,
          description: fileData.description || undefined,
          appointmentId,
          isSharedWithPatient: fileData.isSharedWithPatient,
        });
      }

      // Reset and close
      setSelectedFiles([]);
      onUploadComplete?.();
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return; // Prevent closing during upload
    setSelectedFiles([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Documents
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isUploading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* File Dropzone */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Select Files
              </h3>
              <FileDropzone
                onFilesAccepted={handleFilesAccepted}
                disabled={isUploading}
                maxFiles={10}
              />
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Files to Upload ({selectedFiles.length})
                </h3>
                <div className="space-y-4">
                  {selectedFiles.map((fileData, index) => (
                    <div
                      key={`${fileData.file.name}-${index}`}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start space-x-4">
                        {/* File Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">
                              {getFileTypeIcon(fileData.file.type)}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {fileData.file.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(fileData.file.size)}
                              </p>
                            </div>
                          </div>

                          {/* Metadata Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Category */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Category *
                              </label>
                              <select
                                value={fileData.category}
                                onChange={(e) => updateFileMetadata(index, {
                                  category: e.target.value as DocumentCategory
                                })}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isUploading}
                              >
                                {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Share with Patient */}
                            <div className="flex items-center space-x-2 pt-6">
                              <input
                                type="checkbox"
                                id={`share-${index}`}
                                checked={fileData.isSharedWithPatient}
                                onChange={(e) => updateFileMetadata(index, {
                                  isSharedWithPatient: e.target.checked
                                })}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                disabled={isUploading}
                              />
                              <label
                                htmlFor={`share-${index}`}
                                className="text-xs font-medium text-gray-700"
                              >
                                Share with patient
                              </label>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="mt-4">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Description (optional)
                            </label>
                            <textarea
                              value={fileData.description}
                              onChange={(e) => updateFileMetadata(index, {
                                description: e.target.value
                              })}
                              placeholder="Add notes about this document..."
                              rows={2}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                              disabled={isUploading}
                            />
                          </div>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedFiles.length > 0 && (
              <>
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                {appointmentId && ' for this appointment'}
              </>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};