"use client";

import { useState, useTransition, useDeferredValue, useMemo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  RefreshCw
} from "lucide-react";
import { 
  usePatientLookupByPhone, 
  usePatientTodayAppointments, 
  useOptimisticCheckIn, 
  useQueuePosition 
} from "@/hooks/use-check-in";
import { Patient, Appointment, AppointmentWithDetails, PatientId, AppointmentId } from "@/lib/api-types";

// Loading skeleton components
const QueueSkeleton = () => (
  <Card className="bg-lightest-gray">
    <CardContent className="py-12">
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
    </CardContent>
  </Card>
);

const AppointmentSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

// Success message component with real data
const CheckInSuccess = ({ 
  patient, 
  appointment, 
  appointmentId, 
  onReset 
}: { 
  patient: Patient; 
  appointment: Appointment | AppointmentWithDetails; 
  appointmentId: AppointmentId;
  onReset: () => void;
}) => {
  const { data: queueData, isLoading: isQueueLoading } = useQueuePosition(appointmentId);

  const doctorName = ('doctor' in appointment)
    ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
    : 'Doctor information loading...';

  return (
    <Card className="bg-lightest-gray">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-lightest-gray p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-black" />
          </div>
        </div>
        <CardTitle className="text-2xl text-black">Check-in Successful!</CardTitle>
        <CardDescription className="text-lg">
          Welcome, {patient.firstName} {patient.lastName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-lightest-gray rounded-xl p-6">
          <h4 className="font-semibold text-dark-gray mb-3">Appointment Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Patient ID:</span>
              <p className="font-medium">{patient.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Appointment Time:</span>
              <p className="font-medium">
                {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Doctor:</span>
              <p className="font-medium">{doctorName}</p>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">Appointment Type:</span>
              <p className="font-medium">
                {appointment.type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
            </div>
          </div>
        </div>

        <Suspense fallback={<QueueSkeleton />}>
          {isQueueLoading ? (
            <QueueSkeleton />
          ) : queueData ? (
            <div className="bg-lightest-gray rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-dark-gray">Your Queue Status</h4>
                <Badge className="bg-lightest-gray text-gray text-lg px-4 py-2">
                  #{queueData.queueNumber}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray" />
                  <span className="text-muted-foreground">{queueData.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray" />
                  <span className="text-muted-foreground">Est. wait: {queueData.estimatedWait}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-lightest-gray rounded-xl p-6">
              <h4 className="font-semibold text-dark-gray mb-3">Queue Information</h4>
              <p className="text-muted-foreground">Loading queue position...</p>
            </div>
          )}
        </Suspense>

        <div className="bg-lightest-gray rounded-xl p-6">
          <h4 className="font-semibold text-dark-gray mb-3">What's Next?</h4>
          <div className="space-y-2 text-sm text-dark-gray/70">
            <p>✓ You're successfully checked in</p>
            <p>✓ You'll receive an SMS when it's your turn</p>
            <p>✓ Feel free to wait in our comfortable lounge or nearby area</p>
            <p>✓ Please return when you receive the notification</p>
          </div>
        </div>

        <Button
          onClick={onReset}
          variant="outline"
          className="w-full h-12 bg-lightest-gray text-black"
        >
          Check In Another Patient
        </Button>
      </CardContent>
    </Card>
  );
};

export const CheckInDashboard = () => {
  const [phoneInput, setPhoneInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | AppointmentWithDetails | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "found" | "success" | "error">("idle");

  const deferredPhoneInput = useDeferredValue(phoneInput);

  const formattedPhone = useMemo(() => {
    const numbers = deferredPhoneInput.replace(/\D/g, "");
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)}`;
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

  const { data: appointmentsData, isLoading: isLoadingAppointments } = usePatientTodayAppointments(
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
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-black mr-2" />
          <h2 className="text-2xl font-bold text-black">Patient Check-in</h2>
        </div>
        <p className="text-gray">Digital check-in system for appointments</p>
      </div>

      {/* Idle State - Phone Input */}
      {checkInStatus === "idle" && (
        <Card className="bg-lightest-gray">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-dark-gray">Welcome to Our Clinic</CardTitle>
            <CardDescription>
              Please enter your phone number to check in for your appointment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-dark-gray">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">+65</span>
                </div>
                <Input
                  type="tel"
                  value={formattedPhone}
                  onChange={handlePhoneChange}
                  placeholder="9123 4567"
                  className="pl-12 text-base h-12 bg-white"
                  maxLength={11}
                />
              </div>
              {isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleLookupPatient}
              disabled={formattedPhone.length < 7 || isLookingUp || isPending}
              className="w-full h-12 text-base bg-black text-white"
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
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Found Patient - Show Appointments */}
      {checkInStatus === "found" && selectedPatient && (
        <Card className="bg-lightest-gray">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl text-dark-gray">
              Welcome, {selectedPatient.firstName} {selectedPatient.lastName}!
            </CardTitle>
            <CardDescription>Please select your appointment to check in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Suspense fallback={<AppointmentSkeleton />}>
              {isLoadingAppointments ? (
                <AppointmentSkeleton />
              ) : appointmentsData?.appointments && appointmentsData.appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointmentsData.appointments.map((appointment) => {
                    const doctorName = ('doctor' in appointment)
                      ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                      : 'Doctor information loading...';

                    return (
                      <Card key={appointment.id} className="bg-white">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <h4 className="font-semibold text-dark-gray text-lg">
                                {appointment.type.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                              </h4>
                              <p className="text-muted-foreground">{doctorName}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(appointment.scheduledDateTime).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                <Badge className="bg-lightest-gray text-gray">
                                  {appointment.status.toLowerCase().replace("_", " ")}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                handleCheckIn(appointment.id);
                              }}
                              disabled={isCheckingIn || isPending}
                              className="bg-black text-white"
                            >
                              {isCheckingIn ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Checking in...
                                </>
                              ) : (
                                "Check In"
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No appointments found for today. Please check with our front desk staff.
                  </AlertDescription>
                </Alert>
              )}
            </Suspense>

            <Button
              onClick={resetCheckIn}
              variant="outline"
              className="w-full bg-lightest-gray text-dark-gray"
            >
              Back to Phone Entry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {checkInStatus === "success" && selectedPatient && selectedAppointment && (
        <CheckInSuccess
          patient={selectedPatient}
          appointment={selectedAppointment}
          appointmentId={selectedAppointment.id}
          onReset={resetCheckIn}
        />
      )}

      {/* Error State */}
      {checkInStatus === "error" && (
        <Card className="bg-lightest-gray">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-lightest-gray p-4 rounded-full">
                <AlertCircle className="h-12 w-12 text-gray" />
              </div>
            </div>
            <CardTitle className="text-xl text-gray">Check-in Failed</CardTitle>
            <CardDescription>
              {lookupError
                ? "There was a problem looking up your information"
                : "We couldn't find an appointment with this phone number"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-lightest-gray rounded-xl p-6">
              <h4 className="font-semibold text-dark-gray mb-3">Possible Reasons:</h4>
              <div className="space-y-2 text-sm text-dark-gray/70">
                <p>• No appointment scheduled for today</p>
                <p>• Different phone number used for booking</p>
                <p>• Appointment may have been rescheduled</p>
                <p>• Already checked in</p>
                <p>• System connectivity issues</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={resetCheckIn}
                variant="outline"
                className="bg-lightest-gray text-gray"
              >
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = "/staff")}
                className="bg-black text-white"
              >
                Get Help
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};