import React, { useState } from 'react';
import { X, Bug, Camera, AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { sendBugReport } from '../services/email';
import { compressImage } from '../utils/imageUtils';
import { truncateErrorStack } from '../utils/errorUtils';

const MAX_FIELD_LENGTH = 1000;

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
  const [isCapturing, setIsCapturing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const location = useLocation();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    let processedScreenshot = screenshot;
    if (screenshot) {
      try {
        processedScreenshot = await compressImage(screenshot);
      } catch (err) {
        console.error('Failed to compress screenshot:', err);
        processedScreenshot = null;
      }
    }
    
    try {
      const success = await sendBugReport({
        steps: steps.slice(0, MAX_FIELD_LENGTH),
        expected: expected.slice(0, MAX_FIELD_LENGTH),
        actual: actual.slice(0, MAX_FIELD_LENGTH),
        screenshot: processedScreenshot,
        error: error ? {
          message: error.message,
          stack: truncateErrorStack(error.stack)
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
        setSuccessMessage('Bug report submitted successfully! Thank you for your feedback.');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Show success message briefly
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
      // Hide the modal during capture
      setIsCapturing(true);
      
      // Small delay to ensure modal is hidden
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      setSuccessMessage('Screenshot captured successfully!');
      setTimeout(() => setSuccessMessage(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    } finally {
      // Restore the modal after capture attempt
      setIsCapturing(false);
    }
  };

  if (isCapturing) {
    return null;
  }

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

          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <div className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What steps led to this issue?
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value.slice(0, MAX_FIELD_LENGTH))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="1. Clicked on...\n2. Entered text...\n3. Bug occurred..."
              required
              maxLength={MAX_FIELD_LENGTH}
            />
            <div className="text-xs text-gray-500 mt-1">
              {steps.length}/{MAX_FIELD_LENGTH} characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What did you expect to happen?
            </label>
            <textarea
              value={expected}
              onChange={(e) => setExpected(e.target.value.slice(0, MAX_FIELD_LENGTH))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={2}
              required
              maxLength={MAX_FIELD_LENGTH}
            />
            <div className="text-xs text-gray-500 mt-1">
              {expected.length}/{MAX_FIELD_LENGTH} characters
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What actually happened?
            </label>
            <textarea
              value={actual}
              onChange={(e) => setActual(e.target.value.slice(0, MAX_FIELD_LENGTH))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={2}
              required
              maxLength={MAX_FIELD_LENGTH}
            />
            <div className="text-xs text-gray-500 mt-1">
              {actual.length}/{MAX_FIELD_LENGTH} characters
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={captureScreenshot}
              disabled={isCapturing}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Camera className="h-5 w-5" />
              <span>{isCapturing ? 'Capturing...' : 'Capture Screenshot'}</span>
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