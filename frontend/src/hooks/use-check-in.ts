import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { patientsApi, appointmentsApi } from "@/lib/api";
import { AppointmentId, PatientId, AppointmentStatus } from "@/lib/api-types";

/**
 * Hook for patient lookup by phone number for check-in
 */
export const usePatientLookupByPhone = (phone: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["patients", "lookup", "phone", phone],
    queryFn: () => patientsApi.getPatients({ phone }),
    enabled: enabled && phone.length >= 8, // Only enable if phone number is complete
    staleTime: 0, // Always fresh for check-in
    gcTime: 1 * 60 * 1000, // Keep in cache for 1 minute only
  });
};

/**
 * Hook to get today's appointments for a specific patient
 */
export const usePatientTodayAppointments = (patientId: PatientId | null, enabled: boolean = false) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  return useQuery({
    queryKey: ["appointments", "patient", patientId, "today", today],
    queryFn: () => appointmentsApi.getAppointments({ 
      patientId, 
      date: today,
      status: "SCHEDULED" // Only get scheduled appointments for check-in
    }),
    enabled: enabled && !!patientId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for checking in a patient
 */
export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: AppointmentId) => 
      appointmentsApi.checkInAppointment(appointmentId),
    onSuccess: (response, appointmentId) => {
      // Invalidate relevant queries after successful check-in
      queryClient.invalidateQueries({ 
        queryKey: ["appointments", "today"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["appointments", appointmentId] 
      });
      
      // Update the appointment status in cache if it exists
      queryClient.setQueryData(
        ["appointments", "detail", appointmentId],
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            appointment: {
              ...old.appointment,
              status: "SCHEDULED" as AppointmentStatus, // Patient checked in, ready for doctor
              updatedAt: new Date().toISOString(),
            },
          };
        }
      );
    },
    onError: (error) => {
      console.error("Check-in failed:", error);
    },
  });
};

/**
 * Queue position estimation (mock implementation for now)
 * In a real app, this would come from a backend queue management system
 */
export const useQueuePosition = (appointmentId: AppointmentId | null) => {
  return useQuery({
    queryKey: ["queue", "position", appointmentId],
    queryFn: async () => {
      // Mock queue position logic
      if (!appointmentId) return null;
      
      // Simulate queue calculation
      const queueNumber = Math.floor(Math.random() * 5) + 1;
      const estimatedWaitMinutes = queueNumber * 15;
      
      return {
        queueNumber,
        position: `${queueNumber}${queueNumber === 1 ? 'st' : queueNumber === 2 ? 'nd' : queueNumber === 3 ? 'rd' : 'th'} in queue`,
        estimatedWait: estimatedWaitMinutes < 30 
          ? `${estimatedWaitMinutes} minutes`
          : `${Math.floor(estimatedWaitMinutes / 15) * 15}-${Math.ceil(estimatedWaitMinutes / 15) * 15} minutes`,
        patientsAhead: queueNumber - 1,
      };
    },
    enabled: !!appointmentId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for live updates
  });
};

/**
 * Optimistic check-in hook with immediate UI feedback
 */
export const useOptimisticCheckIn = () => {
  const checkInMutation = useCheckInAppointment();
  const queryClient = useQueryClient();

  const checkInOptimistically = async (appointmentId: AppointmentId) => {
    // Cancel in-flight queries to avoid overwriting our optimistic update
    await queryClient.cancelQueries({ 
      queryKey: ["appointments", "detail", appointmentId] 
    });

    // Optimistically update the appointment status
    queryClient.setQueryData(
      ["appointments", "detail", appointmentId],
      (old: any) => {
        if (!old) return old;
        return {
          ...old,
          appointment: {
            ...old.appointment,
            status: "SCHEDULED" as AppointmentStatus,
            updatedAt: new Date().toISOString(),
          },
        };
      }
    );

    try {
      await checkInMutation.mutateAsync(appointmentId);
      return { success: true };
    } catch (error) {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ 
        queryKey: ["appointments", "detail", appointmentId] 
      });
      throw error;
    }
  };

  return {
    checkInOptimistically,
    isCheckingIn: checkInMutation.isPending,
  };
};

// Export query keys for external cache management
export const checkInKeys = {
  all: ["check-in"] as const,
  lookup: () => [...checkInKeys.all, "lookup"] as const,
  phone: (phone: string) => [...checkInKeys.lookup(), "phone", phone] as const,
  queue: () => [...checkInKeys.all, "queue"] as const,
  position: (appointmentId: AppointmentId) => [...checkInKeys.queue(), "position", appointmentId] as const,
};