"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Heart,
  Phone,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  AlertCircle
} from "lucide-react";

/**
 * iPad Check-in Interface - For patients arriving at the clinic
 * 
 * React 18/19 Features to implement:
 * - useTransition() for phone number submission without blocking UI
 * - startTransition() for search operations 
 * - useDeferredValue() for real-time phone number formatting
 * - Suspense for patient lookup and queue position loading
 * - useOptimistic() for immediate check-in feedback
 * - useActionState() for form submission state management
 */
export default function CheckInPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "searching" | "success" | "error">("idle");
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [queueInfo, setQueueInfo] = useState<any>(null);

  // Mock check-in process
  const handleCheckIn = async () => {
    if (!phoneNumber || phoneNumber.length < 8) return;
    
    setIsSubmitting(true);
    setCheckInStatus("searching");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful check-in
    if (phoneNumber.includes("9123")) {
      setPatientInfo({
        name: "Sarah Chen",
        id: "P001",
        appointmentTime: "10:30 AM",
        doctor: "Dr. Lim Wei Ming"
      });
      setQueueInfo({
        queueNumber: 3,
        estimatedWait: "15-20 minutes",
        position: "3rd in queue"
      });
      setCheckInStatus("success");
    } else {
      setCheckInStatus("error");
    }
    
    setIsSubmitting(false);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Format as +65 XXXX XXXX for Singapore numbers
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const resetCheckIn = () => {
    setPhoneNumber("");
    setCheckInStatus("idle");
    setPatientInfo(null);
    setQueueInfo(null);
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
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="pl-20 text-lg h-14 border-mint/40 focus:border-forest"
                    maxLength={11}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your Singapore mobile number (8 digits)
                </p>
              </div>

              <Button 
                onClick={handleCheckIn}
                disabled={phoneNumber.length < 7}
                className="w-full h-14 text-lg bg-forest hover:bg-forest/90 text-white"
              >
                Check In
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Having trouble? Please ask our front desk staff for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {checkInStatus === "searching" && (
          <Card className="border-sky/30 bg-white/95">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky/20 border-t-sky mx-auto"></div>
                <h3 className="text-xl font-semibold text-charcoal">Checking you in...</h3>
                <p className="text-muted-foreground">Please wait while we find your appointment</p>
              </div>
            </CardContent>
          </Card>
        )}

        {checkInStatus === "success" && patientInfo && queueInfo && (
          <Card className="border-grass/30 bg-white/95">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-grass/20 to-mint/40 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-forest" />
                </div>
              </div>
              <CardTitle className="text-2xl text-forest">Check-in Successful!</CardTitle>
              <CardDescription className="text-lg">
                Welcome, {patientInfo.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient Info */}
              <div className="bg-gradient-to-r from-forest/5 to-grass/5 rounded-xl p-6 border border-mint/30">
                <h4 className="font-semibold text-charcoal mb-3">Appointment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Patient ID:</span>
                    <p className="font-medium">{patientInfo.id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Appointment Time:</span>
                    <p className="font-medium">{patientInfo.appointmentTime}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Doctor:</span>
                    <p className="font-medium">{patientInfo.doctor}</p>
                  </div>
                </div>
              </div>

              {/* Queue Info */}
              <div className="bg-gradient-to-r from-orange/5 to-orange/10 rounded-xl p-6 border border-orange/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-charcoal">Your Queue Status</h4>
                  <Badge className="bg-orange/20 text-orange border-orange/30 text-lg px-4 py-2">
                    #{queueInfo.queueNumber}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange" />
                    <span className="text-muted-foreground">{queueInfo.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange" />
                    <span className="text-muted-foreground">Est. wait: {queueInfo.estimatedWait}</span>
                  </div>
                </div>
              </div>

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
                onClick={resetCheckIn}
                variant="outline"
                className="w-full h-12 border-forest text-forest hover:bg-forest hover:text-white"
              >
                Check In Another Patient
              </Button>
            </CardContent>
          </Card>
        )}

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
                We couldn't find an appointment with this phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-rose/5 to-rose/10 rounded-xl p-6 border border-rose/20">
                <h4 className="font-semibold text-charcoal mb-3">Possible Reasons:</h4>
                <div className="space-y-2 text-sm text-charcoal/70">
                  <p>• No appointment scheduled for today</p>
                  <p>• Different phone number used for booking</p>
                  <p>• Appointment may have been rescheduled</p>
                  <p>• Already checked in</p>
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
                <Button className="bg-forest hover:bg-forest/90 text-white">
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