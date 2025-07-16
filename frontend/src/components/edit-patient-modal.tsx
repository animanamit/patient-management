"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { useUpdatePatient, useOptimisticPatientUpdate } from "@/hooks/use-patients";
import { Patient, UpdatePatientRequest } from "@/lib/api-types";

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const EditPatientModal = ({ isOpen, onClose, patient }: EditPatientModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const updatePatientMutation = useUpdatePatient();
  const { updatePatientOptimistically, isUpdating } = useOptimisticPatientUpdate();

  // Initialize form data when patient changes or modal opens
  useEffect(() => {
    if (patient) {
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: typeof patient.email === 'string' ? patient.email : patient.email?.normalizedValue || "",
        phone: typeof patient.phone === 'string' ? patient.phone : patient.phone?.normalizedValue || "",
        address: patient.address || "",
      });
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create update data object with only changed fields
    const updateData: UpdatePatientRequest = {};
    
    if (formData.firstName !== patient.firstName) {
      updateData.firstName = formData.firstName;
    }
    if (formData.lastName !== patient.lastName) {
      updateData.lastName = formData.lastName;
    }
    
    const currentEmail = typeof patient.email === 'string' ? patient.email : patient.email?.normalizedValue || "";
    if (formData.email !== currentEmail) {
      updateData.email = formData.email;
    }
    
    const currentPhone = typeof patient.phone === 'string' ? patient.phone : patient.phone?.normalizedValue || "";
    if (formData.phone !== currentPhone) {
      updateData.phone = formData.phone;
    }
    
    if (formData.address !== (patient.address || "")) {
      updateData.address = formData.address;
    }

    // If no changes were made, just close the modal
    if (Object.keys(updateData).length === 0) {
      onClose();
      return;
    }

    try {
      // Use optimistic update for better UX
      await updatePatientOptimistically(patient.id, updateData);
      onClose();
    } catch (error) {
      console.error("Failed to update patient:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-sm border border-gray-200 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
            <p className="text-xs text-gray-500 mt-1">Update patient information</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <User className="h-3 w-3 inline mr-1" />
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Mail className="h-3 w-3 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Phone className="h-3 w-3 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <MapPin className="h-3 w-3 inline mr-1" />
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter full address"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Error Message */}
          {updatePatientMutation.isError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xs p-2">
              Failed to update profile. Please try again.
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xs hover:bg-gray-50 transition-colors"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};