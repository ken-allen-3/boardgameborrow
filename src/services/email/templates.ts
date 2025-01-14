import { BorrowRequestDetails, BugReportDetails, FriendInviteDetails } from './types';

export function getBorrowRequestTemplate(details: BorrowRequestDetails) {
  return {
    subject: `Board Game Borrow Request: ${details.gameName}`,
    text: `
${details.borrowerName} would like to borrow ${details.gameName}

Duration: ${details.duration} days
Start Date: ${details.startDate}

${details.message ? `Message: ${details.message}` : ''}

Please respond to this request through the BoardGameBorrow app.
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>Board Game Borrow Request</h2>
  <p><strong>${details.borrowerName}</strong> would like to borrow <strong>${details.gameName}</strong></p>
  
  <ul>
    <li>Duration: ${details.duration} days</li>
    <li>Start Date: ${details.startDate}</li>
  </ul>

  ${details.message ? `<p><strong>Message:</strong> ${details.message}</p>` : ''}

  <p>Please respond to this request through the BoardGameBorrow app.</p>
</body>
</html>
    `.trim()
  };
}

export function getWaitlistTemplate(userEmail: string) {
  return {
    subject: 'New BoardGameBorrow Waitlist Signup',
    text: `
New waitlist signup from: ${userEmail}
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>New Waitlist Signup</h2>
  <p>Email: ${userEmail}</p>
</body>
</html>
    `.trim()
  };
}


export function getFriendInviteTemplate(details: FriendInviteDetails) {
  return {
    subject: `${details.inviterName} invited you to join BoardGameBorrow`,
    text: `
Hi there!

${details.inviterName} (${details.inviterEmail}) has invited you to join BoardGameBorrow - a platform for sharing and borrowing board games with friends.

Join now to:
• Share your board game collection
• Borrow games from friends
• Organize game nights
• Connect with other board game enthusiasts

Sign up here: ${details.signupUrl}

We hope to see you soon!
Best regards,
The BoardGameBorrow Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2b6cb0;">You're Invited to BoardGameBorrow!</h2>
  
  <p>${details.inviterName} (${details.inviterEmail}) has invited you to join BoardGameBorrow - a platform for sharing and borrowing board games with friends.</p>

  <h3 style="color: #2d3748;">Join now to:</h3>
  <ul>
    <li>Share your board game collection</li>
    <li>Borrow games from friends</li>
    <li>Organize game nights</li>
    <li>Connect with other board game enthusiasts</li>
  </ul>

  <div style="margin: 30px 0;">
    <a href="${details.signupUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Sign Up Now
    </a>
  </div>

  <p>We hope to see you soon!</p>
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
