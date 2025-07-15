"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Stethoscope, Heart, UserCheck } from "lucide-react";
import Link from "next/link";
import { CheckInDashboard } from "@/components/check-in-dashboard";
import { DoctorDashboard } from "@/components/doctor-dashboard";
import { PatientDashboard } from "@/components/patient-dashboard";
import { StaffDashboard } from "@/components/staff-dashboard";

/**
 * Landing page for CarePulse
 *
 * React 18/19 Features to implement:
 * - useId() for unique IDs in accessibility landmarks
 * - Concurrent rendering for smooth animations
 * - Suspense boundaries for loading states when adding auth
 */
export default function HomePage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-black">CarePulse</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/about"
              className="text-muted-foreground text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground text-foreground transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/check-in"
              className="text-muted-foreground text-foreground transition-colors"
            >
              Check In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Healthcare Management System</h1>
          <p className="text-gray">Digital platform for physiotherapy clinic management</p>
        </div>

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-lightest-gray mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white">
              <Calendar className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="checkin" className="data-[state=active]:bg-white">
              <Heart className="h-4 w-4 mr-2" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="patient" className="data-[state=active]:bg-white">
              <UserCheck className="h-4 w-4 mr-2" />
              Patient
            </TabsTrigger>
            <TabsTrigger value="doctor" className="data-[state=active]:bg-white">
              <Stethoscope className="h-4 w-4 mr-2" />
              Doctor
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-white">
              <Users className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="cursor-pointer bg-lightest-gray">
                  <CardHeader className="text-center">
                    <UserCheck className="h-12 w-12 text-black mx-auto mb-4" />
                    <CardTitle className="text-black">Patients</CardTitle>
                    <CardDescription>
                      View appointments, documents, and manage profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => setActiveTab("patient")}
                      className="w-full bg-black text-white"
                    >
                      Patient Portal
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer bg-lightest-gray">
                  <CardHeader className="text-center">
                    <Stethoscope className="h-12 w-12 text-black mx-auto mb-4" />
                    <CardTitle className="text-black">Doctors</CardTitle>
                    <CardDescription>
                      View schedule, patient history, and clinical notes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setActiveTab("doctor")}
                      variant="outline"
                      className="w-full bg-lightest-gray text-black"
                    >
                      Doctor Dashboard
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer bg-lightest-gray">
                  <CardHeader className="text-center">
                    <Users className="h-12 w-12 text-black mx-auto mb-4" />
                    <CardTitle className="text-black">Staff</CardTitle>
                    <CardDescription>
                      Monitor clinic operations and manage patient flow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => setActiveTab("staff")}
                      variant="outline"
                      className="w-full bg-lightest-gray text-black"
                    >
                      Staff Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-12">
                <Card className="bg-lightest-gray">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold text-black mb-2">
                      Patient Check-in
                    </h3>
                    <p className="text-gray mb-4">
                      For patients arriving at the clinic
                    </p>
                    <Button
                      onClick={() => setActiveTab("checkin")}
                      variant="outline"
                      className="bg-lightest-gray text-black"
                    >
                      Check In Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Check-in Tab */}
          <TabsContent value="checkin">
            <CheckInDashboard />
          </TabsContent>

          {/* Patient Tab */}
          <TabsContent value="patient">
            <PatientDashboard />
          </TabsContent>

          {/* Doctor Tab */}
          <TabsContent value="doctor">
            <DoctorDashboard />
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <StaffDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
