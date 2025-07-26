"use client";

import { useState, useTransition, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Upload,
  Download,
  Save,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Activity,
  PlusCircle,
  X,
  Eye,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AppointmentWithDetails, AppointmentStatus, AppointmentId } from "@/lib/api-types";
import { useAppointment, useUpdateAppointment } from "@/hooks/use-appointments";
import {
  useDocuments,
  DocumentWithUploader,
  DocumentCategory,
} from "@/hooks/use-documents";
import { DocumentList } from "@/components/documents/document-list";
import { DocumentUploadModal } from "@/components/documents/document-upload-modal";
import { DocumentPreview } from "@/components/documents/document-preview";
import { useAuth } from "@/hooks/use-auth";

const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "SCHEDULED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "IN_PROGRESS":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200";
    case "NO_SHOW":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusLabel = (status: AppointmentStatus) => {
  switch (status) {
    case "SCHEDULED":
      return "Scheduled";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "NO_SHOW":
      return "No Show";
    default:
      return status;
  }
};

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  
  // Ensure the ID has the appt_ prefix for API calls
  const appointmentId = rawId.startsWith('appt_') ? rawId : `appt_${rawId}`;
  
  // Debug logging
  console.log('🔍 Raw ID from params:', rawId);
  console.log('🔍 Full appointmentId for API:', appointmentId);
  console.log('🔍 URL pathname:', window.location.pathname);
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  
  // Document modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DocumentWithUploader | null>(null);

  // Get current user for document management
  const { data: authData } = useAuth();
  const currentUser = authData?.user;
  
  // Doctor's notes and clinical data
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [prescription, setPrescription] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    weight: "",
    height: "",
  });

  // Track initial values for change detection
  const [initialValues, setInitialValues] = useState<{
    clinicalNotes: string;
    diagnosis: string;
    treatment: string;
    prescription: string;
    followUpNotes: string;
    vitals: typeof vitals;
  } | null>(null);

  const { data: appointmentData, isLoading, error } = useAppointment(appointmentId as AppointmentId);
  
  // Fetch appointment documents
  const { 
    data: documentsData, 
    isLoading: isDocumentsLoading,
    refetch: refetchDocuments 
  } = useDocuments({ 
    appointmentId: appointmentId as AppointmentId
  }, { 
    enabled: !!appointmentId 
  });
  
  console.log('Appointment data:', appointmentData);
  console.log('Error:', error);
  const updateAppointmentMutation = useUpdateAppointment();

  const appointment = appointmentData?.appointment;

  // Check if current user is a doctor (you'll need to implement actual role checking)
  const isDoctorView = true; // Replace with actual role check
  const isAdminView = false; // Replace with actual role check

  // Initialize form data when appointment loads
  useEffect(() => {
    if (appointment && !initialValues) {
      const initial = {
        clinicalNotes: "",
        diagnosis: "",
        treatment: "",
        prescription: "",
        followUpNotes: "",
        vitals: {
          bloodPressure: "",
          heartRate: "",
          temperature: "",
          weight: "",
          height: "",
        },
      };
      
      setInitialValues(initial);
      setClinicalNotes(initial.clinicalNotes);
      setDiagnosis(initial.diagnosis);
      setTreatment(initial.treatment);
      setPrescription(initial.prescription);
      setFollowUpNotes(initial.followUpNotes);
      setVitals(initial.vitals);
    }
  }, [appointment, initialValues]);

  // Check if there are any changes
  const hasChanges = () => {
    if (!initialValues) return false;
    
    return (
      clinicalNotes !== initialValues.clinicalNotes ||
      diagnosis !== initialValues.diagnosis ||
      treatment !== initialValues.treatment ||
      prescription !== initialValues.prescription ||
      followUpNotes !== initialValues.followUpNotes ||
      JSON.stringify(vitals) !== JSON.stringify(initialValues.vitals)
    );
  };

  const handleSave = async () => {
    if (!appointment || !hasChanges()) {
      console.log('No changes to save');
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        // Only save if there are actual changes
        const updatedNotes = `${appointment.notes || ''}\n\nClinical Notes:\n${clinicalNotes}\n\nDiagnosis: ${diagnosis}\n\nTreatment: ${treatment}\n\nPrescription: ${prescription}\n\nFollow-up: ${followUpNotes}`;
        
        await updateAppointmentMutation.mutateAsync({
          id: appointment.id,
          data: {
            notes: updatedNotes.trim(),
          },
        });
        
        // Update initial values to current values after successful save
        const newInitialValues = {
          clinicalNotes,
          diagnosis,
          treatment,
          prescription,
          followUpNotes,
          vitals: { ...vitals },
        };
        setInitialValues(newInitialValues);
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to save appointment details:", error);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-red-600 mb-4">Failed to load appointment details</p>
          <Button onClick={() => router.back()} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <ArrowLeft className="h-3 w-3 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Appointment Details
                </h1>
                <p className="text-sm text-gray-600">
                  {appointment?.patient?.firstName} {appointment?.patient?.lastName} • #{appointment?.id?.split("_")?.[1] || 'Loading...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {appointment && (
                <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                  {getStatusLabel(appointment.status)}
                </Badge>
              )}
              {isDoctorView && (
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  {isEditing ? (
                    <>
                      <Eye className="h-3 w-3 mr-2" />
                      View Mode
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3 w-3 mr-2" />
                      Edit Mode
                    </>
                  )}
                </Button>
              )}
              {isEditing && (
                <Button
                  onClick={handleSave}
                  disabled={isPending || !hasChanges()}
                  size="sm"
                  className="text-xs"
                >
                  {isPending ? (
                    <>
                      <AlertCircle className="h-3 w-3 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : hasChanges() ? (
                    <>
                      <Save className="h-3 w-3 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 mr-2" />
                      No Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Patient & Appointment Info */}
          <div className="col-span-4 space-y-6">
            {/* Patient Information */}
            <div className="bg-white border border-gray-200 rounded-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {appointment?.patient?.firstName} {appointment?.patient?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="text-sm text-gray-900">
                    {appointment?.patient?.dateOfBirth
                      ? new Date(appointment.patient.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <p className="text-sm text-gray-900">{typeof appointment?.patient?.phone === 'object' ? appointment.patient.phone.normalizedValue : appointment?.patient?.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <p className="text-sm text-gray-900">{typeof appointment?.patient?.email === 'object' ? appointment.patient.email.normalizedValue : appointment?.patient?.email}</p>
                </div>
                {appointment?.patient?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-900">{appointment.patient.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Appointment Information */}
            <div className="bg-white border border-gray-200 rounded-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Details
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {appointment?.scheduledDateTime ? new Date(appointment.scheduledDateTime).toLocaleString([], {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Loading...'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-sm text-gray-900">
                    {appointment?.type?.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()) || 'Loading...'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm text-gray-900">{appointment?.durationMinutes || 0} minutes</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Doctor</p>
                  <p className="text-sm font-medium text-gray-900">
                    Dr. {appointment?.doctor?.firstName} {appointment?.doctor?.lastName}
                  </p>
                  {appointment?.doctor?.specialization && (
                    <p className="text-xs text-gray-600">{appointment.doctor.specialization}</p>
                  )}
                </div>
                {appointment?.reasonForVisit && (
                  <div>
                    <p className="text-xs text-gray-500">Reason for Visit</p>
                    <p className="text-sm text-gray-900">{appointment.reasonForVisit}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vitals */}
            <div className="bg-white border border-gray-200 rounded-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Vital Signs
                </h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Blood Pressure</label>
                    <Input
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals(prev => ({ ...prev, bloodPressure: e.target.value }))}
                      placeholder="120/80"
                      className="h-8 text-xs"
                      disabled={!isEditing || !isDoctorView}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Heart Rate</label>
                    <Input
                      value={vitals.heartRate}
                      onChange={(e) => setVitals(prev => ({ ...prev, heartRate: e.target.value }))}
                      placeholder="72 bpm"
                      className="h-8 text-xs"
                      disabled={!isEditing || !isDoctorView}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Temperature</label>
                    <Input
                      value={vitals.temperature}
                      onChange={(e) => setVitals(prev => ({ ...prev, temperature: e.target.value }))}
                      placeholder="98.6°F"
                      className="h-8 text-xs"
                      disabled={!isEditing || !isDoctorView}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Weight</label>
                    <Input
                      value={vitals.weight}
                      onChange={(e) => setVitals(prev => ({ ...prev, weight: e.target.value }))}
                      placeholder="150 lbs"
                      className="h-8 text-xs"
                      disabled={!isEditing || !isDoctorView}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Clinical Notes & Files */}
          <div className="col-span-8 space-y-6">
            {/* Clinical Notes */}
            <div className="bg-white border border-gray-200 rounded-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Clinical Documentation
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Clinical Notes
                  </label>
                  <Textarea
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Document clinical observations, findings, and notes..."
                    className="text-xs resize-none"
                    rows={4}
                    disabled={!isEditing || !isDoctorView}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Diagnosis
                    </label>
                    <Textarea
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="Primary and secondary diagnoses..."
                      className="text-xs resize-none"
                      rows={3}
                      disabled={!isEditing || !isDoctorView}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Treatment Plan
                    </label>
                    <Textarea
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      placeholder="Treatment recommendations and plan..."
                      className="text-xs resize-none"
                      rows={3}
                      disabled={!isEditing || !isDoctorView}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Prescription
                  </label>
                  <Textarea
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    placeholder="Medications prescribed, dosage, and instructions..."
                    className="text-xs resize-none"
                    rows={3}
                    disabled={!isEditing || !isDoctorView}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Follow-up Instructions
                  </label>
                  <Textarea
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="Follow-up appointments, instructions for patient, next steps..."
                    className="text-xs resize-none"
                    rows={3}
                    disabled={!isEditing || !isDoctorView}
                  />
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className="bg-white border border-gray-200 rounded-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Attachments & Reports
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <Upload className="h-3 w-3 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {isDocumentsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading documents...</p>
                  </div>
                ) : documentsData?.documents && documentsData.documents.length > 0 ? (
                  <DocumentList
                    documents={documentsData.documents}
                    userRole={currentUser?.role === 'DOCTOR' ? 'DOCTOR' : currentUser?.role === 'STAFF' ? 'STAFF' : 'PATIENT'}
                    currentUserId={currentUser?.id}
                    onPreview={setPreviewDocument}
                    onRefresh={refetchDocuments}
                  />
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">No attachments yet</p>
                    <p className="text-xs text-gray-500">Upload lab results, reports, or other files</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      {appointment?.patient && (
        <DocumentUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          patientId={appointment.patient.id}
          appointmentId={appointmentId}
          onUploadComplete={() => {
            refetchDocuments();
            setIsUploadModalOpen(false);
          }}
        />
      )}

      {/* Document Preview Modal */}
      <DocumentPreview
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
      />
    </div>
  );
}