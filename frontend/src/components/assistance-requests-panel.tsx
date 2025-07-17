"use client";

import { useState } from "react";
import { Bell, Clock, Phone, UserCheck, X, Check, AlertCircle } from "lucide-react";
import { useAssistanceRequests, AssistanceRequest } from "@/hooks/use-assistance-requests";

interface AssistanceRequestsPanelProps {
  className?: string;
  onRequestClick?: (request: AssistanceRequest) => void;
}

export const AssistanceRequestsPanel = ({ className = "", onRequestClick }: AssistanceRequestsPanelProps) => {
  const { requests, acknowledgeRequest, completeRequest, dismissRequest, pendingCount } = useAssistanceRequests();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getRequestTypeColor = (type: AssistanceRequest["requestType"]) => {
    switch (type) {
      case "registration":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "walk-in":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  const getStatusColor = (status: AssistanceRequest["status"]) => {
    switch (status) {
      case "pending":
        return "text-red-600";
      case "acknowledged":
        return "text-orange-600";
      case "completed":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  
  if (requests.length === 0) {
    return null;
  }
  
  return (
    <div className={`bg-white border border-gray-200 rounded-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" />
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Assistance Requests
            </h2>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium border border-red-200 rounded-xs">
                {pendingCount} new
              </span>
            )}
          </div>
          <div className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`}>
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>
      
      {/* Request List */}
      {isExpanded && (
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {requests.map((request) => (
            <div
              key={request.id}
              onClick={() => onRequestClick?.(request)}
              className={`px-4 py-3 transition-colors ${
                request.status === "pending" ? "bg-red-50" : 
                request.status === "acknowledged" ? "bg-orange-50" : "bg-gray-50"
              } ${request.appointmentId && onRequestClick ? "cursor-pointer hover:bg-opacity-80" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {request.phoneNumber}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium border rounded-xs ${getRequestTypeColor(request.requestType)}`}>
                      {request.requestType === "registration" ? "Registration" : "Walk-in"}
                    </span>
                    {request.appointmentId && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium border border-green-200 rounded-xs">
                        Has Appointment
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-600 mb-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(request.timestamp)}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className={`font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                  
                  {request.message && (
                    <p className="text-xs text-gray-600 mt-1">
                      {request.message}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 ml-3">
                  {request.status === "pending" && (
                    <>
                      <button
                        onClick={() => acknowledgeRequest(request.id)}
                        className="p-1 hover:bg-orange-100 rounded-xs transition-colors"
                        title="Acknowledge"
                      >
                        <AlertCircle className="h-3 w-3 text-orange-600" />
                      </button>
                      <button
                        onClick={() => completeRequest(request.id)}
                        className="p-1 hover:bg-green-100 rounded-xs transition-colors"
                        title="Mark Complete"
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </button>
                    </>
                  )}
                  
                  {request.status === "acknowledged" && (
                    <button
                      onClick={() => completeRequest(request.id)}
                      className="p-1 hover:bg-green-100 rounded-xs transition-colors"
                      title="Mark Complete"
                    >
                      <Check className="h-3 w-3 text-green-600" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => dismissRequest(request.id)}
                    className="p-1 hover:bg-red-100 rounded-xs transition-colors"
                    title="Dismiss"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Empty State */}
      {isExpanded && requests.length === 0 && (
        <div className="px-4 py-8 text-center">
          <Bell className="h-6 w-6 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-600 mb-1">No assistance requests</p>
          <p className="text-xs text-gray-500">All caught up!</p>
        </div>
      )}
    </div>
  );
};