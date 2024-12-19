import { EmailRecipient } from './types';
import { EMAIL_CONFIG } from './config';

class SMTPService {
  private initialized: boolean = false;
  private apiKey: string | undefined;

  initialize() {
    if (this.initialized) return true;

    try {
      this.apiKey = import.meta.env.VITE_SENDGRID_API_KEY?.trim();

      if (!this.apiKey) {
        console.error('[SendGrid] API key not found');
        return false;
      }

      if (!this.apiKey.startsWith('SG.')) {
        console.error('[SendGrid] Invalid API key format');
        return false;
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('[SendGrid] Initialization failed:', error);
      return false;
    }
  }

  async sendEmail({
    to,
    subject,
    text,
    html,
    attachments
  }: {
    to: EmailRecipient | EmailRecipient[];
    subject: string;
    text: string;
    html: string;
    attachments?: {
      content: string;
      filename: string;
      type: string;
      disposition: 'attachment' | 'inline';
    }[];
  }): Promise<boolean> {
    if (!this.initialized && !this.initialize()) {
      throw new Error('Failed to initialize SendGrid client');
    }

    try {
      const recipients = Array.isArray(to) ? to : [to];
      
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: recipients.map(r => ({
              email: r.email,
              name: r.name
            }))
          }],
          from: {
            email: EMAIL_CONFIG.from.email,
            name: EMAIL_CONFIG.from.name
          },
          subject,
          content: [
            {
              type: 'text/plain',
              value: text
            },
            {
              type: 'text/html',
              value: html
            }
          ],
          attachments: attachments?.map(att => ({
            filename: att.filename,
            content: att.content,
            type: att.type,
            disposition: att.disposition
          }))
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send email');
      }

      return true;
    } catch (error: any) {
      console.error('[SendGrid] Send error:', error);

      if (error.message?.includes('unauthorized')) {
        throw new Error('Authentication failed - check your API key');
      }

      if (error.message?.includes('network')) {
        throw new Error('Network error - check your connection');
      }

      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized && !this.initialize()) {
      return {
        success: false,
        error: 'Failed to initialize SendGrid client'
      };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/scopes', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'API test failed'
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to verify SendGrid connection'
      };
    }
  }
}

// Export singleton instance
export const smtpService = new SMTPService();