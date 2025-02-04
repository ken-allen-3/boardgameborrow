import React from 'react';
import { RoadmapCard as RoadmapCardType } from '../../services/roadmapService';
import { useAuth } from '../../contexts/AuthContext';
import { roadmapService } from '../../services/roadmapService';

interface RoadmapCardProps {
  card: RoadmapCardType;
  onStatusChange?: (newStatus: RoadmapCardType['status']) => void;
  isAdmin?: boolean;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({ 
  card, 
  onStatusChange,
  isAdmin = false 
}) => {
  const { currentUser } = useAuth();
  const [isVoting, setIsVoting] = React.useState(false);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!currentUser || isVoting) return;
    
    try {
      setIsVoting(true);
      await roadmapService.vote(card.id, currentUser.uid, voteType);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const userVote = currentUser ? card.votes.userVotes[currentUser.uid] : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{card.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col items-center ml-4">
          <button
            onClick={() => handleVote('up')}
            disabled={isVoting}
            className={`p-1 rounded ${
              userVote === 'up'
                ? 'text-green-600'
                : 'text-gray-400 hover:text-green-600'
            }`}
          >
            ▲
          </button>
          <span className="text-sm font-semibold my-1">
            {card.votes.up - card.votes.down}
          </span>
          <button
            onClick={() => handleVote('down')}
            disabled={isVoting}
            className={`p-1 rounded ${
              userVote === 'down'
                ? 'text-red-600'
                : 'text-gray-400 hover:text-red-600'
            }`}
          >
            ▼
          </button>
        </div>
      </div>

      {isAdmin && onStatusChange && (
        <div className="mt-4 border-t pt-3">
          <select
            value={card.status}
            onChange={(e) => onStatusChange(e.target.value as RoadmapCardType['status'])}
            className="w-full p-2 border rounded bg-gray-50"
          >
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
        <span>
          Created {card.createdAt.toLocaleDateString()}
        </span>
        <span className={`px-2 py-1 rounded-full ${
          card.status === 'completed' 
            ? 'bg-green-100 text-green-800'
            : card.status === 'in-progress'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {card.status.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
};
