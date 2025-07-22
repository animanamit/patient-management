"use client";

import { useState } from "react";
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
  ChevronRight,
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
        {/* Navigation Bar */}
        <NavigationBar />

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
        {/* Navigation Bar */}
        <NavigationBar />

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

      {/* Header - Mobile Optimized */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 md:px-6 py-4 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-base font-bold md:font-semibold text-gray-900 truncate">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-sm md:text-xs text-gray-500 md:font-mono md:uppercase md:font-extralight md:tracking-normal">
                Patient ID {patient.id.split("_")[1]}
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-2">
              {/* Patient Selection Dropdown - Desktop Only */}
              {patientsData?.patients && patientsData.patients.length > 1 && (
                <div className="hidden md:block relative">
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

              {/* Desktop Book Appointment Button */}
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="hidden md:block text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs"
              >
                Book Appointment
              </button>

              {/* Mobile Menu Button (if needed for patient selection) */}
              {patientsData?.patients && patientsData.patients.length > 1 && (
                <button className="md:hidden p-2 text-gray-500 active:text-gray-700 rounded-xl active:bg-gray-100 transition-colors">
                  <User className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Main Layout */}
      <div className="pb-20 md:pb-6">
        {/* Mobile: Single Column Stack | Desktop: Keep Grid */}
        <div className="md:p-6 md:grid md:grid-cols-12 md:gap-6">
          {/* Main Content */}
          <div className="md:col-span-8 space-y-4 md:space-y-6">
            {/* Contact Information - Apple Card Style */}
            <section className="px-4 md:px-0">
              <h2 className="hidden md:block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Contact Information
              </h2>
              <div className="bg-white md:border md:border-gray-200 rounded-sm  overflow-hidden">
                <div className="px-6 py-4 md:px-4 md:py-3">
                  <div className="flex items-center gap-4 md:gap-3">
                    <div className="w-10 h-10 md:w-auto md:h-auto bg-blue-100 rounded-full flex items-center justify-center md:bg-transparent">
                      <Phone className="h-5 w-5 md:h-3.5 md:w-3.5 text-blue-600 md:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 md:text-xs md:text-gray-500 md:font-normal">
                        Phone
                      </p>
                      <p className="text-lg font-semibold text-gray-900 md:text-sm md:font-medium mt-1 md:mt-0">
                        {extractValue(patient.phone)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 md:hidden" />
                  </div>
                </div>
                <div className="h-px bg-gray-100 mx-6 md:mx-0" />
                <div className="px-6 py-4 md:px-4 md:py-3">
                  <div className="flex items-center gap-4 md:gap-3">
                    <div className="w-10 h-10 md:w-auto md:h-auto bg-green-100 rounded-full flex items-center justify-center md:bg-transparent">
                      <Mail className="h-5 w-5 md:h-3.5 md:w-3.5 text-green-600 md:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 md:text-xs md:text-gray-500 md:font-normal">
                        Email
                      </p>
                      <p className="text-lg font-semibold text-gray-900 md:text-sm md:font-medium mt-1 md:mt-0 break-all">
                        {extractValue(patient.email)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 md:hidden" />
                  </div>
                </div>
                <div className="h-px bg-gray-100 mx-6 md:mx-0" />
                <div className="px-6 py-4 md:px-4 md:py-3">
                  <div className="flex items-center gap-4 md:gap-3">
                    <div className="w-10 h-10 md:w-auto md:h-auto bg-purple-100 rounded-full flex items-center justify-center md:bg-transparent">
                      <MapPin className="h-5 w-5 md:h-3.5 md:w-3.5 text-purple-600 md:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 md:text-xs md:text-gray-500 md:font-normal">
                        Address
                      </p>
                      <p className="text-lg font-semibold text-gray-900 md:text-sm md:font-medium mt-1 md:mt-0">
                        {patient.address || "Not provided"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 md:hidden" />
                  </div>
                </div>
              </div>
            </section>

            {/* Upcoming Appointments - Apple Card Style */}
            <section className="px-4 md:px-0">
              <div className="flex items-center justify-between mb-3 md:mb-3">
                <h2 className="text-xl font-bold text-gray-900 md:text-xs md:font-semibold md:text-gray-600 md:uppercase md:tracking-wider">
                  Upcoming Appointments
                  <span className="ml-2 text-lg font-medium text-gray-500 md:font-mono md:text-gray-400 md:font-normal md:text-xs">
                    {upcomingAppointments.length}
                  </span>
                </h2>
                <button className="text-blue-600 font-medium md:text-xs md:font-medium md:text-gray-700 md:hover:text-gray-900">
                  View All
                </button>
              </div>
              <div className="bg-white md:border md:border-gray-200 rounded-sm  overflow-hidden">
                {upcomingAppointments.length === 0 ? (
                  <div className="px-6 py-12 md:px-4 md:py-8 text-center">
                    <div className="w-16 h-16 md:w-6 md:h-6 mx-auto mb-4 md:mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 md:h-6 md:w-6 text-gray-300" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2 md:text-sm md:text-gray-600 md:mb-1 md:font-normal">
                      No upcoming appointments
                    </p>
                    <p className="text-base text-gray-500 md:text-xs md:text-gray-500">
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

                      const appointmentDate = new Date(
                        appointment.scheduledDateTime
                      );
                      const isToday =
                        appointmentDate.toDateString() ===
                        new Date().toDateString();
                      const isTomorrow =
                        appointmentDate.toDateString() ===
                        new Date(Date.now() + 86400000).toDateString();

                      return (
                        <div
                          key={appointment.id}
                          className="px-6 py-5 md:px-4 md:py-3 active:bg-gray-50 md:hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {/* Mobile: Large Typography */}
                              <div className="md:hidden">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {appointment.type
                                      .replace("_", " ")
                                      .toLowerCase()
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  </h3>
                                  <div
                                    className={`w-2 h-2 rounded-full ${getStatusColor(
                                      appointment.status
                                    ).replace("text-", "bg-")}`}
                                  />
                                </div>
                                <p className="text-base text-gray-600 mb-2">
                                  {doctorName}
                                </p>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {isToday
                                        ? "Today"
                                        : isTomorrow
                                        ? "Tomorrow"
                                        : appointmentDate.toLocaleDateString(
                                            "en-US",
                                            {
                                              weekday: "short",
                                              month: "short",
                                              day: "numeric",
                                            }
                                          )}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-700">
                                      {appointmentDate.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Desktop: Compact Layout */}
                              <div className="hidden md:block">
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
                                    {appointmentDate.toLocaleDateString()}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span>
                                    {appointmentDate.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 md:gap-1">
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
                                  className="px-4 py-2 md:text-xs md:px-2 md:py-1 text-red-600 hover:bg-red-50 active:bg-red-100 border border-red-200 rounded-full md:rounded-xs transition-colors disabled:opacity-50 font-medium"
                                >
                                  Cancel
                                </button>
                              )}
                              <ChevronRight className="h-6 w-6 md:h-3 md:w-3 text-gray-300" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Medical Documents - Apple Card Style */}
            <section className="px-4 md:px-0">
              <div className="flex items-center justify-between mb-3 md:mb-3">
                <h2 className="text-xl font-bold text-gray-900 md:text-xs md:font-semibold md:text-gray-600 md:uppercase md:tracking-wider">
                  Medical Documents
                  <span className="ml-2 text-lg font-medium text-gray-500 md:font-mono md:text-gray-400 md:font-normal md:text-xs">
                    {documents.length}
                  </span>
                </h2>
                <button className="text-blue-600 font-medium md:text-xs md:font-medium md:text-gray-700 md:hover:text-gray-900">
                  Request Document
                </button>
              </div>
              <div className="bg-white md:border md:border-gray-200 rounded-sm  overflow-hidden">
                {isDocumentsLoading ? (
                  <div className="px-6 py-12 md:px-4 md:py-8 text-center">
                    <div className="w-16 h-16 md:w-4 md:h-4 mx-auto mb-4 md:mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 md:h-4 md:w-4 text-gray-300 animate-spin" />
                    </div>
                    <p className="text-base text-gray-500 md:text-xs md:text-gray-500">
                      Loading documents...
                    </p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="px-6 py-12 md:px-4 md:py-8 text-center">
                    <div className="w-16 h-16 md:w-6 md:h-6 mx-auto mb-4 md:mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                      <FileText className="h-8 w-8 md:h-6 md:w-6 text-gray-300" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2 md:text-sm md:text-gray-600 md:mb-1 md:font-normal">
                      No documents available
                    </p>
                    <p className="text-base text-gray-500 md:text-xs md:text-gray-500">
                      Medical records will appear here
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="px-6 py-5 md:px-4 md:py-3 active:bg-gray-50 md:hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 md:gap-3">
                          {/* Mobile: Larger Document Type Badge */}
                          <div className="md:hidden">
                            <div
                              className={`px-3 py-2 text-sm font-mono border rounded-xl ${getDocumentTypeStyles(
                                doc.type
                              )}`}
                            >
                              {doc.type}
                            </div>
                          </div>

                          {/* Desktop: Small Badge */}
                          <span
                            className={`hidden md:inline-block px-2 py-1 text-xs font-mono border rounded-xs ${getDocumentTypeStyles(
                              doc.type
                            )}`}
                          >
                            {doc.type}
                          </span>

                          <div className="flex-1">
                            {/* Mobile: Large Typography */}
                            <div className="md:hidden">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {doc.name}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="font-medium">
                                  {formatFileSize(doc.fileSize)}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span>
                                  {new Date(doc.uploadedAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                              <div className="mt-2">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    doc.status === "COMPLETE"
                                      ? "bg-green-100 text-green-800"
                                      : doc.status === "ACTIVE"
                                      ? "bg-blue-100 text-blue-800"
                                      : doc.status === "PENDING"
                                      ? "bg-orange-100 text-orange-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {doc.status.toLowerCase()}
                                </span>
                              </div>
                            </div>

                            {/* Desktop: Compact Layout */}
                            <div className="hidden md:block">
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
                            className="flex items-center gap-2 px-4 py-2 md:gap-1 md:text-xs md:font-medium text-blue-600 md:text-gray-700 hover:bg-blue-50 md:hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-full md:rounded-none font-medium transition-colors"
                            disabled={doc.status === "PENDING"}
                          >
                            <Download className="h-5 w-5 md:h-3 md:w-3" />
                            <span className="md:inline">Download</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Desktop Only Sidebar */}
          <div className="hidden md:block md:col-span-4 space-y-6">
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

          {/* Mobile Overview Cards - Stacked below main content */}
          <div className="md:hidden px-4 space-y-4">
            {/* Quick Stats Cards */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Overview</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {appointments.length}
                  </p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600 mb-1">
                    {upcomingAppointments.length}
                  </p>
                  <p className="text-sm text-gray-600">Upcoming</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {documents.length}
                  </p>
                  <p className="text-sm text-gray-600">Documents</p>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            {pastAppointments.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Recent Activity
                </h2>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {pastAppointments.slice(0, 3).map((appointment) => {
                      const doctorName =
                        "doctor" in appointment
                          ? `Dr. ${appointment.doctor.lastName}`
                          : "Doctor";

                      return (
                        <div key={appointment.id} className="px-6 py-4">
                          <div className="flex items-start gap-4">
                            <div
                              className={`mt-2 w-3 h-3 rounded-full ${
                                appointment.status === "COMPLETED"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                            />
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {appointment.type
                                  .replace("_", " ")
                                  .toLowerCase()
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </h3>
                              <p className="text-base text-gray-600 mt-1">
                                {doctorName} •{" "}
                                {new Date(
                                  appointment.scheduledDateTime
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Action Bar - Apple Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 safe-area-inset-bottom">
        <div className="flex gap-3">
          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg active:bg-blue-700 transition-colors"
          >
            Book Appointment
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-6 py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold active:bg-gray-200 transition-colors"
          >
            Edit Profile
          </button>
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
