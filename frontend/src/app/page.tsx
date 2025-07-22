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
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-xs z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      
      {/* Header - Mobile Optimized */}
      <header className="bg-white border-b border-gray-200" role="banner">
        <div className="px-4 py-4 md:px-6 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-6 md:h-6 bg-blue-500 rounded-sm flex items-center justify-center">
                <Heart className="h-4 w-4 md:h-3.5 md:w-3.5 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-xl md:text-base font-bold md:font-semibold text-gray-900">
                CarePulse
              </h1>
            </div>
            
            {/* Mobile Check-in Button */}
            <Link
              href="/check-in"
              className="md:hidden bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-full active:bg-blue-700 transition-colors"
            >
              Check In
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4" role="navigation" aria-label="Top navigation">
              <Link
                href="/about"
                className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xs px-2 py-1"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xs px-2 py-1"
              >
                Contact
              </Link>
              <Link
                href="/check-in"
                className="bg-gray-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-gray-800 border border-gray-900 hover:border-gray-800 transition-colors rounded-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Check In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile First */}
      <main id="main-content" className="px-4 py-6 md:p-6" role="main">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section - Mobile Optimized */}
          <section className="mb-8 md:mb-12" aria-labelledby="hero-heading">
            <div className="text-center mb-8">
              <h2 id="hero-heading" className="text-2xl md:text-2xl font-bold md:font-semibold text-gray-900 mb-3 md:mb-2">
                Healthcare Management System
              </h2>
              <p className="text-base md:text-sm text-gray-600 max-w-2xl mx-auto px-4 md:px-0">
                Digital platform for physiotherapy clinic management
              </p>
            </div>
          </section>

          {/* System Access - Mobile Stack */}
          <div className="space-y-4 md:grid md:grid-cols-12 md:gap-6 mb-8 md:mb-12">
            {/* Check-in Section - Mobile Hero Card */}
            <div className="md:col-span-12 lg:col-span-4">
              <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-6">
                <div className="flex items-start gap-4 md:gap-3 mb-4">
                  <div className="w-12 h-12 md:w-8 md:h-8 bg-blue-50 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 md:h-4 md:w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg md:text-sm font-bold md:font-semibold text-gray-900">
                      Patient Check-in
                    </h2>
                    <p className="text-sm md:text-xs text-gray-500 mt-1 md:mt-0">
                      Quick clinic arrival process
                    </p>
                  </div>
                </div>
                <p className="text-base md:text-xs text-gray-600 mb-6">
                  Streamlined check-in process for patients arriving at the
                  clinic with queue management.
                </p>
                <Link
                  href="/check-in"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 md:px-4 md:py-2 text-base md:text-xs font-semibold md:font-medium hover:bg-blue-700 active:bg-blue-700 border border-blue-600 hover:border-blue-700 transition-colors w-full justify-center rounded-2xl md:rounded-xs"
                >
                  Start Check-in
                  <ArrowRight className="h-4 w-4 md:h-3 md:w-3 ml-2" />
                </Link>
              </div>
            </div>

            {/* Portal Access - Mobile Cards */}
            <div className="md:col-span-12 lg:col-span-8">
              <div className="space-y-4 md:grid md:grid-cols-3 md:gap-4 md:h-full">
                {/* Patient Portal */}
                <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4">
                  <div className="flex items-start gap-3 md:gap-2 mb-4 md:mb-3">
                    <div className="w-10 h-10 md:w-6 md:h-6 bg-green-50 rounded-sm flex items-center justify-center flex-shrink-0">
                      <UserCheck className="h-5 w-5 md:h-3.5 md:w-3.5 text-green-600" />
                    </div>
                    <h3 className="text-lg md:text-sm font-bold md:font-semibold text-gray-900">
                      Patient Portal
                    </h3>
                  </div>
                  <p className="text-base md:text-xs text-gray-600 mb-5 md:mb-4">
                    View appointments, medical documents, and manage your
                    profile
                  </p>
                  <Link
                    href="/patient"
                    className="inline-flex items-center bg-green-600 text-white px-5 py-3 md:px-3 md:py-1.5 text-base md:text-xs font-semibold md:font-medium hover:bg-green-700 active:bg-green-700 border border-green-600 hover:border-green-700 transition-colors w-full justify-center rounded-2xl md:rounded-xs"
                  >
                    Access Portal
                    <ArrowRight className="h-4 w-4 md:h-3 md:w-3 ml-2 md:ml-1" />
                  </Link>
                </div>

                {/* Doctor Portal */}
                <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4">
                  <div className="flex items-start gap-3 md:gap-2 mb-4 md:mb-3">
                    <div className="w-10 h-10 md:w-6 md:h-6 bg-purple-50 rounded-sm flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="h-5 w-5 md:h-3.5 md:w-3.5 text-purple-600" />
                    </div>
                    <h3 className="text-lg md:text-sm font-bold md:font-semibold text-gray-900">
                      Doctor Dashboard
                    </h3>
                  </div>
                  <p className="text-base md:text-xs text-gray-600 mb-5 md:mb-4">
                    View schedule, patient history, and clinical notes
                  </p>
                  <Link
                    href="/doctor"
                    className="inline-flex items-center bg-purple-600 text-white px-5 py-3 md:px-3 md:py-1.5 text-base md:text-xs font-semibold md:font-medium hover:bg-purple-700 active:bg-purple-700 border border-purple-600 hover:border-purple-700 transition-colors w-full justify-center rounded-2xl md:rounded-xs"
                  >
                    Access Dashboard
                    <ArrowRight className="h-4 w-4 md:h-3 md:w-3 ml-2 md:ml-1" />
                  </Link>
                </div>

                {/* Staff Portal */}
                <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4">
                  <div className="flex items-start gap-3 md:gap-2 mb-4 md:mb-3">
                    <div className="w-10 h-10 md:w-6 md:h-6 bg-orange-50 rounded-sm flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 md:h-3.5 md:w-3.5 text-orange-600" />
                    </div>
                    <h3 className="text-lg md:text-sm font-bold md:font-semibold text-gray-900">
                      Staff Dashboard
                    </h3>
                  </div>
                  <p className="text-base md:text-xs text-gray-600 mb-5 md:mb-4">
                    Monitor clinic operations and manage patient flow
                  </p>
                  <Link
                    href="/staff"
                    className="inline-flex items-center bg-orange-600 text-white px-5 py-3 md:px-3 md:py-1.5 text-base md:text-xs font-semibold md:font-medium hover:bg-orange-700 active:bg-orange-700 border border-orange-600 hover:border-orange-700 transition-colors w-full justify-center rounded-2xl md:rounded-xs"
                  >
                    Access Dashboard
                    <ArrowRight className="h-4 w-4 md:h-3 md:w-3 ml-2 md:ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section - Mobile Optimized */}
          <div className="mb-8 md:mb-12">
            <div className="mb-6 text-center md:text-left">
              <h2 className="text-xl md:text-base font-bold md:font-semibold text-gray-900 mb-2 md:mb-1">
                Platform Features
              </h2>
              <p className="text-base md:text-xs text-gray-600">
                Comprehensive tools for modern healthcare management
              </p>
            </div>

            <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
              <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4">
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 bg-blue-50 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 md:h-3.5 md:w-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium text-gray-900 mb-2 md:mb-1">
                      Appointment Management
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Schedule, reschedule, and track appointments with ease
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4">
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 bg-green-50 rounded-sm flex items-center justify-center flex-shrink-0">
                    <UserCheck className="h-5 w-5 md:h-3.5 md:w-3.5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium text-gray-900 mb-2 md:mb-1">
                      Patient Records
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Digital records with secure access and document management
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4">
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 bg-purple-50 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="h-5 w-5 md:h-3.5 md:w-3.5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium text-gray-900 mb-2 md:mb-1">
                      Clinical Tools
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Comprehensive tools for clinical assessment and treatment
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4">
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 bg-orange-50 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 md:h-3.5 md:w-3.5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium text-gray-900 mb-2 md:mb-1">
                      Staff Management
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Efficient workflow management and staff coordination
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4">
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 bg-blue-50 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Heart className="h-5 w-5 md:h-3.5 md:w-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium text-gray-900 mb-2 md:mb-1">
                      Digital Check-in
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Contactless check-in process with queue management
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4">
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 bg-green-50 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 md:h-3.5 md:w-3.5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium text-gray-900 mb-2 md:mb-1">
                      Analytics & Reporting
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Real-time insights and comprehensive reporting tools
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status - Mobile Friendly */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-sm  p-5 md:p-4 mb-6 md:mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div className="flex items-center gap-3 md:gap-2">
                <div className="h-3 w-3 md:h-2 md:w-2 rounded-full bg-green-500" />
                <span className="text-base md:text-xs font-semibold md:font-medium text-gray-900">
                  All Systems Operational
                </span>
              </div>
              <span className="text-sm md:text-xs text-gray-500">
                Last updated: Just now
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
