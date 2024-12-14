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