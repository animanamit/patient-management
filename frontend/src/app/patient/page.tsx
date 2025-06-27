"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  Plus,
  ArrowLeft,
  User,
  Phone,
  Mail
} from "lucide-react";
import Link from "next/link";

/**
 * Patient Dashboard - Main portal for patients
 * 
 * React 18/19 Features to implement:
 * - useTransition() for smooth tab switching without blocking UI
 * - useDeferredValue() for search/filter operations
 * - Suspense for appointment history loading
 * - useOptimistic() for appointment booking optimistic updates
 */
export default function PatientDashboard() {
  // Mock data - replace with actual API calls later
  const patientInfo = {
    name: "Sarah Chen",
    phone: "+65 9123 4567",
    email: "sarah.chen@email.com",
    id: "P001"
  };

  const upcomingAppointments = [
    {
      id: "A001",
      date: "2025-01-15",
      time: "10:30 AM",
      doctor: "Dr. Lim Wei Ming",
      type: "Follow-up Consultation",
      status: "confirmed"
    },
    {
      id: "A002", 
      date: "2025-01-22",
      time: "2:00 PM",
      doctor: "Dr. Sarah Tan",
      type: "Physiotherapy Session",
      status: "confirmed"
    }
  ];

  const documents = [
    {
      id: "D001",
      name: "Exercise Plan - January 2025",
      type: "PDF",
      date: "2025-01-10",
      size: "2.3 MB"
    },
    {
      id: "D002",
      name: "MRI Scan Results",
      type: "PDF", 
      date: "2025-01-08",
      size: "8.7 MB"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-mint/30 to-pale-blue/40">
      {/* Navigation */}
      <header className="border-b border-mint bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portal
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-xl font-semibold text-forest">Patient Portal</h1>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{patientInfo.name}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-forest/5 to-grass/5 rounded-xl p-6 border border-mint/30">
            <h2 className="text-2xl font-bold text-charcoal mb-2">
              Welcome back, {patientInfo.name}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-charcoal/70">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {patientInfo.phone}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {patientInfo.email}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-mint/20">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest/5 data-[state=active]:to-grass/5">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest/5 data-[state=active]:to-grass/5">
              <FileText className="h-4 w-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-forest/5 data-[state=active]:to-grass/5">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-charcoal">Your Appointments</h3>
              <Button className="bg-forest hover:bg-forest/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>

            <div className="grid gap-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="secondary"
                            className="bg-gradient-to-r from-grass/20 to-mint/40 text-charcoal border-grass/30"
                          >
                            {appointment.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">#{appointment.id}</span>
                        </div>
                        <h4 className="font-semibold text-charcoal">{appointment.type}</h4>
                        <p className="text-muted-foreground">with {appointment.doctor}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(appointment.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-forest text-forest hover:bg-forest hover:text-white">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-charcoal mb-4">Medical Documents</h3>
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <Card key={doc.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-sky/10 to-pale-blue/20 rounded-lg">
                            <FileText className="h-5 w-5 text-deep-blue" />
                          </div>
                          <div>
                            <h4 className="font-medium text-charcoal">{doc.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{doc.type}</span>
                              <span>•</span>
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>{new Date(doc.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-deep-blue hover:bg-deep-blue/10">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-mint/30 bg-white/90">
              <CardHeader>
                <CardTitle className="text-charcoal">Profile Information</CardTitle>
                <CardDescription>Your personal details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-charcoal">Full Name</label>
                    <p className="text-muted-foreground">{patientInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal">Patient ID</label>
                    <p className="text-muted-foreground">{patientInfo.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal">Phone Number</label>
                    <p className="text-muted-foreground">{patientInfo.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-charcoal">Email Address</label>
                    <p className="text-muted-foreground">{patientInfo.email}</p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button variant="outline" className="border-forest text-forest hover:bg-forest hover:text-white">
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