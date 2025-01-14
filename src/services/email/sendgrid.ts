import { MailService } from '@sendgrid/mail';
import { EmailRecipient } from './types';
import { EMAIL_CONFIG } from './config';

class SendGridService {
  private client: MailService;
  private initialized: boolean = false;
  private apiKey: string | undefined;

  constructor() {
    this.client = new MailService();
    this.apiKey = import.meta.env.VITE_SENDGRID_API_KEY?.trim();
  }

  initialize() {
    if (this.initialized) return true;

    try {
      if (!this.apiKey) {
        console.error('[SendGrid] API key not found in environment variables');
        return false;
      }
      
      if (!this.apiKey.startsWith('SG.')) {
        console.error('[SendGrid] Invalid API key format - must start with "SG."');
        return false;
      }

      this.client.setApiKey(this.apiKey);
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
      throw new Error('Failed to initialize SendGrid client. Check your API key configuration.');
    }

    try {
      const msg = {
        from: EMAIL_CONFIG.from,
        to,
        subject,
        text,
        html,
        attachments
      };

      await this.client.send(msg);
      
      return true;
    } catch (error: any) {
      // Log detailed error for debugging
      console.error('[SendGrid] API Error:', {
        error
      });

      // Handle specific error cases
      if (error.code === 401) {
        throw new Error('Authentication failed - check your SendGrid API key');
      }
      
      if (error.code === 403) {
        throw new Error('Permission denied - your API key may not have email sending privileges');
      }
      
      if (error.code === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Network or other errors
      if (error.message?.includes('Network')) {
        throw new Error('Network error - check your internet connection');
      }

      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
}

// Export singleton instance
export const sendGridService = new SendGridService();