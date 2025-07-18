import { useMutation } from "@tanstack/react-query";
import { smsApi } from "@/lib/api";

// Hook for sending basic SMS
export const useSendSMS = () => {
  return useMutation({
    mutationFn: (data: {
      to: string;
      body: string;
      patientName?: string;
    }) => smsApi.sendSMS(data),
    onSuccess: (data) => {
      console.log("✅ SMS sent successfully:", data);
    },
    onError: (error) => {
      console.error("❌ Failed to send SMS:", error);
    },
  });
};

// Hook for sending appointment reminders
export const useSendAppointmentReminder = () => {
  return useMutation({
    mutationFn: (data: {
      phoneNumber: string;
      patientName: string;
      appointmentDate: string;
      doctorName: string;
      clinicName?: string;
    }) => smsApi.sendAppointmentReminder(data),
    onSuccess: (data) => {
      console.log("✅ Appointment reminder sent successfully:", data);
    },
    onError: (error) => {
      console.error("❌ Failed to send appointment reminder:", error);
    },
  });
};

// Hook for sending appointment confirmations
export const useSendAppointmentConfirmation = () => {
  return useMutation({
    mutationFn: (data: {
      phoneNumber: string;
      patientName: string;
      appointmentDate: string;
      doctorName: string;
      clinicName?: string;
    }) => smsApi.sendAppointmentConfirmation(data),
    onSuccess: (data) => {
      console.log("✅ Appointment confirmation sent successfully:", data);
    },
    onError: (error) => {
      console.error("❌ Failed to send appointment confirmation:", error);
    },
  });
};

// Hook for sending custom messages
export const useSendCustomMessage = () => {
  return useMutation({
    mutationFn: (data: {
      phoneNumber: string;
      message: string;
      patientName?: string;
    }) => smsApi.sendCustomMessage(data),
    onSuccess: (data) => {
      console.log("✅ Custom message sent successfully:", data);
    },
    onError: (error) => {
      console.error("❌ Failed to send custom message:", error);
    },
  });
};

// Hook for testing SMS functionality
export const useTestSMS = () => {
  return useMutation({
    mutationFn: (data: {
      phoneNumber: string;
    }) => smsApi.testSMS(data),
    onSuccess: (data) => {
      console.log("✅ Test SMS sent successfully:", data);
    },
    onError: (error) => {
      console.error("❌ Failed to send test SMS:", error);
    },
  });
};

// Utility function to format Singapore phone numbers
export const formatSingaporePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Handle different Singapore number formats
  if (digits.startsWith('65')) {
    // Already has country code
    return `+${digits}`;
  } else if (digits.startsWith('8') || digits.startsWith('9')) {
    // Singapore mobile numbers start with 8 or 9
    return `+65${digits}`;
  } else if (digits.startsWith('6')) {
    // Singapore landline numbers start with 6
    return `+65${digits}`;
  } else {
    // Assume it's a Singapore number and add +65
    return `+65${digits}`;
  }
};

// Utility function to validate Singapore phone numbers
export const validateSingaporePhoneNumber = (phoneNumber: string): boolean => {
  const formatted = formatSingaporePhoneNumber(phoneNumber);
  
  // Singapore mobile: +65 8xxx xxxx or +65 9xxx xxxx (8 digits after country code)
  // Singapore landline: +65 6xxx xxxx (8 digits after country code)
  const singaporePattern = /^\+65[689]\d{7}$/;
  
  return singaporePattern.test(formatted);
};