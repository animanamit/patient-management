"use client";

import { useState, useTransition, useDeferredValue, useMemo, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  MoreVertical,
  Grid3X3,
  List
} from "lucide-react";
import { useTodayAppointments, useBulkAppointmentOperations, useAppointment } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { AppointmentStatus, AppointmentWithDetails, Appointment, Patient, AppointmentId } from "@/lib/api-types";
import { AssistanceRequest } from "@/hooks/use-assistance-requests";
import { appointmentsApi } from "@/lib/api";
import { AppointmentsCalendar } from "@/components/appointments-calendar";
import { NavigationBar } from "@/components/navigation-bar";
import { AddPatientModal } from "@/components/add-patient-modal";
import { AssistanceRequestsPanel } from "@/components/assistance-requests-panel";
import { AppointmentDetailsModal } from "@/components/appointment-details-modal";
import { useSendAppointmentReminder, useSendCustomMessage } from "@/hooks/use-sms";

// Loading skeleton - Dense grid
const LoadingSkeleton = () => (
  <div className="grid grid-cols-12 gap-6">
    <div className="col-span-8 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-sm animate-pulse" style={{ backgroundColor: '#EDDCC7' }} />
      ))}
    </div>
    <div className="col-span-4 space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="h-24 rounded-sm animate-pulse" style={{ backgroundColor: '#EDDCC7' }} />
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      <div className="border-0 md:border rounded-sm p-4 md:p-3" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
        <p className="text-sm md:text-xs text-gray-500">Total Today</p>
        <p className="text-2xl md:text-lg font-bold md:font-semibold" style={{ color: '#5D321A' }}>{stats.totalAppointments}</p>
      </div>
      <div className="border-0 md:border rounded-sm p-4 md:p-3" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
        <p className="text-sm md:text-xs text-gray-500">Checked In</p>
        <p className="text-2xl md:text-lg font-bold md:font-semibold text-blue-600">{stats.checkedIn}</p>
      </div>
      <div className="border-0 md:border rounded-sm p-4 md:p-3" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
        <p className="text-sm md:text-xs text-gray-500">In Progress</p>
        <p className="text-2xl md:text-lg font-bold md:font-semibold text-orange-600">{stats.inProgress}</p>
      </div>
      <div className="border-0 md:border rounded-sm p-4 md:p-3" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
        <p className="text-sm md:text-xs text-gray-500">Completed</p>
        <p className="text-2xl md:text-lg font-bold md:font-semibold text-green-600">{stats.completed}</p>
      </div>
      <div className="border-0 md:border rounded-sm p-4 md:p-3" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
        <p className="text-sm md:text-xs text-gray-500">No Shows</p>
        <p className="text-2xl md:text-lg font-bold md:font-semibold text-red-600">{stats.noShows}</p>
      </div>
    </div>
  );
};

// Patient search component - Condensed
const PatientSearchSection = ({ onAddPatient }: { onAddPatient: () => void }) => {
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
    <div className="border rounded-sm" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
      <div className="px-4 py-3 border-b" style={{ backgroundColor: '#EDDCC7', borderColor: '#EDDCC7' }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient Search</h2>
          <button 
            onClick={onAddPatient}
            className="text-xs font-medium text-gray-700 hover:text-gray-900"
          >
            Add Patient
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-8 text-xs rounded-sm"
            style={{ borderColor: '#EDDCC7' }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 py-3">
          <div className="animate-pulse space-y-2">
            <div className="h-4 rounded-sm w-3/4" style={{ backgroundColor: '#EDDCC7' }}></div>
            <div className="h-3 rounded-sm w-1/2" style={{ backgroundColor: '#EDDCC7' }}></div>
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
            <div key={patient.id} className="px-4 py-3 transition-colors" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
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
      return "#FEF3E2";
    case "COMPLETED":
      return "bg-green-50";
    case "NO_SHOW":
      return "bg-red-50";
    default:
      return "#EDDCC7";
  }
};

export default function StaffDashboard() {
  console.log('🏥 STAFF DASHBOARD: Component loaded - will fetch data from multiple Fastify routes');
  
  const [isPending, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<'dashboard' | 'calendar'>('dashboard');
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isAppointmentDetailsModalOpen, setIsAppointmentDetailsModalOpen] = useState(false);
  const [assistanceRequestPhoneNumber, setAssistanceRequestPhoneNumber] = useState<string | undefined>(undefined);

  // Fetch today's appointments
  const { data: appointmentsData, isLoading: isAppointmentsLoading, error: appointmentsError, refetch } = useTodayAppointments();
  const { bulkUpdateStatus, isBulkUpdating } = useBulkAppointmentOperations();
  
  // SMS functionality
  const sendReminderMutation = useSendAppointmentReminder();
  const sendCustomMessageMutation = useSendCustomMessage();

  const handleSendSMS = async (appointment: AppointmentWithDetails) => {
    console.log('🔔 SMS button clicked for appointment:', appointment.id);
    
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    const doctorName = `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
    
    // Extract phone number properly - handle both string and object formats
    let phoneNumber = typeof appointment.patient.phone === 'string' 
      ? appointment.patient.phone 
      : appointment.patient.phone?.normalizedValue;
    
    console.log('📞 Phone number extracted:', phoneNumber);
    console.log('👤 Patient data:', appointment.patient);
    
    if (!phoneNumber || phoneNumber.trim() === '') {
      console.log('❌ No valid phone number found');
      toast.error(`Cannot send SMS to ${patientName}`, {
        description: "Patient doesn't have a valid phone number. Please update their contact information first.",
        position: "top-right",
      });
      return;
    }
    
    // Ensure phone number is in correct format for SMS
    // If it's just digits without +65, add the country code
    if (phoneNumber.match(/^\d{8}$/) && !phoneNumber.startsWith('+')) {
      phoneNumber = `+65${phoneNumber}`;
      console.log('📱 Formatted phone number for SMS:', phoneNumber);
    }
    
    console.log('📤 Attempting to send SMS reminder...');
    
    try {
      const result = await sendReminderMutation.mutateAsync({
        phoneNumber,
        patientName,
        appointmentDate: appointment.scheduledDateTime,
        doctorName,
        clinicName: "CarePulse Clinic",
      });
      
      console.log('📬 SMS API response:', result);
      
      if (result.success) {
        toast.success(`SMS reminder sent to ${patientName}`, {
          description: `Message sent to ${phoneNumber}`,
          position: "top-right",
        });
      } else {
        toast.error(`Failed to send SMS to ${patientName}`, {
          description: result.error || "Unknown error occurred",
          position: "top-right",
        });
      }
    } catch (error) {
      console.error('❌ SMS Error:', error);
      toast.error(`Error sending SMS to ${patientName}`, {
        description: error instanceof Error ? error.message : "Unknown error occurred",
        position: "top-right",
      });
    }
  };

  const handleOpenAppointmentDetails = (appointment: AppointmentWithDetails, phoneNumber?: string) => {
    setSelectedAppointment(appointment);
    setAssistanceRequestPhoneNumber(phoneNumber);
    setIsAppointmentDetailsModalOpen(true);
  };

  const handleCloseAppointmentDetails = () => {
    setSelectedAppointment(null);
    setAssistanceRequestPhoneNumber(undefined);
    setIsAppointmentDetailsModalOpen(false);
  };

  const handleAssistanceRequestClick = async (request: AssistanceRequest) => {
    if (request.appointmentId) {
      try {
        // Fetch the full appointment details
        const appointmentResponse = await appointmentsApi.getAppointmentById(request.appointmentId as AppointmentId);
        if (appointmentResponse.appointment) {
          handleOpenAppointmentDetails(appointmentResponse.appointment as AppointmentWithDetails, request.phoneNumber);
        }
      } catch (error) {
        console.error("Failed to fetch appointment details:", error);
      }
    }
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
      <div className="min-h-screen" style={{ backgroundColor: '#FDF9F7' }}>
        <div className="border-b" style={{ borderColor: '#EDDCC7' }}>
          <div className="px-6 py-3">
            <Skeleton className="h-5 w-32" style={{ backgroundColor: '#EDDCC7' }} />
            <Skeleton className="h-3 w-40 mt-1" style={{ backgroundColor: '#EDDCC7' }} />
          </div>
        </div>
        <div className="p-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDF9F7' }}>
      {/* Navigation Bar */}
      <NavigationBar />
      
      {/* Header - Mobile Responsive */}
      <div className="border-b" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
        <div className="px-4 py-4 md:px-6 md:py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            <div>
              <h1 className="text-lg md:text-base font-bold md:font-semibold" style={{ color: '#5D321A' }}>Staff Dashboard</h1>
              <p className="text-sm md:text-xs text-gray-500">
                Front desk operations • {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* View toggle */}
              <div className="flex items-center border rounded-full md:rounded-xs overflow-hidden flex-shrink-0" style={{ borderColor: '#EDDCC7' }}>
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-4 py-2 md:px-3 md:py-1.5 text-sm md:text-xs font-semibold md:font-medium transition-colors ${
                    viewMode === 'dashboard'
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{ 
                    backgroundColor: viewMode === 'dashboard' ? '#A66B42' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== 'dashboard') e.currentTarget.style.backgroundColor = '#FDF9F7';
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== 'dashboard') e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <List className="h-4 w-4 md:h-3 md:w-3 mr-1 inline" />
                  Dashboard
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 md:px-3 md:py-1.5 text-sm md:text-xs font-semibold md:font-medium transition-colors ${
                    viewMode === 'calendar'
                      ? 'text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{ 
                    backgroundColor: viewMode === 'calendar' ? '#A66B42' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (viewMode !== 'calendar') e.currentTarget.style.backgroundColor = '#FDF9F7';
                  }}
                  onMouseLeave={(e) => {
                    if (viewMode !== 'calendar') e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Grid3X3 className="h-4 w-4 md:h-3 md:w-3 mr-1 inline" />
                  Calendar
                </button>
              </div>
              
              <button 
                onClick={() => refetch()}
                disabled={isAppointmentsLoading}
                className="hidden md:inline-flex text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border transition-colors rounded-xs"
                style={{ borderColor: '#EDDCC7', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <RefreshCw className={`h-3 w-3 mr-1 inline ${isAppointmentsLoading ? 'animate-spin' : ''}`} />
                {isAppointmentsLoading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button className="hidden md:inline-flex text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border transition-colors rounded-xs" style={{ borderColor: '#EDDCC7', backgroundColor: 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                Export Data
              </button>
              <button 
                onClick={() => setIsAddPatientModalOpen(true)}
                className="text-sm md:text-xs font-semibold md:font-medium text-white px-4 py-2 md:px-3 md:py-1.5 transition-colors rounded-full md:rounded-xs flex-shrink-0"
                style={{ backgroundColor: '#A66B42' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7A4A2E'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A66B42'}
              >
                <Plus className="h-4 w-4 md:h-0 md:w-0 mr-1 md:mr-0" />
                Add Patient
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Responsive */}
      <div className="px-4 py-4 md:p-6">
        {viewMode === 'calendar' ? (
          <AppointmentsCalendar />
        ) : (
          <div className="space-y-6 md:grid md:grid-cols-12 md:gap-6 md:space-y-0">
          {/* Left Column - Main Content */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Daily Overview */}
            <section>
              <h2 className="text-base md:text-xs font-bold md:font-semibold text-gray-900 md:text-gray-600 md:uppercase md:tracking-wider mb-4 md:mb-3">
                Daily Overview
                <span className="hidden md:inline ml-2 font-mono text-gray-400 font-normal">Today</span>
              </h2>
              <Suspense fallback={<LoadingSkeleton />}>
                {appointmentsError ? (
                  <div className="border rounded-sm p-6 text-center" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
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
                  className="text-xs font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5 border transition-colors rounded-xs"
                  style={{ borderColor: '#EDDCC7', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  disabled={isBulkUpdating}
                >
                  <Bell className="h-3 w-3 mr-1 inline" />
                  {isBulkUpdating ? "Notifying..." : "Notify All"}
                </button>
              </div>
              
              <div className="border-0 md:border rounded-sm overflow-hidden" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
                <Suspense fallback={<LoadingSkeleton />}>
                  {appointmentsError ? (
                    <div className="px-4 py-12 md:py-8 text-center">
                      <AlertCircle className="h-8 w-8 md:h-6 md:w-6 mx-auto mb-3 md:mb-2 text-red-500" />
                      <p className="text-base md:text-sm text-red-600">Failed to load patient queue</p>
                    </div>
                  ) : patientQueue.length === 0 ? (
                    <div className="px-4 py-12 md:py-8 text-center">
                      <Users className="h-8 w-8 md:h-6 md:w-6 mx-auto mb-3 md:mb-2 text-gray-300" />
                      <p className="text-base md:text-sm text-gray-600 mb-2 md:mb-1">No patients in queue</p>
                      <p className="text-sm md:text-xs text-gray-500">All appointments completed or no check-ins yet</p>
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
                          <div key={appointment.id} className="px-5 py-4 md:px-4 md:py-3 border-l-4 md:border-l-2 transition-colors" style={{ backgroundColor: appointment.status === 'IN_PROGRESS' ? '#FEF3E2' : 'transparent', borderLeftColor: appointment.status === 'IN_PROGRESS' ? '#FB923C' : 'transparent' }} onMouseEnter={(e) => { if (appointment.status !== 'IN_PROGRESS') e.currentTarget.style.backgroundColor = '#FDF9F7'; }} onMouseLeave={(e) => { if (appointment.status !== 'IN_PROGRESS') e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
                              <div className="flex items-start gap-4 md:gap-3">
                                <div className="w-8 h-8 md:w-6 md:h-6 bg-blue-100 rounded-full md:rounded-sm flex items-center justify-center text-sm md:text-xs font-bold md:font-semibold text-blue-600 md:text-gray-600 flex-shrink-0">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 md:mb-1">
                                    <span className="text-base md:text-sm font-semibold md:font-medium text-gray-900">{patientName}</span>
                                    <span className={`text-sm md:text-xs font-semibold md:font-medium ${getStatusColor(appointment.status)}`}>
                                      {appointment.status === 'IN_PROGRESS' ? 'IN PROGRESS' : '•'}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-xs text-gray-600">
                                    <span>{doctorName}</span>
                                    <span className="hidden md:inline text-gray-400">•</span>
                                    <span>
                                      {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <span className="hidden md:inline text-gray-400">•</span>
                                    <span className="font-mono">
                                      #{('patient' in appointment) ? appointment.patient.id.split('_')[1] : 'Loading...'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full md:w-auto">
                                <button
                                  onClick={() => {
                                    console.log('🔘 BUTTON CLICKED: SMS - Will call POST /api/sms/appointment/reminder');
                                    handleSendSMS(appointment);
                                  }}
                                  disabled={sendReminderMutation.isPending}
                                  className="text-sm md:text-xs font-semibold md:font-medium text-gray-700 hover:text-gray-900 px-3 py-2 md:px-0 md:py-0 border md:border-0 rounded-full md:rounded-none flex-1 md:flex-initial"
                                  style={{ borderColor: '#EDDCC7' }}
                                >
                                  <Phone className="h-4 w-4 md:h-3 md:w-3 mr-1 inline" />
                                  {sendReminderMutation.isPending ? 'Sending...' : 'SMS'}
                                </button>
                                <button 
                                  onClick={() => {
                                    // Remove appt_ prefix if it exists to avoid duplication
                                    const cleanId = appointment.id.startsWith('appt_') ? appointment.id.slice(5) : appointment.id;
                                    window.open(`/appointment/${cleanId}`, '_blank');
                                  }}
                                  className="hidden md:inline-flex text-xs font-medium text-gray-700 hover:text-gray-900 px-2 py-1 border rounded-xs transition-colors"
                                  style={{ borderColor: '#EDDCC7', backgroundColor: 'transparent' }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  Details
                                </button>
                                <button 
                                  onClick={() => handleOpenAppointmentDetails(appointment)}
                                  className="text-sm md:text-xs font-semibold md:font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 md:px-2 md:py-1 rounded-full md:rounded-xs flex-1 md:flex-initial"
                                >
                                  Modify
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

            {/* Today's Schedule - Mobile Optimized */}
            <section>
              <div className="flex items-center justify-between mb-4 md:mb-3">
                <h2 className="text-base md:text-xs font-bold md:font-semibold text-gray-900 md:text-gray-600 md:uppercase md:tracking-wider">
                  Today's Schedule
                  <span className="hidden md:inline ml-2 font-mono text-gray-400 font-normal">{appointments.length}</span>
                </h2>
                <button className="hidden md:inline text-xs font-medium text-gray-700 hover:text-gray-900">
                  View Full Schedule
                </button>
              </div>
              
              <div className="border-0 md:border rounded-sm" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
                <Suspense fallback={<LoadingSkeleton />}>
                  {appointmentsError ? (
                    <div className="px-4 py-12 md:py-8 text-center">
                      <AlertCircle className="h-8 w-8 md:h-6 md:w-6 mx-auto mb-3 md:mb-2 text-red-500" />
                      <p className="text-base md:text-sm text-red-600">Failed to load today's schedule</p>
                    </div>
                  ) : appointments.length === 0 ? (
                    <div className="px-4 py-12 md:py-8 text-center">
                      <Calendar className="h-8 w-8 md:h-6 md:w-6 mx-auto mb-3 md:mb-2 text-gray-300" />
                      <p className="text-base md:text-sm text-gray-600 mb-2 md:mb-1">No appointments today</p>
                      <p className="text-sm md:text-xs text-gray-500">No appointments scheduled for today</p>
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
                          <div 
                            key={appointment.id} 
                            className="px-5 py-4 md:px-4 md:py-3 transition-colors"
                            style={{ backgroundColor: 'transparent' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 md:mb-1">
                                  <span className="text-base md:text-sm font-semibold md:font-medium text-gray-900">{patientName}</span>
                                  <span className={`text-sm md:text-xs font-semibold md:font-medium ${getStatusColor(appointment.status)}`}>
                                    •
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm md:text-xs text-gray-600">
                                  <span>{doctorName}</span>
                                  <span className="hidden md:inline text-gray-400">•</span>
                                  <span>{appointment.type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                                  <span className="hidden md:inline text-gray-400">•</span>
                                  <span>
                                    {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                  <span className="hidden md:inline text-gray-400">•</span>
                                  <span className="font-mono">
                                    #{('patient' in appointment) ? appointment.patient.id.split('_')[1] : 'Loading...'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full md:w-auto">
                                <button 
                                  onClick={() => {
                                    // Remove appt_ prefix if it exists to avoid duplication
                                    const cleanId = appointment.id.startsWith('appt_') ? appointment.id.slice(5) : appointment.id;
                                    window.open(`/appointment/${cleanId}`, '_blank');
                                  }}
                                  className="hidden md:inline-flex text-xs font-medium text-gray-700 hover:text-gray-900 px-2 py-1 border rounded-xs transition-colors"
                                  style={{ borderColor: '#EDDCC7', backgroundColor: 'transparent' }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  Details
                                </button>
                                <button 
                                  onClick={() => handleOpenAppointmentDetails(appointment)}
                                  className="text-sm md:text-xs font-semibold md:font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 md:px-2 md:py-1 rounded-sm flex-1 md:flex-initial"
                                >
                                  Modify
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
          </div>

          {/* Right Column - Side Information - Hidden on Mobile */}
          <div className="hidden md:block md:col-span-4 space-y-6">
            
            {/* Assistance Requests */}
            <AssistanceRequestsPanel onRequestClick={handleAssistanceRequestClick} />
            
            {/* Patient Search */}
            <Suspense fallback={<LoadingSkeleton />}>
              <PatientSearchSection onAddPatient={() => setIsAddPatientModalOpen(true)} />
            </Suspense>

            {/* Quick Stats */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Quick Stats</h2>
              <div className="border rounded-sm p-4 space-y-3" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
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
                <button className="w-full text-left px-3 py-2 border transition-colors rounded-xs" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F5E8DF'}>
                  <span className="text-sm font-medium text-gray-900">Check In Patient</span>
                </button>
                <button 
                  onClick={() => setIsAddPatientModalOpen(true)}
                  className="w-full text-left px-3 py-2 border transition-colors rounded-xs"
                  style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F5E8DF'}
                >
                  <span className="text-sm font-medium text-gray-900">Add Patient</span>
                </button>
                <button className="w-full text-left px-3 py-2 border transition-colors rounded-xs" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F5E8DF'}>
                  <span className="text-sm font-medium text-gray-900">Print Reports</span>
                </button>
                <button className="w-full text-left px-3 py-2 border transition-colors rounded-xs" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F5E8DF'}>
                  <span className="text-sm font-medium text-gray-900">Manage Rooms</span>
                </button>
              </div>
            </section>

            {/* System Status */}
            <section>
              <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">System Status</h2>
              <div className="border rounded-sm p-4" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium text-gray-900">All Systems Operational</span>
                </div>
                <p className="text-xs text-gray-500">Last updated: Just now</p>
              </div>
            </section>
          </div>
        </div>
        )}
      </div>
      
      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => setIsAddPatientModalOpen(false)}
        onSuccess={(patientId) => {
          console.log("Patient created with ID:", patientId);
          // Optionally refresh patient search results
        }}
      />
      
      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={isAppointmentDetailsModalOpen}
        onClose={handleCloseAppointmentDetails}
        appointment={selectedAppointment}
        assistanceRequestPhoneNumber={assistanceRequestPhoneNumber}
        onSuccess={() => {
          // Refresh appointments data after successful update
          refetch();
          handleCloseAppointmentDetails();
        }}
      />
    </div>
  );
}