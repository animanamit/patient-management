'use client';

import { useState } from 'react';
import { 
  Download, 
  Eye, 
  Share2, 
  Trash2, 
  Edit3, 
  Filter,
  Search,
  Calendar,
  User,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DocumentWithUploader,
  DocumentCategory,
  DOCUMENT_CATEGORY_LABELS,
  useDownloadDocument,
  useDeleteDocument,
  useToggleSharing,
  useUpdateDocument,
  formatFileSize,
  getFileTypeIcon,
  getDocumentCategoryStyles
} from '@/hooks/use-documents';

interface DocumentListProps {
  documents: DocumentWithUploader[];
  userRole: 'PATIENT' | 'DOCTOR' | 'STAFF';
  currentUserId?: string;
  onPreview?: (document: DocumentWithUploader) => void;
  onRefresh?: () => void;
}

interface DocumentFilters {
  search: string;
  category: DocumentCategory | 'ALL';
  sharedOnly: boolean;
}

export const DocumentList = ({
  documents,
  userRole,
  currentUserId,
  onPreview,
  onRefresh,
}: DocumentListProps) => {
  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    category: 'ALL',
    sharedOnly: false,
  });
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    description: string;
    category: DocumentCategory;
  }>({ description: '', category: DocumentCategory.OTHER });

  const downloadMutation = useDownloadDocument();
  const deleteMutation = useDeleteDocument();
  const toggleSharingMutation = useToggleSharing();
  const updateMutation = useUpdateDocument();

  // Filter documents based on current filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         doc.uploaderName.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = filters.category === 'ALL' || doc.category === filters.category;
    
    const matchesShared = !filters.sharedOnly || doc.isSharedWithPatient;

    return matchesSearch && matchesCategory && matchesShared;
  });

  const handleDownload = (documentId: string) => {
    downloadMutation.mutate(documentId);
  };

  const handleDelete = (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(documentId, {
        onSuccess: () => onRefresh?.(),
      });
    }
  };

  const handleToggleSharing = (documentId: string, currentShared: boolean) => {
    toggleSharingMutation.mutate(
      { documentId, isShared: !currentShared },
      { onSuccess: () => onRefresh?.() }
    );
  };

  const startEdit = (document: DocumentWithUploader) => {
    setEditingDocument(document.id);
    setEditValues({
      description: document.description || '',
      category: document.category,
    });
  };

  const saveEdit = (documentId: string) => {
    updateMutation.mutate(
      { documentId, updates: editValues },
      {
        onSuccess: () => {
          setEditingDocument(null);
          onRefresh?.();
        },
      }
    );
  };

  const cancelEdit = () => {
    setEditingDocument(null);
    setEditValues({ description: '', category: DocumentCategory.OTHER });
  };

  const canEdit = (document: DocumentWithUploader) => {
    return userRole === 'STAFF' || document.uploadedBy === currentUserId;
  };

  const canDelete = (document: DocumentWithUploader) => {
    return userRole === 'STAFF' || document.uploadedBy === currentUserId;
  };

  const canToggleSharing = () => {
    return userRole === 'DOCTOR' || userRole === 'STAFF';
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          📄
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
        <p className="text-gray-600">
          Documents will appear here once they're uploaded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 space-y-4">
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              category: e.target.value as DocumentCategory | 'ALL' 
            }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {/* Shared Filter (for non-patients) */}
          {userRole !== 'PATIENT' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="shared-filter"
                checked={filters.sharedOnly}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  sharedOnly: e.target.checked 
                }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="shared-filter" className="text-sm text-gray-700">
                Shared with patient only
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Document Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredDocuments.length} of {documents.length} documents
        </p>
        {filteredDocuments.length !== documents.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ search: '', category: 'ALL', sharedOnly: false })}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {filteredDocuments.map((document) => (
          <div
            key={document.id}
            className="bg-white border border-gray-200 rounded-sm p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* File Icon */}
              <div className="text-2xl flex-shrink-0 mt-1">
                {getFileTypeIcon(document.fileType)}
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {document.fileName}
                    </h3>
                    
                    {/* Category Badge */}
                    <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-sm border mt-2 ${getDocumentCategoryStyles(document.category)}`}>
                      {DOCUMENT_CATEGORY_LABELS[document.category]}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Preview Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPreview?.(document)}
                      className="h-8 w-8 p-0"
                      title="Preview document"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {/* Download Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(document.id)}
                      disabled={downloadMutation.isPending}
                      className="h-8 w-8 p-0"
                      title="Download document"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    {/* Edit Button */}
                    {canEdit(document) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(document)}
                        className="h-8 w-8 p-0"
                        title="Edit document"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Share Toggle (for doctors/staff) */}
                    {canToggleSharing() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSharing(document.id, document.isSharedWithPatient)}
                        disabled={toggleSharingMutation.isPending}
                        className={`h-8 w-8 p-0 ${document.isSharedWithPatient ? 'text-green-600' : 'text-gray-400'}`}
                        title={document.isSharedWithPatient ? 'Shared with patient' : 'Not shared with patient'}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Delete Button */}
                    {canDelete(document) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Edit Form */}
                {editingDocument === document.id ? (
                  <div className="mt-4 space-y-3 p-3 bg-gray-50 rounded-sm border">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={editValues.category}
                        onChange={(e) => setEditValues(prev => ({ 
                          ...prev, 
                          category: e.target.value as DocumentCategory 
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editValues.description}
                        onChange={(e) => setEditValues(prev => ({ 
                          ...prev, 
                          description: e.target.value 
                        }))}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Add description..."
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => saveEdit(document.id)}
                        disabled={updateMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Document Details */
                  <div className="mt-3 space-y-2">
                    {/* Description */}
                    {document.description && (
                      <p className="text-sm text-gray-600">
                        {document.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(document.createdAt).toLocaleDateString()}</span>
                      </span>
                      
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{document.uploaderName}</span>
                      </span>
                      
                      <span>{formatFileSize(document.fileSize)}</span>
                      
                      {userRole !== 'PATIENT' && (
                        <span className={`font-medium ${document.isSharedWithPatient ? 'text-green-600' : 'text-gray-400'}`}>
                          {document.isSharedWithPatient ? 'Shared' : 'Private'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredDocuments.length === 0 && documents.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-2">No documents match your filters</p>
          <Button
            variant="ghost"
            onClick={() => setFilters({ search: '', category: 'ALL', sharedOnly: false })}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear filters to see all documents
          </Button>
        </div>
      )}
    </div>
  );
};