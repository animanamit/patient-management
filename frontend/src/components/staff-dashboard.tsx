"use client";

import { useState, useTransition, useDeferredValue, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  UserCheck
} from "lucide-react";
import { useTodayAppointments, useBulkAppointmentOperations } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { AppointmentStatus, AppointmentWithDetails, Appointment, Patient } from "@/lib/api-types";

// Loading skeletons
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i} className="bg-lightest-gray">
        <CardContent className="p-4">
          <div className="text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-2" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const QueueSkeleton = () => (
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

// Stats calculation component
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <Card className="bg-lightest-gray">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-dark-gray">{stats.totalAppointments}</p>
            <p className="text-sm text-gray">Total Today</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-lightest-gray">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-dark-gray">{stats.checkedIn}</p>
            <p className="text-sm text-gray">Checked In</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-lightest-gray">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-dark-gray">{stats.inProgress}</p>
            <p className="text-sm text-gray">In Progress</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-lightest-gray">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-dark-gray">{stats.completed}</p>
            <p className="text-sm text-gray">Completed</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-lightest-gray">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-dark-gray">{stats.noShows}</p>
            <p className="text-sm text-gray">No Shows</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Patient search component
const PatientSearchTab = () => {
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, ID, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        {isPending && (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>

      {isLoading ? (
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
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load patients. Please try again later.
          </AlertDescription>
        </Alert>
      ) : patients.length === 0 ? (
        <Card className="bg-lightest-gray">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-dark-gray mb-2">
              {searchQuery ? "No patients found" : "Search for patients"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Enter a name, ID, or phone number to search"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {patients.map((patient) => (
            <Card key={patient.id} className="bg-lightest-gray">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-dark-gray text-lg">
                      {patient.firstName} {patient.lastName}
                    </h4>
                    <p className="text-muted-foreground">ID: {patient.id}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {typeof patient.phone === 'string' ? patient.phone : patient.phone?.toString() || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-4 w-4" />
                        {typeof patient.email === 'string' ? patient.email : patient.email?.toString() || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white text-gray">
                      View History
                    </Button>
                    <Button size="sm" className="bg-black text-white">
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Queue status utilities
const getQueueStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "SCHEDULED":
      return "bg-lightest-gray text-gray";
    case "IN_PROGRESS":
      return "bg-lightest-gray text-gray";
    case "COMPLETED":
      return "bg-lightest-gray text-gray";
    case "NO_SHOW":
      return "bg-lightest-gray text-gray";
    default:
      return "bg-lightest-gray text-gray";
  }
};

const getQueueStatusIcon = (status: AppointmentStatus) => {
  switch (status) {
    case "SCHEDULED":
      return <Clock className="h-3 w-3" />;
    case "IN_PROGRESS":
      return <Activity className="h-3 w-3" />;
    case "COMPLETED":
      return <CheckCircle className="h-3 w-3" />;
    case "NO_SHOW":
      return <AlertCircle className="h-3 w-3" />;
    default:
      return <AlertCircle className="h-3 w-3" />;
  }
};

export const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState("queue");
  const [isPending, startTransition] = useTransition();

  // Fetch today's appointments
  const { data: appointmentsData, isLoading: isAppointmentsLoading, error: appointmentsError, refetch } = useTodayAppointments();
  const { bulkUpdateStatus, isBulkUpdating } = useBulkAppointmentOperations();

  const handleTabChange = (newTab: string) => {
    startTransition(() => {
      setActiveTab(newTab);
    });
  };

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
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-black mr-2" />
            <h2 className="text-2xl font-bold text-black">Staff Dashboard</h2>
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray" />
        </div>
        <StatsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-black mr-2" />
          <h2 className="text-2xl font-bold text-black">Staff Dashboard</h2>
        </div>
        <p className="text-gray">Front desk and patient management</p>
      </div>

      {/* Daily Overview */}
      <Suspense fallback={<StatsSkeleton />}>
        {appointmentsError ? (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load appointment statistics.
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="ml-2" disabled={isAppointmentsLoading}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <DashboardStats appointments={appointments} />
        )}
      </Suspense>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-lightest-gray">
          <TabsTrigger
            value="queue"
            className="data-[state=active]:bg-white"
            disabled={isPending}
          >
            <Users className="h-4 w-4 mr-2" />
            Patient Queue
            {isPending && activeTab !== "queue" && (
              <Loader2 className="h-3 w-3 ml-2 animate-spin" />
            )}
          </TabsTrigger>
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
            value="search"
            className="data-[state=active]:bg-white"
            disabled={isPending}
          >
            <Search className="h-4 w-4 mr-2" />
            Patient Search
            {isPending && activeTab !== "search" && (
              <Loader2 className="h-3 w-3 ml-2 animate-spin" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Patient Queue Tab */}
        <TabsContent value="queue" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-dark-gray">Current Patient Queue</h3>
            <Button className="bg-black text-white" disabled={isBulkUpdating}>
              <Bell className="h-4 w-4 mr-2" />
              {isBulkUpdating ? "Sending..." : "Send SMS Notification"}
            </Button>
          </div>

          <Suspense fallback={<QueueSkeleton />}>
            {appointmentsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load patient queue. Please try again later.
                </AlertDescription>
              </Alert>
            ) : patientQueue.length === 0 ? (
              <Card className="bg-lightest-gray">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-dark-gray mb-2">No patients in queue</h3>
                  <p className="text-muted-foreground">
                    All appointments are completed or no patients have checked in yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {patientQueue.map((appointment, index) => {
                  const patientName = ('patient' in appointment)
                    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                    : 'Patient name loading...';

                  const doctorName = ('doctor' in appointment)
                    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                    : 'Doctor name loading...';

                  return (
                    <Card key={appointment.id} className="bg-lightest-gray">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Badge className={`${getQueueStatusColor(appointment.status)} flex items-center gap-1`}>
                                {getQueueStatusIcon(appointment.status)}
                                {appointment.status.toLowerCase().replace("_", " ")}
                              </Badge>
                              <div className="bg-lightest-gray text-gray px-3 py-1 rounded-full text-sm font-medium">
                                Queue #{index + 1}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-dark-gray text-lg">{patientName}</h4>
                              <p className="text-muted-foreground">
                                ID: {('patient' in appointment) ? appointment.patient.id : 'Loading...'}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Appointment: {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                              <div className="flex items-center gap-1">
                                <UserCheck className="h-4 w-4" />
                                {doctorName}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white text-gray"
                              onClick={() => handleSendSMS(patientName)}
                              disabled={isPending}
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              SMS
                            </Button>
                            <Button size="sm" className="bg-black text-white" disabled={isPending}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </Suspense>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-dark-gray">
              Today's Schedule - {new Date().toLocaleDateString()}
            </h3>
            <Button variant="outline" className="bg-lightest-gray text-gray">
              Export Schedule
            </Button>
          </div>

          <Suspense fallback={<QueueSkeleton />}>
            {appointmentsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load today's schedule. Please try again later.
                </AlertDescription>
              </Alert>
            ) : appointments.length === 0 ? (
              <Card className="bg-lightest-gray">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-dark-gray mb-2">No appointments today</h3>
                  <p className="text-muted-foreground">
                    No appointments are scheduled for today
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  const patientName = ('patient' in appointment)
                    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
                    : 'Patient name loading...';

                  const doctorName = ('doctor' in appointment)
                    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                    : 'Doctor name loading...';

                  return (
                    <Card key={appointment.id} className="bg-lightest-gray">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Badge className={getQueueStatusColor(appointment.status)}>
                                {appointment.status.toLowerCase().replace("_", " ")}
                              </Badge>
                              <span className="text-sm text-muted-foreground">#{appointment.id}</span>
                            </div>
                            <h4 className="font-semibold text-dark-gray text-lg">{patientName}</h4>
                            <p className="text-muted-foreground">
                              ID: {('patient' in appointment) ? appointment.patient.id : 'Loading...'}
                            </p>
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
                              <div className="flex items-center gap-1">
                                <UserCheck className="h-4 w-4" />
                                {doctorName}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="bg-white text-gray">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </Suspense>
        </TabsContent>

        {/* Patient Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Suspense fallback={<QueueSkeleton />}>
            <PatientSearchTab />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};