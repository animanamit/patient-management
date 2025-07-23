import { http, HttpResponse } from 'msw'
import { 
  mockPatients, 
  mockDoctors, 
  mockAppointments, 
  findMockPatient, 
  findMockDoctor, 
  findMockAppointment,
  createMockPatient,
  createMockDoctor,
  createMockAppointment
} from '../data'

const API_BASE_URL = 'http://localhost:8000/api'

export const apiHandlers = [
  // Patients API
  http.get(`${API_BASE_URL}/patients`, ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let filteredPatients = mockPatients
    
    if (search) {
      filteredPatients = mockPatients.filter(patient => 
        patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
        patient.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    const paginatedPatients = filteredPatients.slice(offset, offset + limit)

    return HttpResponse.json({
      patients: paginatedPatients,
      total: filteredPatients.length,
      limit,
      offset,
    })
  }),

  http.get(`${API_BASE_URL}/patients/:id`, ({ params }) => {
    const patient = findMockPatient(params.id as string)
    
    if (!patient) {
      return HttpResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({ patient })
  }),

  http.post(`${API_BASE_URL}/patients`, async ({ request }) => {
    const data = await request.json() as any
    
    const newPatient = createMockPatient({
      id: `patient_${Date.now()}`,
      ...data,
    })

    mockPatients.push(newPatient)

    return HttpResponse.json({ patient: newPatient }, { status: 201 })
  }),

  http.put(`${API_BASE_URL}/patients/:id`, async ({ params, request }) => {
    const data = await request.json() as any
    const patientIndex = mockPatients.findIndex(p => p.id === params.id)
    
    if (patientIndex === -1) {
      return HttpResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    mockPatients[patientIndex] = {
      ...mockPatients[patientIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ patient: mockPatients[patientIndex] })
  }),

  http.delete(`${API_BASE_URL}/patients/:id`, ({ params }) => {
    const patientIndex = mockPatients.findIndex(p => p.id === params.id)
    
    if (patientIndex === -1) {
      return HttpResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      )
    }

    mockPatients.splice(patientIndex, 1)
    return HttpResponse.json({ success: true })
  }),

  // Doctors API
  http.get(`${API_BASE_URL}/doctors`, ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const specialization = url.searchParams.get('specialization')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let filteredDoctors = mockDoctors
    
    if (search) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.firstName.toLowerCase().includes(search.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(search.toLowerCase()) ||
        doctor.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (specialization) {
      filteredDoctors = filteredDoctors.filter(doctor => 
        doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
      )
    }

    const paginatedDoctors = filteredDoctors.slice(offset, offset + limit)

    return HttpResponse.json({
      doctors: paginatedDoctors,
      total: filteredDoctors.length,
      limit,
      offset,
    })
  }),

  http.get(`${API_BASE_URL}/doctors/:id`, ({ params }) => {
    const doctor = findMockDoctor(params.id as string)
    
    if (!doctor) {
      return HttpResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json({ doctor })
  }),

  http.post(`${API_BASE_URL}/doctors`, async ({ request }) => {
    const data = await request.json() as any
    
    const newDoctor = createMockDoctor({
      id: `doctor_${Date.now()}`,
      ...data,
    })

    mockDoctors.push(newDoctor)

    return HttpResponse.json({ doctor: newDoctor }, { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/doctors/:id`, async ({ params, request }) => {
    const data = await request.json() as any
    const doctorIndex = mockDoctors.findIndex(d => d.id === params.id)
    
    if (doctorIndex === -1) {
      return HttpResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    mockDoctors[doctorIndex] = {
      ...mockDoctors[doctorIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    return HttpResponse.json({ doctor: mockDoctors[doctorIndex] })
  }),

  http.delete(`${API_BASE_URL}/doctors/:id`, ({ params }) => {
    const doctorIndex = mockDoctors.findIndex(d => d.id === params.id)
    
    if (doctorIndex === -1) {
      return HttpResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    mockDoctors.splice(doctorIndex, 1)
    return HttpResponse.json({ success: true })
  }),

  // Appointments API
  http.get(`${API_BASE_URL}/appointments`, ({ request }) => {
    const url = new URL(request.url)
    const patientId = url.searchParams.get('patientId')
    const doctorId = url.searchParams.get('doctorId')
    const status = url.searchParams.get('status')
    const dateFrom = url.searchParams.get('dateFrom')
    const dateTo = url.searchParams.get('dateTo')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    let filteredAppointments = mockAppointments

    if (patientId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.patientId === patientId)
    }

    if (doctorId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.doctorId === doctorId)
    }

    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status)
    }

    if (dateFrom) {
      filteredAppointments = filteredAppointments.filter(apt => 
        new Date(apt.scheduledDateTime) >= new Date(dateFrom)
      )
    }

    if (dateTo) {
      filteredAppointments = filteredAppointments.filter(apt => 
        new Date(apt.scheduledDateTime) <= new Date(dateTo)
      )
    }

    // Add patient and doctor details to appointments
    const appointmentsWithDetails = filteredAppointments.map(appointment => ({
      ...appointment,
      patient: findMockPatient(appointment.patientId),
      doctor: findMockDoctor(appointment.doctorId),
    }))

    const paginatedAppointments = appointmentsWithDetails.slice(offset, offset + limit)

    return HttpResponse.json({
      appointments: paginatedAppointments,
      total: filteredAppointments.length,
      limit,
      offset,
    })
  }),

  http.get(`${API_BASE_URL}/appointments/:id`, ({ params }) => {
    const appointment = findMockAppointment(params.id as string)
    
    if (!appointment) {
      return HttpResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    const appointmentWithDetails = {
      ...appointment,
      patient: findMockPatient(appointment.patientId),
      doctor: findMockDoctor(appointment.doctorId),
    }

    return HttpResponse.json({ appointment: appointmentWithDetails })
  }),

  http.post(`${API_BASE_URL}/appointments`, async ({ request }) => {
    const data = await request.json() as any
    
    const newAppointment = createMockAppointment({
      id: `appointment_${Date.now()}`,
      ...data,
    })

    mockAppointments.push(newAppointment)

    const appointmentWithDetails = {
      ...newAppointment,
      patient: findMockPatient(newAppointment.patientId),
      doctor: findMockDoctor(newAppointment.doctorId),
    }

    return HttpResponse.json({ appointment: appointmentWithDetails }, { status: 201 })
  }),

  http.patch(`${API_BASE_URL}/appointments/:id`, async ({ params, request }) => {
    const data = await request.json() as any
    const appointmentIndex = mockAppointments.findIndex(a => a.id === params.id)
    
    if (appointmentIndex === -1) {
      return HttpResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    mockAppointments[appointmentIndex] = {
      ...mockAppointments[appointmentIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    }

    const appointmentWithDetails = {
      ...mockAppointments[appointmentIndex],
      patient: findMockPatient(mockAppointments[appointmentIndex].patientId),
      doctor: findMockDoctor(mockAppointments[appointmentIndex].doctorId),
    }

    return HttpResponse.json({ appointment: appointmentWithDetails })
  }),

  http.delete(`${API_BASE_URL}/appointments/:id`, ({ params }) => {
    const appointmentIndex = mockAppointments.findIndex(a => a.id === params.id)
    
    if (appointmentIndex === -1) {
      return HttpResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    mockAppointments.splice(appointmentIndex, 1)
    return HttpResponse.json({ success: true })
  }),
]