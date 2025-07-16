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
  Heart,
  Phone,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  AlertCircle,
  Loader2,
  ArrowLeft,
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

// Loading skeleton components - Dense grid
const QueueSkeleton = () => (
  <div className="bg-white border border-gray-200  p-6">
    <div className="text-center space-y-3">
      <Skeleton className="h-12 w-12  mx-auto bg-gray-200" />
      <Skeleton className="h-4 w-32 mx-auto bg-gray-100" />
      <Skeleton className="h-3 w-48 mx-auto bg-gray-100" />
    </div>
  </div>
);

const AppointmentSkeleton = () => (
  <div className="space-y-3">
    <div className="h-16 bg-gray-100  animate-pulse" />
    <div className="h-16 bg-gray-100  animate-pulse" />
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
        <div className="w-12 h-12 bg-green-50  flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Check-in Successful!
        </h2>
        <p className="text-sm text-gray-600">
          Welcome, {patient.firstName} {patient.lastName}
        </p>
      </div>

      {/* Appointment Details */}
      <div className="bg-white border border-gray-200 ">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Appointment Details
          </h3>
        </div>
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs text-gray-500">Patient ID</span>
              <p className="text-sm font-medium text-gray-900 font-mono">
                #{patient.id.split('_')[1]}
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
          <div className="bg-white border border-gray-200 ">
            <div className="px-4 py-3 border-b border-gray-100">
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
          <div className="bg-white border border-gray-200  p-4">
            <p className="text-sm text-gray-600">Loading queue position...</p>
          </div>
        )}
      </Suspense>

      {/* Instructions */}
      <div className="bg-white border border-gray-200 ">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            What's Next?
          </h3>
        </div>
        <div className="px-4 py-4">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>You're successfully checked in</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
              <span>You'll receive an SMS when it's your turn</span>
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
        className="w-full text-xs font-medium text-gray-700 hover:text-gray-900 px-4 py-3 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs"
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
  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | AppointmentWithDetails | null
  >(null);
  const [checkInStatus, setCheckInStatus] = useState<
    "idle" | "found" | "success" | "error"
  >("idle");

  // Use deferred value for phone number to avoid excessive API calls
  const deferredPhoneInput = useDeferredValue(phoneInput);

  // Format phone number for display and API calls
  const formattedPhone = useMemo(() => {
    const numbers = deferredPhoneInput.replace(/\D/g, "");

    // Format as +65 XXXX XXXX for Singapore numbers
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(
        6,
        10
      )}`;
    }
  }, [deferredPhoneInput]);

  // Generate phone number for API (with +65 prefix)
  const apiPhoneNumber = useMemo(() => {
    const numbers = deferredPhoneInput.replace(/\D/g, "");
    if (numbers.length >= 8) {
      return `+65 ${numbers.slice(0, 4)} ${numbers.slice(4, 8)}`;
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
        setCheckInStatus("error");
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500  flex items-center justify-center">
                <Heart className="h-3.5 w-3.5 text-white" />
              </div>
              <h1 className="text-base font-semibold text-gray-900">CarePulse</h1>
            </div>
            <p className="text-xs text-gray-500">Digital Check-in System</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="w-full max-w-lg">

          {/* Idle State - Phone Input */}
          {checkInStatus === "idle" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Welcome to Our Clinic
                </h2>
                <p className="text-sm text-gray-600">
                  Please enter your phone number to check in for your appointment
                </p>
              </div>

              <div className="bg-white border border-gray-200 ">
                <div className="px-4 py-3 border-b border-gray-100">
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
                      className="pl-16 h-10 border-gray-200  focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                  Having trouble? Please ask our front desk staff for assistance.
                </p>
              </div>
            </div>
          )}

          {/* Found Patient - Show Appointments */}
          {checkInStatus === "found" && selectedPatient && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Welcome, {selectedPatient.firstName} {selectedPatient.lastName}!
                </h2>
                <p className="text-sm text-gray-600">
                  Please select your appointment to check in
                </p>
              </div>

              <div className="bg-white border border-gray-200 ">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Today's Appointments
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
                      appointmentsData.appointments.map((appointment) => {
                        const doctorName =
                          "doctor" in appointment
                            ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                            : "Doctor information loading...";

                        return (
                          <div
                            key={appointment.id}
                            className="px-4 py-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {appointment.type
                                      .replace("_", " ")
                                      .toLowerCase()
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
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
                      })
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                        <p className="text-sm text-red-600">
                          No appointments found for today. Please check with our
                          front desk staff.
                        </p>
                      </div>
                    )}
                  </Suspense>
                </div>
              </div>

              <button
                onClick={resetCheckIn}
                className="w-full text-xs font-medium text-gray-700 hover:text-gray-900 px-4 py-3 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs"
              >
                <span className="flex items-center justify-center gap-2">
                  <ArrowLeft className="h-3 w-3" />
                  Back to Phone Entry
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
                <div className="w-12 h-12 bg-red-50  flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Check-in Failed
                </h2>
                <p className="text-sm text-gray-600">
                  {lookupError
                    ? "There was a problem looking up your information"
                    : "We couldn't find an appointment with this phone number"}
                </p>
              </div>

              {lookupError && (
                <div className="bg-red-50 border border-red-200  p-4">
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

              <div className="bg-white border border-gray-200 ">
                <div className="px-4 py-3 border-b border-gray-100">
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
                  className="text-xs font-medium text-gray-700 hover:text-gray-900 px-4 py-3 border border-gray-200 hover:bg-gray-50 transition-colors rounded-xs"
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
    </div>
  );
}