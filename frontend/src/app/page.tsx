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
    <div className="min-h-screen" style={{ backgroundColor: '#F8FBF7' }}>
      {/* Skip to main content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-xs z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      
      {/* Header - Mobile Optimized */}
      <header className="border-b" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }} role="banner">
        <div className="px-4 py-4 md:px-6 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-6 md:h-6 rounded-sm flex items-center justify-center" style={{ backgroundColor: '#6B9A65' }}>
                <Heart className="h-4 w-4 md:h-3.5 md:w-3.5 text-white" aria-hidden="true" />
              </div>
              <h1 className="text-xl md:text-base font-bold md:font-semibold" style={{ color: '#2D5A29' }}>
                CarePulse
              </h1>
            </div>
            
            {/* Mobile Check-in Button */}
            <Link
              href="/check-in"
              className="md:hidden text-white px-4 py-2 text-sm font-semibold rounded-full transition-colors"
              style={{ backgroundColor: '#6B9A65' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4A7A44'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6B9A65'}
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
                className="text-white px-3 py-1.5 text-xs font-medium transition-colors rounded-xs focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  backgroundColor: '#2D5A29',
                  borderColor: '#2D5A29',
                  '--tw-ring-color': '#6B9A65'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4A7A44';
                  e.currentTarget.style.borderColor = '#4A7A44';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2D5A29';
                  e.currentTarget.style.borderColor = '#2D5A29';
                }}
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
              <h2 id="hero-heading" className="text-2xl md:text-2xl font-bold md:font-semibold mb-3 md:mb-2" style={{ color: '#2D5A29' }}>
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
              <div className="border-0 md:border rounded-sm p-5 md:p-6" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="flex items-start gap-4 md:gap-3 mb-4">
                  <div className="w-12 h-12 md:w-8 md:h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F8FBF7' }}>
                    <Heart className="h-6 w-6 md:h-4 md:w-4" style={{ color: '#6B9A65' }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg md:text-sm font-bold md:font-semibold" style={{ color: '#2D5A29' }}>
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
                  className="inline-flex items-center text-white px-6 py-3 md:px-4 md:py-2 text-base md:text-xs font-semibold md:font-medium border transition-colors w-full justify-center rounded-2xl md:rounded-xs"
                  style={{ 
                    backgroundColor: '#6B9A65',
                    borderColor: '#6B9A65'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4A7A44';
                    e.currentTarget.style.borderColor = '#4A7A44';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#6B9A65';
                    e.currentTarget.style.borderColor = '#6B9A65';
                  }}
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
                <div className="border-0 md:border rounded-sm p-5 md:p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                  <div className="flex items-start gap-3 md:gap-2 mb-4 md:mb-3">
                    <div className="w-10 h-10 md:w-6 md:h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDF5E9' }}>
                      <UserCheck className="h-5 w-5 md:h-3.5 md:w-3.5" style={{ color: '#6B9A65' }} />
                    </div>
                    <h3 className="text-lg md:text-sm font-bold md:font-semibold" style={{ color: '#2D5A29' }}>
                      Patient Portal
                    </h3>
                  </div>
                  <p className="text-base md:text-xs text-gray-600 mb-5 md:mb-4">
                    View appointments, medical documents, and manage your
                    profile
                  </p>
                  <Link
                    href="/patient"
                    className="inline-flex items-center text-white px-5 py-3 md:px-3 md:py-1.5 text-base md:text-xs font-semibold md:font-medium border transition-colors w-full justify-center rounded-2xl md:rounded-xs"
                    style={{ 
                      backgroundColor: '#6B9A65',
                      borderColor: '#6B9A65'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4A7A44';
                      e.currentTarget.style.borderColor = '#4A7A44';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#6B9A65';
                      e.currentTarget.style.borderColor = '#6B9A65';
                    }}
                  >
                    Access Portal
                    <ArrowRight className="h-4 w-4 md:h-3 md:w-3 ml-2 md:ml-1" />
                  </Link>
                </div>

                {/* Doctor Portal */}
                <div className="border-0 md:border rounded-sm p-5 md:p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                  <div className="flex items-start gap-3 md:gap-2 mb-4 md:mb-3">
                    <div className="w-10 h-10 md:w-6 md:h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EBF1F8' }}>
                      <Stethoscope className="h-5 w-5 md:h-3.5 md:w-3.5" style={{ color: '#5C7B9E' }} />
                    </div>
                    <h3 className="text-lg md:text-sm font-bold md:font-semibold" style={{ color: '#2D5A29' }}>
                      Doctor Dashboard
                    </h3>
                  </div>
                  <p className="text-base md:text-xs text-gray-600 mb-5 md:mb-4">
                    View schedule, patient history, and clinical notes
                  </p>
                  <Link
                    href="/doctor"
                    className="inline-flex items-center text-white px-5 py-3 md:px-3 md:py-1.5 text-base md:text-xs font-semibold md:font-medium border transition-colors w-full justify-center rounded-2xl md:rounded-xs"
                    style={{ 
                      backgroundColor: '#5C7B9E',
                      borderColor: '#5C7B9E'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3D5A7A';
                      e.currentTarget.style.borderColor = '#3D5A7A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#5C7B9E';
                      e.currentTarget.style.borderColor = '#5C7B9E';
                    }}
                  >
                    Access Dashboard
                    <ArrowRight className="h-4 w-4 md:h-3 md:w-3 ml-2 md:ml-1" />
                  </Link>
                </div>

                {/* Staff Portal */}
                <div className="border-0 md:border rounded-sm p-5 md:p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                  <div className="flex items-start gap-3 md:gap-2 mb-4 md:mb-3">
                    <div className="w-10 h-10 md:w-6 md:h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#F5E8DF' }}>
                      <Users className="h-5 w-5 md:h-3.5 md:w-3.5" style={{ color: '#A66B42' }} />
                    </div>
                    <h3 className="text-lg md:text-sm font-bold md:font-semibold" style={{ color: '#2D5A29' }}>
                      Staff Dashboard
                    </h3>
                  </div>
                  <p className="text-base md:text-xs text-gray-600 mb-5 md:mb-4">
                    Monitor clinic operations and manage patient flow
                  </p>
                  <Link
                    href="/staff"
                    className="inline-flex items-center text-white px-5 py-3 md:px-3 md:py-1.5 text-base md:text-xs font-semibold md:font-medium border transition-colors w-full justify-center rounded-2xl md:rounded-xs"
                    style={{ 
                      backgroundColor: '#A66B42',
                      borderColor: '#A66B42'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#7A4A2E';
                      e.currentTarget.style.borderColor = '#7A4A2E';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#A66B42';
                      e.currentTarget.style.borderColor = '#A66B42';
                    }}
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
              <h2 className="text-xl md:text-base font-bold md:font-semibold mb-2 md:mb-1" style={{ color: '#2D5A29' }}>
                Platform Features
              </h2>
              <p className="text-base md:text-xs text-gray-600">
                Comprehensive tools for modern healthcare management
              </p>
            </div>

            <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0">
              <div className="border-0 md:border rounded-sm p-5 md:p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDF5E9' }}>
                    <Calendar className="h-5 w-5 md:h-3.5 md:w-3.5" style={{ color: '#6B9A65' }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium mb-2 md:mb-1" style={{ color: '#2D5A29' }}>
                      Appointment Management
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Schedule, reschedule, and track appointments with ease
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-0 md:border rounded-sm p-5 md:p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDF5E9' }}>
                    <UserCheck className="h-5 w-5 md:h-3.5 md:w-3.5" style={{ color: '#6B9A65' }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium mb-2 md:mb-1" style={{ color: '#2D5A29' }}>
                      Patient Records
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Digital records with secure access and document management
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-0 md:border rounded-sm p-5 md:p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDF5E9' }}>
                    <Stethoscope className="h-5 w-5 md:h-3.5 md:w-3.5" style={{ color: '#6B9A65' }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium mb-2 md:mb-1" style={{ color: '#2D5A29' }}>
                      Clinical Tools
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Comprehensive tools for clinical assessment and treatment
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-0 md:border rounded-sm p-5 md:p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDF5E9' }}>
                    <Users className="h-5 w-5 md:h-3.5 md:w-3.5" style={{ color: '#6B9A65' }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium mb-2 md:mb-1" style={{ color: '#2D5A29' }}>
                      Staff Management
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Efficient workflow management and staff coordination
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-0 md:border rounded-sm p-5 md:p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDF5E9' }}>
                    <Heart className="h-5 w-5 md:h-3.5 md:w-3.5" style={{ color: '#6B9A65' }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium mb-2 md:mb-1" style={{ color: '#2D5A29' }}>
                      Digital Check-in
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600">
                      Contactless check-in process with queue management
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-0 md:border rounded-sm p-5 md:p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="flex items-start gap-4 md:gap-3">
                  <div className="w-10 h-10 md:w-6 md:h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EDF5E9' }}>
                    <Calendar className="h-5 w-5 md:h-3.5 md:w-3.5" style={{ color: '#6B9A65' }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base md:text-sm font-semibold md:font-medium mb-2 md:mb-1" style={{ color: '#2D5A29' }}>
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
          <div className="border-0 md:border rounded-sm p-5 md:p-4 mb-6 md:mb-12" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <div className="flex items-center gap-3 md:gap-2">
                <div className="h-3 w-3 md:h-2 md:w-2 rounded-full" style={{ backgroundColor: '#6B9A65' }} />
                <span className="text-base md:text-xs font-semibold md:font-medium" style={{ color: '#2D5A29' }}>
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
