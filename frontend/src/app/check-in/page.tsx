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

/**
 * iPad Check-in Interface - For patients arriving at the clinic
 * 
 * React 18/19 Features implemented:
 * - useTransition() for phone number submission without blocking UI
 * - startTransition() for search operations 
 * - useDeferredValue() for real-time phone number formatting
 * - Suspense for patient lookup and queue position loading
 * - useOptimistic() for immediate check-in feedback (via custom hook)
 * - useMemo() for expensive phone number formatting computations
 */
// Loading skeleton components
const QueueSkeleton = () => (
  <Card className="border-mint/30 bg-white/95">
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
    <Card className="border-grass/30 bg-white/95">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-grass/20 to-mint/40 p-4 rounded-full">
            <CheckCircle className="h-12 w-12 text-forest" />
          </div>
        </div>
        <CardTitle className="text-2xl text-forest">Check-in Successful!</CardTitle>
        <CardDescription className="text-lg">
          Welcome, {patient.firstName} {patient.lastName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Info */}
        <div className="bg-gradient-to-r from-forest/5 to-grass/5 rounded-xl p-6 border border-mint/30">
          <h4 className="font-semibold text-charcoal mb-3">Appointment Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Patient ID:</span>
              <p className="font-medium">{patient.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Appointment Time:</span>
              <p className="font-medium">
                {new Date(appointment.scheduledDateTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
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
                {appointment.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
          </div>
        </div>

        {/* Queue Info */}
        <Suspense fallback={<QueueSkeleton />}>
          {isQueueLoading ? (
            <QueueSkeleton />
          ) : queueData ? (
            <div className="bg-gradient-to-r from-orange/5 to-orange/10 rounded-xl p-6 border border-orange/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-charcoal">Your Queue Status</h4>
                <Badge className="bg-orange/20 text-orange border-orange/30 text-lg px-4 py-2">
                  #{queueData.queueNumber}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange" />
                  <span className="text-muted-foreground">{queueData.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange" />
                  <span className="text-muted-foreground">Est. wait: {queueData.estimatedWait}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-sky/5 to-pale-blue/10 rounded-xl p-6 border border-sky/20">
              <h4 className="font-semibold text-charcoal mb-3">Queue Information</h4>
              <p className="text-muted-foreground">Loading queue position...</p>
            </div>
          )}
        </Suspense>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-sky/5 to-pale-blue/10 rounded-xl p-6 border border-sky/20">
          <h4 className="font-semibold text-charcoal mb-3">What's Next?</h4>
          <div className="space-y-2 text-sm text-charcoal/70">
            <p>✓ You're successfully checked in</p>
            <p>✓ You'll receive an SMS when it's your turn</p>
            <p>✓ Feel free to wait in our comfortable lounge or nearby area</p>
            <p>✓ Please return when you receive the notification</p>
          </div>
        </div>

        <Button 
          onClick={onReset}
          variant="outline"
          className="w-full h-12 border-forest text-forest hover:bg-forest hover:text-white"
        >
          Check In Another Patient
        </Button>
      </CardContent>
    </Card>
  );
};

export default function CheckInPage() {
  // React 18/19 hooks for enhanced UX
  const [phoneInput, setPhoneInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | AppointmentWithDetails | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "found" | "success" | "error">("idle");

  // Use deferred value for phone number to avoid excessive API calls
  const deferredPhoneInput = useDeferredValue(phoneInput);

  // Format phone number for display and API calls
  const formattedPhone = useMemo(() => {
    const numbers = deferredPhoneInput.replace(/\D/g, '');
    
    // Format as +65 XXXX XXXX for Singapore numbers
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)}`;
    }
  }, [deferredPhoneInput]);

  // Generate phone number for API (with +65 prefix)
  const apiPhoneNumber = useMemo(() => {
    const numbers = deferredPhoneInput.replace(/\D/g, '');
    if (numbers.length >= 8) {
      return `+65 ${numbers.slice(0, 4)} ${numbers.slice(4, 8)}`;
    }
    return '';
  }, [deferredPhoneInput]);

  // Patient lookup by phone number
  const { data: patientsData, isLoading: isLookingUp, error: lookupError } = usePatientLookupByPhone(
    apiPhoneNumber,
    apiPhoneNumber.length > 0 && checkInStatus === "idle"
  );

  // Today's appointments for found patient
  const { data: appointmentsData, isLoading: isLoadingAppointments } = usePatientTodayAppointments(
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
    <div className="min-h-screen bg-gradient-to-br from-mint to-pale-blue flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-forest mr-3" />
            <h1 className="text-4xl font-bold text-forest">CarePulse</h1>
          </div>
          <p className="text-xl text-charcoal/70">Digital Check-in System</p>
        </div>

        {/* Idle State - Phone Input */}
        {checkInStatus === "idle" && (
          <Card className="border-mint/30 bg-white/95">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-charcoal">Welcome to Our Clinic</CardTitle>
              <CardDescription className="text-lg">
                Please enter your phone number to check in for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-charcoal">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <span className="text-muted-foreground">+65</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="XXXX XXXX"
                    value={formattedPhone}
                    onChange={handlePhoneChange}
                    className="pl-20 text-lg h-14 border-mint/40 focus:border-forest"
                    maxLength={11}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your Singapore mobile number (8 digits)
                </p>
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
                className="w-full h-14 text-lg bg-forest hover:bg-forest/90 text-white"
              >
                {isLookingUp ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    Check In
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Having trouble? Please ask our front desk staff for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Found Patient - Show Appointments */}
        {checkInStatus === "found" && selectedPatient && (
          <Card className="border-sky/30 bg-white/95">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-charcoal">
                Welcome, {selectedPatient.firstName} {selectedPatient.lastName}!
              </CardTitle>
              <CardDescription className="text-lg">
                Please select your appointment to check in
              </CardDescription>
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
                        <Card key={appointment.id} className="border-mint/30 bg-white/90 hover:border-mint/50 transition-colors">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-charcoal text-lg">
                                  {appointment.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </h4>
                                <p className="text-muted-foreground">{doctorName}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {new Date(appointment.scheduledDateTime).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </div>
                                  <Badge className="bg-sky/20 text-deep-blue border-sky/30">
                                    {appointment.status.toLowerCase().replace('_', ' ')}
                                  </Badge>
                                </div>
                                {appointment.reasonForVisit && (
                                  <p className="text-sm text-muted-foreground">
                                    <strong>Reason:</strong> {appointment.reasonForVisit}
                                  </p>
                                )}
                              </div>
                              <Button 
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  handleCheckIn(appointment.id);
                                }}
                                disabled={isCheckingIn || isPending}
                                className="bg-forest hover:bg-forest/90 text-white"
                              >
                                {isCheckingIn ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Checking in...
                                  </>
                                ) : (
                                  <>
                                    Check In
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                  </>
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
                className="w-full border-charcoal text-charcoal hover:bg-charcoal hover:text-white"
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
          <Card className="border-rose/30 bg-white/95">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-rose/20 to-rose/40 p-4 rounded-full">
                  <AlertCircle className="h-12 w-12 text-rose" />
                </div>
              </div>
              <CardTitle className="text-2xl text-rose">Check-in Failed</CardTitle>
              <CardDescription className="text-lg">
                {lookupError 
                  ? "There was a problem looking up your information"
                  : "We couldn't find an appointment with this phone number"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {lookupError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error: {lookupError instanceof Error ? lookupError.message : 'Unknown error occurred'}
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-gradient-to-r from-rose/5 to-rose/10 rounded-xl p-6 border border-rose/20">
                <h4 className="font-semibold text-charcoal mb-3">Possible Reasons:</h4>
                <div className="space-y-2 text-sm text-charcoal/70">
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
                  className="border-rose text-rose hover:bg-rose hover:text-white"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.href = "/staff"}
                  className="bg-forest hover:bg-forest/90 text-white"
                >
                  Get Help
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}