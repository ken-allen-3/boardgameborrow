import { BorrowRequestDetails, BugReportDetails } from './types';

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