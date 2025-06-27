"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle
} from "lucide-react";
import Link from "next/link";

/**
 * Doctor Dashboard - Main portal for doctors/physiotherapists
 * 
 * React 18/19 Features to implement:
 * - useTransition() for appointment status updates without blocking
 * - startTransition() for non-urgent state updates
 * - useDeferredValue() for patient search functionality  
 * - Suspense for patient history data loading
 * - useOptimistic() for real-time appointment status changes
 */
export default function DoctorDashboard() {
  // Mock data - replace with actual API calls later
  const doctorInfo = {
    name: "Dr. Lim Wei Ming",
    specialization: "Senior Physiotherapist",
    id: "D001"
  };

  const todayAppointments = [
    {
      id: "A001",
      time: "09:00 AM",
      patient: "Sarah Chen",
      patientId: "P001",
      type: "Follow-up Consultation",
      status: "scheduled",
      duration: "30 min"
    },
    {
      id: "A003",
      time: "10:30 AM", 
      patient: "John Lim",
      patientId: "P003",
      type: "Initial Assessment",
      status: "in_progress",
      duration: "45 min"
    },
    {
      id: "A005",
      time: "02:00 PM",
      patient: "Mary Wong",
      patientId: "P005", 
      type: "Physiotherapy Session",
      status: "scheduled",
      duration: "60 min"
    }
  ];

  const recentPatients = [
    {
      id: "P001",
      name: "Sarah Chen",
      lastVisit: "2025-01-10",
      condition: "Lower Back Pain",
      status: "ongoing"
    },
    {
      id: "P002", 
      name: "David Tan",
      lastVisit: "2025-01-08",
      condition: "Shoulder Rehabilitation",
      status: "completed"
    },
    {
      id: "P003",
      name: "John Lim", 
      lastVisit: "2025-01-05",
      condition: "Knee Injury Recovery",
      status: "ongoing"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Activity className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-sky/20 text-deep-blue border-sky/30";
      case "in_progress":
        return "bg-orange/20 text-orange border-orange/30";
      case "completed":
        return "bg-grass/20 text-forest border-grass/30";
      case "cancelled":
        return "bg-rose/20 text-rose border-rose/30";
      default:
        return "bg-mint/20 text-charcoal border-mint/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pale-blue/20 to-sky/30">
      {/* Navigation */}
      <header className="border-b border-mint bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-xl font-semibold text-deep-blue">Doctor Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="text-right">
              <div className="text-sm font-medium">{doctorInfo.name}</div>
              <div className="text-xs text-muted-foreground">{doctorInfo.specialization}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-deep-blue/15 bg-gradient-to-br from-deep-blue/3 to-sky/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-deep-blue">Today&apos;s Appointments</p>
                  <p className="text-2xl font-bold text-charcoal">{todayAppointments.length}</p>
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
                    {todayAppointments.filter(apt => apt.status === "in_progress").length}
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
                  <p className="text-sm font-medium text-forest">Active Patients</p>
                  <p className="text-2xl font-bold text-charcoal">
                    {recentPatients.filter(p => p.status === "ongoing").length}
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
                  <p className="text-sm font-medium text-deep-blue">Completed Today</p>
                  <p className="text-2xl font-bold text-charcoal">2</p>
                </div>
                <CheckCircle className="h-8 w-8 text-deep-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-mint/20">
            <TabsTrigger value="schedule" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-deep-blue/5 data-[state=active]:to-sky/5">
              <Calendar className="h-4 w-4 mr-2" />
              Today&apos;s Schedule
            </TabsTrigger>
            <TabsTrigger value="patients" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-deep-blue/5 data-[state=active]:to-sky/5">
              <Users className="h-4 w-4 mr-2" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-deep-blue/5 data-[state=active]:to-sky/5">
              <FileText className="h-4 w-4 mr-2" />
              Clinical Notes
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-charcoal">
                Today&apos;s Appointments - {new Date().toLocaleDateString()}
              </h3>
              <Button variant="outline" className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white">
                View Full Calendar
              </Button>
            </div>

            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{appointment.id}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-charcoal text-lg">{appointment.patient}</h4>
                          <p className="text-muted-foreground">ID: {appointment.patientId}</p>
                        </div>
                        <p className="text-deep-blue font-medium">{appointment.type}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {appointment.duration}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white">
                          View Patient
                        </Button>
                        {appointment.status === "scheduled" && (
                          <Button size="sm" className="bg-orange hover:bg-orange/90 text-white">
                            Start Session
                          </Button>
                        )}
                        {appointment.status === "in_progress" && (
                          <Button size="sm" className="bg-forest hover:bg-forest/90 text-white">
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-charcoal">Recent Patients</h3>
              <Button variant="outline" className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white">
                Search All Patients
              </Button>
            </div>

            <div className="grid gap-4">
              {recentPatients.map((patient) => (
                <Card key={patient.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-charcoal">{patient.name}</h4>
                          <Badge className={patient.status === "ongoing" ? "bg-grass/20 text-forest border-grass/30" : "bg-mint/20 text-charcoal border-mint/30"}>
                            {patient.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">ID: {patient.id}</p>
                        <p className="text-deep-blue font-medium">{patient.condition}</p>
                        <p className="text-sm text-muted-foreground">
                          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white">
                        View History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Clinical Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card className="border-mint/30 bg-white/90">
              <CardHeader>
                <CardTitle className="text-charcoal">Clinical Notes</CardTitle>
                <CardDescription>Manage patient notes and documentation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Clinical notes management interface</p>
                  <p className="text-sm">This section will be implemented with patient-specific note editing</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}