import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  onClose: () => void;
  onCapture: (photo: string) => void;
}

function CameraCapture({ onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsStreamReady(true);
        };
      }
    } catch (err) {
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !isStreamReady) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(videoRef.current, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg');
      stopCamera();
      onCapture(photoData);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    // Only allow click-to-capture on desktop
    if (!isMobile) {
      capturePhoto();
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 w-full">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      <div className="relative flex-1">
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="absolute inset-0 flex flex-col">
          <style>
            {`
              @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              .ai-header {
                background: linear-gradient(270deg, #ff0080, #7928ca, #4299e1);
                background-size: 200% 200%;
                animation: gradient 3s ease infinite;
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
              .ai-pulse {
                animation: pulse 2s ease-in-out infinite;
              }
            `}
          </style>
          <div className="ai-header text-white text-center py-4 px-6 shadow-lg">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 ai-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" 
                />
              </svg>
              <span>AI-Powered Game Detection</span>
            </div>
            {!isMobile && (
              <div className="text-sm mt-1 font-light">
                Click anywhere to capture and let AI identify your games
              </div>
            )}
          </div>
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            onClick={handleVideoClick}
            className={`flex-1 object-cover ${!isMobile ? 'cursor-pointer' : ''}`}
          />
        </div>
      </div>

      {/* Only show the capture button on mobile */}
      {isMobile && isStreamReady && (
        <div className="p-8 bg-black flex justify-center items-center">
          <button
            onClick={capturePhoto}
            className="w-20 h-20 rounded-full bg-white border-8 border-indigo-400 hover:border-indigo-500 transition-all duration-200 flex items-center justify-center shadow-lg transform hover:scale-105"
            aria-label="Take photo"
          >
            <div className="w-14 h-14 rounded-full ai-header flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" 
                />
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default CameraCapture;
