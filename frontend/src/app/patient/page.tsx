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
  ArrowUpRight
} from "lucide-react";
import { usePatients, usePatient } from "@/hooks/use-patients";
import { usePatientAppointments } from "@/hooks/use-appointments";
import { Patient, Appointment, AppointmentWithDetails } from "@/lib/api-types";

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

// Mock documents data
const mockDocuments = [
  {
    id: "1",
    name: "Blood Test Results",
    type: "LAB",
    date: "2024-01-15",
    size: "245 KB",
    status: "COMPLETE"
  },
  {
    id: "2", 
    name: "X-Ray - Chest",
    type: "IMG",
    date: "2024-01-10",
    size: "1.2 MB",
    status: "COMPLETE"
  },
  {
    id: "3",
    name: "Prescription",
    type: "RX",
    date: "2024-01-08",
    size: "98 KB",
    status: "ACTIVE"
  }
];

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

const getDocTypeColor = (type: string) => {
  switch (type) {
    case "LAB":
      return "text-purple-600 bg-purple-50";
    case "IMG":
      return "text-blue-600 bg-blue-50";
    case "RX":
      return "text-green-600 bg-green-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export default function PatientDashboard() {
  // Fetch patients to get the first patient ID
  const { data: patientsData, isLoading: isPatientsLoading, error: patientsError } = usePatients();
  const firstPatientId = patientsData?.patients?.[0]?.id || null;

  // Fetch patient details
  const { data: patientData, isLoading: isPatientLoading, error: patientError } = usePatient(
    firstPatientId || undefined,
    { enabled: !!firstPatientId }
  );

  // Fetch patient appointments
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = usePatientAppointments(
    firstPatientId || undefined,
    { enabled: !!firstPatientId }
  );

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

  // Show error state
  if (patientsError || patientError || !patientData || !firstPatientId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Failed to load patient information</span>
          </div>
        </div>
      </div>
    );
  }

  const patient = patientData.patient;
  const appointments = appointmentsData?.appointments || [];
  const upcomingAppointments = appointments.filter(apt => apt.status === "SCHEDULED");
  const pastAppointments = appointments.filter(apt => apt.status === "COMPLETED" || apt.status === "CANCELLED");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-xs text-gray-500">
                Patient ID <span className="font-mono">{patient.id.split('_')[1]}</span>
              </p>
            </div>
            <button className="text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors">
              Book Appointment
            </button>
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
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Contact Information</h2>
              <div className="bg-white border border-gray-200 rounded-sm divide-y divide-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">
                        {typeof patient.phone === 'string' ? patient.phone : patient.phone?.toString() || 'Not provided'}
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
                        {typeof patient.email === 'string' ? patient.email : patient.email?.toString() || 'Not provided'}
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
                        {patient.address || 'Not provided'}
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
                  <span className="ml-2 font-mono text-gray-400 font-normal">{upcomingAppointments.length}</span>
                </h2>
                <button className="text-xs font-medium text-gray-700 hover:text-gray-900">
                  View All
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-sm">
                {upcomingAppointments.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-600 mb-1">No upcoming appointments</p>
                    <p className="text-xs text-gray-500">Schedule your next visit</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {upcomingAppointments.slice(0, 3).map((appointment) => {
                      const doctorName = ('doctor' in appointment)
                        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                        : 'Loading...';
                      
                      return (
                        <div key={appointment.id} className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-gray-900">
                                  {appointment.type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                                <span className={`text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                  •
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span>{doctorName}</span>
                                <span className="text-gray-400">•</span>
                                <span>{new Date(appointment.scheduledDateTime).toLocaleDateString()}</span>
                                <span className="text-gray-400">•</span>
                                <span>
                                  {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="h-3 w-3 text-gray-400" />
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
                  <span className="ml-2 font-mono text-gray-400 font-normal">{mockDocuments.length}</span>
                </h2>
                <button className="text-xs font-medium text-gray-700 hover:text-gray-900">
                  Request Document
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-sm">
                <div className="divide-y divide-gray-100">
                  {mockDocuments.map((doc) => (
                    <div key={doc.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`px-1.5 py-0.5 rounded-sm text-xs font-mono ${getDocTypeColor(doc.type)}`}>
                            {doc.type}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500">{doc.size}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{new Date(doc.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900">
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Side Information */}
          <div className="col-span-4 space-y-6">
            
            {/* Quick Stats */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Overview</h2>
              <div className="bg-white border border-gray-200 rounded-sm p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Total Appointments</p>
                  <p className="text-lg font-semibold text-gray-900">{appointments.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Upcoming</p>
                  <p className="text-lg font-semibold text-blue-600">{upcomingAppointments.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Documents</p>
                  <p className="text-lg font-semibold text-gray-900">{mockDocuments.length}</p>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Recent Activity</h2>
              <div className="bg-white border border-gray-200 rounded-sm">
                <div className="divide-y divide-gray-100">
                  {pastAppointments.slice(0, 3).map((appointment) => {
                    const doctorName = ('doctor' in appointment)
                      ? `Dr. ${appointment.doctor.lastName}`
                      : 'Doctor';
                    
                    return (
                      <div key={appointment.id} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                            appointment.status === 'COMPLETED' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {appointment.type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {doctorName} • {new Date(appointment.scheduledDateTime).toLocaleDateString()}
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
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Book Appointment</span>
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Request Document</span>
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Update Profile</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}