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
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
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

// Loading skeleton components
const QueueSkeleton = () => (
  <div className="text-center py-12">
    <div className="space-y-4">
      <Skeleton className="h-16 w-16 rounded-full mx-auto bg-gray-200" />
      <Skeleton className="h-6 w-48 mx-auto bg-gray-200" />
      <Skeleton className="h-4 w-64 mx-auto bg-gray-200" />
    </div>
  </div>
);

const AppointmentSkeleton = () => (
  <div className="space-y-1">
    <div className="py-4 border-b border-gray-100">
      <Skeleton className="h-6 w-full bg-gray-200" />
    </div>
    <div className="py-4 border-b border-gray-100">
      <Skeleton className="h-6 w-full bg-gray-200" />
    </div>
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
    <div className="space-y-12">
      {/* Success Header */}
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-black mb-2">
          Check-in Successful!
        </h2>
        <p className="text-lg text-gray-600">
          Welcome, {patient.firstName} {patient.lastName}
        </p>
      </div>

      {/* Appointment Details */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-black mb-6">
          Appointment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Patient ID</div>
            <p className="font-medium text-black">{patient.id.split("_")[1]}</p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">
              Appointment Time
            </div>
            <p className="font-medium text-black">
              {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Doctor</div>
            <p className="font-medium text-black">{doctorName}</p>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">
              Appointment Type
            </div>
            <p className="font-medium text-black">
              {appointment.type
                .replace("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          </div>
        </div>
      </div>

      {/* Queue Status */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-black mb-6">
          Your Queue Status
        </h3>
        <Suspense fallback={<QueueSkeleton />}>
          {isQueueLoading ? (
            <QueueSkeleton />
          ) : queueData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">
                  Queue Number
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  #{queueData.queueNumber}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">
                  Position
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  {queueData.position}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">
                  Estimated Wait
                </div>
                <div className="text-3xl font-bold text-gray-600">
                  {queueData.estimatedWait}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6">
              <p className="text-gray-500">Loading queue position...</p>
            </div>
          )}
        </Suspense>
      </div>

      {/* What's Next */}
      <div className="mb-12">
        <h3 className="text-lg font-semibold text-black mb-6">
          What&apos;s Next?
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-gray-700">You&apos;re successfully checked in</p>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-gray-700">
              You&apos;ll receive an SMS when it&apos;s your turn
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-gray-700">
              Feel free to wait in our comfortable lounge or nearby area
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-gray-700">
              Please return when you receive the notification
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
      >
        Check In Another Patient
      </button>
    </div>
  );
};

export const CheckInDashboard = () => {
  const [phoneInput, setPhoneInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<
    Appointment | AppointmentWithDetails | null
  >(null);
  const [checkInStatus, setCheckInStatus] = useState<
    "idle" | "found" | "success" | "error"
  >("idle");

  const deferredPhoneInput = useDeferredValue(phoneInput);

  const formattedPhone = useMemo(() => {
    const numbers = deferredPhoneInput.replace(/\D/g, "");

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

  const apiPhoneNumber = useMemo(() => {
    const numbers = deferredPhoneInput.replace(/\D/g, "");
    if (numbers.length >= 8) {
      return `+65 ${numbers.slice(0, 4)} ${numbers.slice(4, 8)}`;
    }
    return "";
  }, [deferredPhoneInput]);

  const {
    data: patientsData,
    isLoading: isLookingUp,
    error: lookupError,
  } = usePatientLookupByPhone(
    apiPhoneNumber,
    apiPhoneNumber.length > 0 && checkInStatus === "idle"
  );

  const { data: appointmentsData, isLoading: isLoadingAppointments } =
    usePatientTodayAppointments(
      selectedPatient?.id || null,
      !!selectedPatient && checkInStatus === "found"
    );

  const { checkInOptimistically, isCheckingIn } = useOptimisticCheckIn();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneInput(value);

    if (checkInStatus !== "idle") {
      startTransition(() => {
        setCheckInStatus("idle");
        setSelectedPatient(null);
        setSelectedAppointment(null);
      });
    }
  };

  const handleLookupPatient = () => {
    if (patientsData?.patients && patientsData.patients.length > 0) {
      startTransition(() => {
        setSelectedPatient(patientsData.patients[0]);
        setCheckInStatus("found");
      });
    } else {
      setCheckInStatus("error");
    }
  };

  const handleCheckIn = async (appointmentId: AppointmentId) => {
    if (!selectedPatient) return;

    try {
      await checkInOptimistically(selectedPatient.id, appointmentId);
      setCheckInStatus("success");
    } catch (error) {
      console.log("Check-in error:", error);
      setCheckInStatus("error");
    }
  };

  const resetCheckIn = () => {
    startTransition(() => {
      setPhoneInput("");
      setCheckInStatus("idle");
      setSelectedPatient(null);
      setSelectedAppointment(null);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="p-8 pb-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-black">
                  Patient Check-in
                </h1>
                <p className="text-gray-500">
                  Digital check-in system for appointments
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-8">
        {/* Idle State - Phone Input */}
        {checkInStatus === "idle" && (
          <div className="space-y-8">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-black mb-2">
                Welcome to Our Clinic
              </h2>
              <p className="text-gray-600">
                Please enter your phone number to check in for your appointment
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+65</span>
                  </div>
                  <Input
                    type="tel"
                    value={formattedPhone}
                    onChange={handlePhoneChange}
                    placeholder="9123 4567"
                    className="pl-12 text-base h-12 bg-white border-gray-200 rounded-md"
                    maxLength={11}
                  />
                </div>
                {isPending && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLookupPatient}
                disabled={formattedPhone.length < 7 || isLookingUp || isPending}
                className="w-full h-12 text-base bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLookingUp ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    Check In
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Found Patient - Show Appointments */}
        {checkInStatus === "found" && selectedPatient && (
          <div className="space-y-8">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-black mb-2">
                Welcome, {selectedPatient.firstName} {selectedPatient.lastName}!
              </h2>
              <p className="text-gray-600">
                Please select your appointment to check in
              </p>
            </div>

            <div className="space-y-6">
              <Suspense fallback={<AppointmentSkeleton />}>
                {isLoadingAppointments ? (
                  <AppointmentSkeleton />
                ) : appointmentsData?.appointments &&
                  appointmentsData.appointments.length > 0 ? (
                  <div className="space-y-1">
                    {appointmentsData.appointments.map((appointment) => {
                      const doctorName =
                        "doctor" in appointment
                          ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                          : "Doctor information loading...";

                      return (
                        <div
                          key={appointment.id}
                          className="py-6 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h4 className="font-medium text-black text-lg">
                                {appointment.type
                                  .replace("_", " ")
                                  .toLowerCase()
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </h4>
                              <p className="text-gray-600">{doctorName}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(
                                    appointment.scheduledDateTime
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                  {appointment.status
                                    .toLowerCase()
                                    .replace("_", " ")}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                handleCheckIn(appointment.id);
                              }}
                              disabled={isCheckingIn || isPending}
                              className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCheckingIn ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Checking in...
                                </>
                              ) : (
                                "Check In"
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-500" />
                    <p className="text-red-600">
                      No appointments found for today. Please check with our
                      front desk staff.
                    </p>
                  </div>
                )}
              </Suspense>

              <button
                onClick={resetCheckIn}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
              >
                Back to Phone Entry
              </button>
            </div>
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
          <div className="space-y-8">
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">
                Check-in Failed
              </h2>
              <p className="text-gray-600">
                {lookupError
                  ? "There was a problem looking up your information"
                  : "We couldn't find an appointment with this phone number"}
              </p>
            </div>

            <div className="space-y-6">
              <div className="mb-8">
                <h3 className="font-medium text-black mb-4">
                  Possible Reasons:
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p>• No appointment scheduled for today</p>
                  <p>• Different phone number used for booking</p>
                  <p>• Appointment may have been rescheduled</p>
                  <p>• Already checked in</p>
                  <p>• System connectivity issues</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={resetCheckIn}
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => (window.location.href = "/staff")}
                  className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
                >
                  Get Help
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
