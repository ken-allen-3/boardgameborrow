import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Key } from 'lucide-react';
import { smtpService } from '../services/email/smtp';

function ApiTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
  } | null>(null);

  const handleTest = async () => {
    setIsTesting(true);
    setResult(null);

    try {
      const testResult = await smtpService.testConnection();
      setResult(testResult);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">SMTP Connection Test</h1>

        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            Click the button below to test the SMTP connection using the configured settings.
          </p>
          <button
            onClick={handleTest}
            disabled={isTesting}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {isTesting ? 'Testing...' : 'Test SMTP Connection'}
          </button>

          {result && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {result.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-700">
                    SMTP connection successful!
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">API Key Test Failed</div>
                    <div className="text-sm text-red-700">{result.error}</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiTest;