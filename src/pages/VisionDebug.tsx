import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';

interface VisionResponse {
  raw: any;
  processed: {
    text: string[];
    labels: string[];
    boardGames: string[];
  };
}

function VisionDebug() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<VisionResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setResponse(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) return;
  
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending image for analysis...');
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze image');
      }
  
      const data = await response.json();
      console.log('Received analysis response:', data);
      
      setResponse({
        raw: data,
        processed: {
          text: data.textAnnotations?.map((ann: any) => ann.description) || [],
          labels: data.labelAnnotations?.map((ann: any) => ann.description) || [],
          boardGames: extractBoardGameNames(data.textAnnotations || [])
        }
      });
    } catch (err) {
      console.error('Vision API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const extractBoardGameNames = (annotations: any[]): string[] => {
    // Simple extraction for now - we'll improve this later
    return annotations
      .slice(1) // Skip first annotation which contains all text
      .map(ann => ann.description)
      .filter(text => text.length > 3); // Filter out very short text
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Vision API Debug Interface</h1>

        {/* File Upload Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Upload className="h-5 w-5" />
              Select Image
            </button>
            <button
              onClick={analyzeImage}
              disabled={!image || loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Image Preview */}
        {image && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Image Preview</h2>
            <div className="relative aspect-video w-full">
              <img
                src={image}
                alt="Selected"
                className="absolute inset-0 w-full h-full object-contain bg-gray-100 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Results Display */}
        {response && (
          <div className="space-y-6">
            {/* Processed Results */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Processed Results</h2>
              <div className="space-y-4">
                {/* Detected Board Games */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Detected Board Games</h3>
                  <div className="flex flex-wrap gap-2">
                    {response.processed.boardGames.map((game, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                      >
                        {game}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detected Text */}
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">All Detected Text</h3>
                  <div className="flex flex-wrap gap-2">
                    {response.processed.text.map((text, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {text}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Raw JSON Response */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Raw API Response</h2>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(response.raw, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisionDebug;
