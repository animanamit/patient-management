"use client";

import { useState, useTransition } from "react";
import { X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useCreatePatient } from "@/hooks/use-patients";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { useDoctors } from "@/hooks/use-doctors";
import { CreatePatientRequest, DoctorId, AppointmentType } from "@/lib/api-types";

interface WalkInRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (patientId: string, appointmentId: string) => void;
}

export const WalkInRegistrationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: WalkInRegistrationModalProps) => {
  const [step, setStep] = useState<"patient" | "appointment" | "success">("patient");
  const [patientData, setPatientData] = useState<CreatePatientRequest>({
    clerkUserId: "", // Will be set by backend
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
  });
  const [selectedDoctorId, setSelectedDoctorId] = useState<DoctorId | null>(null);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("CHECK_UP");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [isPending, startTransition] = useTransition();
  
  const createPatientMutation = useCreatePatient();
  const createAppointmentMutation = useCreateAppointment();
  const { data: doctorsData, isLoading: isDoctorsLoading } = useDoctors();
  
  const doctors = doctorsData?.doctors || [];
  
  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    startTransition(async () => {
      try {
        // Format phone number for Singapore
        const formattedPhone = patientData.phone.startsWith("+65") 
          ? patientData.phone 
          : `+65${patientData.phone.replace(/\D/g, "")}`;
        
        const result = await createPatientMutation.mutateAsync({
          ...patientData,
          phone: formattedPhone,
        });
        
        setCreatedPatientId(result.patient.id);
        setStep("appointment");
      } catch (err: any) {
        setError(err.message || "Failed to create patient. Please try again.");
      }
    });
  };
  
  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!selectedDoctorId || !createdPatientId) return;
    
    startTransition(async () => {
      try {
        // Create appointment for today
        const now = new Date();
        const scheduledDateTime = new Date();
        scheduledDateTime.setHours(now.getHours() + 1, 0, 0, 0); // Schedule for next hour
        
        const result = await createAppointmentMutation.mutateAsync({
          patientId: createdPatientId,
          doctorId: selectedDoctorId,
          type: appointmentType,
          scheduledDateTime: scheduledDateTime.toISOString(),
          durationMinutes: appointmentType === "CHECK_UP" ? 30 : appointmentType === "FIRST_CONSULT" ? 60 : appointmentType === "FOLLOW_UP" ? 45 : 15,
          reasonForVisit: reasonForVisit || "Walk-in appointment",
        });
        
        setCreatedAppointmentId(result.appointment.id);
        setStep("success");
        
        // Auto close after 3 seconds and call success callback
        setTimeout(() => {
          onSuccess?.(createdPatientId, result.appointment.id);
          handleClose();
        }, 3000);
      } catch (err: any) {
        setError(err.message || "Failed to create appointment. Please try again.");
      }
    });
  };
  
  const handleClose = () => {
    setStep("patient");
    setPatientData({
      clerkUserId: "", // Will be set by backend
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dateOfBirth: "",
      address: "",
      emergencyContact: "",
    });
    setSelectedDoctorId(null);
    setAppointmentType("CHECK_UP");
    setReasonForVisit("");
    setCreatedPatientId(null);
    setCreatedAppointmentId(null);
    setError(null);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/50 transition-opacity" onClick={handleClose} />
        
        <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-sm shadow-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Walk-in Registration
              </h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-xs transition-colors"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {step === "patient" && (
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Step 1: Patient Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        First Name*
                      </label>
                      <input
                        type="text"
                        required
                        value={patientData.firstName}
                        onChange={(e) => setPatientData({ ...patientData, firstName: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Last Name*
                      </label>
                      <input
                        type="text"
                        required
                        value={patientData.lastName}
                        onChange={(e) => setPatientData({ ...patientData, lastName: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone Number*
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="8888 8888"
                      value={patientData.phone}
                      onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={patientData.email}
                      onChange={(e) => setPatientData({ ...patientData, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date of Birth*
                    </label>
                    <input
                      type="date"
                      required
                      value={patientData.dateOfBirth}
                      onChange={(e) => setPatientData({ ...patientData, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={patientData.address}
                      onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      placeholder="Contact name and number"
                      value={patientData.emergencyContact}
                      onChange={(e) => setPatientData({ ...patientData, emergencyContact: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xs hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || createPatientMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-xs disabled:opacity-50"
                  >
                    {isPending || createPatientMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {step === "appointment" && (
              <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Step 2: Appointment Details
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Select Doctor*
                    </label>
                    {isDoctorsLoading ? (
                      <div className="p-3 border border-gray-200 rounded-xs">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : (
                      <select
                        required
                        value={selectedDoctorId || ""}
                        onChange={(e) => setSelectedDoctorId(e.target.value as DoctorId)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Choose a doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || "General Practice"}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Appointment Type*
                    </label>
                    <select
                      value={appointmentType}
                      onChange={(e) => setAppointmentType(e.target.value as typeof appointmentType)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="CHECK_UP">Check-up (30 min)</option>
                      <option value="FIRST_CONSULT">First Consultation (60 min)</option>
                      <option value="FOLLOW_UP">Follow-up (45 min)</option>
                    </select>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Reason for Visit
                    </label>
                    <textarea
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      placeholder="Brief description of symptoms or reason for visit"
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xs">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> Walk-in appointments are subject to availability. 
                      You will be added to today's queue and seen as soon as possible.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep("patient")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xs hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isPending || createAppointmentMutation.isPending || !selectedDoctorId}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 rounded-xs disabled:opacity-50"
                  >
                    {isPending || createAppointmentMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Complete Registration"
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {step === "success" && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Registration Successful!
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Patient and appointment have been created.
                </p>
                <p className="text-xs text-gray-500">
                  Redirecting to check-in confirmation...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};