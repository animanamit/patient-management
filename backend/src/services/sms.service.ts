import twilio from 'twilio';
import { z } from 'zod';

// Environment variables validation
const twilioConfigSchema = z.object({
  TWILIO_ACCOUNT_SID: z.string().min(1, 'Twilio Account SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'Twilio Auth Token is required'),
  TWILIO_PHONE_NUMBER: z.string().min(1, 'Twilio Phone Number is required'),
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),
});

export interface SendSMSRequest {
  to: string;
  body: string;
  appointmentId?: string;
  patientName?: string;
}

export interface SMSResponse {
  success: boolean;
  messageSid?: string;
  error?: string;
  to: string;
  body: string;
}

export class SMSService {
  private client: twilio.Twilio;
  private fromNumber: string;
  private messagingServiceSid?: string;

  constructor() {
    // Validate environment variables
    const config = twilioConfigSchema.parse({
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
      TWILIO_MESSAGING_SERVICE_SID: process.env.TWILIO_MESSAGING_SERVICE_SID,
    });

    // Initialize Twilio client
    this.client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
    this.fromNumber = config.TWILIO_PHONE_NUMBER;
    this.messagingServiceSid = config.TWILIO_MESSAGING_SERVICE_SID;

    console.log('✅ SMS Service initialized successfully');
  }

  /**
   * Format Singapore phone number to E.164 format
   */
  private formatSingaporeNumber(phoneNumber: string): string {
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
  }

  /**
   * Validate Singapore phone number
   */
  private validateSingaporeNumber(phoneNumber: string): boolean {
    const formatted = this.formatSingaporeNumber(phoneNumber);
    
    // Singapore mobile: +65 8xxx xxxx or +65 9xxx xxxx (8 digits after country code)
    // Singapore landline: +65 6xxx xxxx (8 digits after country code)
    const singaporePattern = /^\+65[689]\d{7}$/;
    
    return singaporePattern.test(formatted);
  }

  /**
   * Send SMS using Twilio
   */
  async sendSMS(request: SendSMSRequest): Promise<SMSResponse> {
    try {
      // Format and validate phone number
      const formattedNumber = this.formatSingaporeNumber(request.to);
      
      if (!this.validateSingaporeNumber(request.to)) {
        return {
          success: false,
          error: `Invalid Singapore phone number format: ${request.to}`,
          to: formattedNumber,
          body: request.body,
        };
      }

      console.log(`📱 Sending SMS to ${formattedNumber}...`);

      // Prepare message options
      const messageOptions: any = {
        body: request.body,
        to: formattedNumber,
      };

      // Use Messaging Service SID if available, otherwise use phone number
      if (this.messagingServiceSid) {
        messageOptions.messagingServiceSid = this.messagingServiceSid;
      } else {
        messageOptions.from = this.fromNumber;
      }

      // Send the message
      const message = await this.client.messages.create(messageOptions);

      console.log(`✅ SMS sent successfully. SID: ${message.sid}, Status: ${message.status}`);

      return {
        success: true,
        messageSid: message.sid,
        to: formattedNumber,
        body: request.body,
      };

    } catch (error: any) {
      console.error('❌ Failed to send SMS:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send SMS',
        to: request.to,
        body: request.body,
      };
    }
  }

  /**
   * Send appointment reminder SMS
   */
  async sendAppointmentReminder(
    phoneNumber: string,
    patientName: string,
    appointmentDate: Date,
    doctorName: string,
    clinicName: string = 'CarePulse Clinic'
  ): Promise<SMSResponse> {
    const formattedDate = appointmentDate.toLocaleString('en-SG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Hi ${patientName}, this is a reminder for your appointment at ${clinicName} on ${formattedDate} with ${doctorName}. Please arrive 15 minutes early. Reply STOP to opt out.`;

    return this.sendSMS({
      to: phoneNumber,
      body: message,
      patientName,
    });
  }

  /**
   * Send appointment confirmation SMS
   */
  async sendAppointmentConfirmation(
    phoneNumber: string,
    patientName: string,
    appointmentDate: Date,
    doctorName: string,
    clinicName: string = 'CarePulse Clinic'
  ): Promise<SMSResponse> {
    const formattedDate = appointmentDate.toLocaleString('en-SG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Hi ${patientName}, your appointment at ${clinicName} has been confirmed for ${formattedDate} with ${doctorName}. We look forward to seeing you! Reply STOP to opt out.`;

    return this.sendSMS({
      to: phoneNumber,
      body: message,
      patientName,
    });
  }

  /**
   * Send appointment cancellation SMS
   */
  async sendAppointmentCancellation(
    phoneNumber: string,
    patientName: string,
    appointmentDate: Date,
    reason: string = 'unforeseen circumstances',
    clinicName: string = 'CarePulse Clinic'
  ): Promise<SMSResponse> {
    const formattedDate = appointmentDate.toLocaleString('en-SG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Hi ${patientName}, we regret to inform you that your appointment at ${clinicName} on ${formattedDate} has been cancelled due to ${reason}. Please call us to reschedule. Reply STOP to opt out.`;

    return this.sendSMS({
      to: phoneNumber,
      body: message,
      patientName,
    });
  }

  /**
   * Send custom SMS message
   */
  async sendCustomMessage(
    phoneNumber: string,
    message: string,
    patientName?: string
  ): Promise<SMSResponse> {
    return this.sendSMS({
      to: phoneNumber,
      body: message,
      patientName,
    });
  }

  /**
   * Test SMS functionality
   */
  async testSMS(phoneNumber: string): Promise<SMSResponse> {
    const message = `Hello from CarePulse! This is a test message to verify SMS functionality. Time: ${new Date().toLocaleString('en-SG')}`;
    
    return this.sendSMS({
      to: phoneNumber,
      body: message,
    });
  }
}

// Export singleton instance
export const smsService = new SMSService();