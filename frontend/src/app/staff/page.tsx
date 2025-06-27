"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Phone
} from "lucide-react";
import Link from "next/link";

/**
 * Staff Dashboard - Admin portal for front desk and nursing staff
 * 
 * React 18/19 Features to implement:
 * - useTransition() for queue management updates without blocking UI
 * - startTransition() for non-urgent patient search operations
 * - useDeferredValue() for real-time patient search filtering
 * - Suspense for appointment and patient data loading
 * - useOptimistic() for queue status changes and SMS notifications
 */
export default function StaffDashboard() {
  // Mock data - replace with actual API calls later
  const staffInfo = {
    name: "Jennifer Wong",
    role: "Front Desk Coordinator",
    id: "S001"
  };

  const todayStats = {
    totalAppointments: 12,
    checkedIn: 8,
    inProgress: 2,
    completed: 4,
    noShows: 1
  };

  const patientQueue = [
    {
      id: "Q001",
      patient: "Sarah Chen",
      patientId: "P001",
      appointmentTime: "10:30 AM",
      doctor: "Dr. Lim Wei Ming",
      status: "checked_in",
      queueNumber: 3,
      checkinTime: "10:25 AM"
    },
    {
      id: "Q002",
      patient: "John Lim",
      patientId: "P003", 
      appointmentTime: "11:00 AM",
      doctor: "Dr. Sarah Tan",
      status: "in_progress",
      queueNumber: 1,
      checkinTime: "10:55 AM"
    },
    {
      id: "Q003",
      patient: "Mary Wong",
      patientId: "P005",
      appointmentTime: "2:00 PM", 
      doctor: "Dr. Lim Wei Ming",
      status: "waiting",
      queueNumber: 4,
      checkinTime: "1:45 PM"
    }
  ];

  const upcomingAppointments = [
    {
      id: "A007",
      time: "3:30 PM",
      patient: "David Tan",
      patientId: "P002",
      doctor: "Dr. Sarah Tan",
      type: "Follow-up",
      status: "scheduled"
    },
    {
      id: "A008",
      time: "4:00 PM", 
      patient: "Lisa Kim",
      patientId: "P006",
      doctor: "Dr. Lim Wei Ming",
      type: "Initial Assessment",
      status: "scheduled"
    }
  ];

  const getQueueStatusIcon = (status: string) => {
    switch (status) {
      case "checked_in":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <Activity className="h-4 w-4" />;
      case "ready":
        return <Bell className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getQueueStatusColor = (status: string) => {
    switch (status) {
      case "checked_in":
        return "bg-sky/15 text-deep-blue border-sky/30";
      case "in_progress":
        return "bg-orange/15 text-orange border-orange/30";
      case "ready":
        return "bg-grass/15 text-forest border-grass/30";
      case "completed":
        return "bg-mint/15 text-charcoal border-mint/30";
      default:
        return "bg-rose/15 text-rose border-rose/30";
    }
  };

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
              <div className="text-sm font-medium">{staffInfo.name}</div>
              <div className="text-xs text-muted-foreground">{staffInfo.role}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Daily Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-orange/15 bg-gradient-to-br from-orange/3 to-rose/5">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-charcoal">{todayStats.totalAppointments}</p>
                <p className="text-sm text-orange">Total Today</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-sky/15 bg-gradient-to-br from-sky/3 to-pale-blue/5">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-charcoal">{todayStats.checkedIn}</p>
                <p className="text-sm text-deep-blue">Checked In</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange/15 bg-gradient-to-br from-orange/3 to-orange/5">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-charcoal">{todayStats.inProgress}</p>
                <p className="text-sm text-orange">In Progress</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-grass/15 bg-gradient-to-br from-grass/3 to-mint/5">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-charcoal">{todayStats.completed}</p>
                <p className="text-sm text-forest">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-rose/15 bg-gradient-to-br from-rose/3 to-rose/5">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-charcoal">{todayStats.noShows}</p>
                <p className="text-sm text-rose">No Shows</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-mint/20">
            <TabsTrigger value="queue" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange/5 data-[state=active]:to-rose/5">
              <Users className="h-4 w-4 mr-2" />
              Patient Queue
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange/5 data-[state=active]:to-rose/5">
              <Calendar className="h-4 w-4 mr-2" />
              Today&apos;s Schedule
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange/5 data-[state=active]:to-rose/5">
              <Search className="h-4 w-4 mr-2" />
              Patient Search
            </TabsTrigger>
          </TabsList>

          {/* Patient Queue Tab */}
          <TabsContent value="queue" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-charcoal">Current Patient Queue</h3>
              <Button className="bg-orange hover:bg-orange/90 text-white">
                <Bell className="h-4 w-4 mr-2" />
                Send SMS Notification
              </Button>
            </div>

            <div className="space-y-4">
              {patientQueue.map((patient) => (
                <Card key={patient.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Badge className={`${getQueueStatusColor(patient.status)} flex items-center gap-1`}>
                            {getQueueStatusIcon(patient.status)}
                            {patient.status.replace('_', ' ')}
                          </Badge>
                          <div className="bg-orange/10 text-orange px-3 py-1 rounded-full text-sm font-medium">
                            Queue #{patient.queueNumber}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-charcoal text-lg">{patient.patient}</h4>
                          <p className="text-muted-foreground">ID: {patient.patientId}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Appointment: {patient.appointmentTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {patient.doctor}
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Checked in: {patient.checkinTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white">
                          <Phone className="h-4 w-4 mr-2" />
                          SMS
                        </Button>
                        {patient.status === "checked_in" && (
                          <Button size="sm" className="bg-orange hover:bg-orange/90 text-white">
                            Ready for Doctor
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-charcoal">
                Upcoming Appointments - {new Date().toLocaleDateString()}
              </h3>
              <Button variant="outline" className="border-orange text-orange hover:bg-orange hover:text-white">
                Export Schedule
              </Button>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-sky/15 text-deep-blue border-sky/30">
                            {appointment.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{appointment.id}</span>
                        </div>
                        <h4 className="font-semibold text-charcoal text-lg">{appointment.patient}</h4>
                        <p className="text-muted-foreground">ID: {appointment.patientId}</p>
                        <p className="text-orange font-medium">{appointment.type}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {appointment.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {appointment.doctor}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-orange text-orange hover:bg-orange hover:text-white">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Patient Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card className="border-mint/30 bg-white/90">
              <CardHeader>
                <CardTitle className="text-charcoal">Patient Search</CardTitle>
                <CardDescription>Search for patient records and appointment history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Patient search interface</p>
                  <p className="text-sm">This section will be implemented with advanced search and filtering</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}