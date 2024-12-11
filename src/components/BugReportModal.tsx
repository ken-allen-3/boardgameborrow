import React, { useState } from 'react';
import { X, Bug, Camera, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendBugReport } from '../services/email';

interface BugReportModalProps {
  onClose: () => void;
  error?: Error;
}

function BugReportModal({ onClose, error }: BugReportModalProps) {
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const location = useLocation();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const success = await sendBugReport({
        steps,
        expected,
        actual,
        screenshot,
        error: error ? {
          message: error.message,
          stack: error.stack
        } : undefined,
        environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        user: currentUser ? {
          email: currentUser.email || undefined
        } : undefined
        }
      });
      
      if (success) {
        onClose();
      } else {
        throw new Error('Failed to send bug report');
      }
    } catch (err) {
      console.error('Failed to submit bug report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const captureScreenshot = async () => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const video = document.createElement('video');

      const stream = await navigator.mediaDevices.getDisplayMedia({
        preferCurrentTab: true
      });

      video.srcObject = stream;
      await video.play();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      
      const screenshot = canvas.toDataURL('image/png');
      setScreenshot(screenshot);
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">Report a Bug</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">Error Detected</div>
                <div className="text-sm text-red-700">{error.message}</div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What steps led to this issue?
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="1. Clicked on...\n2. Entered text...\n3. Bug occurred..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What did you expect to happen?
            </label>
            <textarea
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What actually happened?
            </label>
            <textarea
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={2}
              required
            />
          </div>

          <div>
            <button
              type="button"
              onClick={captureScreenshot}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Camera className="h-5 w-5" />
              <span>Capture Screenshot</span>
            </button>
            
            {screenshot && (
              <div className="mt-2">
                <img 
                  src={screenshot} 
                  alt="Bug screenshot" 
                  className="max-h-48 rounded border"
                />
                <button
                  type="button"
                  onClick={() => setScreenshot(null)}
                  className="text-sm text-red-600 hover:text-red-700 mt-1"
                >
                  Remove screenshot
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BugReportModal;