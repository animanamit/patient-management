import { Hono } from 'hono';
import { z } from 'zod';
import { smsService } from '../services/sms.service.js';
import { validateRequest } from '../utils/validation.js';

const app = new Hono();

// Request schemas
const sendSMSSchema = z.object({
  to: z.string().min(8, 'Phone number must be at least 8 digits'),
  body: z.string().min(1, 'Message body is required').max(1600, 'Message too long'),
  patientName: z.string().optional(),
});

const appointmentReminderSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  patientName: z.string().min(1, 'Patient name is required'),
  appointmentDate: z.string().datetime('Invalid date format'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  clinicName: z.string().default('CarePulse Clinic'),
});

const appointmentConfirmationSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  patientName: z.string().min(1, 'Patient name is required'),
  appointmentDate: z.string().datetime('Invalid date format'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  clinicName: z.string().default('CarePulse Clinic'),
});

const appointmentCancellationSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  patientName: z.string().min(1, 'Patient name is required'),
  appointmentDate: z.string().datetime('Invalid date format'),
  reason: z.string().default('unforeseen circumstances'),
  clinicName: z.string().default('CarePulse Clinic'),
});

const customMessageSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  message: z.string().min(1, 'Message is required').max(1600, 'Message too long'),
  patientName: z.string().optional(),
});

const testSMSSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
});

// Type definitions
type SendSMSRequest = z.infer<typeof sendSMSSchema>;
type AppointmentReminderRequest = z.infer<typeof appointmentReminderSchema>;
type AppointmentConfirmationRequest = z.infer<typeof appointmentConfirmationSchema>;
type AppointmentCancellationRequest = z.infer<typeof appointmentCancellationSchema>;
type CustomMessageRequest = z.infer<typeof customMessageSchema>;
type TestSMSRequest = z.infer<typeof testSMSSchema>;

// POST /sms/send - Send basic SMS
app.post(
  '/send',
  validateRequest(sendSMSSchema),
  async (c) => {
    try {
      const { to, body, patientName } = c.req.valid('json');

      console.log(`📱 SMS send request: ${to} - ${body.substring(0, 50)}...`);

      const result = await smsService.sendSMS({
        to,
        body,
        patientName,
      });

      if (!result.success) {
        return c.json({
          success: false,
          error: result.error,
          details: {
            to: result.to,
            body: result.body,
          },
        }, 400);
      }

      return c.json({
        success: true,
        messageSid: result.messageSid,
        to: result.to,
        body: result.body,
        message: 'SMS sent successfully',
      });

    } catch (error: any) {
      console.error('Error in SMS send route:', error);
      return c.json({
        success: false,
        error: 'Failed to send SMS',
        details: error.message,
      }, 500);
    }
  }
);

// POST /sms/appointment/reminder - Send appointment reminder
app.post(
  '/appointment/reminder',
  validateRequest(appointmentReminderSchema),
  async (c) => {
    try {
      const { phoneNumber, patientName, appointmentDate, doctorName, clinicName } = c.req.valid('json');

      console.log(`📅 Appointment reminder request: ${patientName} - ${phoneNumber}`);

      const result = await smsService.sendAppointmentReminder(
        phoneNumber,
        patientName,
        new Date(appointmentDate),
        doctorName,
        clinicName
      );

      if (!result.success) {
        return c.json({
          success: false,
          error: result.error,
          details: {
            to: result.to,
            body: result.body,
          },
        }, 400);
      }

      return c.json({
        success: true,
        messageSid: result.messageSid,
        to: result.to,
        body: result.body,
        type: 'appointment_reminder',
        message: 'Appointment reminder sent successfully',
      });

    } catch (error: any) {
      console.error('Error in appointment reminder route:', error);
      return c.json({
        success: false,
        error: 'Failed to send appointment reminder',
        details: error.message,
      }, 500);
    }
  }
);

// POST /sms/appointment/confirmation - Send appointment confirmation
app.post(
  '/appointment/confirmation',
  validateRequest(appointmentConfirmationSchema),
  async (c) => {
    try {
      const { phoneNumber, patientName, appointmentDate, doctorName, clinicName } = c.req.valid('json');

      console.log(`✅ Appointment confirmation request: ${patientName} - ${phoneNumber}`);

      const result = await smsService.sendAppointmentConfirmation(
        phoneNumber,
        patientName,
        new Date(appointmentDate),
        doctorName,
        clinicName
      );

      if (!result.success) {
        return c.json({
          success: false,
          error: result.error,
          details: {
            to: result.to,
            body: result.body,
          },
        }, 400);
      }

      return c.json({
        success: true,
        messageSid: result.messageSid,
        to: result.to,
        body: result.body,
        type: 'appointment_confirmation',
        message: 'Appointment confirmation sent successfully',
      });

    } catch (error: any) {
      console.error('Error in appointment confirmation route:', error);
      return c.json({
        success: false,
        error: 'Failed to send appointment confirmation',
        details: error.message,
      }, 500);
    }
  }
);

// POST /sms/appointment/cancellation - Send appointment cancellation
app.post(
  '/appointment/cancellation',
  validateRequest(appointmentCancellationSchema),
  async (c) => {
    try {
      const { phoneNumber, patientName, appointmentDate, reason, clinicName } = c.req.valid('json');

      console.log(`❌ Appointment cancellation request: ${patientName} - ${phoneNumber}`);

      const result = await smsService.sendAppointmentCancellation(
        phoneNumber,
        patientName,
        new Date(appointmentDate),
        reason,
        clinicName
      );

      if (!result.success) {
        return c.json({
          success: false,
          error: result.error,
          details: {
            to: result.to,
            body: result.body,
          },
        }, 400);
      }

      return c.json({
        success: true,
        messageSid: result.messageSid,
        to: result.to,
        body: result.body,
        type: 'appointment_cancellation',
        message: 'Appointment cancellation sent successfully',
      });

    } catch (error: any) {
      console.error('Error in appointment cancellation route:', error);
      return c.json({
        success: false,
        error: 'Failed to send appointment cancellation',
        details: error.message,
      }, 500);
    }
  }
);

// POST /sms/custom - Send custom message
app.post(
  '/custom',
  validateRequest(customMessageSchema),
  async (c) => {
    try {
      const { phoneNumber, message, patientName } = c.req.valid('json');

      console.log(`💬 Custom message request: ${phoneNumber} - ${message.substring(0, 50)}...`);

      const result = await smsService.sendCustomMessage(
        phoneNumber,
        message,
        patientName
      );

      if (!result.success) {
        return c.json({
          success: false,
          error: result.error,
          details: {
            to: result.to,
            body: result.body,
          },
        }, 400);
      }

      return c.json({
        success: true,
        messageSid: result.messageSid,
        to: result.to,
        body: result.body,
        type: 'custom_message',
        message: 'Custom message sent successfully',
      });

    } catch (error: any) {
      console.error('Error in custom message route:', error);
      return c.json({
        success: false,
        error: 'Failed to send custom message',
        details: error.message,
      }, 500);
    }
  }
);

// POST /sms/test - Test SMS functionality
app.post(
  '/test',
  validateRequest(testSMSSchema),
  async (c) => {
    try {
      const { phoneNumber } = c.req.valid('json');

      console.log(`🧪 SMS test request: ${phoneNumber}`);

      const result = await smsService.testSMS(phoneNumber);

      if (!result.success) {
        return c.json({
          success: false,
          error: result.error,
          details: {
            to: result.to,
            body: result.body,
          },
        }, 400);
      }

      return c.json({
        success: true,
        messageSid: result.messageSid,
        to: result.to,
        body: result.body,
        type: 'test_message',
        message: 'Test SMS sent successfully',
      });

    } catch (error: any) {
      console.error('Error in SMS test route:', error);
      return c.json({
        success: false,
        error: 'Failed to send test SMS',
        details: error.message,
      }, 500);
    }
  }
);

// GET /sms/health - SMS service health check
app.get('/health', async (c) => {
  try {
    // Check if Twilio credentials are configured
    const isConfigured = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    );

    return c.json({
      status: isConfigured ? 'healthy' : 'misconfigured',
      service: 'SMS Service',
      timestamp: new Date().toISOString(),
      configuration: {
        accountSid: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'missing',
        authToken: process.env.TWILIO_AUTH_TOKEN ? 'configured' : 'missing',
        phoneNumber: process.env.TWILIO_PHONE_NUMBER ? 'configured' : 'missing',
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID ? 'configured' : 'not_configured',
      },
      features: [
        'basic_sms',
        'appointment_reminders',
        'appointment_confirmations',
        'appointment_cancellations',
        'custom_messages',
        'test_messages',
        'singapore_number_validation'
      ]
    });
  } catch (error: any) {
    console.error('SMS health check error:', error);
    return c.json({
      status: 'error',
      service: 'SMS Service',
      timestamp: new Date().toISOString(),
      error: error.message,
    }, 500);
  }
});

// GET /sms/info - SMS service information
app.get('/info', async (c) => {
  return c.json({
    service: 'CarePulse SMS Service',
    description: 'SMS messaging service for patient communication',
    endpoints: {
      '/send': 'Send basic SMS message',
      '/appointment/reminder': 'Send appointment reminder',
      '/appointment/confirmation': 'Send appointment confirmation',
      '/appointment/cancellation': 'Send appointment cancellation',
      '/custom': 'Send custom message',
      '/test': 'Test SMS functionality',
      '/health': 'Service health check',
      '/info': 'Service information'
    },
    supported_regions: ['Singapore'],
    phone_number_format: 'Singapore E.164 format (+65XXXXXXXX)',
    message_limits: {
      max_length: 1600,
      encoding: 'UTF-8'
    }
  });
});

export default app;