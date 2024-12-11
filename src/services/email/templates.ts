import { BorrowRequestDetails, BugReportDetails } from './types';

export function getBorrowRequestTemplate(details: BorrowRequestDetails) {
  const formattedDate = new Date(details.startDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    subject: `New Borrow Request: ${details.gameName}`,
    text: `
Hello!

${details.borrowerName} would like to borrow your copy of ${details.gameName}.

Request Details:
- Start Date: ${formattedDate}
- Duration: ${details.duration} days
${details.message ? `\nMessage from ${details.borrowerName}:\n${details.message}` : ''}

You can approve or reject this request by logging into your BoardGameBorrow account.

Best regards,
The BoardGameBorrow Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>New Borrow Request</h2>
  <p><strong>${details.borrowerName}</strong> would like to borrow your copy of <strong>${details.gameName}</strong>.</p>
  
  <h3>Request Details:</h3>
  <ul>
    <li>Start Date: ${formattedDate}</li>
    <li>Duration: ${details.duration} days</li>
  </ul>
  
  ${details.message ? `
  <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
    <strong>Message from ${details.borrowerName}:</strong><br>
    ${details.message}
  </div>
  ` : ''}

  <p>You can approve or reject this request by logging into your BoardGameBorrow account.</p>
  
  <p>Best regards,<br>The BoardGameBorrow Team</p>
</body>
</html>
    `.trim()
  };
}

export function getBugReportTemplate(details: BugReportDetails) {
  return {
    subject: 'BoardGameBorrow Bug Report',
    text: `
Bug Report Details:

Steps to Reproduce:
${details.steps}

Expected Behavior:
${details.expected}

Actual Behavior:
${details.actual}

Error:
${details.error?.message || 'No error message provided'}
${details.error?.stack ? `\nStack Trace:\n${details.error.stack}` : ''}

Environment:
User Agent: ${details.environment.userAgent}
URL: ${details.environment.url}
User: ${details.environment.user?.email || 'Not logged in'}

${details.screenshot ? 'Screenshot attached' : 'No screenshot provided'}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>Bug Report Details</h2>

  <h3>Steps to Reproduce:</h3>
  <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${details.steps}</pre>

  <h3>Expected Behavior:</h3>
  <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${details.expected}</pre>

  <h3>Actual Behavior:</h3>
  <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${details.actual}</pre>

  ${details.error ? `
  <h3>Error Details:</h3>
  <div style="background: #fff5f5; padding: 15px; border-radius: 5px; color: #c53030;">
    <strong>Message:</strong> ${details.error.message}<br>
    ${details.error.stack ? `<strong>Stack Trace:</strong><br><pre>${details.error.stack}</pre>` : ''}
  </div>
  ` : ''}

  <h3>Environment:</h3>
  <ul>
    <li><strong>User Agent:</strong> ${details.environment.userAgent}</li>
    <li><strong>URL:</strong> ${details.environment.url}</li>
    <li><strong>User:</strong> ${details.environment.user?.email || 'Not logged in'}</li>
  </ul>
</body>
</html>
    `.trim()
  };
}

export function getWaitlistTemplate(email: string) {
  return {
    subject: 'New BoardGameBorrow Waitlist Signup',
    text: `New waitlist signup: ${email}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>New Waitlist Signup</h2>
  <p>Email: ${email}</p>
</body>
</html>
    `.trim()
  };
}