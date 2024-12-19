export interface AppError extends Error {
  code?: string;
  context?: Record<string, any>;
}

export function createAppError(message: string, code?: string, context?: Record<string, any>): AppError {
  const error = new Error(message) as AppError;
  error.code = code;
  error.context = context;
  return error;
}

export function logError(error: Error | AppError, component?: string) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    code: (error as AppError).code,
    context: (error as AppError).context,
    component,
    timestamp: new Date().toISOString()
  };

  console.error('[Error]', errorInfo);
  
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