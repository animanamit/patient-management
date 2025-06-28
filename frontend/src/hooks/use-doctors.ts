import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  doctorsApi, 
  ApiError 
} from "@/lib/api";
import {
  Doctor,
  DoctorId,
  DoctorQueryParams,
  CreateDoctorRequest,
  UpdateDoctorRequest,
} from "@/lib/api-types";

// Query Keys
export const doctorKeys = {
  all: ["doctors"] as const,
  lists: () => [...doctorKeys.all, "list"] as const,
  list: (params?: DoctorQueryParams) => [...doctorKeys.lists(), params] as const,
  details: () => [...doctorKeys.all, "detail"] as const,
  detail: (id: DoctorId) => [...doctorKeys.details(), id] as const,
  active: () => [...doctorKeys.all, "active"] as const,
  bySpecialization: (specialization: string) => [...doctorKeys.all, "specialization", specialization] as const,
};

// Hook to get all doctors with optional filtering
export const useDoctors = (params?: DoctorQueryParams) => {
  return useQuery({
    queryKey: doctorKeys.list(params),
    queryFn: async () => {
      console.log('🔍 Fetching doctors with params:', params);
      try {
        const result = await doctorsApi.getDoctors(params);
        console.log('✅ Doctors fetched successfully:', result);
        return result;
      } catch (error) {
        console.error('❌ Failed to fetch doctors:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get active doctors only
export const useActiveDoctors = () => {
  return useQuery({
    queryKey: doctorKeys.active(),
    queryFn: () => doctorsApi.getDoctors({ isActive: "true" }),
    staleTime: 10 * 60 * 1000, // 10 minutes - active doctors change less frequently
  });
};

// Hook to get doctors by specialization
export const useDoctorsBySpecialization = (specialization: string) => {
  return useQuery({
    queryKey: doctorKeys.bySpecialization(specialization),
    queryFn: () => doctorsApi.getDoctors({ specialization }),
    enabled: !!specialization,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single doctor by ID
export const useDoctor = (id: DoctorId, options: { enabled?: boolean } = {}) => {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorsApi.getDoctorById(id),
    enabled: options.enabled !== false && !!id, // Only run query if ID is provided and not disabled
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create a new doctor
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDoctorRequest) => doctorsApi.createDoctor(data),
    onSuccess: (response) => {
      // Invalidate and refetch doctors lists
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.active() });
      
      // Set the new doctor data in cache
      queryClient.setQueryData(
        doctorKeys.detail(response.doctor.id),
        response
      );
    },
    onError: (error: ApiError) => {
      console.error("Failed to create doctor:", error);
    },
  });
};

// Hook to update a doctor
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: DoctorId; data: UpdateDoctorRequest }) =>
      doctorsApi.updateDoctor(id, data),
    onSuccess: (response, variables) => {
      // Update the doctor in the detail cache
      queryClient.setQueryData(
        doctorKeys.detail(variables.id),
        response
      );
      
      // Invalidate lists to ensure they reflect the update
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.active() });
      
      // If specialization was updated, invalidate specialization queries
      if (variables.data.specialization !== undefined) {
        queryClient.invalidateQueries({ 
          queryKey: [...doctorKeys.all, "specialization"] 
        });
      }
    },
    onError: (error: ApiError) => {
      console.error("Failed to update doctor:", error);
    },
  });
};

// Hook to delete a doctor
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: DoctorId) => doctorsApi.deleteDoctor(id),
    onSuccess: (_, deletedId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: doctorKeys.detail(deletedId) });
      
      // Invalidate lists to remove the deleted doctor
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.active() });
      queryClient.invalidateQueries({ 
        queryKey: [...doctorKeys.all, "specialization"] 
      });
    },
    onError: (error: ApiError) => {
      console.error("Failed to delete doctor:", error);
    },
  });
};

// Optimistic update hook for doctor status (React 18/19 feature showcase)
export const useOptimisticDoctorStatusUpdate = () => {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateDoctor();

  const toggleDoctorStatusOptimistically = async (
    id: DoctorId,
    newStatus: boolean
  ) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey: doctorKeys.detail(id) });

    // Snapshot the previous value
    const previousDoctor = queryClient.getQueryData(doctorKeys.detail(id));

    // Optimistically update the cache
    queryClient.setQueryData(doctorKeys.detail(id), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        doctor: {
          ...old.doctor,
          isActive: newStatus,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    try {
      // Perform the actual update
      await updateMutation.mutateAsync({ 
        id, 
        data: { isActive: newStatus } 
      });
    } catch (error) {
      // If the mutation fails, roll back to the previous state
      queryClient.setQueryData(doctorKeys.detail(id), previousDoctor);
      throw error;
    }
  };

  return {
    toggleDoctorStatusOptimistically,
    isUpdating: updateMutation.isPending,
  };
};