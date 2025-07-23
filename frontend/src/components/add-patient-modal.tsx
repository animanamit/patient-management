"use client";

import { useState, useTransition } from "react";
import { X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useCreatePatient } from "@/hooks/use-patients";
import { CreatePatientRequest } from "@/lib/api-types";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (patientId: string) => void;
}

export const AddPatientModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddPatientModalProps) => {
  const [formData, setFormData] = useState<CreatePatientRequest>({
    clerkUserId: "", // Will be set by backend
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const createPatientMutation = useCreatePatient();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    startTransition(async () => {
      try {
        // Format phone number for Singapore
        const formattedPhone = formData.phone.startsWith("+65") 
          ? formData.phone 
          : `+65${formData.phone.replace(/\D/g, "")}`;
        
        const result = await createPatientMutation.mutateAsync({
          ...formData,
          phone: formattedPhone,
        });
        
        setShowSuccess(true);
        
        // Auto close after 2 seconds and call success callback
        setTimeout(() => {
          onSuccess?.(result.patient.id);
          handleClose();
        }, 2000);
      } catch (err: any) {
        setError(err.message || "Failed to create patient. Please try again.");
      }
    });
  };
  
  const handleClose = () => {
    setFormData({
      clerkUserId: "", // Will be set by backend
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      address: "",
      emergencyContact: "",
    });
    setError(null);
    setShowSuccess(false);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className="flex min-h-full items-end md:items-center justify-center md:p-4">
        <div 
          className="fixed inset-0 bg-gray-900/50 transition-opacity" 
          onClick={handleClose}
          aria-hidden="true"
        />
        
        <div className="relative w-full max-w-lg md:max-w-md bg-white border-0 md:border rounded-t-sm md:rounded-sm " style={{ borderColor: '#E0ECDB' }}>
          {/* Mobile handle */}
          <div className="md:hidden flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#D0E5C4' }}></div>
          </div>
          
          {/* Header */}
          <div className="px-6 py-6 md:px-6 md:py-4 md:border-b" style={{ borderColor: '#E0ECDB' }}>
            <div className="flex items-center justify-between">
              <h2 id="modal-title" className="text-xl md:text-base font-bold md:font-semibold" style={{ color: '#2D5A29' }}>
                Add New Patient
              </h2>
              <button
                onClick={handleClose}
                className="p-3 md:p-1 hover:bg-gray-100 rounded-full md:rounded-xs transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Close modal"
              >
                <X className="h-6 w-6 md:h-4 md:w-4 text-gray-500" aria-hidden="true" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 pb-6 md:p-6">
            {/* Status announcements for screen readers */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {error && `Error: ${error}`}
              {showSuccess && "Patient created successfully"}
              {isPending && "Creating patient, please wait"}
            </div>
            
            {showSuccess ? (
              <div className="text-center py-12 md:py-8" id="modal-description">
                <CheckCircle className="h-16 w-16 md:h-12 md:w-12 text-green-500 mx-auto mb-6 md:mb-4" aria-hidden="true" />
                <h3 className="text-xl md:text-base font-bold md:font-semibold text-gray-900 mb-3 md:mb-2">
                  Patient Created Successfully!
                </h3>
                <p className="text-base md:text-sm text-gray-600">
                  The patient has been added to the system.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-4">
                {/* Error Display */}
                {error && (
                  <div className="p-4 md:p-3 border rounded-sm" style={{ backgroundColor: '#EDF5E9', borderColor: '#D0E5C4' }}>
                    <div className="flex items-center gap-3 md:gap-2">
                      <AlertCircle className="h-5 w-5 md:h-4 md:w-4" style={{ color: '#6B9A65' }} />
                      <p className="text-base md:text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                  <div>
                    <label className="block text-base md:text-xs font-semibold md:font-medium text-gray-900 md:text-gray-700 mb-2 md:mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-4 md:px-3 md:py-2 text-base md:text-sm border border-gray-300 md:border-gray-200 rounded-sm focus:outline-none focus:ring-2 md:focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base md:text-xs font-semibold md:font-medium text-gray-900 md:text-gray-700 mb-2 md:mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-4 md:px-3 md:py-2 text-base md:text-sm border border-gray-300 md:border-gray-200 rounded-sm focus:outline-none focus:ring-2 md:focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-base md:text-xs font-semibold md:font-medium text-gray-900 md:text-gray-700 mb-2 md:mb-1">
                    Phone Number*
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 md:left-3 top-1/2 -translate-y-1/2 text-base md:text-sm text-gray-500">
                      +65
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="8888 8888"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-14 md:pl-12 pr-4 md:pr-3 py-4 md:py-2 text-base md:text-sm border border-gray-300 md:border-gray-200 rounded-sm focus:outline-none focus:ring-2 md:focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-base md:text-xs font-semibold md:font-medium text-gray-900 md:text-gray-700 mb-2 md:mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-4 md:px-3 md:py-2 text-base md:text-sm border border-gray-300 md:border-gray-200 rounded-sm focus:outline-none focus:ring-2 md:focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-base md:text-xs font-semibold md:font-medium text-gray-900 md:text-gray-700 mb-2 md:mb-1">
                    Date of Birth*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-4 md:px-3 md:py-2 text-base md:text-sm border border-gray-300 md:border-gray-200 rounded-sm focus:outline-none focus:ring-2 md:focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-base md:text-xs font-semibold md:font-medium text-gray-900 md:text-gray-700 mb-2 md:mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-4 md:px-3 md:py-2 text-base md:text-sm border border-gray-300 md:border-gray-200 rounded-sm focus:outline-none focus:ring-2 md:focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-base md:text-xs font-semibold md:font-medium text-gray-900 md:text-gray-700 mb-2 md:mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Contact name and number"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-4 py-4 md:px-3 md:py-2 text-base md:text-sm border border-gray-300 md:border-gray-200 rounded-sm focus:outline-none focus:ring-2 md:focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex flex-col md:flex-row md:justify-end gap-4 md:gap-3 pt-6 md:pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="order-2 md:order-1 px-6 py-4 md:px-4 md:py-2 text-base md:text-sm font-semibold md:font-medium text-gray-700 hover:text-gray-900 border border-gray-300 md:border-gray-200 rounded-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || createPatientMutation.isPending}
                    className="order-1 md:order-2 px-6 py-4 md:px-4 md:py-2 text-base md:text-sm font-bold md:font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-sm disabled:opacity-50 transition-colors"
                  >
                    {isPending || createPatientMutation.isPending ? (
                      <span className="flex items-center justify-center gap-3 md:gap-2">
                        <Loader2 className="h-5 w-5 md:h-3 md:w-3 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Add Patient"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};