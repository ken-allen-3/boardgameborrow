import React from 'react';
import { RoadmapCard as RoadmapCardComponent } from './RoadmapCard';
import { RoadmapCard as RoadmapCardType } from '../../services/roadmapService';

interface RoadmapColumnProps {
  title: string;
  status: RoadmapCardType['status'];
  cards: RoadmapCardType[];
  isAdmin?: boolean;
  onStatusChange?: (cardId: string, newStatus: RoadmapCardType['status']) => void;
}

export const RoadmapColumn: React.FC<RoadmapColumnProps> = ({
  title,
  status,
  cards,
  isAdmin = false,
  onStatusChange,
}) => {
  const columnColors = {
    planned: 'bg-gray-50 border-gray-200',
    'in-progress': 'bg-blue-50 border-blue-200',
    completed: 'bg-green-50 border-green-200',
  };

  const handleStatusChange = (cardId: string) => (newStatus: RoadmapCardType['status']) => {
    onStatusChange?.(cardId, newStatus);
  };

  return (
    <div className={`flex-1 min-w-[300px] max-w-md mx-2 p-4 rounded-lg border ${columnColors[status]}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-gray-500">{cards.length}</span>
      </div>

      <div className="space-y-4">
        {cards.map((card) => (
          <RoadmapCardComponent
            key={card.id}
            card={card}
            isAdmin={isAdmin}
            onStatusChange={handleStatusChange(card.id)}
          />
        ))}
        
        {cards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No cards in this column
          </div>
        )}
      </div>
    </div>
  );
};
