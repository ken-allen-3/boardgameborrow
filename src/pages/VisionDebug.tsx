import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, RefreshCw, AlertCircle, ChevronDown, ChevronUp, X, Download } from 'lucide-react';

interface DetectedGame {
  title: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  matchedBggId?: string;
}

interface VisionResponse {
  detectedGames: DetectedGame[];
  rawResponse: any;
}

function VisionDebug() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<VisionResponse | null>(null);
  const [highlightedGame, setHighlightedGame] = useState<DetectedGame | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setResponse(null);
    setHighlightedGame(null);

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

    try {
      const imageUrl = await readFileAsDataURL(file);
      setImage(imageUrl);
    } catch (err) {
      setError('Failed to load image');
      console.error('Image load error:', err);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
      setResponse(data);
    } catch (err) {
      console.error('Vision API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setResponse(null);
    setError(null);
    setHighlightedGame(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const getFilteredResponse = () => {
    if (!response?.rawResponse) return null;

    // Extract only text annotations and relevant metadata
    const filteredResponse = {
      textAnnotations: response.rawResponse.textAnnotations?.map((annotation: any) => ({
        description: annotation.description,
        boundingPoly: annotation.boundingPoly,
        confidence: annotation.confidence
      })),
      // Add other relevant fields as needed
      locale: response.rawResponse.textAnnotations?.[0]?.locale
    };

    return filteredResponse;
  };

  const downloadJson = () => {
    if (!response) return;

    const filteredResponse = getFilteredResponse();
    const dataStr = JSON.stringify(filteredResponse, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `vision-api-response-${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Vision API Debug Interface</h1>
          {image && (
            <button
              onClick={resetAnalysis}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-4 w-4" />
              Reset
            </button>
          )}
        </div>

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
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h2 className="text-lg font-semibold mb-4">Image Preview</h2>
            <div className="relative border rounded-lg overflow-hidden bg-gray-100">
              <img
                ref={imageRef}
                src={image}
                alt="Selected"
                className="max-w-full h-auto object-contain mx-auto"
                style={{ maxHeight: '600px' }}
              />
              {response?.detectedGames && highlightedGame?.boundingBox && (
                <div
                  className="absolute border-2 border-indigo-500 bg-indigo-500/10"
                  style={{
                    left: `${highlightedGame.boundingBox.x}px`,
                    top: `${highlightedGame.boundingBox.y}px`,
                    width: `${highlightedGame.boundingBox.width}px`,
                    height: `${highlightedGame.boundingBox.height}px`,
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-indigo-500 text-white text-xs px-2 py-1 rounded">
                    {highlightedGame.title}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Display */}
        {response && (
          <div className="space-y-6">
            {/* Detected Games */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Detected Games</h2>
              <div className="space-y-2">
                {response.detectedGames.map((game, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                    onMouseEnter={() => setHighlightedGame(game)}
                    onMouseLeave={() => setHighlightedGame(null)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{game.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        game.confidence > 0.8 
                          ? 'bg-green-100 text-green-800'
                          : game.confidence > 0.6
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {Math.round(game.confidence * 100)}% confidence
                      </span>
                    </div>
                    <button
                      className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                      onClick={() => {
                        // TODO: Add to user's collection
                        console.log('Add game:', game.title);
                      }}
                    >
                      Add to Collection
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Raw Response (collapsible) */}
            <div className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gray-50">
                <button
                  onClick={() => setShowRawResponse(!showRawResponse)}
                  className="flex items-center gap-2 font-semibold"
                >
                  <span>Raw API Response</span>
                  {showRawResponse ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                <button
                  onClick={downloadJson}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  title="Download JSON"
                >
                  <Download className="h-4 w-4" />
                  <span>Download JSON</span>
                </button>
              </div>
              {showRawResponse && (
                <pre className="p-4 bg-gray-900 text-gray-100 overflow-x-auto">
                  {JSON.stringify(getFilteredResponse(), null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VisionDebug;