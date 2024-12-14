export function validateEnvVariables() {
  const requiredVars = ['VITE_SENDGRID_API_KEY'];
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const apiKey = import.meta.env.VITE_SENDGRID_API_KEY;
  if (!apiKey.startsWith('SG.')) {
    throw new Error('VITE_SENDGRID_API_KEY must start with "SG."');
  }
}