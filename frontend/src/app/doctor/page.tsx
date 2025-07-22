"use client";

import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  AlertCircle,
  ArrowUpRight,
  Play,
  Search,
  ChevronDown,
  Stethoscope,
} from "lucide-react";
import { useDoctors, useDoctor } from "@/hooks/use-doctors";
import { useTodayAppointments } from "@/hooks/use-appointments";
import { NavigationBar } from "@/components/navigation-bar";
import { Appointment, AppointmentWithDetails } from "@/lib/api-types";

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

// Stats calculation component
const StatsGrid = ({
  appointments,
}: {
  appointments: (Appointment | AppointmentWithDetails)[];
}) => {
  const stats = useMemo(() => {
    const totalToday = appointments.length;
    const inProgress = appointments.filter(
      (apt) => apt.status === "IN_PROGRESS"
    ).length;
    const completed = appointments.filter(
      (apt) => apt.status === "COMPLETED"
    ).length;
    const scheduled = appointments.filter(
      (apt) => apt.status === "SCHEDULED"
    ).length;

    return { totalToday, inProgress, completed, scheduled };
  }, [appointments]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm p-4 md:p-3">
        <p className="text-sm md:text-xs text-gray-500">Today</p>
        <p className="text-xl md:text-lg font-bold md:font-semibold text-gray-900">
          {stats.totalToday}
        </p>
      </div>
      <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm p-4 md:p-3">
        <p className="text-sm md:text-xs text-gray-500">Scheduled</p>
        <p className="text-xl md:text-lg font-bold md:font-semibold text-blue-600">{stats.scheduled}</p>
      </div>
      <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm p-4 md:p-3">
        <p className="text-sm md:text-xs text-gray-500">In Progress</p>
        <p className="text-xl md:text-lg font-bold md:font-semibold text-orange-600">
          {stats.inProgress}
        </p>
      </div>
      <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm p-4 md:p-3">
        <p className="text-sm md:text-xs text-gray-500">Completed</p>
        <p className="text-xl md:text-lg font-bold md:font-semibold text-green-600">
          {stats.completed}
        </p>
      </div>
    </div>
  );
};

// Status configuration helper
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

const getStatusBg = (status: string) => {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-50";
    case "IN_PROGRESS":
      return "bg-orange-50";
    case "COMPLETED":
      return "bg-green-50";
    case "CANCELLED":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
};

export default function DoctorDashboard() {
  // Helper function to ensure doctor ID is properly formatted
  const ensureCleanDoctorId = (id: string | null): string | null => {
    if (!id || typeof id !== "string") return null;
    
    // If ID is already double-prefixed, clean it up
    if (id.startsWith("doctor_doctor_")) {
      const cleanId = id.replace("doctor_doctor_", "doctor_");
      console.log("🔧 Cleaned double-prefixed doctor ID:", id, "->", cleanId);
      return cleanId;
    }
    
    // If ID has no prefix, add it
    if (!id.startsWith("doctor_")) {
      const prefixedId = `doctor_${id}`;
      console.log("🔧 Added prefix to doctor ID:", id, "->", prefixedId);
      return prefixedId;
    }
    
    // ID is already properly formatted
    return id;
  };

  // Fetch doctors to get the list
  const {
    data: doctorsData,
    isLoading: isDoctorsLoading,
    error: doctorsError,
  } = useDoctors();

  // State for selected doctor
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  // Use the first doctor as default if no selection
  const firstDoctorId = doctorsData?.doctors?.[0]?.id || null;
  const cleanFirstDoctorId = ensureCleanDoctorId(firstDoctorId);
  const cleanSelectedDoctorId = ensureCleanDoctorId(selectedDoctorId);
  
  const validDoctorId = cleanSelectedDoctorId || cleanFirstDoctorId;

  // Debug logging to track ID transformations
  console.log("🔍 Doctor Dashboard ID Debug:", {
    firstDoctorIdRaw: firstDoctorId,
    firstDoctorIdClean: cleanFirstDoctorId,
    selectedDoctorIdRaw: selectedDoctorId,
    selectedDoctorIdClean: cleanSelectedDoctorId,
    validDoctorIdFinal: validDoctorId
  });

  // Debug logging to help identify ID issues
  if (firstDoctorId && typeof firstDoctorId !== "string") {
    console.error(
      "DoctorDashboard: firstDoctorId is not a string:",
      firstDoctorId,
      typeof firstDoctorId
    );
  }

  // Fetch doctor details
  const {
    data: doctorData,
    isLoading: isDoctorLoading,
    error: doctorError,
  } = useDoctor(validDoctorId || "", { enabled: !!validDoctorId });

  // Fetch appointments for the doctor
  const { data: appointmentsData, isLoading: isAppointmentsLoading } =
    useTodayAppointments(validDoctorId || undefined, {
      enabled: !!validDoctorId,
    });

  const appointments = appointmentsData?.appointments || [];
  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "SCHEDULED"
  );
  const activeAppointments = appointments.filter(
    (apt) => apt.status === "IN_PROGRESS"
  );
  const completedToday = appointments.filter(
    (apt) => apt.status === "COMPLETED"
  );

  // Show loading state
  if (isDoctorsLoading || isDoctorLoading || isAppointmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200">
          <div className="px-6 py-3">
            <Skeleton className="h-5 w-40 bg-gray-200" />
            <Skeleton className="h-3 w-32 bg-gray-100 mt-1" />
          </div>
        </div>
        <div className="p-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  // Show empty state if no doctors exist
  if (!isDoctorsLoading && doctorsData && doctorsData.doctors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <NavigationBar />
        
        <div className="p-6 w-full h-full flex items-center justify-center">
          <div className="text-center">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Doctors Found</h3>
            <p className="text-sm text-gray-600 mb-4">
              There are no doctors in the system yet. Add a doctor to get started.
            </p>
            <button className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 px-4 py-2 rounded-xs transition-colors">
              Add First Doctor
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (doctorsError || doctorError || (!isDoctorsLoading && !doctorData && validDoctorId)) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <NavigationBar />
        
        <div className="p-6 w-full h-full flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load</h3>
            <p className="text-sm text-gray-600 mb-4">
              {doctorsError ? 'Failed to load doctors list' : 'Failed to load doctor information'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-xs hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const doctor = doctorData?.doctor;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Header - Mobile Responsive */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 md:px-6 md:py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div>
              <h1 className="text-lg md:text-base font-bold md:font-semibold text-gray-900">
                Dr. {doctor?.firstName} {doctor?.lastName}
              </h1>
              <p className="text-sm md:text-xs text-gray-500">
                {doctor?.specialization || "General Practice"} • ID{" "}
                <span className="font-mono">{doctor?.id.split("_")[1]}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Doctor Selection Dropdown - Hidden on mobile */}
              {doctorsData?.doctors && doctorsData.doctors.length > 1 && (
                <div className="hidden md:block relative">
                  <select
                    value={validDoctorId || ""}
                    onChange={(e) => setSelectedDoctorId(ensureCleanDoctorId(e.target.value))}
                    className="text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs bg-white appearance-none pr-8"
                  >
                    {doctorsData.doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}

              <button className="hidden md:inline-flex text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                View Schedule
              </button>
              <button className="text-sm md:text-xs font-semibold md:font-medium text-white bg-blue-600 md:bg-gray-900 hover:bg-blue-700 md:hover:bg-gray-800 px-4 py-2 md:px-3 md:py-1.5 transition-colors rounded-sm">
                New Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout - Mobile Responsive */}
      <div className="px-4 py-4 md:p-6">
        <div className="space-y-6 md:grid md:grid-cols-12 md:gap-6 md:space-y-0">
          {/* Left Column - Main Content */}
          <div className="md:col-span-8 space-y-6">
            {/* Daily Stats */}
            <section>
              <h2 className="text-base md:text-xs font-bold md:font-semibold text-gray-900 md:text-gray-600 md:uppercase md:tracking-wider mb-4 md:mb-3">
                Today&apos;s Overview
                <span className="hidden md:inline ml-2 font-mono text-gray-400 font-normal">
                  Today
                </span>
              </h2>
              <StatsGrid appointments={appointments} />
            </section>

            {/* Active/In Progress Appointments */}
            {activeAppointments.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    In Progress
                    <span className="ml-2 font-mono text-gray-400 font-normal">
                      {activeAppointments.length}
                    </span>
                  </h2>
                </div>
                <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {activeAppointments.map((appointment) => {
                      const patientName =
                        "patient" in appointment
                          ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                          : "Loading...";

                      const patientId =
                        "patient" in appointment
                          ? appointment.patient.id.split("_")[1]
                          : "Loading...";

                      return (
                        <div
                          key={appointment.id}
                          className="px-5 py-4 md:px-4 md:py-3 bg-orange-50 border-l-4 md:border-l-2 border-orange-400"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 md:mb-1">
                                <span className="text-base md:text-sm font-semibold md:font-medium text-gray-900">
                                  {patientName}
                                </span>
                                <span className="text-sm md:text-xs font-semibold md:font-medium text-orange-600">
                                  IN PROGRESS
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-xs text-gray-600">
                                <span>
                                  {appointment.type
                                    .replace("_", " ")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                                <span className="hidden md:inline text-gray-400">•</span>
                                <span className="font-mono">#{patientId}</span>
                                <span className="hidden md:inline text-gray-400">•</span>
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
                            <button className="flex items-center justify-center gap-2 md:gap-1 text-sm md:text-xs font-semibold md:font-medium text-orange-700 hover:text-orange-900 px-4 py-2 md:px-2 md:py-1 border border-orange-200 rounded-sm hover:bg-orange-50 transition-colors w-full md:w-auto">
                              Continue Session
                              <ArrowUpRight className="h-4 w-4 md:h-3 md:w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Upcoming Appointments */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Upcoming Today
                  <span className="ml-2 font-mono text-gray-400 font-normal">
                    {upcomingAppointments.length}
                  </span>
                </h2>
                <button className="text-xs font-medium text-gray-700 hover:text-gray-900 px-2 py-1 border border-gray-200 rounded-xs hover:bg-gray-50 transition-colors">
                  View Full Schedule
                </button>
              </div>
              <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm ">
                {upcomingAppointments.length === 0 ? (
                  <div className="px-4 py-12 md:py-8 text-center">
                    <Calendar className="h-8 w-8 md:h-6 md:w-6 mx-auto mb-3 md:mb-2 text-gray-300" />
                    <p className="text-base md:text-sm text-gray-600 mb-1">
                      No upcoming appointments
                    </p>
                    <p className="text-sm md:text-xs text-gray-500">
                      Your schedule is clear
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {upcomingAppointments.map((appointment) => {
                      const patientName =
                        "patient" in appointment
                          ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                          : "Loading...";

                      const patientId =
                        "patient" in appointment
                          ? appointment.patient.id.split("_")[1]
                          : "Loading...";

                      return (
                        <div
                          key={appointment.id}
                          className="px-5 py-4 md:px-4 md:py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 md:mb-1">
                                <span className="text-base md:text-sm font-semibold md:font-medium text-gray-900">
                                  {patientName}
                                </span>
                                <span
                                  className={`text-sm md:text-xs font-medium ${getStatusColor(
                                    appointment.status
                                  )}`}
                                >
                                  •
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-xs text-gray-600">
                                <span>
                                  {appointment.type
                                    .replace("_", " ")
                                    .toLowerCase()
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                                <span className="hidden md:inline text-gray-400">•</span>
                                <span className="font-mono">#{patientId}</span>
                                <span className="hidden md:inline text-gray-400">•</span>
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
                            <div className="flex items-center gap-2 w-full md:w-auto">
                              <button className="hidden md:inline-flex text-xs font-medium text-gray-700 hover:text-gray-900 px-2 py-1 border border-gray-200 rounded-xs hover:bg-gray-50 transition-colors">
                                View Patient
                              </button>
                              <button className="flex items-center justify-center gap-2 md:gap-1 text-sm md:text-xs font-semibold md:font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 px-4 py-2 md:px-2 md:py-1 rounded-sm flex-1 md:flex-initial">
                                <Play className="h-4 w-4 md:h-3 md:w-3" />
                                Start Session
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column - Side Information - Hidden on Mobile */}
          <div className="hidden md:block md:col-span-4 space-y-6">
            {/* Patient Search */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Patient Lookup
              </h2>
              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button className="w-full text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-2 border border-gray-200 rounded-xs hover:bg-gray-50 transition-colors">
                    View All Patients
                  </button>
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
                  {completedToday.slice(0, 4).map((appointment) => {
                    const patientName =
                      "patient" in appointment
                        ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                        : "Patient";

                    return (
                      <div key={appointment.id} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {appointment.type
                                .replace("_", " ")
                                .toLowerCase()
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {patientName} •{" "}
                              {new Date(
                                appointment.scheduledDateTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {completedToday.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-xs text-gray-500">
                        No completed appointments yet today
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                  <span className="text-sm font-medium text-gray-900">
                    Schedule Appointment
                  </span>
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                  <span className="text-sm font-medium text-gray-900">
                    Add Patient
                  </span>
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                  <span className="text-sm font-medium text-gray-900">
                    Clinical Notes
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
