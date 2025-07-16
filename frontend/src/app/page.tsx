"use client";

import {
  Calendar,
  Users,
  Stethoscope,
  Heart,
  UserCheck,
  ArrowRight,
} from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                <Heart className="h-3.5 w-3.5 text-white" />
              </div>
              <h1 className="text-base font-semibold text-gray-900">
                CarePulse
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/about"
                className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/check-in"
                className="bg-gray-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-gray-800 border border-gray-900 hover:border-gray-800 transition-colors rounded-xs"
              >
                Check In
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Healthcare Management System
              </h1>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Digital platform for physiotherapy clinic management
              </p>
            </div>
          </div>

          {/* System Access Grid */}
          <div className="grid grid-cols-12 gap-6 mb-12">
            {/* Check-in Section */}
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white border border-gray-200 rounded-sm p-6 h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-50 rounded-sm flex items-center justify-center">
                    <Heart className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Patient Check-in
                    </h2>
                    <p className="text-xs text-gray-500">
                      Quick clinic arrival process
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-6">
                  Streamlined check-in process for patients arriving at the
                  clinic with queue management.
                </p>
                <Link
                  href="/check-in"
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 text-xs font-medium hover:bg-blue-700 border border-blue-600 hover:border-blue-700 transition-colors w-full justify-center rounded-xs"
                >
                  Start Check-in
                  <ArrowRight className="h-3 w-3 ml-2" />
                </Link>
              </div>
            </div>

            {/* Portal Access Grid */}
            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {/* Patient Portal */}
                <div className="bg-white border border-gray-200 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-green-50 rounded-sm flex items-center justify-center">
                      <UserCheck className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Patient Portal
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    View appointments, medical documents, and manage your
                    profile
                  </p>
                  <Link
                    href="/patient"
                    className="inline-flex items-center bg-green-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-green-700 border border-green-600 hover:border-green-700 transition-colors w-full justify-center rounded-xs"
                  >
                    Access Portal
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>

                {/* Doctor Portal */}
                <div className="bg-white border border-gray-200 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-purple-50 rounded-sm flex items-center justify-center">
                      <Stethoscope className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Doctor Dashboard
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    View schedule, patient history, and clinical notes
                  </p>
                  <Link
                    href="/doctor"
                    className="inline-flex items-center bg-purple-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-purple-700 border border-purple-600 hover:border-purple-700 transition-colors w-full justify-center rounded-xs"
                  >
                    Access Dashboard
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>

                {/* Staff Portal */}
                <div className="bg-white border border-gray-200 rounded-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-orange-50 rounded-sm flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-orange-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      Staff Dashboard
                    </h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">
                    Monitor clinic operations and manage patient flow
                  </p>
                  <Link
                    href="/staff"
                    className="inline-flex items-center bg-orange-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-orange-700 border border-orange-600 hover:border-orange-700 transition-colors w-full justify-center rounded-xs"
                  >
                    Access Dashboard
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Platform Features
              </h2>
              <p className="text-xs text-gray-600">
                Comprehensive tools for modern healthcare management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-50 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Appointment Management
                    </h4>
                    <p className="text-xs text-gray-600">
                      Schedule, reschedule, and track appointments with ease
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-50 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <UserCheck className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Patient Records
                    </h4>
                    <p className="text-xs text-gray-600">
                      Digital records with secure access and document management
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-50 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Stethoscope className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Clinical Tools
                    </h4>
                    <p className="text-xs text-gray-600">
                      Comprehensive tools for clinical assessment and treatment
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-50 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Staff Management
                    </h4>
                    <p className="text-xs text-gray-600">
                      Efficient workflow management and staff coordination
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-50 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Digital Check-in
                    </h4>
                    <p className="text-xs text-gray-600">
                      Contactless check-in process with queue management
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-50 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Analytics & Reporting
                    </h4>
                    <p className="text-xs text-gray-600">
                      Real-time insights and comprehensive reporting tools
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white border border-gray-200 rounded-sm p-4 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-gray-900">
                  All Systems Operational
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
