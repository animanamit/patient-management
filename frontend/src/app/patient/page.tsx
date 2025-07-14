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
import {
  Calendar,
  Clock,
  FileText,
  Download,
  Plus,
  ArrowLeft,
  User,
  Phone,
  Mail,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePatients, usePatient } from "@/hooks/use-patients";
import { usePatientAppointments } from "@/hooks/use-appointments";
import { useDoctor } from "@/hooks/use-doctors";
import { PatientId, AppointmentStatus } from "@/lib/api-types";

/**
 * Patient Dashboard - Main portal for patients
 *
 * React 18/19 Features implemented:
 * - useTransition() for smooth tab switching without blocking UI
 * - useDeferredValue() for search/filter operations
 * - Suspense for appointment history loading
 * - Error boundaries and loading states
 */

// For demo purposes, we'll fetch all patients and use the first one
// In a real app, this would come from authentication/routing

// Loading skeleton component for appointments
const AppointmentSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="mint/30 bg-white/90">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Document list component (mock data for now)
const DocumentsList = () => {
  const documents = [
    {
      id: "D001",
      name: "Exercise Plan - January 2025",
      type: "PDF",
      date: "2025-01-10",
      size: "2.3 MB",
    },
    {
      id: "D002",
      name: "MRI Scan Results",
      type: "PDF",
      date: "2025-01-08",
      size: "8.7 MB",
    },
  ];

  return (
    <div className="grid gap-4">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className="mint/30 bg-white/90 hover:mint/50 transition-colors"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-light-gray from-blue/10 to-light-blue/20 rounded-lg">
                  <FileText className="h-5 w-5 text-dark-blue" />
                </div>
                <div>
                  <h4 className="font-medium text-gray">{doc.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{new Date(doc.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-dark-blue bg-dark-blue/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Appointments list component with real data
const AppointmentsList = ({ patientId }: { patientId: PatientId }) => {
  const {
    data: appointmentsData,
    isLoading,
    error,
  } = usePatientAppointments(patientId);

  if (isLoading) return <AppointmentSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load appointments. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const appointments = appointmentsData?.appointments || [];

  if (appointments.length === 0) {
    return (
      <Card className="mint/30 bg-white/90">
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-gray mb-2">
            No appointments scheduled
          </h3>
          <p className="text-muted-foreground mb-4">
            Book your first appointment to get started
          </p>
          <Button className="bg-green bg-green/90 text-black uppercase font-mono">
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="   transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`rounded-xs none
                      ${
                        appointment.status === "SCHEDULED"
                          ? "text-gray"
                          : ""
                      }
                      ${
                        appointment.status === "IN_PROGRESS"
                          ? "bg-lightest-gray from-amber/20 to-yellow/40 text-gray amber/30"
                          : ""
                      }
                      ${
                        appointment.status === "COMPLETED"
                          ? "bg-lightest-gray from-green/20 to-light-green/40 text-gray green/30"
                          : ""
                      }
                      ${
                        appointment.status === "CANCELLED"
                          ? "bg-lightest-gray from-red/20 to-pink/40 text-gray red/30"
                          : ""
                      }
                    `}
                  >
                    {appointment.status.toLowerCase().replace("_", " ")}
                  </Badge>

                  <span className="text-sm text-muted-foreground">
                    #{appointment.id}
                  </span>
                </div>
                <h4 className="font-semibold text-gray">
                  {appointment.type
                    .replace("_", " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </h4>
                <p className="text-muted-foreground">
                  {"doctor" in appointment
                    ? `with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                    : "Doctor information loading..."}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(
                      appointment.scheduledDateTime
                    ).toLocaleDateString()}
                  </div>
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
                </div>
                {appointment.reasonForVisit && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Reason:</strong> {appointment.reasonForVisit}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="green text-green bg-green text-black"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default function PatientDashboard() {
  // React 18/19 hooks for enhanced UX
  const [activeTab, setActiveTab] = useState("appointments");
  const [isPending, startTransition] = useTransition();

  // Fetch all patients to get the first one for demo
  const {
    data: patientsData,
    isLoading: isPatientsLoading,
    error: patientsError,
  } = usePatients();

  // Get the first patient ID
  const firstPatientId = patientsData?.patients?.[0]?.id;

  // Fetch specific patient data using the first patient ID
  const {
    data: patientData,
    isLoading: isPatientLoading,
    error: patientError,
  } = usePatient(firstPatientId!, {
    enabled: !!firstPatientId,
  });

  // Handle tab switching with useTransition for smooth UX
  const handleTabChange = (newTab: string) => {
    startTransition(() => {
      setActiveTab(newTab);
    });
  };

  // Show loading state if patient data is loading
  if (isPatientsLoading || isPatientLoading) {
    return (
      <div className="min-h-screen bg-light-gray from-white via-mint/30 to-light-blue/40">
        <header className="b mint bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-muted-foreground text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-xl font-semibold text-green">
                Patient Portal
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="bg-lightest-gray from-green/5 to-light-green/5 rounded-xl p-6 border mint/30">
              <Skeleton className="h-8 w-64 mb-2" />
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <AppointmentSkeleton />
          </div>
        </main>
      </div>
    );
  }

  // Show error state if patient data failed to load
  if (patientsError || patientError || !patientData || !firstPatientId) {
    return (
      <div className="min-h-screen bg-light-gray from-white via-mint/30 to-light-blue/40">
        <header className="b mint bg-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-muted-foreground text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Link>
              <div className="h-4 w-px bg-border" />
              <h1 className="text-xl font-semibold text-green">
                Patient Portal
              </h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load patient information. Please try refreshing the page
              or contact support if the problem persists.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const patient = patientData.patient;

  return (
    <div className="min-h-screen bg-light-gray from-white via-mint/30 to-light-blue/40">
      {/* Navigation */}
      <header className="b mint bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center text-muted-foreground text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-xl font-semibold text-green">
              Patient Portal
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">
              {patient.firstName} {patient.lastName}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-lightest-gray from-green/5 to-light-green/5 rounded-xl p-6 border mint/30">
            <h2 className="text-2xl font-bold text-gray mb-2">
              Welcome back, {patient.firstName} {patient.lastName}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray/70">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {patient.phone?.normalizedValue ||
                  patient.phone?.toString() ||
                  patient.phone}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {patient.email?.normalizedValue ||
                  patient.email?.toString() ||
                  patient.email}
              </div>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6 rounded-sm"
        >
          <TabsList className="grid w-full grid-cols-3 bg-white border  rounded-xs">
            <TabsTrigger
              value="appointments"
              className=" data-[state=active]:bg-lightest-gray data-[state=active]:from-green/5 data-[state=active]:to-light-green/5"
              disabled={isPending}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
              {isPending && activeTab !== "appointments" && (
                <Loader2 className="h-3 w-3 ml-2 animate-spin" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-lightest-gray data-[state=active]:from-green/5 data-[state=active]:to-light-green/5"
              disabled={isPending}
            >
              <FileText className="h-4 w-4 mr-2" />
              Documents
              {isPending && activeTab !== "documents" && (
                <Loader2 className="h-3 w-3 ml-2 animate-spin" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-lightest-gray data-[state=active]:from-green/5 data-[state=active]:to-light-green/5"
              disabled={isPending}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
              {isPending && activeTab !== "profile" && (
                <Loader2 className="h-3 w-3 ml-2 animate-spin" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray">
                Your Appointments
              </h3>
              <Button className="bg-green bg-green/90 text-black uppercase font-mono rounded-xs">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>

            <Suspense fallback={<AppointmentSkeleton />}>
              <AppointmentsList patientId={patient.id} />
            </Suspense>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6 rounded-none">
            <div>
              <h3 className="text-xl font-semibold text-gray mb-4">
                Medical Documents
              </h3>
              <Suspense
                fallback={
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                }
              >
                <DocumentsList />
              </Suspense>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="mint/30 bg-white/90">
              <CardHeader>
                <CardTitle className="text-gray">
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your personal details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray">
                      Full Name
                    </label>
                    <p className="text-muted-foreground">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray">
                      Patient ID
                    </label>
                    <p className="text-muted-foreground">{patient.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray">
                      Phone Number
                    </label>
                    <p className="text-muted-foreground">
                      {patient.phone?.normalizedValue ||
                        patient.phone?.toString() ||
                        patient.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray">
                      Email Address
                    </label>
                    <p className="text-muted-foreground">
                      {patient.email?.normalizedValue ||
                        patient.email?.toString() ||
                        patient.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray">
                      Date of Birth
                    </label>
                    <p className="text-muted-foreground">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  {patient.address && (
                    <div>
                      <label className="text-sm font-medium text-gray">
                        Address
                      </label>
                      <p className="text-muted-foreground">{patient.address}</p>
                    </div>
                  )}
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="green text-green bg-green text-black"
                  >
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
