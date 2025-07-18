"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  Stethoscope,
  FileText,
  Save,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Trash2,
  ChevronDownIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  AppointmentWithDetails,
  Patient,
  Doctor,
  AppointmentStatus,
  AppointmentType,
} from "@/lib/api-types";
import {
  useUpdateAppointment,
  useUpdateAppointmentStatus,
  useDeleteAppointment,
} from "@/hooks/use-appointments";
import { useUpdatePatient } from "@/hooks/use-patients";
import { useDoctors } from "@/hooks/use-doctors";

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: AppointmentWithDetails | null;
  onSuccess?: () => void;
  assistanceRequestPhoneNumber?: string;
}

type Step = "overview" | "appointment" | "patient" | "review";

const appointmentStatusOptions: {
  value: AppointmentStatus;
  label: string;
  color: string;
}[] = [
  { value: "SCHEDULED", label: "Scheduled", color: "text-blue-600" },
  { value: "IN_PROGRESS", label: "In Progress", color: "text-orange-600" },
  { value: "COMPLETED", label: "Completed", color: "text-green-600" },
  { value: "CANCELLED", label: "Cancelled", color: "text-red-600" },
  { value: "NO_SHOW", label: "No Show", color: "text-gray-600" },
];

const appointmentTypeOptions: { value: AppointmentType; label: string }[] = [
  { value: "FIRST_CONSULT", label: "First Consultation" },
  { value: "CHECK_UP", label: "Check-up" },
  { value: "FOLLOW_UP", label: "Follow-up" },
];

const durationOptions = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
];

export const AppointmentDetailsModal = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
  assistanceRequestPhoneNumber,
}: AppointmentDetailsModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("overview");
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dobCalendarOpen, setDobCalendarOpen] = useState(false);

  // Form states
  const [appointmentData, setAppointmentData] = useState({
    type: "" as AppointmentType,
    status: "" as AppointmentStatus,
    scheduledDate: new Date(),
    scheduledTime: "",
    durationMinutes: 30,
    reasonForVisit: "",
    notes: "",
    doctorId: "",
  });

  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: new Date(),
    address: "",
  });

  // Mutations
  const updateAppointmentMutation = useUpdateAppointment();
  const updateAppointmentStatusMutation = useUpdateAppointmentStatus();
  const updatePatientMutation = useUpdatePatient();
  const deleteAppointmentMutation = useDeleteAppointment();

  // Get doctors for dropdown
  const { data: doctorsData } = useDoctors();

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.scheduledDateTime);
      const timeString = format(appointmentDate, "HH:mm");

      setAppointmentData({
        type: appointment.type,
        status: appointment.status,
        scheduledDate: appointmentDate,
        scheduledTime: timeString,
        durationMinutes: appointment.durationMinutes,
        reasonForVisit: appointment.reasonForVisit || "",
        notes: appointment.notes || "",
        doctorId: appointment.doctorId,
      });

      setPatientData({
        firstName: appointment.patient.firstName,
        lastName: appointment.patient.lastName,
        email: appointment.patient.email,
        phone: assistanceRequestPhoneNumber || appointment.patient.phone,
        dateOfBirth: appointment.patient.dateOfBirth
          ? new Date(appointment.patient.dateOfBirth)
          : new Date(),
        address: appointment.patient.address || "",
      });

      setCurrentStep("overview");
    }
  }, [appointment]);

  const handleSave = async () => {
    if (!appointment) return;

    startTransition(async () => {
      try {
        // Combine date and time into a proper DateTime
        const [hours, minutes] = appointmentData.scheduledTime
          .split(":")
          .map(Number);
        const scheduledDateTime = new Date(appointmentData.scheduledDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);

        // Update appointment details
        await updateAppointmentMutation.mutateAsync({
          id: appointment.id,
          data: {
            type: appointmentData.type,
            scheduledDateTime: scheduledDateTime.toISOString(),
            durationMinutes: appointmentData.durationMinutes,
            reasonForVisit: appointmentData.reasonForVisit,
            notes: appointmentData.notes,
            doctorId: appointmentData.doctorId,
          },
        });

        // Update appointment status separately if changed
        if (appointmentData.status !== appointment.status) {
          await updateAppointmentStatusMutation.mutateAsync({
            id: appointment.id,
            status: appointmentData.status,
          });
        }

        // Update patient information
        await updatePatientMutation.mutateAsync({
          id: appointment.patient.id,
          data: {
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            email: patientData.email,
            phone: patientData.phone,
            dateOfBirth: patientData.dateOfBirth.toISOString(),
            address: patientData.address,
          },
        });

        toast.success("Appointment updated successfully!", {
          description: "All changes have been saved.",
          position: "top-right",
        });
        
        onSuccess?.();
        onClose();
      } catch (error) {
        console.error("Failed to update appointment:", error);
        
        // Handle specific error types
        if (error instanceof Error) {
          const errorMessage = error.message;
          
          if (errorMessage.includes("email") && errorMessage.includes("already exists")) {
            toast.error("Email already exists", {
              description: "This email is already registered to another patient. Please use a different email.",
              position: "top-right",
            });
          } else if (errorMessage.includes("phone") && errorMessage.includes("already exists")) {
            toast.error("Phone number already exists", {
              description: "This phone number is already registered to another patient. Please use a different number.",
              position: "top-right",
            });
          } else {
            toast.error("Failed to update appointment", {
              description: errorMessage || "An unexpected error occurred. Please try again.",
              position: "top-right",
            });
          }
        } else {
          toast.error("Failed to update appointment", {
            description: "An unexpected error occurred. Please try again.",
            position: "top-right",
          });
        }
      }
    });
  };

  const handleClose = () => {
    setCurrentStep("overview");
    setShowDeleteConfirmation(false);
    setCalendarOpen(false);
    setDobCalendarOpen(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!appointment) return;

    console.log('🗑️ Deleting appointment with ID:', appointment.id);

    startTransition(async () => {
      try {
        await deleteAppointmentMutation.mutateAsync(appointment.id);
        onSuccess?.();
        handleClose();
      } catch (error) {
        console.error("Failed to delete appointment:", error);
      }
    });
  };

  if (!isOpen || !appointment) return null;

  const steps: { key: Step; label: string; icon: React.ComponentType }[] = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "appointment", label: "Appointment", icon: CalendarIcon },
    { key: "patient", label: "Patient Info", icon: User },
    { key: "review", label: "Review", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Appointment Details
              </h2>
              <p className="text-sm text-gray-600">
                {appointment.patient.firstName} {appointment.patient.lastName} •
                #{appointment.id.split("_")[1]}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-sm transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.key === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xs transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : isCompleted
                        ? "bg-green-100 text-green-700"
                        : "text-gray-500"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="text-xs font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-gray-300 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-sm max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-sm flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Delete Appointment
                  </h3>
                  <p className="text-xs text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete this appointment for{" "}
                <strong>
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </strong>
                ? This will permanently remove the appointment from the system.
              </p>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="text-xs"
                >
                  {isPending ? (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Appointment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 max-h-[calc(90vh-200px)] overflow-y-auto">
          {currentStep === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Appointment Overview
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirmation(true)}
                  className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-sm">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Current Status
                  </h3>
                  <div className="flex items-center gap-2">
                    {appointmentStatusOptions.find(
                      (opt) => opt.value === appointment.status
                    ) && (
                      <span
                        className={`text-sm font-medium ${
                          appointmentStatusOptions.find(
                            (opt) => opt.value === appointment.status
                          )?.color
                        }`}
                      >
                        {
                          appointmentStatusOptions.find(
                            (opt) => opt.value === appointment.status
                          )?.label
                        }
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-sm">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Appointment Time
                  </h3>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(appointment.scheduledDateTime).toLocaleString([], {
                      year: 'numeric',
                      month: 'numeric', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-sm">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Doctor
                </h3>
                <p className="text-sm font-medium text-gray-900">
                  Dr. {appointment.doctor.firstName}{" "}
                  {appointment.doctor.lastName}
                </p>
                {appointment.doctor.specialization && (
                  <p className="text-xs text-gray-600">
                    {appointment.doctor.specialization}
                  </p>
                )}
              </div>

              {appointment.reasonForVisit && (
                <div className="bg-gray-50 p-4 rounded-sm">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Reason for Visit
                  </h3>
                  <p className="text-sm text-gray-900">
                    {appointment.reasonForVisit}
                  </p>
                </div>
              )}

              {appointment.notes && (
                <div className="bg-gray-50 p-4 rounded-sm">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Notes
                  </h3>
                  <p className="text-sm text-gray-900">{appointment.notes}</p>
                </div>
              )}
            </div>
          )}

          {currentStep === "appointment" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Appointment Type
                  </label>
                  <Select
                    value={appointmentData.type}
                    onValueChange={(value: AppointmentType) =>
                      setAppointmentData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <Select
                    value={appointmentData.status}
                    onValueChange={(value: AppointmentStatus) =>
                      setAppointmentData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-8 w-full justify-between text-left text-xs font-normal"
                      >
                        {appointmentData.scheduledDate
                          ? appointmentData.scheduledDate.toLocaleDateString()
                          : "Select date"}
                        <ChevronDownIcon className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-0 shadow-none"
                      align="start"
                    >
                      <Calendar
                        key={`appointment-calendar-${appointment?.id || "new"}`}
                        mode="single"
                        selected={appointmentData.scheduledDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          if (date) {
                            setAppointmentData((prev) => ({
                              ...prev,
                              scheduledDate: date,
                            }));
                          }
                          setCalendarOpen(false);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        className=""
                        classNames={{
                          months: "",
                          month: "",
                          caption: "",
                          caption_label: "",
                          nav: "",
                          nav_button: "",
                          nav_button_previous: "",
                          nav_button_next: "",
                          table: "",
                          head_row: "",
                          head_cell: "",
                          row: "",
                          cell: "",
                          day: "",
                          day_selected: "",
                          day_today: "",
                          day_outside: "",
                          day_disabled: "",
                          day_range_middle: "",
                          day_hidden: "",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={appointmentData.scheduledTime}
                    onChange={(e) =>
                      setAppointmentData((prev) => ({
                        ...prev,
                        scheduledTime: e.target.value,
                      }))
                    }
                    className="h-8 text-xs bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <Select
                  value={appointmentData.durationMinutes?.toString() || "30"}
                  onValueChange={(value) =>
                    setAppointmentData((prev) => ({
                      ...prev,
                      durationMinutes: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value.toString()}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <Select
                  value={appointmentData.doctorId}
                  onValueChange={(value) =>
                    setAppointmentData((prev) => ({
                      ...prev,
                      doctorId: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorsData?.doctors?.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName}
                        {doctor.specialization && ` - ${doctor.specialization}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <Textarea
                  value={appointmentData.reasonForVisit}
                  onChange={(e) =>
                    setAppointmentData((prev) => ({
                      ...prev,
                      reasonForVisit: e.target.value,
                    }))
                  }
                  placeholder="Describe the reason for this appointment..."
                  className="text-xs resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Textarea
                  value={appointmentData.notes}
                  onChange={(e) =>
                    setAppointmentData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Additional notes about the appointment..."
                  className="text-xs resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === "patient" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    value={patientData.firstName}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="h-8 text-xs"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={patientData.lastName}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="h-8 text-xs"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={patientData.email}
                    onChange={(e) =>
                      setPatientData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="h-8 text-xs"
                    placeholder="patient@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone *
                    {patientData.phone && (
                      <span className="text-xs text-blue-600 font-normal ml-1">
                        (Used for check-in)
                      </span>
                    )}
                  </label>
                  <Input
                    type="tel"
                    value={patientData.phone}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Basic Singapore phone formatting
                      if (value.startsWith("+65")) {
                        value = value.replace(/\D/g, "").replace(/^65/, "+65 ");
                        if (value.length > 7) {
                          value = value.slice(0, 7) + " " + value.slice(7, 11);
                        }
                      }
                      setPatientData((prev) => ({
                        ...prev,
                        phone: value,
                      }));
                    }}
                    className="h-8 text-xs"
                    placeholder="+65 XXXX XXXX"
                  />
                  {assistanceRequestPhoneNumber && (
                    <p className="text-xs text-blue-600 mt-1">
                      ✓ Auto-filled from check-in (editable)
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <Popover open={dobCalendarOpen} onOpenChange={setDobCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-8 w-full justify-between text-left text-xs font-normal"
                    >
                      {patientData.dateOfBirth
                        ? patientData.dateOfBirth.toLocaleDateString()
                        : "Select date of birth"}
                      <ChevronDownIcon className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-0 shadow-none"
                    align="start"
                  >
                    <Calendar
                      key={`dob-calendar-${appointment?.id || "new"}`}
                      mode="single"
                      selected={patientData.dateOfBirth}
                      captionLayout="dropdown"
                      onSelect={(date) => {
                        if (date) {
                          setPatientData((prev) => ({
                            ...prev,
                            dateOfBirth: date,
                          }));
                        }
                        setDobCalendarOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      className=""
                      classNames={{
                        months: "",
                        month: "",
                        caption: "",
                        caption_label: "",
                        nav: "",
                        nav_button: "",
                        nav_button_previous: "",
                        nav_button_next: "",
                        table: "",
                        head_row: "",
                        head_cell: "",
                        row: "",
                        cell: "",
                        day: "",
                        day_selected: "",
                        day_today: "",
                        day_outside: "",
                        day_disabled: "",
                        day_range_middle: "",
                        day_hidden: "",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Textarea
                  value={patientData.address}
                  onChange={(e) =>
                    setPatientData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter full address"
                  className="text-xs resize-none"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === "review" && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-medium text-blue-900">
                    Review Changes
                  </h3>
                </div>
                <p className="text-xs text-blue-700">
                  Please review all changes before saving. This will update both
                  the appointment and patient information.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Appointment Updates
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">
                        {
                          appointmentTypeOptions.find(
                            (opt) => opt.value === appointmentData.type
                          )?.label
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className="font-medium">
                        {
                          appointmentStatusOptions.find(
                            (opt) => opt.value === appointmentData.status
                          )?.label
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date & Time:</span>
                      <span className="font-medium">
                        {appointmentData.scheduledDate
                          ? format(appointmentData.scheduledDate, "PPP")
                          : "No date selected"}{" "}
                        at {appointmentData.scheduledTime 
                          ? new Date(`2000-01-01T${appointmentData.scheduledTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : "No time selected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">
                        {durationOptions.find(
                          (opt) => opt.value === appointmentData.durationMinutes
                        )?.label ||
                          `${appointmentData.durationMinutes || 30} minutes`}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Patient Updates
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">
                        {patientData.firstName} {patientData.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{patientData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{patientData.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">DOB:</span>
                      <span className="font-medium">
                        {patientData.dateOfBirth.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {(appointmentData.reasonForVisit || appointmentData.notes) && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Additional Information
                  </h4>
                  {appointmentData.reasonForVisit && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500">
                        Reason for Visit:
                      </span>
                      <p className="text-xs text-gray-900 mt-1">
                        {appointmentData.reasonForVisit}
                      </p>
                    </div>
                  )}
                  {appointmentData.notes && (
                    <div>
                      <span className="text-xs text-gray-500">Notes:</span>
                      <p className="text-xs text-gray-900 mt-1">
                        {appointmentData.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep !== "overview" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentIndex = steps.findIndex(
                      (step) => step.key === currentStep
                    );
                    if (currentIndex > 0) {
                      setCurrentStep(steps[currentIndex - 1].key);
                    }
                  }}
                  className="text-xs"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                className="text-xs"
              >
                Cancel
              </Button>

              {currentStep === "review" ? (
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isPending}
                  className="text-xs"
                >
                  {isPending ? (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 mr-1" />
                      Save Changes
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    const currentIndex = steps.findIndex(
                      (step) => step.key === currentStep
                    );
                    if (currentIndex < steps.length - 1) {
                      setCurrentStep(steps[currentIndex + 1].key);
                    }
                  }}
                  className="text-xs"
                >
                  Next
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
