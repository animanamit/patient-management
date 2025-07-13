"use client";

import {
  useState,
  useTransition,
  useDeferredValue,
  useMemo,
  Suspense,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  ArrowLeft,
  User,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useDoctors, useDoctor } from "@/hooks/use-doctors";
import {
  useTodayAppointments,
  useOptimisticAppointmentStatusUpdate,
} from "@/hooks/use-appointments";
import {
  AppointmentStatus,
  AppointmentWithDetails,
  Appointment,
} from "@/lib/api-types";

/**
 * Doctor Dashboard - Main portal for doctors/physiotherapists
 *
 * React 18/19 Features implemented:
 * - useTransition() for appointment status updates without blocking
 * - startTransition() for non-urgent state updates
 * - useDeferredValue() for patient search functionality
 * - Suspense for patient history data loading
 * - useOptimistic() for real-time appointment status changes
 */

// For demo purposes, we'll fetch all doctors and use the first one
// In a real app, this would come from authentication

// Loading skeletons
const AppointmentSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="border-mint/30 bg-white/90">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-40" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    {[1, 2, 3, 4].map((i) => (
      <Card
        key={i}
        className="border-deep-blue/15 bg-gradient-to-br from-deep-blue/3 to-sky/5"
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-8" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Appointment component with optimistic updates
const AppointmentCard = ({
  appointment,
  onStatusUpdate,
}: {
  appointment: Appointment | AppointmentWithDetails;
  onStatusUpdate: (id: string, status: AppointmentStatus) => void;
}) => {
  const [isPending, startTransition] = useTransition();
  const { updateStatusOptimistically, isUpdating } =
    useOptimisticAppointmentStatusUpdate();

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    startTransition(async () => {
      try {
        await updateStatusOptimistically(appointment.id, newStatus);
        onStatusUpdate(appointment.id, newStatus);
      } catch (error) {
        console.error("Failed to update appointment status:", error);
      }
    });
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case "SCHEDULED":
        return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Activity className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-sky/20 text-deep-blue border-sky/30";
      case "IN_PROGRESS":
        return "bg-orange/20 text-orange border-orange/30";
      case "COMPLETED":
        return "bg-grass/20 text-forest border-grass/30";
      case "CANCELLED":
        return "bg-rose/20 text-rose border-rose/30";
      default:
        return "bg-mint/20 text-charcoal border-mint/30";
    }
  };

  const patientName =
    "patient" in appointment
      ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
      : "Patient name loading...";

  const patientId =
    "patient" in appointment ? appointment.patient.id : "Loading...";

  return (
    <Card className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge
                className={`${getStatusColor(
                  appointment.status
                )} flex items-center gap-1`}
              >
                {isUpdating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  getStatusIcon(appointment.status)
                )}
                {appointment.status.toLowerCase().replace("_", " ")}
              </Badge>
              <span className="text-sm text-muted-foreground">
                #{appointment.id}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-charcoal text-lg">
                {patientName}
              </h4>
              <p className="text-muted-foreground">ID: {patientId}</p>
            </div>
            <p className="text-deep-blue font-medium">
              {appointment.type
                .replace("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(appointment.scheduledDateTime).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4" />
                {appointment.durationMinutes} min
              </div>
            </div>
            {appointment.reasonForVisit && (
              <p className="text-sm text-muted-foreground">
                <strong>Reason:</strong> {appointment.reasonForVisit}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white"
            >
              View Patient
            </Button>
            {appointment.status === "SCHEDULED" && (
              <Button
                size="sm"
                className="bg-orange hover:bg-orange/90 text-white"
                onClick={() => handleStatusChange("IN_PROGRESS")}
                disabled={isPending || isUpdating}
              >
                {isPending || isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Start Session
              </Button>
            )}
            {appointment.status === "IN_PROGRESS" && (
              <Button
                size="sm"
                className="bg-forest hover:bg-forest/90 text-white"
                onClick={() => handleStatusChange("COMPLETED")}
                disabled={isPending || isUpdating}
              >
                {isPending || isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Stats component with real data
const DashboardStats = ({
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="border-deep-blue/15 bg-gradient-to-br from-deep-blue/3 to-sky/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-deep-blue">
                Today&apos;s Appointments
              </p>
              <p className="text-2xl font-bold text-charcoal">
                {stats.totalToday}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-deep-blue" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange/15 bg-gradient-to-br from-orange/3 to-orange/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange">In Progress</p>
              <p className="text-2xl font-bold text-charcoal">
                {stats.inProgress}
              </p>
            </div>
            <Activity className="h-8 w-8 text-orange" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-grass/15 bg-gradient-to-br from-grass/3 to-mint/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest">Scheduled</p>
              <p className="text-2xl font-bold text-charcoal">
                {stats.scheduled}
              </p>
            </div>
            <Users className="h-8 w-8 text-forest" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-sky/15 bg-gradient-to-br from-sky/3 to-pale-blue/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-deep-blue">
                Completed Today
              </p>
              <p className="text-2xl font-bold text-charcoal">
                {stats.completed}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-deep-blue" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function DoctorDashboard() {
  // React 18/19 hooks for enhanced UX
  const [activeTab, setActiveTab] = useState("schedule");
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Fetch all doctors to get the first one for demo
  const {
    data: doctorsData,
    isLoading: isDoctorsLoading,
    error: doctorsError,
  } = useDoctors();

  // Get the first doctor ID
  const firstDoctorId = doctorsData?.doctors?.[0]?.id;

  // Fetch specific doctor data using the first doctor ID
  const {
    data: doctorData,
    isLoading: isDoctorLoading,
    error: doctorError,
  } = useDoctor(firstDoctorId!, {
    enabled: !!firstDoctorId,
  });

  // Fetch today's appointments for this doctor
  const {
    data: appointmentsData,
    isLoading: isAppointmentsLoading,
    error: appointmentsError,
  } = useTodayAppointments(firstDoctorId!, {
    enabled: !!firstDoctorId,
  });

  // Handle tab switching with useTransition
  const handleTabChange = (newTab: string) => {
    startTransition(() => {
      setActiveTab(newTab);
    });
  };

  // Handle appointment status updates
  const handleAppointmentStatusUpdate = (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    // This will be handled by the optimistic update hook in AppointmentCard
    console.log(`Appointment ${appointmentId} status updated to ${newStatus}`);
  };

  // Filter appointments based on deferred search query
  const filteredAppointments = useMemo(() => {
    if (!appointmentsData?.appointments) return [];

    if (!deferredSearchQuery) return appointmentsData.appointments;

    return appointmentsData.appointments.filter((appointment) => {
      const searchLower = deferredSearchQuery.toLowerCase();
      const patientName =
        "patient" in appointment
          ? // @ts-expect-error todo: Fix type error here
            `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase()
          : "";

      return (
        patientName.includes(searchLower) ||
        appointment.type.toLowerCase().includes(searchLower) ||
        appointment.id.toLowerCase().includes(searchLower)
      );
    });
  }, [appointmentsData, deferredSearchQuery]);

  // Show loading state if doctor data is loading
  if (isDoctorsLoading || isDoctorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pale-blue/20 to-sky/30">
        <header className="border-b border-mint bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Link>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-xl font-semibold text-deep-blue">
                Doctor Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <StatsSkeleton />
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <AppointmentSkeleton />
          </div>
        </main>
      </div>
    );
  }

  // Show error state if doctor data failed to load
  if (doctorsError || doctorError || !doctorData || !firstDoctorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pale-blue/20 to-sky/30">
        <header className="border-b border-mint bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Link>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-xl font-semibold text-deep-blue">
                Doctor Dashboard
              </h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load doctor information. Please try refreshing the page
              or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const doctor = doctorData.doctor;
  const appointments = filteredAppointments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pale-blue/20 to-sky/30">
      {/* Navigation */}
      <header className="border-b border-mint bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
            </Link>
            <div className="h-4 w-px bg-border" />
          </div>
          <div className="flex items-center space-x-2">
            {/* <User className="h-5 w-5 text-muted-foreground" /> */}
            <div className="text-right">
              <div className="text-xs uppercase font-mono font-medium">
                Dr. {doctor.firstName} {doctor.lastName}
              </div>
              <div className="text-xs text-muted-foreground uppercase font-mono">
                {doctor.specialization || "General Practitioner"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <Suspense fallback={<StatsSkeleton />}>
          {isAppointmentsLoading ? (
            <StatsSkeleton />
          ) : appointmentsError ? (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load appointment statistics.
              </AlertDescription>
            </Alert>
          ) : (
            <DashboardStats appointments={appointments} />
          )}
        </Suspense>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white border border-mint/20">
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-deep-blue/5 data-[state=active]:to-sky/5"
              disabled={isPending}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Today&apos;s Schedule
              {isPending && activeTab !== "schedule" && (
                <Loader2 className="h-3 w-3 ml-2 animate-spin" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="patients"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-deep-blue/5 data-[state=active]:to-sky/5"
              disabled={isPending}
            >
              <Users className="h-4 w-4 mr-2" />
              Patients
              {isPending && activeTab !== "patients" && (
                <Loader2 className="h-3 w-3 ml-2 animate-spin" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-deep-blue/5 data-[state=active]:to-sky/5"
              disabled={isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              Clinical Notes
              {isPending && activeTab !== "notes" && (
                <Loader2 className="h-3 w-3 ml-2 animate-spin" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-semibold text-charcoal">
                Today&apos;s Appointments - {new Date().toLocaleDateString()}
              </h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button
                  variant="outline"
                  className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white"
                >
                  View Full Calendar
                </Button>
              </div>
            </div>

            <Suspense fallback={<AppointmentSkeleton />}>
              {isAppointmentsLoading ? (
                <AppointmentSkeleton />
              ) : appointmentsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load appointments. Please try again later.
                  </AlertDescription>
                </Alert>
              ) : appointments.length === 0 ? (
                <Card className="border-mint/30 bg-white/90">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-charcoal mb-2">
                      {searchQuery
                        ? "No matching appointments"
                        : "No appointments scheduled"}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "Try adjusting your search criteria"
                        : "Enjoy your free day!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onStatusUpdate={handleAppointmentStatusUpdate}
                    />
                  ))}
                </div>
              )}
            </Suspense>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-charcoal">
                Patient Management
              </h3>
              <Button
                variant="outline"
                className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white"
              >
                Search All Patients
              </Button>
            </div>

            <Card className="border-mint/30 bg-white/90">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium text-charcoal mb-2">
                  Patient Management
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comprehensive patient management interface coming soon
                </p>
                <Button
                  variant="outline"
                  className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white"
                >
                  View All Patients
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clinical Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card className="border-mint/30 bg-white/90">
              <CardHeader>
                <CardTitle className="text-charcoal">Clinical Notes</CardTitle>
                <CardDescription>
                  Manage patient notes and documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Clinical notes management interface</p>
                  <p className="text-sm">
                    This section will be implemented with patient-specific note
                    editing
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
