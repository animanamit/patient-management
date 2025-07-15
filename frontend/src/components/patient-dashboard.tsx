"use client";

import { useState, useTransition, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Download
} from "lucide-react";
import { usePatients, usePatient } from "@/hooks/use-patients";
import { usePatientAppointments } from "@/hooks/use-appointments";
import { Patient, Appointment, AppointmentWithDetails } from "@/lib/api-types";

// Loading skeletons
const PatientSkeleton = () => (
  <div className="space-y-4">
    <Card className="bg-lightest-gray">
      <CardContent className="p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Mock documents data
const mockDocuments = [
  {
    id: "1",
    name: "Blood Test Results",
    type: "Lab Report",
    date: "2024-01-15",
    size: "245 KB"
  },
  {
    id: "2", 
    name: "X-Ray - Chest",
    type: "Imaging",
    date: "2024-01-10",
    size: "1.2 MB"
  },
  {
    id: "3",
    name: "Prescription",
    type: "Medication",
    date: "2024-01-08",
    size: "98 KB"
  }
];

// Document list component
const DocumentList = ({ documents }: { documents: typeof mockDocuments }) => (
  <div className="space-y-4">
    {documents.map((doc) => (
      <Card key={doc.id} className="bg-lightest-gray">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg">
                <FileText className="h-5 w-5 text-gray" />
              </div>
              <div>
                <h4 className="font-medium text-dark-gray">{doc.name}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{doc.type}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{new Date(doc.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="bg-white text-gray">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Appointment list component
const AppointmentList = ({ appointments }: { appointments: (Appointment | AppointmentWithDetails)[] }) => (
  <div className="space-y-4">
    {appointments.map((appointment) => {
      const doctorName = ('doctor' in appointment)
        ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
        : 'Doctor information loading...';

      const getStatusColor = (status: string) => {
        switch (status) {
          case "SCHEDULED":
            return "text-dark-gray";
          case "IN_PROGRESS":
            return "bg-lightest-gray text-dark-gray";
          case "COMPLETED":
            return "bg-lightest-gray text-dark-gray";
          case "CANCELLED":
            return "bg-lightest-gray text-dark-gray";
          default:
            return "bg-lightest-gray text-dark-gray";
        }
      };

      return (
        <Card key={appointment.id} className="bg-lightest-gray">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`rounded-sm ${getStatusColor(appointment.status)}`}
                  >
                    {appointment.status.toLowerCase().replace("_", " ")}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(appointment.scheduledDateTime).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold text-dark-gray">
                  {appointment.type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                </h4>
                <p className="text-muted-foreground">{doctorName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
);

export const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState("appointments");
  const [isPending, startTransition] = useTransition();

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

  const handleTabChange = (newTab: string) => {
    startTransition(() => {
      setActiveTab(newTab);
    });
  };

  // Show loading state
  if (isPatientsLoading || isPatientLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-black mr-2" />
            <h2 className="text-2xl font-bold text-black">Patient Portal</h2>
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray" />
        </div>
        <PatientSkeleton />
      </div>
    );
  }

  // Show error state
  if (patientsError || patientError || !patientData || !firstPatientId) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-black mr-2" />
            <h2 className="text-2xl font-bold text-black">Patient Portal</h2>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load patient information. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const patient = patientData.patient;
  const appointments = appointmentsData?.appointments || [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <User className="h-8 w-8 text-black mr-2" />
          <h2 className="text-2xl font-bold text-black">Patient Portal</h2>
        </div>
        <p className="text-gray">Welcome, {patient.firstName} {patient.lastName}</p>
      </div>

      {/* Patient Welcome Section */}
      <div className="bg-lightest-gray rounded-xl p-6">
        <h3 className="text-xl font-bold text-dark-gray mb-2">
          Welcome back, {patient.firstName} {patient.lastName}
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-dark-gray/70">
          <div className="flex items-center gap-1">
            <Phone className="h-4 w-4" />
            {typeof patient.phone === 'string' ? patient.phone : patient.phone?.toString() || 'N/A'}
          </div>
          <div className="flex items-center gap-1">
            <Mail className="h-4 w-4" />
            {typeof patient.email === 'string' ? patient.email : patient.email?.toString() || 'N/A'}
          </div>
          {patient.address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {patient.address}
            </div>
          )}
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-lightest-gray rounded-sm">
          <TabsTrigger
            value="appointments"
            className="data-[state=active]:bg-white"
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
            className="data-[state=active]:bg-white"
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
            className="data-[state=active]:bg-white"
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
            <h3 className="text-xl font-semibold text-dark-gray">Your Appointments</h3>
            <Button className="bg-black text-white">Book New Appointment</Button>
          </div>

          <Suspense fallback={<PatientSkeleton />}>
            {appointments.length === 0 ? (
              <Card className="bg-lightest-gray">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-dark-gray mb-2">No appointments</h3>
                  <p className="text-muted-foreground">
                    You don't have any appointments scheduled
                  </p>
                </CardContent>
              </Card>
            ) : (
              <AppointmentList appointments={appointments} />
            )}
          </Suspense>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-dark-gray">Medical Documents</h3>
            <Button variant="outline" className="bg-lightest-gray text-gray">
              Request Document
            </Button>
          </div>

          <Suspense fallback={<PatientSkeleton />}>
            <DocumentList documents={mockDocuments} />
          </Suspense>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="bg-lightest-gray">
            <CardHeader>
              <CardTitle className="text-dark-gray">Profile Information</CardTitle>
              <CardDescription>
                Your personal details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-dark-gray">First Name</Label>
                  <Input
                    value={patient.firstName}
                    readOnly
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-dark-gray">Last Name</Label>
                  <Input
                    value={patient.lastName}
                    readOnly
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-dark-gray">Email</Label>
                  <Input
                    value={typeof patient.email === 'string' ? patient.email : patient.email?.toString() || 'N/A'}
                    readOnly
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-dark-gray">Phone</Label>
                  <Input
                    value={typeof patient.phone === 'string' ? patient.phone : patient.phone?.toString() || 'N/A'}
                    readOnly
                    className="bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-dark-gray">Address</Label>
                  <Input
                    value={patient.address || 'N/A'}
                    readOnly
                    className="bg-white"
                  />
                </div>
              </div>
              <Button variant="outline" className="bg-white text-gray">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};