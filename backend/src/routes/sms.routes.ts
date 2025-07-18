import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { smsService } from '../services/sms.service.js';

// Request schemas
const sendSMSSchema = z.object({
  to: z.string().min(8, 'Phone number must be at least 8 digits'),
  body: z.string().min(1, 'Message body is required').max(1600, 'Message too long'),
  patientName: z.string().optional(),
});

const appointmentReminderSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  patientName: z.string().min(1, 'Patient name is required'),
  appointmentDate: z.string().datetime('Invalid appointment date'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  clinicName: z.string().optional(),
});

const appointmentConfirmationSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  patientName: z.string().min(1, 'Patient name is required'),
  appointmentDate: z.string().datetime('Invalid appointment date'),
  doctorName: z.string().min(1, 'Doctor name is required'),
  clinicName: z.string().optional(),
});

const appointmentCancellationSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  patientName: z.string().min(1, 'Patient name is required'),
  appointmentDate: z.string().datetime('Invalid appointment date'),
  reason: z.string().optional(),
  clinicName: z.string().optional(),
});

const customMessageSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
  message: z.string().min(1, 'Message is required').max(1600, 'Message too long'),
  patientName: z.string().optional(),
});

const testSMSSchema = z.object({
  phoneNumber: z.string().min(8, 'Phone number must be at least 8 digits'),
});

const smsRoutes: FastifyPluginAsync = async (fastify) => {
  // Send basic SMS
  fastify.post('/send', async (request, reply) => {
    try {
      const validatedBody = sendSMSSchema.parse(request.body);
      const { to, body, patientName } = validatedBody;

      fastify.log.info(`Sending SMS to ${to}: ${body.substring(0, 50)}...`);

      const result = await smsService.sendSMS({
        to,
        body,
        patientName,
      });

      if (result.success) {
        reply.code(200).send(result);
      } else {
        reply.code(400).send({
          error: result.error || 'Failed to send SMS',
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        fastify.log.error('Error sending SMS:', error);
        reply.code(500).send({
          error: 'Internal server error while sending SMS',
        });
      }
    }
  });

  // Send appointment reminder
  fastify.post('/appointment/reminder', async (request, reply) => {
    try {
      const validatedBody = appointmentReminderSchema.parse(request.body);
      const { phoneNumber, patientName, appointmentDate, doctorName, clinicName } = validatedBody;

      fastify.log.info(`Sending appointment reminder to ${phoneNumber} for ${patientName}`);

      const result = await smsService.sendAppointmentReminder(
        phoneNumber,
        patientName,
        new Date(appointmentDate),
        doctorName,
        clinicName
      );

      if (result.success) {
        reply.code(200).send(result);
      } else {
        reply.code(400).send({
          error: result.error || 'Failed to send appointment reminder',
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        fastify.log.error('Error sending appointment reminder:', error);
        reply.code(500).send({
          error: 'Internal server error while sending appointment reminder',
        });
      }
    }
  });

  // Send appointment confirmation
  fastify.post('/appointment/confirmation', async (request, reply) => {
    try {
      const validatedBody = appointmentConfirmationSchema.parse(request.body);
      const { phoneNumber, patientName, appointmentDate, doctorName, clinicName } = validatedBody;

      fastify.log.info(`Sending appointment confirmation to ${phoneNumber} for ${patientName}`);

      const result = await smsService.sendAppointmentConfirmation(
        phoneNumber,
        patientName,
        new Date(appointmentDate),
        doctorName,
        clinicName
      );

      if (result.success) {
        reply.code(200).send(result);
      } else {
        reply.code(400).send({
          error: result.error || 'Failed to send appointment confirmation',
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        fastify.log.error('Error sending appointment confirmation:', error);
        reply.code(500).send({
          error: 'Internal server error while sending appointment confirmation',
        });
      }
    }
  });

  // Send appointment cancellation
  fastify.post('/appointment/cancellation', async (request, reply) => {
    try {
      const validatedBody = appointmentCancellationSchema.parse(request.body);
      const { phoneNumber, patientName, appointmentDate, reason, clinicName } = validatedBody;

      fastify.log.info(`Sending appointment cancellation to ${phoneNumber} for ${patientName}`);

      const result = await smsService.sendAppointmentCancellation(
        phoneNumber,
        patientName,
        new Date(appointmentDate),
        reason,
        clinicName
      );

      if (result.success) {
        reply.code(200).send(result);
      } else {
        reply.code(400).send({
          error: result.error || 'Failed to send appointment cancellation',
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        fastify.log.error('Error sending appointment cancellation:', error);
        reply.code(500).send({
          error: 'Internal server error while sending appointment cancellation',
        });
      }
    }
  });

  // Send custom message
  fastify.post('/custom', async (request, reply) => {
    try {
      const validatedBody = customMessageSchema.parse(request.body);
      const { phoneNumber, message, patientName } = validatedBody;

      fastify.log.info(`Sending custom message to ${phoneNumber}: ${message.substring(0, 50)}...`);

      const result = await smsService.sendCustomMessage(
        phoneNumber,
        message,
        patientName
      );

      if (result.success) {
        reply.code(200).send(result);
      } else {
        reply.code(400).send({
          error: result.error || 'Failed to send custom message',
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        fastify.log.error('Error sending custom message:', error);
        reply.code(500).send({
          error: 'Internal server error while sending custom message',
        });
      }
    }
  });

  // Test SMS functionality
  fastify.post('/test', async (request, reply) => {
    try {
      const validatedBody = testSMSSchema.parse(request.body);
      const { phoneNumber } = validatedBody;

      fastify.log.info(`Sending test SMS to ${phoneNumber}`);

      const result = await smsService.testSMS(phoneNumber);

      if (result.success) {
        reply.code(200).send(result);
      } else {
        reply.code(400).send({
          error: result.error || 'Failed to send test SMS',
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      } else {
        fastify.log.error('Error sending test SMS:', error);
        reply.code(500).send({
          error: 'Internal server error while sending test SMS',
        });
      }
    }
  });
};

export default smsRoutes;