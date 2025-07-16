"use client";

import { useState } from "react";
import { X, Calendar, Clock, User, FileText, Loader2 } from "lucide-react";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { useDoctors } from "@/hooks/use-doctors";
import { 
  PatientId, 
  DoctorId, 
  AppointmentType, 
  CreateAppointmentRequest 
} from "@/lib/api-types";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: PatientId;
  patientName: string;
}

export const BookAppointmentModal = ({ 
  isOpen, 
  onClose, 
  patientId, 
  patientName 
}: BookAppointmentModalProps) => {
  const [formData, setFormData] = useState({
    doctorId: "",
    type: "CHECK_UP" as AppointmentType,
    scheduledDateTime: "",
    durationMinutes: 30,
    reasonForVisit: "",
    notes: "",
  });

  const createAppointmentMutation = useCreateAppointment();
  const { data: doctorsData, isLoading: isDoctorsLoading } = useDoctors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.doctorId || !formData.scheduledDateTime) {
      return;
    }

    const appointmentData: CreateAppointmentRequest = {
      patientId,
      doctorId: formData.doctorId as DoctorId,
      type: formData.type,
      scheduledDateTime: new Date(formData.scheduledDateTime).toISOString(),
      durationMinutes: formData.durationMinutes,
      reasonForVisit: formData.reasonForVisit || undefined,
      notes: formData.notes || undefined,
    };

    try {
      await createAppointmentMutation.mutateAsync(appointmentData);
      onClose();
      // Reset form
      setFormData({
        doctorId: "",
        type: "CHECK_UP",
        scheduledDateTime: "",
        durationMinutes: 30,
        reasonForVisit: "",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to create appointment:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "durationMinutes" ? parseInt(value) || 30 : value,
    }));
  };

  // Get minimum date (today)
  const today = new Date();
  const minDate = today.toISOString().slice(0, 16); // Format for datetime-local input

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-sm border border-gray-200 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Book Appointment</h2>
            <p className="text-xs text-gray-500 mt-1">For {patientName}</p>
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
          {/* Doctor Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <User className="h-3 w-3 inline mr-1" />
              Doctor
            </label>
            <select
              name="doctorId"
              value={formData.doctorId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isDoctorsLoading}
            >
              <option value="">Select a doctor</option>
              {doctorsData?.doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                  {doctor.specialization && ` - ${doctor.specialization}`}
                </option>
              ))}
            </select>
            {isDoctorsLoading && (
              <p className="text-xs text-gray-500 mt-1">Loading doctors...</p>
            )}
          </div>

          {/* Appointment Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <FileText className="h-3 w-3 inline mr-1" />
              Appointment Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="CHECK_UP">Check-up</option>
              <option value="FOLLOW_UP">Follow-up</option>
              <option value="FIRST_CONSULT">First Consultation</option>
            </select>
          </div>

          {/* Date and Time */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Calendar className="h-3 w-3 inline mr-1" />
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="scheduledDateTime"
              value={formData.scheduledDateTime}
              onChange={handleInputChange}
              min={minDate}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <Clock className="h-3 w-3 inline mr-1" />
              Duration (minutes)
            </label>
            <select
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Reason for Visit
            </label>
            <input
              type="text"
              name="reasonForVisit"
              value={formData.reasonForVisit}
              onChange={handleInputChange}
              placeholder="Brief description of the visit purpose"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional information for the doctor"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Error Message */}
          {createAppointmentMutation.isError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xs p-2">
              Failed to create appointment. Please try again.
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xs hover:bg-gray-50 transition-colors"
              disabled={createAppointmentMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createAppointmentMutation.isPending ||
                !formData.doctorId ||
                !formData.scheduledDateTime
              }
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {createAppointmentMutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Creating...
                </>
              ) : (
                "Book Appointment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};