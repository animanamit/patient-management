import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  appointmentsApi, 
  ApiError 
} from "@/lib/api";
import {
  Appointment,
  AppointmentWithDetails,
  AppointmentId,
  PatientId,
  DoctorId,
  AppointmentQueryParams,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  AppointmentStatus,
  AppointmentType,
} from "@/lib/api-types";

// Query Keys
export const appointmentKeys = {
  all: ["appointments"] as const,
  lists: () => [...appointmentKeys.all, "list"] as const,
  list: (params?: AppointmentQueryParams) => [...appointmentKeys.lists(), params] as const,
  details: () => [...appointmentKeys.all, "detail"] as const,
  detail: (id: AppointmentId) => [...appointmentKeys.details(), id] as const,
  byPatient: (patientId: PatientId) => [...appointmentKeys.all, "patient", patientId] as const,
  byDoctor: (doctorId: DoctorId) => [...appointmentKeys.all, "doctor", doctorId] as const,
  byStatus: (status: AppointmentStatus) => [...appointmentKeys.all, "status", status] as const,
  byType: (type: AppointmentType) => [...appointmentKeys.all, "type", type] as const,
  byDateRange: (dateFrom: string, dateTo: string) => [...appointmentKeys.all, "dateRange", dateFrom, dateTo] as const,
};

// Hook to get all appointments with optional filtering
export const useAppointments = (params?: AppointmentQueryParams) => {
  return useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => appointmentsApi.getAppointments(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - appointments change more frequently
  });
};

// Hook to get appointments for a specific patient
export const usePatientAppointments = (patientId?: PatientId, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: appointmentKeys.byPatient(patientId!),
    queryFn: () => appointmentsApi.getAppointments({ patientId }),
    enabled: !!patientId && (options.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get appointments for a specific doctor
export const useDoctorAppointments = (doctorId: DoctorId) => {
  return useQuery({
    queryKey: appointmentKeys.byDoctor(doctorId),
    queryFn: () => appointmentsApi.getAppointments({ doctorId }),
    enabled: !!doctorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get appointments by status
export const useAppointmentsByStatus = (status: AppointmentStatus) => {
  return useQuery({
    queryKey: appointmentKeys.byStatus(status),
    queryFn: () => appointmentsApi.getAppointments({ status }),
    staleTime: 1 * 60 * 1000, // 1 minute - status-based queries are time-sensitive
  });
};

// Hook to get appointments for today (for doctor/staff dashboards)
export const useTodayAppointments = (doctorId?: DoctorId, options: { enabled?: boolean } = {}) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  // Type safety: ensure doctorId is a string or undefined
  const validDoctorId = typeof doctorId === 'string' && doctorId ? doctorId : undefined;
  
  // Debug logging to help identify ID issues
  if (doctorId && typeof doctorId !== 'string') {
    console.error('useTodayAppointments: doctorId is not a string:', doctorId, typeof doctorId);
  }
  
  const params: AppointmentQueryParams = {
    dateFrom: startOfDay,
    dateTo: endOfDay,
    ...(validDoctorId && { doctorId: validDoctorId }),
  };

  return useQuery({
    queryKey: [...appointmentKeys.byDateRange(startOfDay, endOfDay), validDoctorId],
    queryFn: () => appointmentsApi.getAppointments(params),
    enabled: options.enabled !== false, // Remove the !!validDoctorId check to allow staff dashboard to work
    staleTime: 30 * 1000, // 30 seconds - today's appointments need frequent updates
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

// Hook to get a single appointment by ID
export const useAppointment = (id: AppointmentId) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentsApi.getAppointmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a new appointment
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentsApi.createAppointment(data),
    onSuccess: (response, variables) => {
      // Set the new appointment data in cache
      queryClient.setQueryData(
        appointmentKeys.detail(response.appointment.id),
        response
      );
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byPatient(variables.patientId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byDoctor(variables.doctorId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byStatus("SCHEDULED") });
    },
    onError: (error: ApiError) => {
      console.error("Failed to create appointment:", error);
    },
  });
};

// Hook to update an appointment
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: AppointmentId; data: UpdateAppointmentRequest }) =>
      appointmentsApi.updateAppointment(id, data),
    onSuccess: (response, variables) => {
      // Update the appointment in the detail cache
      queryClient.setQueryData(
        appointmentKeys.detail(variables.id),
        response
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      // Also invalidate all list-based queries including date range queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      
      // Invalidate patient and doctor specific queries
      const appointment = response.appointment as Appointment;
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byPatient(appointment.patientId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byDoctor(appointment.doctorId) });
      
      // Invalidate status-based queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byStatus(appointment.status) });
    },
    onError: (error: ApiError) => {
      console.error("Failed to update appointment:", error);
    },
  });
};

// Hook to update appointment status (optimized for frequent status changes)
export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: AppointmentId; status: AppointmentStatus }) =>
      appointmentsApi.updateAppointmentStatus(id, { status }),
    onSuccess: (response, variables) => {
      // Update the appointment in the detail cache
      queryClient.setQueryData(
        appointmentKeys.detail(variables.id),
        response
      );
      
      // Invalidate relevant queries efficiently
      const appointment = response.appointment as Appointment;
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      // Also invalidate all list-based queries including date range queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byPatient(appointment.patientId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byDoctor(appointment.doctorId) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.byStatus(variables.status) });
    },
    onError: (error: ApiError) => {
      console.error("Failed to update appointment status:", error);
    },
  });
};

// Hook to delete/cancel an appointment
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: AppointmentId) => appointmentsApi.deleteAppointment(id),
    onSuccess: (_, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: appointmentKeys.detail(deletedId) });
      
      // Invalidate all lists to remove the deleted appointment
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      // Invalidate all appointment-related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error: ApiError) => {
      console.error("Failed to delete appointment:", error);
    },
  });
};

// Optimistic status update hook (React 18/19 feature showcase)
export const useOptimisticAppointmentStatusUpdate = () => {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateAppointmentStatus();

  const updateStatusOptimistically = async (
    id: AppointmentId,
    newStatus: AppointmentStatus
  ) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: appointmentKeys.detail(id) });

    // Snapshot the previous value
    const previousAppointment = queryClient.getQueryData(appointmentKeys.detail(id));

    // Optimistically update the cache
    queryClient.setQueryData(appointmentKeys.detail(id), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        appointment: {
          ...old.appointment,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    try {
      // Perform the actual update
      await updateMutation.mutateAsync({ id, status: newStatus });
    } catch (error) {
      // If the mutation fails, roll back to the previous state
      queryClient.setQueryData(appointmentKeys.detail(id), previousAppointment);
      throw error;
    }
  };

  return {
    updateStatusOptimistically,
    isUpdating: updateMutation.isPending,
  };
};

// Hook for bulk appointment operations (for staff dashboard)
export const useBulkAppointmentOperations = () => {
  const queryClient = useQueryClient();

  const bulkUpdateStatus = useMutation({
    mutationFn: async ({ 
      appointmentIds, 
      status 
    }: { 
      appointmentIds: AppointmentId[];
      status: AppointmentStatus;
    }) => {
      // Execute all status updates in parallel
      const promises = appointmentIds.map(id => 
        appointmentsApi.updateAppointmentStatus(id, { status })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      // Invalidate all appointment-related queries
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
    onError: (error: ApiError) => {
      console.error("Failed to bulk update appointments:", error);
    },
  });

  return {
    bulkUpdateStatus,
    isBulkUpdating: bulkUpdateStatus.isPending,
  };
};