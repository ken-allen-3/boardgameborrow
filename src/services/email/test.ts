import { MailService } from '@sendgrid/mail';

export async function testSendGridApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!apiKey) {
      return { 
        success: false, 
        error: 'API key is missing' 
      };
    }

    if (!apiKey.startsWith('SG.')) {
      return { 
        success: false, 
        error: 'Invalid API key format - must start with "SG."' 
      };
    }

    const client = new MailService();
    client.setApiKey(apiKey);

    // Make a simple API call that doesn't send an email but validates the key
    await client.request({
      method: 'GET',
      url: '/v3/scopes',
    });

    return { success: true };
  } catch (error: any) {
    console.error('[SendGrid Test] API Error:', error);

    if (error.code === 401 || error.code === 403) {
      return {
        success: false,
        error: 'Authentication failed - invalid API key'
      };
    }

    if (error.message?.includes('Network')) {
      return {
        success: false,
        error: 'Network error - check your internet connection'
      };
    }

    return {
      success: false,
      error: `API test failed: ${error.message || 'Unknown error'}`
    };
  }
}