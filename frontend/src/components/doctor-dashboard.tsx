"use client";

import { useState, useTransition, useDeferredValue, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Activity,
  AlertCircle,
  Loader2,
  Stethoscope
} from "lucide-react";
import { useDoctors, useDoctor } from "@/hooks/use-doctors";
import { useTodayAppointments } from "@/hooks/use-appointments";
import { Doctor, Appointment, AppointmentWithDetails } from "@/lib/api-types";

// Loading skeletons
const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="bg-lightest-gray">
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

const AppointmentSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="bg-lightest-gray">
        <CardContent className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Doctor stats component
const DoctorStats = ({ appointments }: { appointments: (Appointment | AppointmentWithDetails)[] }) => {
  const stats = useMemo(() => {
    const totalToday = appointments.length;
    const inProgress = appointments.filter(apt => apt.status === "IN_PROGRESS").length;
    const completed = appointments.filter(apt => apt.status === "COMPLETED").length;
    const scheduled = appointments.filter(apt => apt.status === "SCHEDULED").length;

    return { totalToday, inProgress, completed, scheduled };
  }, [appointments]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-lightest-gray">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray">Today's Appointments</p>
              <p className="text-2xl font-bold text-dark-gray">{stats.totalToday}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-lightest-gray">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray">In Progress</p>
              <p className="text-2xl font-bold text-dark-gray">{stats.inProgress}</p>
            </div>
            <Activity className="h-8 w-8 text-gray" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-lightest-gray">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray">Scheduled</p>
              <p className="text-2xl font-bold text-dark-gray">{stats.scheduled}</p>
            </div>
            <Users className="h-8 w-8 text-gray" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-lightest-gray">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray">Completed Today</p>
              <p className="text-2xl font-bold text-dark-gray">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual appointment card
const AppointmentCard = ({ appointment }: { appointment: Appointment | AppointmentWithDetails }) => {
  const patientName = ('patient' in appointment)
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
    : 'Patient information loading...';

  const patientId = ('patient' in appointment) ? appointment.patient.id : 'Loading...';

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-lightest-gray text-gray";
      case "IN_PROGRESS":
        return "bg-lightest-gray text-gray";
      case "COMPLETED":
        return "bg-lightest-gray text-gray";
      case "CANCELLED":
        return "bg-lightest-gray text-gray";
      default:
        return "bg-lightest-gray text-gray";
    }
  };

  return (
    <Card className="bg-lightest-gray">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status.toLowerCase().replace("_", " ")}
              </Badge>
              <span className="text-sm text-muted-foreground">#{appointment.id}</span>
            </div>
            <div>
              <h4 className="font-semibold text-dark-gray text-lg">{patientName}</h4>
              <p className="text-muted-foreground">ID: {patientId}</p>
            </div>
            <p className="text-gray font-medium">
              {appointment.type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="bg-lightest-gray text-gray">
              View Patient
            </Button>
            <Button size="sm" className="bg-black text-white">
              Start Consultation
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  const [isPending, startTransition] = useTransition();

  // Fetch doctors to get the first doctor ID
  const { data: doctorsData, isLoading: isDoctorsLoading, error: doctorsError } = useDoctors();
  const firstDoctorId = doctorsData?.doctors?.[0]?.id || null;
  
  // Ensure we have a valid string ID, not an object
  const validDoctorId = typeof firstDoctorId === 'string' && firstDoctorId ? firstDoctorId : null;
  
  // Debug logging to help identify ID issues
  if (firstDoctorId && typeof firstDoctorId !== 'string') {
    console.error('DoctorDashboard: firstDoctorId is not a string:', firstDoctorId, typeof firstDoctorId);
  }

  // Fetch doctor details
  const { data: doctorData, isLoading: isDoctorLoading, error: doctorError } = useDoctor(
    validDoctorId || undefined,
    { enabled: !!validDoctorId }
  );

  // Fetch appointments for the doctor
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useTodayAppointments(
    validDoctorId || undefined,
    { enabled: !!validDoctorId }
  );

  const handleTabChange = (newTab: string) => {
    startTransition(() => {
      setActiveTab(newTab);
    });
  };

  // Filter appointments based on search
  const filteredAppointments = useMemo(() => {
    if (!appointmentsData?.appointments) return [];
    return appointmentsData.appointments.filter(appointment => {
      return true; // For now, return all appointments
    });
  }, [appointmentsData]);

  // Show loading state
  if (isDoctorsLoading || isDoctorLoading || isAppointmentsLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-black mr-2" />
            <h2 className="text-2xl font-bold text-black">Doctor Dashboard</h2>
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray" />
        </div>
        <StatsSkeleton />
      </div>
    );
  }

  // Show error state
  if (doctorsError || doctorError || !doctorData || !validDoctorId) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-black mr-2" />
            <h2 className="text-2xl font-bold text-black">Doctor Dashboard</h2>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load doctor information. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const doctor = doctorData.doctor;
  const appointments = filteredAppointments;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Stethoscope className="h-8 w-8 text-black mr-2" />
          <h2 className="text-2xl font-bold text-black">Doctor Dashboard</h2>
        </div>
        <p className="text-gray">Welcome, Dr. {doctor.firstName} {doctor.lastName}</p>
      </div>

      {/* Doctor Stats */}
      <Suspense fallback={<StatsSkeleton />}>
        <DoctorStats appointments={appointments} />
      </Suspense>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-lightest-gray">
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-white"
            disabled={isPending}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Today's Schedule
            {isPending && activeTab !== "schedule" && (
              <Loader2 className="h-3 w-3 ml-2 animate-spin" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="patients"
            className="data-[state=active]:bg-white"
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
            className="data-[state=active]:bg-white"
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
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-dark-gray">
              Today's Schedule - {new Date().toLocaleDateString()}
            </h3>
            <Button variant="outline" className="bg-lightest-gray text-gray">
              Add Appointment
            </Button>
          </div>

          <Suspense fallback={<AppointmentSkeleton />}>
            {appointments.length === 0 ? (
              <Card className="bg-lightest-gray">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-dark-gray mb-2">No appointments today</h3>
                  <p className="text-muted-foreground">
                    You have no appointments scheduled for today
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            )}
          </Suspense>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-dark-gray">Patient Management</h3>
            <Button variant="outline" className="bg-lightest-gray text-gray">
              Add Patient
            </Button>
          </div>

          <Card className="bg-lightest-gray">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-dark-gray mb-2">Patient List</h3>
              <p className="text-muted-foreground">
                View and manage your patient roster
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-dark-gray">Clinical Notes</h3>
            <Button variant="outline" className="bg-lightest-gray text-gray">
              New Note
            </Button>
          </div>

          <Card className="bg-lightest-gray">
            <CardHeader>
              <CardTitle className="text-dark-gray">Recent Notes</CardTitle>
              <CardDescription>
                Your recent clinical notes and observations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter clinical notes..."
                className="min-h-32 bg-white"
              />
              <Button className="bg-black text-white">Save Note</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};