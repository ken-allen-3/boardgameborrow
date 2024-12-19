import emailjs from 'emailjs-com';

const EMAILJS_CONFIG = {
  serviceId: 'BGB2',
  userId: 'SjbPca0PUCMxaP_in',
  templateIds: {
    waitlist: 'template_waitlist',
    bugReport: 'template_bug_report',
    borrowRequest: 'template_borrow_request'
  }
};

interface EmailError extends Error {
  text?: string;
  status?: number;
}

export async function sendWaitlistEmail(email: string): Promise<boolean> {
  try {
    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateIds.waitlist,
      { email },
      EMAILJS_CONFIG.userId
    );
    return true;
  } catch (error) {
    console.error('Failed to send waitlist email:', error);
    return false;
  }
}

export async function sendBorrowRequestEmail(params: {
  ownerEmail: string;
  borrowerName: string;
  gameName: string;
  startDate: string;
  duration: number;
  message?: string;
}): Promise<boolean> {
  try {
    if (!params.ownerEmail || !params.borrowerName || !params.gameName) {
      console.error('Missing required parameters for borrow request email');
      return false;
    }

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateIds.borrowRequest,
      {
        to_email: params.ownerEmail,
        borrower_name: params.borrowerName,
        game_name: params.gameName,
        start_date: new Date(params.startDate).toLocaleDateString(),
        duration: params.duration,
        message: params.message || 'No message provided'
      },
      EMAILJS_CONFIG.userId
    );
    return true;
  } catch (error) {
    console.error('Failed to send borrow request email:', {
      error,
      params
    });
    return false;
  }
}

export async function sendBugReport(params: {
  steps: string;
  expected: string;
  actual: string;
  screenshot?: string | null;
  error?: {
    message: string;
    stack?: string;
  };
  environment: {
    userAgent: string;
    url: string;
    user?: {
      email?: string;
    };
  };
}): Promise<boolean> {
  try {
    const templateParams = {
      steps: params.steps,
      expected: params.expected,
      actual: params.actual,
      error_message: params.error?.message || 'No error message',
      error_stack: params.error?.stack || 'No stack trace',
      user_agent: params.environment.userAgent,
      url: params.environment.url,
      user_email: params.environment.user?.email || 'Not logged in',
      content: params.screenshot || '' // Add screenshot as content for Variable Attachment
    };

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateIds.bugReport,
      templateParams,
      EMAILJS_CONFIG.userId
    );
    return true;
  } catch (error) {
    console.error('Failed to send bug report:', error);
    return false;
  }
}