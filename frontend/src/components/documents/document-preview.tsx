'use client';

import { useState, useEffect } from 'react';
import { X, Download, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DocumentWithUploader,
  useDownloadDocument,
  formatFileSize,
  getFileTypeIcon,
  isImageFile,
  isPdfFile
} from '@/hooks/use-documents';

interface DocumentPreviewProps {
  document: DocumentWithUploader | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentPreview = ({
  document,
  isOpen,
  onClose,
}: DocumentPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const downloadMutation = useDownloadDocument();

  useEffect(() => {
    if (!document || !isOpen) {
      setPreviewUrl(null);
      setPreviewError(null);
      return;
    }

    // Only try to preview images and PDFs
    if (isImageFile(document.fileType) || isPdfFile(document.fileType)) {
      loadPreview();
    }
  }, [document, isOpen]);

  const loadPreview = async () => {
    if (!document) return;

    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/documents/${document.id}/download-url`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to get preview URL');
      }

      const { downloadUrl } = await response.json();
      setPreviewUrl(downloadUrl);
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewError('Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleDownload = () => {
    if (document) {
      downloadMutation.mutate(document.id);
    }
  };

  if (!isOpen || !document) return null;

  const canPreview = isImageFile(document.fileType) || isPdfFile(document.fileType);

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <span className="text-xl">
              {getFileTypeIcon(document.fileType)}
            </span>
            <div>
              <h3 className="font-medium text-gray-900 truncate">
                {document.fileName}
              </h3>
              <p className="text-sm text-gray-600">
                {formatFileSize(document.fileSize)} • {document.uploaderName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={downloadMutation.isPending}
            >
              {downloadMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {canPreview ? (
            <div className="w-full h-full flex items-center justify-center">
              {isLoadingPreview ? (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-gray-600">Loading preview...</p>
                </div>
              ) : previewError ? (
                <div className="flex flex-col items-center space-y-4 text-center max-w-md">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Preview not available
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {previewError}
                    </p>
                    <Button
                      onClick={handleDownload}
                      disabled={downloadMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="w-full h-full">
                  {isImageFile(document.fileType) ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img
                        src={previewUrl}
                        alt={document.fileName}
                        className="max-w-full max-h-full object-contain"
                        onError={() => setPreviewError('Failed to load image')}
                      />
                    </div>
                  ) : isPdfFile(document.fileType) ? (
                    <div className="w-full h-full">
                      <iframe
                        src={previewUrl}
                        className="w-full h-full border-0"
                        title={document.fileName}
                        onError={() => setPreviewError('Failed to load PDF')}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            /* Non-previewable files */
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">
                  {getFileTypeIcon(document.fileType)}
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Preview not available
                </h4>
                <p className="text-gray-600 mb-6">
                  This file type cannot be previewed in the browser. 
                  Download the file to view its contents.
                </p>
                <Button
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {downloadMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download File
                </Button>
                
                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left">
                  <h5 className="font-medium text-blue-900 mb-2">File Information</h5>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div><strong>Type:</strong> {document.fileType}</div>
                    <div><strong>Size:</strong> {formatFileSize(document.fileSize)}</div>
                    <div><strong>Uploaded:</strong> {new Date(document.createdAt).toLocaleString()}</div>
                    <div><strong>By:</strong> {document.uploaderName}</div>
                    {document.description && (
                      <div><strong>Description:</strong> {document.description}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with document metadata */}
        {document.description && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm">
              <span className="font-medium text-gray-700">Description: </span>
              <span className="text-gray-600">{document.description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};