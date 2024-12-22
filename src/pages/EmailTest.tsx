import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { sendWaitlistEmail } from '../services/email';

export default function EmailTest() {
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleTestEmail = async () => {
    setLastError(null);
    setLastSuccess(null);
    setIsSending(true);

    try {
      await sendWaitlistEmail('kennydavidallen@gmail.com');
      setLastSuccess('Email sent successfully!');
    } catch (error: any) {
      // Capture the full error details
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        response: error.response
      };
      
      setLastError(JSON.stringify(errorDetails, null, 2));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Email Integration Testing</h1>

        <div className="space-y-6">
          <div>
            <button
              onClick={handleTestEmail}
              disabled={isSending}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
              <span>{isSending ? 'Sending...' : 'Send Test Email'}</span>
            </button>
            <p className="mt-2 text-sm text-gray-600">
              Will send to: kennydavidallen@gmail.com
            </p>
          </div>

          {lastSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-700">{lastSuccess}</div>
            </div>
          )}

          {lastError && (
            <div className="space-y-2">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-red-800">Email Error</div>
                  <div className="text-sm text-red-700">Check the details below</div>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100 whitespace-pre-wrap">{lastError}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}