"use client";

import { useState, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Eye } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import { useAppointments } from "@/hooks/use-appointments";
import { AppointmentWithDetails, AppointmentStatus } from "@/lib/api-types";

interface AppointmentsCalendarProps {
  className?: string;
}

// Status color configuration
const getStatusColor = (status: AppointmentStatus) => {
  switch (status) {
    case "SCHEDULED":
      return { backgroundColor: "#EBF1F8", color: "#243A56", borderColor: "#D8E4F0" };
    case "IN_PROGRESS":
      return { backgroundColor: "#FEF3E2", color: "#A66B42", borderColor: "#EDDCC7" };
    case "COMPLETED":
      return { backgroundColor: "#E0ECDB", color: "#2D5A29", borderColor: "#6B9A65" };
    case "CANCELLED":
      return { backgroundColor: "#EDDCC7", color: "#5D321A", borderColor: "#A66B42" };
    case "NO_SHOW":
      return { backgroundColor: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" };
    default:
      return { backgroundColor: "#EDDCC7", color: "#5D321A", borderColor: "#A66B42" };
  }
};

const AppointmentItem = ({ appointment }: { appointment: AppointmentWithDetails }) => {
  const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const doctorName = `Dr. ${appointment.doctor.lastName}`;
  const time = format(new Date(appointment.scheduledDateTime), "HH:mm");
  
  const statusColors = getStatusColor(appointment.status);
  
  return (
    <div 
      className="px-2 py-1 mb-1 text-xs border rounded-xs" 
      style={statusColors}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5 flex-shrink-0" />
            <span className="font-medium truncate">{time}</span>
          </div>
          <div className="truncate">{patientName}</div>
          <div className="truncate opacity-75">{doctorName}</div>
        </div>
        <button className="ml-1 p-0.5 hover:bg-black/10 rounded-xs">
          <Eye className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
};

export const AppointmentsCalendar = ({ className = "" }: AppointmentsCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  
  // Get appointments for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const { data: appointmentsData, isLoading } = useAppointments({
    dateFrom: monthStart.toISOString(),
    dateTo: monthEnd.toISOString(),
  });
  
  // Generate calendar dates
  const calendarDates = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start, end });
    
    // Add padding days from previous month
    const startDay = start.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const paddingDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const paddingDate = new Date(start);
      paddingDate.setDate(start.getDate() - (i + 1));
      paddingDays.push(paddingDate);
    }
    
    // Add padding days from next month
    const endDay = end.getDay();
    const trailingDays = [];
    for (let i = 1; i <= (6 - endDay); i++) {
      const trailingDate = new Date(end);
      trailingDate.setDate(end.getDate() + i);
      trailingDays.push(trailingDate);
    }
    
    return [...paddingDays, ...daysInMonth, ...trailingDays];
  }, [currentMonth]);
  
  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    if (!appointmentsData?.appointments) return {};
    
    const grouped: { [key: string]: AppointmentWithDetails[] } = {};
    
    appointmentsData.appointments.forEach((appointment) => {
      const dateKey = format(new Date(appointment.scheduledDateTime), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appointment as AppointmentWithDetails);
    });
    
    // Sort appointments by time for each date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.scheduledDateTime).getTime() - new Date(b.scheduledDateTime).getTime()
      );
    });
    
    return grouped;
  }, [appointmentsData]);
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
    setSelectedDate(null);
  };
  
  const getDateAppointments = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return appointmentsByDate[dateKey] || [];
  };
  
  const handleDateClick = (date: Date) => {
    const isSameDate = selectedDate && isSameDay(date, selectedDate);
    
    if (isSameDate) {
      // Close panel if clicking the same date
      setIsDetailsPanelOpen(false);
      setTimeout(() => setSelectedDate(null), 300); // Wait for animation
    } else {
      // Open panel with new date
      setSelectedDate(date);
      setIsDetailsPanelOpen(true);
    }
  };
  
  return (
    <div className={`border rounded-sm ${className} flex relative overflow-hidden`} style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
      {/* Main Calendar Container */}
      <div className={`flex-1 transition-all duration-300 ${isDetailsPanelOpen ? 'mr-80' : 'mr-0'}`}>
        {/* Header */}
        <div className="px-4 py-3 border-b" style={{ borderColor: '#EDDCC7' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-900">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 rounded-xs transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-2 py-1 text-xs font-medium text-gray-700 rounded-xs transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 rounded-xs transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      
      {/* Calendar Grid */}
      <div className="p-4">
        {/* Days of week header */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar dates */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDates.map((date, index) => {
            const appointments = getDateAppointments(date);
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isTodayDate = isToday(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            
            return (
              <div
                key={index}
                className={`
                  min-h-24 p-1 border rounded-xs cursor-pointer transition-colors
                  ${isSelected ? 'border-2' : ''}
                `}
                style={{
                  backgroundColor: isCurrentMonth ? '#F5E8DF' : '#FDF9F7',
                  borderColor: isSelected ? '#A66B42' : '#EDDCC7'
                }}
                onClick={() => handleDateClick(date)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isCurrentMonth ? '#F5E8DF' : '#FDF9F7'}
              >
                <div className={`
                  text-xs font-medium mb-1 flex items-center gap-1
                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                `}>
                  {format(date, "d")}
                  {isTodayDate && (
                    <span className="text-[9px] bg-blue-500 text-white px-1 py-0.5 rounded-xs font-medium">
                      TODAY
                    </span>
                  )}
                </div>
                
                {/* Appointments for this date */}
                <div className="space-y-0.5">
                  {appointments.slice(0, 3).map((appointment) => (
                    <AppointmentItem key={appointment.id} appointment={appointment} />
                  ))}
                  
                  {appointments.length > 3 && (
                    <div className="px-2 py-1 text-xs text-gray-500 border rounded-xs" style={{ backgroundColor: '#EDDCC7', borderColor: '#A66B42' }}>
                      +{appointments.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      </div>
      
      {/* Sliding Details Panel */}
      <div className={`
        absolute top-0 right-0 h-full w-80 border-l"
        style={{ backgroundColor: '#FDF9F7', borderColor: '#EDDCC7' }}
        className=" 
        transform transition-transform duration-300 ease-in-out
        ${isDetailsPanelOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {selectedDate && (
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsDetailsPanelOpen(false);
                    setTimeout(() => setSelectedDate(null), 300);
                  }}
                  className="p-1 rounded-xs transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {getDateAppointments(selectedDate).map((appointment) => (
                  <div key={appointment.id} className="border rounded-xs p-4 transition-colors" style={{ backgroundColor: '#F5E8DF', borderColor: '#EDDCC7' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FDF9F7'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F5E8DF'}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-gray-900">
                          {format(new Date(appointment.scheduledDateTime), "HH:mm")}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium border rounded-xs ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toLowerCase().replace('_', ' ')}
                        </span>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded-xs">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {appointment.patient.firstName} {appointment.patient.lastName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-blue-600 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {appointment.type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} • {appointment.durationMinutes} min
                        </span>
                      </div>
                      
                      {appointment.reasonForVisit && (
                        <div className="mt-3 p-2 rounded-xs" style={{ backgroundColor: '#FDF9F7' }}>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Reason:</span> {appointment.reasonForVisit}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {getDateAppointments(selectedDate).length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500 mb-1">No appointments scheduled</p>
                    <p className="text-xs text-gray-400">This date is available for new appointments</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20" style={{ backgroundColor: 'rgba(253, 249, 247, 0.75)' }}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};