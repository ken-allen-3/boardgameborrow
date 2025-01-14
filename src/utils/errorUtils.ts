export interface AppError extends Error {
  code?: string;
  context?: Record<string, any>;
  component?: string;
  action?: string;
}

export function createAppError(
  message: string,
  code?: string,
  context?: Record<string, any>,
  component?: string,
  action?: string
): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.context = context;
  error.component = component;
  error.action = action;
  return error;
}

export function logError(error: Error | AppError, component?: string) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    code: (error as AppError).code,
    context: (error as AppError).context,
    component: (error as AppError).component || component,
    action: (error as AppError).action,
    timestamp: new Date().toISOString()
  };

  // More detailed console logging
  console.error('[Error]', {
    ...errorInfo,
    location: `${errorInfo.component}${errorInfo.action ? ` (${errorInfo.action})` : ''}`,
    details: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error
  });
  
  // TODO: Add error reporting service integration
  // e.g., Sentry, LogRocket, etc.
}

export function truncateErrorStack(stack?: string, maxLength = 500): string {
  if (!stack) return '';
  if (stack.length <= maxLength) return stack;
  
  const lines = stack.split('\n');
  let truncated = '';
  
  for (const line of lines) {
    if (truncated.length + line.length > maxLength) {
      return truncated + '\n[Stack trace truncated...]';
    }
    truncated += (truncated ? '\n' : '') + line;
  }
  
  return truncated;
}
