import React, { useState } from 'react';
import { X, Clock, MessageSquare } from 'lucide-react';
import { addDays, format } from 'date-fns';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import DatePicker from './DatePicker';
import { trackGameAction } from '../services/analyticsService';

interface BorrowRequestModalProps {
  game: {
    id: string;
    title: string;
    owner: {
      email: string;
      firstName: string;
      lastName: string;
    };
    isFriend: boolean;
  };
  onClose: () => void;
  onSubmit: (request: {
    gameId: string;
    startDate: string;
    duration: number;
    message: string;
  }) => void;
}

function BorrowRequestModal({ game, onClose, onSubmit }: BorrowRequestModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState(7);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!startDate) {
      setError('Please select a start date');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {

      const requestData = {
        gameId: game.id,
        startDate: startDate.toISOString().split('T')[0],
        duration,
        message
      };
      await onSubmit(requestData);
      
      // Track the borrow request
      trackGameAction('Borrow Request', game.id, {
        title: game.title,
        owner: game.owner.email,
        startDate: requestData.startDate,
        duration: requestData.duration
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to submit request. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Request to Borrow</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!game.isFriend ? (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Friend Request Required</div>
              <p className="text-gray-600 mb-4">
                You need to be friends with {game.owner.firstName} to borrow their games. 
                Send them a friend request to get started!
              </p>
              <a 
                href={`/profile/${game.owner.email}`}
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Profile & Send Friend Request
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && <ErrorMessage message={error} />}
          {isSuccess && <SuccessMessage message="Game borrow request sent successfully!" />}
          
          <div>
            <div className="font-medium mb-1">Game</div>
            <div className="text-gray-600">{game.title}</div>
            <div className="text-sm text-gray-500">
              Owned by {game.owner.firstName} {game.owner.lastName}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Start Date
            </label>
            <DatePicker
              selectedDate={startDate}
              onChange={setStartDate}
              minDate={new Date()}
            />
            {startDate && (
              <div className="mt-2 text-sm text-gray-600">
                Return by: {format(addDays(startDate, duration), 'EEEE, MMMM d, yyyy')}
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Borrow Duration (days)
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={duration}
                aria-label="Borrow duration"
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={7}>1 week</option>
                <option value={14}>2 weeks</option>
                <option value={30}>1 month</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Message to Owner
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <textarea
                value={message}
                aria-label="Message to owner"
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a note to the owner..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSubmitting ? 'opacity-75' : ''
              }`}
            >
              {isSubmitting ? 'Sending Request...' : 'Send Request'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

export default BorrowRequestModal;
