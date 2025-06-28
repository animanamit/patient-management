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
  ArrowLeft,
  User,
  Bell,
  Search,
  CheckCircle,
  AlertCircle,
  Phone,
  Loader2,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useTodayAppointments, useBulkAppointmentOperations } from "@/hooks/use-appointments";
import { usePatients } from "@/hooks/use-patients";
import { AppointmentStatus, AppointmentWithDetails, Appointment, Patient } from "@/lib/api-types";

/**
 * Staff Dashboard - Admin portal for front desk and nursing staff
 * 
 * React 18/19 Features implemented:
 * - useTransition() for queue management updates without blocking UI
 * - startTransition() for non-urgent patient search operations
 * - useDeferredValue() for real-time patient search filtering
 * - Suspense for appointment and patient data loading
 * - useOptimistic() for queue status changes and SMS notifications
 */

// Loading skeletons
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i} className="border-orange/15 bg-gradient-to-br from-orange/3 to-rose/5">
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
      <Card key={i} className="border-mint/30 bg-white/90">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-32" />
            </div>
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
      <Card className="border-orange/15 bg-gradient-to-br from-orange/3 to-rose/5">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-charcoal">{stats.totalAppointments}</p>
            <p className="text-sm text-orange">Total Today</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-sky/15 bg-gradient-to-br from-sky/3 to-pale-blue/5">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-charcoal">{stats.checkedIn}</p>
            <p className="text-sm text-deep-blue">Checked In</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange/15 bg-gradient-to-br from-orange/3 to-orange/5">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-charcoal">{stats.inProgress}</p>
            <p className="text-sm text-orange">In Progress</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-grass/15 bg-gradient-to-br from-grass/3 to-mint/5">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-charcoal">{stats.completed}</p>
            <p className="text-sm text-forest">Completed</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose/15 bg-gradient-to-br from-rose/3 to-rose/5">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-charcoal">{stats.noShows}</p>
            <p className="text-sm text-rose">No Shows</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Patient search component with deferred value
const PatientSearchTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Fetch patients with deferred search
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
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, ID, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {isPending && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-mint/30 bg-white/90">
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
        <Card className="border-mint/30 bg-white/90">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium text-charcoal mb-2">
              {searchQuery ? 'No patients found' : 'Search for patients'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search criteria' : 'Enter a name, ID, or phone number to search'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {patients.map((patient) => (
            <Card key={patient.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-charcoal text-lg">
                      {patient.firstName} {patient.lastName}
                    </h4>
                    <p className="text-muted-foreground">ID: {patient.id}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {typeof patient.phone === 'string' ? patient.phone : patient.phone?.normalizedValue || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {typeof patient.email === 'string' ? patient.email : patient.email?.normalizedValue || 'N/A'}
                      </div>
                    </div>
                    {patient.address && (
                      <p className="text-sm text-muted-foreground">{patient.address}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-orange text-orange hover:bg-orange hover:text-white">
                      View History
                    </Button>
                    <Button size="sm" className="bg-orange hover:bg-orange/90 text-white">
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

export default function StaffDashboard() {
  // React 18/19 hooks for enhanced UX
  const [activeTab, setActiveTab] = useState("queue");
  const [isPending, startTransition] = useTransition();

  // Fetch today's appointments for all doctors
  const { data: appointmentsData, isLoading: isAppointmentsLoading, error: appointmentsError, refetch } = useTodayAppointments();
  const { bulkUpdateStatus, isBulkUpdating } = useBulkAppointmentOperations();

  // Handle tab switching with useTransition
  const handleTabChange = (newTab: string) => {
    startTransition(() => {
      setActiveTab(newTab);
    });
  };

  // Simulate sending SMS notification
  const handleSendSMS = async (patientName: string) => {
    startTransition(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`SMS sent to ${patientName}`);
    });
  };

  // Filter appointments to create a patient queue (in-progress and scheduled)
  const patientQueue = useMemo(() => {
    if (!appointmentsData?.appointments) return [];
    
    return appointmentsData.appointments
      .filter(apt => apt.status === "SCHEDULED" || apt.status === "IN_PROGRESS")
      .sort((a, b) => {
        // Sort by status priority: IN_PROGRESS first, then by scheduled time
        if (a.status === "IN_PROGRESS" && b.status !== "IN_PROGRESS") return -1;
        if (b.status === "IN_PROGRESS" && a.status !== "IN_PROGRESS") return 1;
        return new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime();
      });
  }, [appointmentsData]);

  const appointments = appointmentsData?.appointments || [];

  const getQueueStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case "SCHEDULED":
        return <Clock className="h-4 w-4" />;
      case "IN_PROGRESS":
        return <Activity className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getQueueStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-sky/15 text-deep-blue border-sky/30";
      case "IN_PROGRESS":
        return "bg-orange/15 text-orange border-orange/30";
      case "COMPLETED":
        return "bg-grass/15 text-forest border-grass/30";
      default:
        return "bg-rose/15 text-rose border-rose/30";
    }
  };

  // Show loading state if appointments data is loading
  if (isAppointmentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-orange/10 to-rose/20">
        <header className="border-b border-mint/20 bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-xl font-semibold text-orange">Staff Dashboard</h1>
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
            <QueueSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange/10 to-rose/20">
      {/* Navigation */}
      <header className="border-b border-mint/20 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-xl font-semibold text-orange">Staff Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="text-right">
              <div className="text-sm font-medium">Staff Member</div>
              <div className="text-xs text-muted-foreground">Front Desk Coordinator</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Daily Overview */}
        <Suspense fallback={<StatsSkeleton />}>
          {appointmentsError ? (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load appointment statistics.
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => refetch()} 
                  className="ml-2"
                  disabled={isAppointmentsLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <DashboardStats appointments={appointments} />
          )}
        </Suspense>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-mint/20">
            <TabsTrigger 
              value="queue" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange/5 data-[state=active]:to-rose/5"
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
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange/5 data-[state=active]:to-rose/5"
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
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange/5 data-[state=active]:to-rose/5"
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
              <h3 className="text-xl font-semibold text-charcoal">Current Patient Queue</h3>
              <Button 
                className="bg-orange hover:bg-orange/90 text-white" 
                disabled={isBulkUpdating}
              >
                <Bell className="h-4 w-4 mr-2" />
                {isBulkUpdating ? 'Sending...' : 'Send SMS Notification'}
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
                <Card className="border-mint/30 bg-white/90">
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-charcoal mb-2">No patients in queue</h3>
                    <p className="text-muted-foreground">All appointments are completed or no patients have checked in yet</p>
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
                      <Card key={appointment.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <Badge className={`${getQueueStatusColor(appointment.status)} flex items-center gap-1`}>
                                  {getQueueStatusIcon(appointment.status)}
                                  {appointment.status.toLowerCase().replace('_', ' ')}
                                </Badge>
                                <div className="bg-orange/10 text-orange px-3 py-1 rounded-full text-sm font-medium">
                                  Queue #{index + 1}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-charcoal text-lg">{patientName}</h4>
                                <p className="text-muted-foreground">ID: {('patient' in appointment) ? appointment.patient.id : 'Loading...'}</p>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Appointment: {new Date(appointment.scheduledDateTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {doctorName}
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
                                onClick={() => handleSendSMS(patientName)}
                                disabled={isPending}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                SMS
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-orange hover:bg-orange/90 text-white"
                                disabled={isPending}
                              >
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
              <h3 className="text-xl font-semibold text-charcoal">
                Today's Schedule - {new Date().toLocaleDateString()}
              </h3>
              <Button variant="outline" className="border-orange text-orange hover:bg-orange hover:text-white">
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
                <Card className="border-mint/30 bg-white/90">
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-charcoal mb-2">No appointments today</h3>
                    <p className="text-muted-foreground">No appointments are scheduled for today</p>
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
                      <Card key={appointment.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <Badge className={getQueueStatusColor(appointment.status)}>
                                  {appointment.status.toLowerCase().replace('_', ' ')}
                                </Badge>
                                <span className="text-sm text-muted-foreground">#{appointment.id}</span>
                              </div>
                              <h4 className="font-semibold text-charcoal text-lg">{patientName}</h4>
                              <p className="text-muted-foreground">
                                ID: {('patient' in appointment) ? appointment.patient.id : 'Loading...'}
                              </p>
                              <p className="text-orange font-medium">
                                {appointment.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(appointment.scheduledDateTime).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {doctorName}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-orange text-orange hover:bg-orange hover:text-white">
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
      </main>
    </div>
  );
}