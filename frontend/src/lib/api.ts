import {
  Patient,
  Doctor,
  Appointment,
  AppointmentWithDetails,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientQueryParams,
  PatientsResponse,
  PatientApiResponse,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorQueryParams,
  DoctorsResponse,
  DoctorApiResponse,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  UpdateAppointmentStatusRequest,
  AppointmentQueryParams,
  AppointmentsResponse,
  AppointmentApiResponse,
  PatientId,
  DoctorId,
  AppointmentId,
} from "./api-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🔍 API Request: ${options.method || 'GET'} ${url}`);
  console.log('📤 Request options:', options);
  
  const config: RequestInit = {
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    console.log(`📥 API Response: ${response.status} ${response.statusText}`);
    console.log('🌐 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      console.error('📄 Error response body:', errorText);
      
      let errorData = {};
      if (errorText) {
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {};
        }
      }
      throw new ApiError(
        errorData.error || `HTTP error! status: ${response.status} - ${errorText}`,
        response.status,
        errorData.details
      );
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      console.log('✅ API Success: 204 No Content');
      return {} as T;
    }

    const data = await response.json();
    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error('🚨 Fetch error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      0
    );
  }
}

// Patient API functions
export const patientsApi = {
  // GET /patients - List patients with filtering
  getPatients: async (params?: PatientQueryParams): Promise<PatientsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/patients?${queryString}` : "/patients";
    
    return fetchApi<PatientsResponse>(endpoint);
  },

  // GET /patients/:id - Get single patient
  getPatientById: async (id: PatientId): Promise<PatientApiResponse> => {
    return fetchApi<PatientApiResponse>(`/patients/${id}`);
  },

  // POST /patients - Create new patient
  createPatient: async (data: CreatePatientRequest): Promise<PatientApiResponse> => {
    return fetchApi<PatientApiResponse>("/patients", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // PUT /patients/:id - Update patient
  updatePatient: async (
    id: PatientId,
    data: UpdatePatientRequest
  ): Promise<PatientApiResponse> => {
    return fetchApi<PatientApiResponse>(`/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // DELETE /patients/:id - Delete patient
  deletePatient: async (id: PatientId): Promise<void> => {
    return fetchApi<void>(`/patients/${id}`, {
      method: "DELETE",
    });
  },
};

// Doctor API functions
export const doctorsApi = {
  // GET /doctors - List doctors with filtering
  getDoctors: async (params?: DoctorQueryParams): Promise<DoctorsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/doctors?${queryString}` : "/doctors";
    
    return fetchApi<DoctorsResponse>(endpoint);
  },

  // GET /doctors/:id - Get single doctor
  getDoctorById: async (id: DoctorId): Promise<DoctorApiResponse> => {
    return fetchApi<DoctorApiResponse>(`/doctors/${id}`);
  },

  // POST /doctors - Create new doctor
  createDoctor: async (data: CreateDoctorRequest): Promise<DoctorApiResponse> => {
    return fetchApi<DoctorApiResponse>("/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // PATCH /doctors/:id - Update doctor
  updateDoctor: async (
    id: DoctorId,
    data: UpdateDoctorRequest
  ): Promise<DoctorApiResponse> => {
    return fetchApi<DoctorApiResponse>(`/doctors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // DELETE /doctors/:id - Delete doctor
  deleteDoctor: async (id: DoctorId): Promise<void> => {
    return fetchApi<void>(`/doctors/${id}`, {
      method: "DELETE",
    });
  },
};

// Appointment API functions
export const appointmentsApi = {
  // GET /appointments - List appointments with filtering
  getAppointments: async (params?: AppointmentQueryParams): Promise<AppointmentsResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/appointments?${queryString}` : "/appointments";
    
    return fetchApi<AppointmentsResponse>(endpoint);
  },

  // GET /appointments/:id - Get single appointment
  getAppointmentById: async (id: AppointmentId): Promise<AppointmentApiResponse> => {
    return fetchApi<AppointmentApiResponse>(`/appointments/${id}`);
  },

  // POST /appointments - Create new appointment
  createAppointment: async (data: CreateAppointmentRequest): Promise<AppointmentApiResponse> => {
    return fetchApi<AppointmentApiResponse>("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // PUT /appointments/:id - Update appointment
  updateAppointment: async (
    id: AppointmentId,
    data: UpdateAppointmentRequest
  ): Promise<AppointmentApiResponse> => {
    return fetchApi<AppointmentApiResponse>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // PATCH /appointments/:id/status - Update appointment status only
  updateAppointmentStatus: async (
    id: AppointmentId,
    data: UpdateAppointmentStatusRequest
  ): Promise<AppointmentApiResponse> => {
    return fetchApi<AppointmentApiResponse>(`/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  // DELETE /appointments/:id - Cancel appointment
  deleteAppointment: async (id: AppointmentId): Promise<void> => {
    return fetchApi<void>(`/appointments/${id}`, {
      method: "DELETE",
    });
  },

  // POST /appointments/:id/check-in - Check in patient for appointment
  checkInAppointment: async (id: AppointmentId): Promise<AppointmentApiResponse> => {
    return fetchApi<AppointmentApiResponse>(`/appointments/${id}/check-in`, {
      method: "POST",
    });
  },
};

// SMS API endpoints
export const smsApi = {
  // Send basic SMS
  sendSMS: async (data: {
    to: string;
    body: string;
    patientName?: string;
  }): Promise<{
    success: boolean;
    messageSid?: string;
    error?: string;
    to: string;
    body: string;
  }> => {
    return fetchApi<{
      success: boolean;
      messageSid?: string;
      error?: string;
      to: string;
      body: string;
    }>("/sms/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Send appointment reminder
  sendAppointmentReminder: async (data: {
    phoneNumber: string;
    patientName: string;
    appointmentDate: string;
    doctorName: string;
    clinicName?: string;
  }): Promise<{
    success: boolean;
    messageSid?: string;
    error?: string;
    to: string;
    body: string;
  }> => {
    return fetchApi<{
      success: boolean;
      messageSid?: string;
      error?: string;
      to: string;
      body: string;
    }>("/sms/appointment/reminder", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Send appointment confirmation
  sendAppointmentConfirmation: async (data: {
    phoneNumber: string;
    patientName: string;
    appointmentDate: string;
    doctorName: string;
    clinicName?: string;
  }): Promise<{
    success: boolean;
    messageSid?: string;
    error?: string;
    to: string;
    body: string;
  }> => {
    return fetchApi<{
      success: boolean;
      messageSid?: string;
      error?: string;
      to: string;
      body: string;
    }>("/sms/appointment/confirmation", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Send custom message
  sendCustomMessage: async (data: {
    phoneNumber: string;
    message: string;
    patientName?: string;
  }): Promise<{
    success: boolean;
    messageSid?: string;
    error?: string;
    to: string;
    body: string;
  }> => {
    return fetchApi<{
      success: boolean;
      messageSid?: string;
      error?: string;
      to: string;
      body: string;
    }>("/sms/custom", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Test SMS
  testSMS: async (data: {
    phoneNumber: string;
  }): Promise<{
    success: boolean;
    messageSid?: string;
    error?: string;
    to: string;
    body: string;
  }> => {
    return fetchApi<{
      success: boolean;
      messageSid?: string;
      error?: string;
      to: string;
      body: string;
    }>("/sms/test", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Export the API error class for use in components
export { ApiError };