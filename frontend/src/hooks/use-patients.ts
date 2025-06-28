import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  patientsApi, 
  ApiError 
} from "@/lib/api";
import {
  Patient,
  PatientId,
  PatientQueryParams,
  CreatePatientRequest,
  UpdatePatientRequest,
} from "@/lib/api-types";

// Query Keys
export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (params?: PatientQueryParams) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (id: PatientId) => [...patientKeys.details(), id] as const,
};

// Hook to get all patients with optional filtering
export const usePatients = (params?: PatientQueryParams) => {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => patientsApi.getPatients(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single patient by ID
export const usePatient = (id: PatientId) => {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => patientsApi.getPatientById(id),
    enabled: !!id, // Only run query if ID is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a new patient
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientsApi.createPatient(data),
    onSuccess: (response) => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      
      // Set the new patient data in cache
      queryClient.setQueryData(
        patientKeys.detail(response.patient.id),
        response
      );
    },
    onError: (error: ApiError) => {
      console.error("Failed to create patient:", error);
    },
  });
};

// Hook to update a patient
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: PatientId; data: UpdatePatientRequest }) =>
      patientsApi.updatePatient(id, data),
    onSuccess: (response, variables) => {
      // Update the patient in the detail cache
      queryClient.setQueryData(
        patientKeys.detail(variables.id),
        response
      );
      
      // Invalidate lists to ensure they reflect the update
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    onError: (error: ApiError) => {
      console.error("Failed to update patient:", error);
    },
  });
};

// Hook to delete a patient
export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: PatientId) => patientsApi.deletePatient(id),
    onSuccess: (_, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: patientKeys.detail(deletedId) });
      
      // Invalidate lists to remove the deleted patient
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    onError: (error: ApiError) => {
      console.error("Failed to delete patient:", error);
    },
  });
};

// Optimistic update hook for patient data (React 18/19 feature showcase)
export const useOptimisticPatientUpdate = () => {
  const queryClient = useQueryClient();
  const updateMutation = useUpdatePatient();

  const updatePatientOptimistically = async (
    id: PatientId,
    updates: UpdatePatientRequest
  ) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: patientKeys.detail(id) });

    // Snapshot the previous value
    const previousPatient = queryClient.getQueryData(patientKeys.detail(id));

    // Optimistically update the cache
    queryClient.setQueryData(patientKeys.detail(id), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        patient: {
          ...old.patient,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    try {
      // Perform the actual update
      await updateMutation.mutateAsync({ id, data: updates });
    } catch (error) {
      // If the mutation fails, roll back to the previous state
      queryClient.setQueryData(patientKeys.detail(id), previousPatient);
      throw error;
    }
  };

  return {
    updatePatientOptimistically,
    isUpdating: updateMutation.isPending,
  };
};