import { useState, useEffect } from "react";

// Simple in-memory store for demo purposes
// In a real app, this would use WebSocket/Server-Sent Events or a real-time database
export interface AssistanceRequest {
  id: string;
  phoneNumber: string;
  requestType: "registration" | "walk-in";
  timestamp: Date;
  status: "pending" | "acknowledged" | "completed";
  message?: string;
  patientId?: string;
  appointmentId?: string;
}

// Global state for assistance requests (demo purposes)
let assistanceRequests: AssistanceRequest[] = [];
let listeners: Array<(requests: AssistanceRequest[]) => void> = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener([...assistanceRequests]));
};

// Hook for creating assistance requests (check-in page)
export const useCreateAssistanceRequest = () => {
  const createRequest = (
    phoneNumber: string, 
    requestType: "registration" | "walk-in", 
    message?: string,
    patientId?: string,
    appointmentId?: string
  ) => {
    const newRequest: AssistanceRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phoneNumber,
      requestType,
      timestamp: new Date(),
      status: "pending",
      message,
      patientId,
      appointmentId,
    };
    
    assistanceRequests.unshift(newRequest); // Add to beginning
    notifyListeners();
    
    return newRequest;
  };

  return { createRequest };
};

// Hook for managing assistance requests (staff dashboard)
export const useAssistanceRequests = () => {
  const [requests, setRequests] = useState<AssistanceRequest[]>([...assistanceRequests]);

  useEffect(() => {
    const listener = (updatedRequests: AssistanceRequest[]) => {
      setRequests(updatedRequests);
    };
    
    listeners.push(listener);
    
    // Initial sync
    setRequests([...assistanceRequests]);
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const acknowledgeRequest = (id: string) => {
    assistanceRequests = assistanceRequests.map(req =>
      req.id === id ? { ...req, status: "acknowledged" as const } : req
    );
    notifyListeners();
  };

  const completeRequest = (id: string) => {
    assistanceRequests = assistanceRequests.map(req =>
      req.id === id ? { ...req, status: "completed" as const } : req
    );
    notifyListeners();
  };

  const dismissRequest = (id: string) => {
    assistanceRequests = assistanceRequests.filter(req => req.id !== id);
    notifyListeners();
  };

  return {
    requests,
    acknowledgeRequest,
    completeRequest,
    dismissRequest,
    pendingCount: requests.filter(r => r.status === "pending").length,
  };
};