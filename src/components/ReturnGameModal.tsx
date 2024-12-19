import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  owner: string;
  borrowDate?: string;
}

interface ReturnGameModalProps {
  game: Game;
  onClose: () => void;
  onSubmit: (gameId: string, condition: string, notes: string) => void;
}

function ReturnGameModal({ game, onClose, onSubmit }: ReturnGameModalProps) {
  const [condition, setCondition] = useState('perfect');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(game.id, condition, notes);
      onClose();
    } catch (error) {
      console.error('Failed to submit return:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const borrowDuration = game.borrowDate 
    ? Math.ceil((new Date().getTime() - new Date(game.borrowDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Return Game</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <div className="font-medium mb-1">{game.title}</div>
            <div className="text-sm text-gray-500">
              Borrowed from {game.owner}
              {borrowDuration > 0 && ` · ${borrowDuration} days ago`}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">
              Game Condition
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCondition('perfect')}
                className={`p-3 border rounded-lg flex items-center gap-2 ${
                  condition === 'perfect'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CheckCircle className={`h-5 w-5 ${
                  condition === 'perfect' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <div className="text-left">
                  <div className="font-medium">Perfect</div>
                  <div className="text-xs text-gray-500">Like new condition</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCondition('damaged')}
                className={`p-3 border rounded-lg flex items-center gap-2 ${
                  condition === 'damaged'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <AlertTriangle className={`h-5 w-5 ${
                  condition === 'damaged' ? 'text-yellow-500' : 'text-gray-400'
                }`} />
                <div className="text-left">
                  <div className="font-medium">Damaged</div>
                  <div className="text-xs text-gray-500">Has some issues</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Notes
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={condition === 'damaged' 
                  ? 'Please describe any damage or issues...'
                  : 'Add any additional notes...'}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                required={condition === 'damaged'}
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
              disabled={isSubmitting || (condition === 'damaged' && !notes)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Return Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReturnGameModal;