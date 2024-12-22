import React, { useState } from 'react';
import { Calendar, Clock, MessageSquare, Check, X, Clock4 } from 'lucide-react';

interface BorrowRequest {
  id: string;
  gameId: string;
  borrowerName: string;
  startDate: string;
  duration: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface BorrowRequestCardProps {
  request: BorrowRequest;
  onApprove: (requestId: string, availabilityTime: string) => void;
  onReject: (requestId: string) => void;
}

function BorrowRequestCard({ request, onApprove, onReject }: BorrowRequestCardProps) {
  const [showAvailability, setShowAvailability] = useState(false);
  const [availabilityTime, setAvailabilityTime] = useState('');

  const handleApprove = () => {
    if (!availabilityTime) {
      setShowAvailability(true);
      return;
    }
    onApprove(request.id, availabilityTime);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{request.borrowerName}</h3>
          <p className="text-sm text-gray-500">wants to borrow your game</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${
          request.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : request.status === 'approved'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>Starting {formatDate(request.startDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>For {request.duration} days</span>
        </div>
        {request.message && (
          <div className="flex items-start gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
            <p className="text-gray-600">{request.message}</p>
          </div>
        )}
      </div>

      {request.status === 'pending' && (
        <div className="space-y-3">
          {showAvailability ? (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                When can you meet for pickup?
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Clock4 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="datetime-local"
                    value={availabilityTime}
                    onChange={(e) => setAvailabilityTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <button
                  onClick={() => handleApprove()}
                  disabled={!availabilityTime}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleApprove()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => onReject(request.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <X className="h-4 w-4" />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>
      )}

      {request.status === 'approved' && availabilityTime && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">Pickup arranged for:</span>{' '}
            {new Date(availabilityTime).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default BorrowRequestCard;