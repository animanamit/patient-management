"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, Stethoscope } from "lucide-react";
import Link from "next/link";

/**
 * Landing page for CarePulse
 *
 * React 18/19 Features to implement:
 * - useId() for unique IDs in accessibility landmarks
 * - Concurrent rendering for smooth animations
 * - Suspense boundaries for loading states when adding auth
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F8F4ED]">
      {/* Header */}
      <header className=" bg-[#F8F4ED]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-forest">CarePulse</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-6">
            CarePulse Clinic Portal
          </h2>
          <p className="text-lg text-charcoal/70 mb-8 max-w-xl mx-auto">
            Select your role to access the clinic management system
          </p>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="border-forest/10 hover:border-forest/20 transition-colors cursor-pointer bg-white/90">
              <CardHeader className="text-center">
                <Calendar className="h-12 w-12 text-forest mx-auto mb-4" />
                <CardTitle className="text-forest">Patients</CardTitle>
                <CardDescription>
                  Manage appointments and access medical records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/patient" className="w-full">
                  <Button className="w-full bg-forest hover:bg-forest/90 text-white">
                    Patient Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-sky/10 hover:border-sky/20 transition-colors cursor-pointer bg-white/90">
              <CardHeader className="text-center">
                <Stethoscope className="h-12 w-12 text-deep-blue mx-auto mb-4" />
                <CardTitle className="text-deep-blue">Doctors</CardTitle>
                <CardDescription>
                  View schedule, patient history, and clinical notes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/doctor" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white"
                  >
                    Doctor Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-orange/10 hover:border-orange/20 transition-colors cursor-pointer bg-white/90">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-orange mx-auto mb-4" />
                <CardTitle className="text-orange">Staff</CardTitle>
                <CardDescription>
                  Monitor clinic operations and manage patient flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/staff" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-orange text-orange hover:bg-orange hover:text-white"
                  >
                    Staff Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* iPad Check-in Link */}
          <div className="mt-12">
            <Card className="border-grass/30 bg-white/90">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-grass mb-2">
                  Patient Check-in
                </h3>
                <p className="text-charcoal/70 mb-4">
                  For patients arriving at the clinic
                </p>
                <Link href="/check-in">
                  <Button
                    variant="outline"
                    className="border-grass text-grass hover:bg-grass hover:text-white"
                  >
                    Check In Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
