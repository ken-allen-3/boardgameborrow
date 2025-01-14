import { smtpService } from './smtp';
import { EMAIL_CONFIG } from './config';
import { getBorrowRequestTemplate, getBugReportTemplate, getWaitlistTemplate, getFriendInviteTemplate } from './templates';
import type { BorrowRequestDetails, BugReportDetails, FriendInviteDetails } from './types';

class EmailService {
  private async send(msg: any) {
    try {
      await smtpService.sendEmail(msg);
    } catch (error: any) {
      console.error('[Email] Send error:', error?.response?.body || error);

      if (error.code === 'EAUTH') {
        throw new Error('Email service authentication failed - check SMTP credentials');
      }

      if (error.code === 'ETIMEDOUT') {
        throw new Error('Connection timed out - check your network and SMTP settings');
      }

      if (error.code === 'ECONNECTION') {
        throw new Error('Connection failed - check your SMTP settings');
      }

      throw new Error(error.message || 'Failed to send email');
    }
  }

  async sendBorrowRequest(details: BorrowRequestDetails): Promise<void> {
    const template = getBorrowRequestTemplate(details);
    await this.send({
      to: {
        email: details.ownerEmail,
        name: details.ownerName
      },
      from: EMAIL_CONFIG.from,
      ...template
    });
  }

  async sendBugReport(details: BugReportDetails): Promise<void> {
    const template = getBugReportTemplate(details);
    await this.send({
      to: {
        email: EMAIL_CONFIG.admin.email,
        name: EMAIL_CONFIG.admin.name
      },
      from: EMAIL_CONFIG.from,
      ...template,
      attachments: details.screenshot ? [{
        content: details.screenshot.split(',')[1],
        filename: 'screenshot.png',
        type: 'image/png',
        disposition: 'attachment'
      }] : undefined
    });
  }

  async sendWaitlistNotification(userEmail: string): Promise<void> {
    const template = getWaitlistTemplate(userEmail);
    await this.send({
      to: {
        email: EMAIL_CONFIG.admin.email,
        name: EMAIL_CONFIG.admin.name
      },
      from: EMAIL_CONFIG.from,
      ...template
    });
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export wrapper functions
export async function sendBorrowRequestEmail(details: BorrowRequestDetails): Promise<boolean> {
  try {
    await emailService.sendBorrowRequest(details);
    return true;
  } catch (error) {
    console.error('Failed to send borrow request email:', error);
    return false;
  }
}

export async function sendBugReport(details: BugReportDetails): Promise<boolean> {
  try {
    await emailService.sendBugReport(details);
    return true;
  } catch (error) {
    console.error('Failed to send bug report:', error);
    return false;
  }
}

export async function sendFriendInvite(details: FriendInviteDetails): Promise<boolean> {
  try {
    const template = getFriendInviteTemplate(details);
    await emailService.send({
      to: {
        email: details.inviteeEmail
      },
      from: EMAIL_CONFIG.from,
      ...template
    });
    return true;
  } catch (error) {
    console.error('Failed to send friend invite:', error);
    return false;
  }
}

export async function sendWaitlistEmail(userEmail: string): Promise<boolean> {
  try {
    await emailService.sendWaitlistNotification(userEmail);
    return true;
  } catch (error) {
    console.error('Failed to send waitlist email:', error);
    return false;
  }
}
