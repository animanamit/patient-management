"use client";

import {
  useState,
  useTransition,
  useDeferredValue,
  useMemo,
  Suspense,
} from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  UserCheck,
} from "lucide-react";
import {
  usePatientLookupByPhone,
  usePatientTodayAppointments,
  useOptimisticCheckIn,
  useQueuePosition,
} from "@/hooks/use-check-in";
import {
  Patient,
  Appointment,
  AppointmentWithDetails,
  AppointmentId,
} from "@/lib/api-types";
import { NavigationBar } from "@/components/navigation-bar";
import { WalkInRegistrationModal } from "@/components/walk-in-registration-modal";
import { useCreateAssistanceRequest } from "@/hooks/use-assistance-requests";
import { useCreatePatient } from "@/hooks/use-patients";
import { useCreateAppointment } from "@/hooks/use-appointments";
import { useActiveDoctors } from "@/hooks/use-doctors";

// Loading skeleton components - Dense grid
const QueueSkeleton = () => (
  <div className="border p-6" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
    <div className="text-center space-y-3">
      <Skeleton className="h-12 w-12 mx-auto" style={{ backgroundColor: '#E0ECDB' }} />
      <Skeleton className="h-4 w-32 mx-auto" style={{ backgroundColor: '#E0ECDB' }} />
      <Skeleton className="h-3 w-48 mx-auto" style={{ backgroundColor: '#E0ECDB' }} />
    </div>
  </div>
);

const AppointmentSkeleton = () => (
  <div className="space-y-3">
    <div className="h-16 animate-pulse" style={{ backgroundColor: '#E0ECDB' }} />
    <div className="h-16 animate-pulse" style={{ backgroundColor: '#E0ECDB' }} />
  </div>
);

// Success message component with real data
const CheckInSuccess = ({
  patient,
  appointment,
  appointmentId,
  onReset,
}: {
  patient: Patient;
  appointment: Appointment | AppointmentWithDetails;
  appointmentId: AppointmentId;
  onReset: () => void;
}) => {
  const { data: queueData, isLoading: isQueueLoading } =
    useQueuePosition(appointmentId);

  const doctorName =
    "doctor" in appointment
      ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
      : "Doctor information loading...";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#EDF5E9' }}>
          <CheckCircle className="h-6 w-6" style={{ color: '#6B9A65' }} />
        </div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: '#2D5A29' }}>
          Check-in Successful!
        </h2>
        <p className="text-sm text-gray-600">
          Welcome, {patient.firstName} {patient.lastName}
        </p>
      </div>

      {/* Appointment Details */}
      <div className="bg-white border " style={{ borderColor: '#E0ECDB' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: '#E0ECDB' }}>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Appointment Details
          </h3>
        </div>
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-500">Patient ID</span>
              <p className="text-sm font-medium text-gray-900 font-mono">
                #{patient.id.split("_")[1]}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Time</span>
              <p className="text-sm font-medium text-gray-900">
                {new Date(appointment.scheduledDateTime).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Doctor</span>
              <p className="text-sm font-medium text-gray-900">{doctorName}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Type</span>
              <p className="text-sm font-medium text-gray-900">
                {appointment.type
                  .replace("_", " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Status */}
      <Suspense fallback={<QueueSkeleton />}>
        {isQueueLoading ? (
          <QueueSkeleton />
        ) : queueData ? (
          <div className="bg-white border " style={{ borderColor: '#E0ECDB' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: '#E0ECDB' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Queue Status
                </h3>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium border border-blue-200 rounded-xs">
                  #{queueData.queueNumber}
                </span>
              </div>
            </div>
            <div className="px-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Position</span>
                  <span className="text-sm font-medium text-gray-900">
                    {queueData.position}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Est. wait</span>
                  <span className="text-sm font-medium text-gray-900">
                    {queueData.estimatedWait}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border p-4" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
            <p className="text-sm text-gray-600">Loading queue position...</p>
          </div>
        )}
      </Suspense>

      {/* Instructions */}
      <div className="bg-white border " style={{ borderColor: '#E0ECDB' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: '#E0ECDB' }}>
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            What&apos;s Next?
          </h3>
        </div>
        <div className="px-4 py-4">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>You&apos;re successfully checked in</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>You&apos;ll receive an SMS when it&apos;s your turn</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Feel free to wait in our comfortable lounge</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Please return when you receive the notification</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full text-xs font-medium text-gray-700 hover:text-gray-900 px-4 py-3 border transition-colors rounded-xs"
        style={{ 
          borderColor: '#E0ECDB',
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FBF7'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        Check In Another Patient
      </button>
    </div>
  );
};

export default function CheckInPage() {
  // React 18/19 hooks for enhanced UX
  const [phoneInput, setPhoneInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | AppointmentWithDetails | null
  >(null);
  const [checkInStatus, setCheckInStatus] = useState<
    "idle" | "found" | "processing" | "concierge" | "success" | "error"
  >("idle");

  // Assistance request system
  const { createRequest } = useCreateAssistanceRequest();

  // Mutation hooks for auto-creating records
  const createPatientMutation = useCreatePatient();
  const createAppointmentMutation = useCreateAppointment();

  // Get available doctors for appointment creation
  const { data: doctorsData } = useActiveDoctors();

  // Stock ailments for temporary appointments
  const stockAilments = [
    "General consultation needed",
    "Follow-up visit required",
    "Routine check-up",
    "Health concern to discuss",
    "Wellness consultation",
    "Medical advice needed",
  ];

  // Use deferred value for phone number to avoid excessive API calls
  const deferredPhoneInput = useDeferredValue(phoneInput);

  // Format phone number for display and API calls
  const formattedPhone = useMemo(() => {
    const numbers = deferredPhoneInput.replace(/\D/g, "");

    // Format as XXXX XXXX for Singapore mobile numbers (8 digits)
    if (numbers.length <= 4) {
      return numbers;
    } else {
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)}`;
    }
  }, [deferredPhoneInput]);

  // Generate phone number for API (with +65 prefix)
  const apiPhoneNumber = useMemo(() => {
    const numbers = deferredPhoneInput.replace(/\D/g, "");
    if (numbers.length >= 8) {
      return `+65${numbers.slice(0, 8)}`;
    }
    return "";
  }, [deferredPhoneInput]);

  // Patient lookup by phone number
  const {
    data: patientsData,
    isLoading: isLookingUp,
    error: lookupError,
  } = usePatientLookupByPhone(
    apiPhoneNumber,
    apiPhoneNumber.length > 0 && checkInStatus === "idle"
  );

  // Today's appointments for found patient
  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    usePatientTodayAppointments(
      selectedPatient?.id || null,
      !!selectedPatient && checkInStatus === "found"
    );

  // Check-in mutation with optimistic updates
  const { checkInOptimistically, isCheckingIn } = useOptimisticCheckIn();

  // Handle phone number input changes
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneInput(value);

    // Reset states when user changes phone number
    if (checkInStatus !== "idle") {
      startTransition(() => {
        setCheckInStatus("idle");
        setSelectedPatient(null);
        setSelectedAppointment(null);
      });
    }
  };

  // Handle patient lookup
  const handleLookupPatient = () => {
    if (!apiPhoneNumber || isLookingUp) return;

    startTransition(() => {
      // Check if we found a patient
      if (patientsData?.patients && patientsData.patients.length > 0) {
        const patient = patientsData.patients[0]; // Take first match
        setSelectedPatient(patient);
        setCheckInStatus("found");
      } else {
        // Patient not found - gracefully create temporary records
        setCheckInStatus("processing");

        startTransition(async () => {
          try {
            // Create temporary patient record
            const tempPatientData = {
              clerkUserId: `temp_${Date.now()}`, // Temporary clerk ID
              firstName: "Guest",
              lastName: "Patient",
              phone: apiPhoneNumber,
              email: `guest.${Date.now()}.${Math.random()
                .toString(36)
                .substring(2, 8)}@temp.clinic.local`, // Temporary email with random suffix
              dateOfBirth: "1990-01-01T00:00:00.000Z", // Temporary DOB - will be updated by concierge
              address: "To be confirmed by concierge", // Will be filled by concierge
              emergencyContact: "", // Will be filled by concierge
            };

            const patientResult = await createPatientMutation.mutateAsync(
              tempPatientData
            );

            // Create temporary appointment
            const randomAilment =
              stockAilments[Math.floor(Math.random() * stockAilments.length)];
            const now = new Date();
            const appointmentTime = new Date();
            appointmentTime.setHours(
              now.getHours(),
              now.getMinutes() + 5,
              0,
              0
            ); // 5 minutes from now

            // Get the first available doctor or fallback to a default
            const availableDoctor = doctorsData?.doctors?.[0];
            const doctorId = availableDoctor?.id || "doctor_general"; // Fallback if no doctors available

            const appointmentData = {
              patientId: patientResult.patient.id,
              doctorId: doctorId, // Use real doctor ID or fallback
              type: "FIRST_CONSULT" as const, // Valid appointment type
              scheduledDateTime: appointmentTime.toISOString(),
              durationMinutes: 30,
              reasonForVisit: randomAilment,
            };

            const appointmentResult =
              await createAppointmentMutation.mutateAsync(appointmentData);

            // Create assistance request for concierge
            createRequest(
              formattedPhone,
              "registration",
              `Guest patient created - needs full registration and appointment details updated. Reason: ${randomAilment}`,
              patientResult.patient.id,
              appointmentResult.appointment.id
            );

            // Set patient and appointment data
            setSelectedPatient(patientResult.patient);
            setSelectedAppointment(appointmentResult.appointment);
            setCheckInStatus("concierge");
          } catch (error) {
            console.error("Failed to create temporary records:", error);
            setCheckInStatus("error");
          }
        });
      }
    });
  };

  // Handle appointment check-in
  const handleCheckIn = async (appointmentId: AppointmentId) => {
    if (!selectedAppointment) return;

    try {
      startTransition(async () => {
        await checkInOptimistically(appointmentId);
        setCheckInStatus("success");
      });
    } catch (error) {
      console.error("Check-in failed:", error);
      setCheckInStatus("error");
    }
  };

  // Reset all states
  const resetCheckIn = () => {
    startTransition(() => {
      setPhoneInput("");
      setCheckInStatus("idle");
      setSelectedPatient(null);
      setSelectedAppointment(null);
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FBF7' }}>
      {/* Navigation Bar */}
      <NavigationBar />

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="w-full max-w-lg">
          {/* Idle State - Phone Input */}
          {checkInStatus === "idle" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-1" style={{ color: '#2D5A29' }}>
                  Welcome to Our Clinic
                </h2>
                <p className="text-sm text-gray-600">
                  Please enter your phone number to check in for your
                  appointment
                </p>
              </div>

              <div className="border" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: '#E0ECDB' }}>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone Number
                  </h3>
                </div>
                <div className="px-4 py-4 space-y-4">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">+65</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="XXXX XXXX"
                      value={formattedPhone}
                      onChange={handlePhoneChange}
                      className="pl-16 h-10 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      style={{ borderColor: '#E0ECDB' }}
                      maxLength={11}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter your Singapore mobile number (8 digits)
                  </p>
                  {isPending && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleLookupPatient}
                disabled={formattedPhone.length < 7 || isLookingUp || isPending}
                className="w-full text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 border border-blue-600 hover:border-blue-700 disabled:border-gray-300 px-4 py-3 transition-colors rounded-xs"
              >
                {isLookingUp ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Looking up...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Check In
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Having trouble? Please ask our front desk staff for
                  assistance.
                </p>
              </div>
            </div>
          )}

          {/* Found Patient - Show Appointments */}
          {checkInStatus === "found" && selectedPatient && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-1" style={{ color: '#2D5A29' }}>
                  Welcome, {selectedPatient.firstName}{" "}
                  {selectedPatient.lastName}!
                </h2>
                <p className="text-sm text-gray-600">
                  Please select your appointment to check in
                </p>
              </div>

              <div className="border" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: '#E0ECDB' }}>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Select Check-in Type
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  <Suspense fallback={<AppointmentSkeleton />}>
                    {isLoadingAppointments ? (
                      <div className="px-4 py-6">
                        <AppointmentSkeleton />
                      </div>
                    ) : appointmentsData?.appointments &&
                      appointmentsData.appointments.length > 0 ? (
                      <>
                        <div className="px-4 py-3" style={{ backgroundColor: '#F8FBF7' }}>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Scheduled Appointments
                          </p>
                        </div>
                        {appointmentsData.appointments.map((appointment) => {
                          const doctorName =
                            "doctor" in appointment
                              ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                              : "Doctor information loading...";

                          return (
                            <div
                              key={appointment.id}
                              className="px-4 py-4 transition-colors"
                          style={{ backgroundColor: 'transparent' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0ECDB'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {appointment.type
                                        .replace("_", " ")
                                        .toLowerCase()
                                        .replace(/\b\w/g, (l) =>
                                          l.toUpperCase()
                                        )}
                                    </h4>
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium border border-blue-200 rounded-xs">
                                      {appointment.status
                                        .toLowerCase()
                                        .replace("_", " ")}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {doctorName}
                                  </p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {new Date(
                                        appointment.scheduledDateTime
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  </div>
                                  {appointment.reasonForVisit && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      <strong>Reason:</strong>{" "}
                                      {appointment.reasonForVisit}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    handleCheckIn(appointment.id);
                                  }}
                                  disabled={isCheckingIn || isPending}
                                  className="text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 border border-green-600 hover:border-green-700 disabled:border-gray-300 px-3 py-1.5 transition-colors ml-4 rounded-xs"
                                >
                                  {isCheckingIn ? (
                                    <span className="flex items-center gap-1">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      Checking in...
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      Check In
                                      <CheckCircle className="h-3 w-3" />
                                    </span>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : null}
                  </Suspense>

                  {/* Walk-in Option */}
                  <div style={{ backgroundColor: '#F8FBF7' }}>
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                        Don&apos;t have an appointment?
                      </p>
                      <div className="border rounded-xs" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                        <div className="px-4 py-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                Walk-in Consultation
                              </h4>
                              <p className="text-xs text-gray-600 mb-2">
                                Register for a walk-in appointment. You&apos;ll
                                be added to the queue based on availability.
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>Subject to doctor availability</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => setIsWalkInModalOpen(true)}
                              className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 px-3 py-1.5 transition-colors ml-4 rounded-xs"
                            >
                              <span className="flex items-center gap-1">
                                Register Walk-in
                                <ArrowRight className="h-3 w-3" />
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!appointmentsData?.appointments?.length &&
                    !isLoadingAppointments && (
                      <div className="px-4 py-8 text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-600 mb-2">
                          No scheduled appointments for today
                        </p>
                        <p className="text-xs text-gray-500">
                          You can still register as a walk-in patient above
                        </p>
                      </div>
                    )}
                </div>
              </div>

              <button
                onClick={resetCheckIn}
                className="w-full text-xs font-medium text-gray-700 hover:text-gray-900 px-4 py-3 border transition-colors rounded-xs"
                style={{ 
                  borderColor: '#E0ECDB',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FBF7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-3 w-3" />
                  Back to Phone Entry
                </span>
              </button>
            </div>
          )}

          {/* Processing State */}
          {checkInStatus === "processing" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-sm flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#EBF1F8' }}>
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                </div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: '#2D5A29' }}>
                  Setting Up Your Visit
                </h2>
                <p className="text-sm text-gray-600">
                  Please wait while we prepare your appointment...
                </p>
              </div>
            </div>
          )}

          {/* Concierge Direction State */}
          {checkInStatus === "concierge" && selectedPatient && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-sm flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#EDF5E9' }}>
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: '#2D5A29' }}>
                  Welcome to Our Clinic!
                </h2>
                <p className="text-sm text-gray-600">
                  Your appointment has been created successfully.
                </p>
              </div>

              <div className="border rounded-sm" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: '#E0ECDB' }}>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Next Steps
                  </h3>
                </div>

                <div className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-600">
                        1
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Please proceed to the front desk
                      </h4>
                      <p className="text-xs text-gray-600">
                        Our concierge will complete your registration and
                        confirm your appointment details.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 border-t" style={{ backgroundColor: '#EBF1F8', borderColor: '#E0ECDB' }}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">
                      Estimated wait time: 2-5 minutes
                    </span>
                  </div>
                </div>
              </div>

              <div className="border rounded-sm p-4" style={{ backgroundColor: '#F8FBF7', borderColor: '#E0ECDB' }}>
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Have your information ready:
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Government-issued ID (NRIC/Passport)</li>
                  <li>• Insurance card (if applicable)</li>
                  <li>• Emergency contact information</li>
                  <li>• Current medications (if any)</li>
                </ul>
              </div>

              <button
                onClick={resetCheckIn}
                className="w-full text-xs font-medium text-gray-700 hover:text-gray-900 px-4 py-3 border transition-colors rounded-xs"
                style={{ 
                  borderColor: '#E0ECDB',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FBF7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-3 w-3" />
                  Start Over
                </span>
              </button>
            </div>
          )}

          {/* Success State */}
          {checkInStatus === "success" &&
            selectedPatient &&
            selectedAppointment && (
              <CheckInSuccess
                patient={selectedPatient}
                appointment={selectedAppointment}
                appointmentId={selectedAppointment.id}
                onReset={resetCheckIn}
              />
            )}

          {/* Error State */}
          {checkInStatus === "error" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#FEF2F2' }}>
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold mb-1" style={{ color: '#2D5A29' }}>
                  Check-in Failed
                </h2>
                <p className="text-sm text-gray-600">
                  {lookupError
                    ? "There was a problem looking up your information"
                    : "We couldn't find an appointment with this phone number"}
                </p>
              </div>

              {lookupError && (
                <div className="border p-4" style={{ backgroundColor: '#FEF2F2', borderColor: '#FECACA' }}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      Error:{" "}
                      {lookupError instanceof Error
                        ? lookupError.message
                        : "Unknown error occurred"}
                    </span>
                  </div>
                </div>
              )}

              <div className="border" style={{ backgroundColor: '#EDF5E9', borderColor: '#E0ECDB' }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: '#E0ECDB' }}>
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Possible Reasons
                  </h3>
                </div>
                <div className="px-4 py-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>No appointment scheduled for today</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>Different phone number used for booking</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>Appointment may have been rescheduled</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>Already checked in</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>System connectivity issues</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetCheckIn}
                  className="text-xs font-medium text-gray-700 hover:text-gray-900 px-4 py-3 border transition-colors rounded-xs"
                  style={{ 
                    borderColor: '#E0ECDB',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FBF7'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = "/staff")}
                  className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 px-4 py-3 transition-colors rounded-xs"
                >
                  Get Help
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Walk-in Registration Modal */}
      <WalkInRegistrationModal
        isOpen={isWalkInModalOpen}
        onClose={() => setIsWalkInModalOpen(false)}
        onSuccess={(patientId, appointmentId) => {
          // Set the check-in status to success after walk-in registration
          setCheckInStatus("success");
          setSelectedAppointment({ id: appointmentId } as Appointment);
          setIsWalkInModalOpen(false);
        }}
      />
    </div>
  );
}
