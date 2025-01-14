export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailError extends Error {
  code?: string | number;
  response?: any;
  originalError?: any;
}

export interface FriendInviteDetails {
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  signupUrl: string;
}

export interface BugReportDetails {
  steps: string;
  expected: string;
  actual: string;
  screenshot?: string;
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
}

export interface BorrowRequestDetails {
  ownerEmail: string;
  borrowerName: string;
  gameName: string;
  startDate: string;
  duration: number;
  message?: string;
}
