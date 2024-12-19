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
            onClick={onClose}
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
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="absolute inset-0 flex flex-col">
          <div className="text-white text-center py-4 px-6 bg-black/50">
            Take a photo of your board game collection
            {!isMobile && (
              <div className="text-sm opacity-75 mt-1">
                Click anywhere on the camera view to capture
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
            className="w-20 h-20 rounded-full bg-white border-8 border-gray-300 hover:border-gray-400 transition-colors duration-200 flex items-center justify-center"
            aria-label="Take photo"
          >
            <div className="w-14 h-14 rounded-full bg-indigo-600"></div>
          </button>
        </div>
      )}
    </div>
  );
}

export default CameraCapture;