"use client";

import { useState, useTransition, useMemo, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  FileText,
  User,
  Clock,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Loader2,
  Download,
  Activity,
  CheckCircle2,
  XCircle,
  Plus,
  ChevronRight,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { usePatients, usePatient } from "@/hooks/use-patients";
import {
  usePatientAppointments,
  useOptimisticAppointmentStatusUpdate,
} from "@/hooks/use-appointments";
import {
  usePatientDocuments,
  formatFileSize,
  getDocumentTypeStyles,
} from "@/hooks/use-documents";
import { BookAppointmentModal } from "@/components/book-appointment-modal";
import { EditPatientModal } from "@/components/edit-patient-modal";
import { NavigationBar } from "@/components/navigation-bar";
import { Patient, Appointment, AppointmentWithDetails } from "@/lib/api-types";

// Helper function to extract value from value objects
const extractValue = (
  value: string | { normalizedValue: string } | any
): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "normalizedValue" in value) {
    return value.normalizedValue;
  }
  return "Not provided";
};

// Loading skeleton - Dense grid
const LoadingSkeleton = () => (
  <div className="grid grid-cols-12 gap-6">
    <div className="col-span-8 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-gray-100 rounded-sm animate-pulse" />
      ))}
    </div>
    <div className="col-span-4 space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="h-24 bg-gray-100 rounded-sm animate-pulse" />
      ))}
    </div>
  </div>
);

// Documents will be fetched from the API using usePatientDocuments hook

// Status configuration
const getStatusColor = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "text-blue-600";
    case "IN_PROGRESS":
      return "text-orange-600";
    case "COMPLETED":
      return "text-green-600";
    case "CANCELLED":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

// Document type color function moved to use-documents hook

export default function PatientDashboard() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Optimistic appointment status updates
  const {
    updateStatusOptimistically,
    isUpdating: isUpdatingAppointmentStatus,
  } = useOptimisticAppointmentStatusUpdate();

  // Handle appointment status changes with proper typing
  const handleAppointmentStatusChange = async (
    appointmentId: string,
    newStatus: "CANCELLED" | "COMPLETED"
  ) => {
    try {
      await updateStatusOptimistically(appointmentId, newStatus);
    } catch (error) {
      console.error("Failed to update appointment status:", error);
      // TODO: Add toast notification for user feedback
    }
  };

  // Fetch patients to get the list
  const {
    data: patientsData,
    isLoading: isPatientsLoading,
    error: patientsError,
  } = usePatients();

  // State for selected patient
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );

  // Use the first patient as default if no selection
  const firstPatientId = patientsData?.patients?.[0]?.id || null;
  const validPatientId = selectedPatientId || firstPatientId;

  // Fetch patient details
  const {
    data: patientData,
    isLoading: isPatientLoading,
    error: patientError,
  } = usePatient(validPatientId || undefined, { enabled: !!validPatientId });

  // Fetch patient appointments
  const { data: appointmentsData, isLoading: isAppointmentsLoading } =
    usePatientAppointments(validPatientId || undefined, {
      enabled: !!validPatientId,
    });

  // Fetch patient documents
  const { data: documentsData, isLoading: isDocumentsLoading } =
    usePatientDocuments(validPatientId || undefined, {
      enabled: !!validPatientId,
    });

  // Show loading state
  if (isPatientsLoading || isPatientLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200">
          <div className="px-6 py-3">
            <Skeleton className="h-5 w-32 bg-gray-200" />
            <Skeleton className="h-3 w-24 bg-gray-100 mt-1" />
          </div>
        </div>
        <div className="p-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // Show error state with better messaging
  if (patientsError || patientError) {
    const errorMessage =
      patientsError?.message ||
      patientError?.message ||
      "Unknown error occurred";
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 w-full h-full flex items-center justify-center">
          <div className="bg-white border border-red-200 rounded-sm p-4 max-w-md">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Failed to load patient information
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-xs hover:bg-red-100 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show no patients state
  if (!validPatientId || !patientData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="bg-white border border-gray-200 rounded-sm p-8 text-center max-w-md mx-auto">
            <User className="h-8 w-8 mx-auto mb-3 text-gray-300" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No Patient Data
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              {!validPatientId
                ? "No patients found in the system."
                : "Patient information could not be loaded."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xs hover:bg-blue-100 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const patient = patientData.patient;
  const appointments = appointmentsData?.appointments || [];
  const documents = documentsData?.documents || [];
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "SCHEDULED"
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "COMPLETED" || apt.status === "CANCELLED"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-xs text-gray-500 font-mono uppercase font-extralight tracking-normal">
                Patient ID {patient.id.split("_")[1]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Patient Selection Dropdown */}
              {patientsData?.patients && patientsData.patients.length > 1 && (
                <div className="relative">
                  <select
                    value={validPatientId || ""}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs bg-white appearance-none pr-8"
                  >
                    {patientsData.patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs"
              >
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-8 space-y-6">
            {/* Contact Information */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Contact Information
              </h2>
              <div className="bg-white border border-gray-200 rounded-sm divide-y divide-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {extractValue(patient.phone)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">
                        {extractValue(patient.email)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="text-sm font-medium text-gray-900">
                        {patient.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Upcoming Appointments */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Upcoming Appointments
                  <span className="ml-2 font-mono text-gray-400 font-normal">
                    {upcomingAppointments.length}
                  </span>
                </h2>
                <button className="text-xs font-medium text-gray-700 hover:text-gray-900">
                  View All
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-sm">
                {upcomingAppointments.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-600 mb-1">
                      No upcoming appointments
                    </p>
                    <p className="text-xs text-gray-500">
                      Schedule your next visit
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {upcomingAppointments.slice(0, 3).map((appointment) => {
                      const doctorName =
                        "doctor" in appointment && appointment.doctor
                          ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                          : "Doctor information unavailable";

                      return (
                        <div
                          key={appointment.id}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {appointment.type
                                    .replace("_", " ")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                                <span
                                  className={`text-xs font-medium ${getStatusColor(
                                    appointment.status
                                  )}`}
                                >
                                  •
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span>{doctorName}</span>
                                <span className="text-gray-400">•</span>
                                <span>
                                  {new Date(
                                    appointment.scheduledDateTime
                                  ).toLocaleDateString()}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>
                                  {new Date(
                                    appointment.scheduledDateTime
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {appointment.status === "SCHEDULED" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAppointmentStatusChange(
                                      appointment.id,
                                      "CANCELLED"
                                    );
                                  }}
                                  disabled={isUpdatingAppointmentStatus}
                                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 border border-red-200 rounded-xs transition-colors disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              )}
                              <ArrowUpRight className="h-3 w-3 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Medical Documents */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Medical Documents
                  <span className="ml-2 font-mono text-gray-400 font-normal">
                    {documents.length}
                  </span>
                </h2>
                <button className="text-xs font-medium text-gray-700 hover:text-gray-900">
                  Request Document
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-sm">
                {isDocumentsLoading ? (
                  <div className="px-4 py-8 text-center">
                    <Loader2 className="h-4 w-4 mx-auto mb-2 text-gray-300 animate-spin" />
                    <p className="text-xs text-gray-500">
                      Loading documents...
                    </p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <FileText className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-600 mb-1">
                      No documents available
                    </p>
                    <p className="text-xs text-gray-500">
                      Medical records will appear here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2 py-1 text-xs font-mono border rounded-xs ${getDocumentTypeStyles(
                                doc.type
                              )}`}
                            >
                              {doc.type}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {doc.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">
                                  {formatFileSize(doc.fileSize)}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(
                                    doc.uploadedAt
                                  ).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span
                                  className={`text-xs ${
                                    doc.status === "COMPLETE"
                                      ? "text-green-600"
                                      : doc.status === "ACTIVE"
                                      ? "text-blue-600"
                                      : doc.status === "PENDING"
                                      ? "text-orange-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {doc.status.toLowerCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={doc.status === "PENDING"}
                          >
                            <Download className="h-3 w-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Side Information */}
          <div className="col-span-4 space-y-6">
            {/* Quick Stats */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Overview
              </h2>
              <div className="bg-white border border-gray-200 rounded-sm p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Total Appointments</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {appointments.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Upcoming</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {upcomingAppointments.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Documents</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {documents.length}
                  </p>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Recent Activity
              </h2>
              <div className="bg-white border border-gray-200 rounded-sm">
                <div className="divide-y divide-gray-100">
                  {pastAppointments.slice(0, 3).map((appointment) => {
                    const doctorName =
                      "doctor" in appointment
                        ? `Dr. ${appointment.doctor.lastName}`
                        : "Doctor";

                    return (
                      <div key={appointment.id} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                              appointment.status === "COMPLETED"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {appointment.type
                                .replace("_", " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {doctorName} •{" "}
                              {new Date(
                                appointment.scheduledDateTime
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs"
                >
                  <span className="text-sm font-medium text-gray-900">
                    Book Appointment
                  </span>
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                  <span className="text-sm font-medium text-gray-900">
                    Request Document
                  </span>
                </button>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs"
                >
                  <span className="text-sm font-medium text-gray-900">
                    Update Profile
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Modals */}
      {patient && (
        <>
          <BookAppointmentModal
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            patientId={patient.id}
            patientName={`${patient.firstName} ${patient.lastName}`}
          />
          <EditPatientModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            patient={patient}
          />
        </>
      )}
    </div>
  );
}
