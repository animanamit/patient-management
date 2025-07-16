"use client";

import { useState, useTransition, useDeferredValue, useMemo, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Users,
  Clock,
  Calendar,
  Activity,
  Bell,
  Search,
  CheckCircle,
  AlertCircle,
  Phone,
  Loader2,
  RefreshCw,
  UserCheck,
  Plus,
  ArrowUpRight,
  MoreVertical
} from "lucide-react";
import { useTodayAppointments, useBulkAppointmentOperations } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { AppointmentStatus, AppointmentWithDetails, Appointment, Patient } from "@/lib/api-types";

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

// Stats calculation component - Dense grid
const DashboardStats = ({ appointments }: { appointments: (Appointment | AppointmentWithDetails)[] }) => {
  const stats = useMemo(() => {
    const totalAppointments = appointments.length;
    const checkedIn = appointments.filter(apt => apt.status === "SCHEDULED").length;
    const inProgress = appointments.filter(apt => apt.status === "IN_PROGRESS").length;
    const completed = appointments.filter(apt => apt.status === "COMPLETED").length;
    const noShows = appointments.filter(apt => apt.status === "NO_SHOW").length;

    return { totalAppointments, checkedIn, inProgress, completed, noShows };
  }, [appointments]);

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="bg-white border border-gray-200 rounded-sm p-3">
        <p className="text-xs text-gray-500">Total Today</p>
        <p className="text-lg font-semibold text-gray-900">{stats.totalAppointments}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-sm p-3">
        <p className="text-xs text-gray-500">Checked In</p>
        <p className="text-lg font-semibold text-blue-600">{stats.checkedIn}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-sm p-3">
        <p className="text-xs text-gray-500">In Progress</p>
        <p className="text-lg font-semibold text-orange-600">{stats.inProgress}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-sm p-3">
        <p className="text-xs text-gray-500">Completed</p>
        <p className="text-lg font-semibold text-green-600">{stats.completed}</p>
      </div>
      <div className="bg-white border border-gray-200 rounded-sm p-3">
        <p className="text-xs text-gray-500">No Shows</p>
        <p className="text-lg font-semibold text-red-600">{stats.noShows}</p>
      </div>
    </div>
  );
};

// Patient search component - Condensed
const PatientSearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const { data: patientsData, isLoading, error } = usePatients(
    deferredSearchQuery ? { firstName: deferredSearchQuery } : undefined
  );

  const handleSearch = (query: string) => {
    startTransition(() => {
      setSearchQuery(query);
    });
  };

  const patients = patientsData?.patients || [];

  return (
    <div className="bg-white border border-gray-200 rounded-sm">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient Search</h2>
          <button className="text-xs font-medium text-gray-700 hover:text-gray-900">
            Add Patient
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-8 text-xs border-gray-200 rounded-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-3">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-100 rounded-sm w-3/4"></div>
            <div className="h-3 bg-gray-100 rounded-sm w-1/2"></div>
          </div>
        </div>
      ) : error ? (
        <div className="px-4 py-6 text-center">
          <AlertCircle className="h-4 w-4 mx-auto mb-2 text-red-500" />
          <p className="text-xs text-red-600">Failed to load patients</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-gray-500">
            {searchQuery ? "No patients found" : "Enter search terms"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {patients.slice(0, 4).map((patient) => (
            <div key={patient.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 font-mono">#{patient.id.split('_')[1]}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{typeof patient.phone === 'string' ? patient.phone : 'N/A'}</span>
                  </div>
                </div>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-200 rounded-xs hover:bg-blue-50 transition-colors">
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Status configuration helper
const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "SCHEDULED":
      return "text-blue-600";
    case "IN_PROGRESS":
      return "text-orange-600";
    case "COMPLETED":
      return "text-green-600";
    case "NO_SHOW":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const getStatusBg = (status: AppointmentStatus) => {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-50";
    case "IN_PROGRESS":
      return "bg-orange-50";
    case "COMPLETED":
      return "bg-green-50";
    case "NO_SHOW":
      return "bg-red-50";
    default:
      return "bg-gray-50";
  }
};

export default function StaffDashboard() {
  const [isPending, startTransition] = useTransition();

  // Fetch today's appointments
  const { data: appointmentsData, isLoading: isAppointmentsLoading, error: appointmentsError, refetch } = useTodayAppointments();
  const { bulkUpdateStatus, isBulkUpdating } = useBulkAppointmentOperations();

  const handleSendSMS = async (patientName: string) => {
    startTransition(async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`SMS sent to ${patientName}`);
    });
  };

  // Filter appointments for patient queue
  const patientQueue = useMemo(() => {
    if (!appointmentsData?.appointments) return [];

    return appointmentsData.appointments
      .filter(apt => apt.status === "SCHEDULED" || apt.status === "IN_PROGRESS")
      .sort((a, b) => {
        if (a.status === "IN_PROGRESS" && b.status !== "IN_PROGRESS") return -1;
        if (b.status === "IN_PROGRESS" && a.status !== "IN_PROGRESS") return 1;
        return new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime();
      });
  }, [appointmentsData]);

  const appointments = appointmentsData?.appointments || [];

  // Show loading state
  if (isAppointmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200">
          <div className="px-6 py-3">
            <Skeleton className="h-5 w-32 bg-gray-200" />
            <Skeleton className="h-3 w-40 bg-gray-100 mt-1" />
          </div>
        </div>
        <div className="p-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">Staff Dashboard</h1>
              <p className="text-xs text-gray-500">
                Front desk operations • {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                Export Data
              </button>
              <button className="text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 border border-gray-900 hover:border-gray-800 px-3 py-1.5 transition-colors rounded-xs">
                Add Patient
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
            
            {/* Daily Overview */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                Daily Overview
                <span className="ml-2 font-mono text-gray-400 font-normal">{new Date().toLocaleDateString()}</span>
              </h2>
              <Suspense fallback={<LoadingSkeleton />}>
                {appointmentsError ? (
                  <div className="bg-white border border-gray-200 rounded-sm p-6 text-center">
                    <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                    <p className="text-sm text-red-600 mb-3">Failed to load appointment statistics</p>
                    <button 
                      onClick={() => refetch()} 
                      disabled={isAppointmentsLoading}
                      className="text-xs font-medium text-red-700 hover:text-red-900 px-3 py-1.5 border border-red-200 rounded-xs hover:bg-red-50 transition-colors"
                    >
                      <RefreshCw className="h-3 w-3 mr-1 inline" />
                      Retry
                    </button>
                  </div>
                ) : (
                  <DashboardStats appointments={appointments} />
                )}
              </Suspense>
            </section>

            {/* Patient Queue */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Patient Queue
                  <span className="ml-2 font-mono text-gray-400 font-normal">{patientQueue.length}</span>
                </h2>
                <button 
                  className="text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs"
                  disabled={isBulkUpdating}
                >
                  <Bell className="h-3 w-3 mr-1 inline" />
                  {isBulkUpdating ? "Notifying..." : "Notify All"}
                </button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-sm">
                <Suspense fallback={<LoadingSkeleton />}>
                  {appointmentsError ? (
                    <div className="px-4 py-8 text-center">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                      <p className="text-sm text-red-600">Failed to load patient queue</p>
                    </div>
                  ) : patientQueue.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-600 mb-1">No patients in queue</p>
                      <p className="text-xs text-gray-500">All appointments completed or no check-ins yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {patientQueue.map((appointment, index) => {
                        const patientName = ('patient' in appointment)
                          ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                          : 'Loading...';

                        const doctorName = ('doctor' in appointment)
                          ? `Dr. ${appointment.doctor.lastName}`
                          : 'Doctor';

                        return (
                          <div key={appointment.id} className={`px-4 py-3 ${appointment.status === 'IN_PROGRESS' ? 'bg-orange-50 border-l-2 border-orange-400' : 'hover:bg-gray-50'} transition-colors`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-gray-100 rounded-sm flex items-center justify-center text-xs font-semibold text-gray-600">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-gray-900">{patientName}</span>
                                    <span className={`text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                      {appointment.status === 'IN_PROGRESS' ? 'IN PROGRESS' : '•'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-600">
                                    <span>{doctorName}</span>
                                    <span className="text-gray-400">•</span>
                                    <span>
                                      {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-mono">
                                      #{('patient' in appointment) ? appointment.patient.id.split('_')[1] : 'Loading...'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleSendSMS(patientName)}
                                  disabled={isPending}
                                  className="text-xs font-medium text-gray-700 hover:text-gray-900"
                                >
                                  <Phone className="h-3 w-3 mr-1 inline" />
                                  SMS
                                </button>
                                <button className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 px-2 py-1 rounded-xs">
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Suspense>
              </div>
            </section>

            {/* Today's Schedule */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Today's Schedule
                  <span className="ml-2 font-mono text-gray-400 font-normal">{appointments.length}</span>
                </h2>
                <button className="text-xs font-medium text-gray-700 hover:text-gray-900">
                  View Full Schedule
                </button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-sm">
                <Suspense fallback={<LoadingSkeleton />}>
                  {appointmentsError ? (
                    <div className="px-4 py-8 text-center">
                      <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                      <p className="text-sm text-red-600">Failed to load today's schedule</p>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm text-gray-600 mb-1">No appointments today</p>
                      <p className="text-xs text-gray-500">No appointments scheduled for today</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {appointments.slice(0, 6).map((appointment) => {
                        const patientName = ('patient' in appointment)
                          ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                          : 'Loading...';

                        const doctorName = ('doctor' in appointment)
                          ? `Dr. ${appointment.doctor.lastName}`
                          : 'Doctor';

                        return (
                          <div key={appointment.id} className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">{patientName}</span>
                                  <span className={`text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                    •
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <span>{doctorName}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>{appointment.type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                                  <span className="text-gray-400">•</span>
                                  <span>
                                    {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="font-mono">
                                    #{('patient' in appointment) ? appointment.patient.id.split('_')[1] : 'Loading...'}
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
                </Suspense>
              </div>
            </section>
          </div>

          {/* Right Column - Side Information */}
          <div className="col-span-4 space-y-6">
            
            {/* Patient Search */}
            <Suspense fallback={<LoadingSkeleton />}>
              <PatientSearchSection />
            </Suspense>

            {/* Quick Stats */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Quick Stats</h2>
              <div className="bg-white border border-gray-200 rounded-sm p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Avg Wait Time</span>
                  <span className="text-sm font-semibold text-gray-900">12min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">On Time Rate</span>
                  <span className="text-sm font-semibold text-green-600">84%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">No Show Rate</span>
                  <span className="text-sm font-semibold text-red-600">8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Utilization</span>
                  <span className="text-sm font-semibold text-blue-600">92%</span>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                  <span className="text-sm font-medium text-gray-900">Check In Patient</span>
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                  <span className="text-sm font-medium text-gray-900">Schedule Appointment</span>
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                  <span className="text-sm font-medium text-gray-900">Print Reports</span>
                </button>
                <button className="w-full text-left px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs">
                  <span className="text-sm font-medium text-gray-900">Manage Rooms</span>
                </button>
              </div>
            </section>

            {/* System Status */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">System Status</h2>
              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-gray-900">All Systems Operational</span>
                </div>
                <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}