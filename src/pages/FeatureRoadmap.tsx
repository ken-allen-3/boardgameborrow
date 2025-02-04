import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { roadmapService, RoadmapCard } from '../services/roadmapService';
import { RoadmapColumn } from '../components/roadmap/RoadmapColumn';
import { NewFeatureModal } from '../components/roadmap/NewFeatureModal';
import LoadingScreen from '../components/LoadingScreen';

export const FeatureRoadmap: React.FC = () => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<RoadmapCard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'features' | 'bugs'>('all');

  // Check if user is admin (you may want to adjust this based on your admin logic)
  const isAdmin = currentUser?.email === 'your-admin-email@example.com';

  const loadCards = async () => {
    try {
      setIsLoading(true);
      const loadedCards = await roadmapService.getAllCards();
      setCards(loadedCards);
      setError(null);
    } catch (err) {
      console.error('Error loading roadmap cards:', err);
      setError('Failed to load roadmap cards. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleStatusChange = async (cardId: string, newStatus: RoadmapCard['status']) => {
    try {
      await roadmapService.updateCard(cardId, { status: newStatus });
      await loadCards(); // Reload cards to get updated state
    } catch (err) {
      console.error('Error updating card status:', err);
      // You might want to show an error toast here
    }
  };

  const getCardsByStatus = (status: RoadmapCard['status']) => {
    return cards.filter(card => {
      const statusMatch = card.status === status;
      if (filter === 'all') return statusMatch;
      if (filter === 'bugs') return statusMatch && card.tags.includes('bug');
      return statusMatch && !card.tags.includes('bug'); // features
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCards}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Feature Roadmap</h1>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="px-3 py-1.5 border rounded-lg bg-white text-sm"
            >
              <option value="all">All Items</option>
              <option value="features">Features Only</option>
              <option value="bugs">Bugs Only</option>
            </select>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <span className="mr-2">+</span>
            Submit Feature Request
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6">
          <RoadmapColumn
            title="Planned"
            status="planned"
            cards={getCardsByStatus('planned')}
            isAdmin={isAdmin}
            onStatusChange={handleStatusChange}
          />
          <RoadmapColumn
            title="In Progress"
            status="in-progress"
            cards={getCardsByStatus('in-progress')}
            isAdmin={isAdmin}
            onStatusChange={handleStatusChange}
          />
          <RoadmapColumn
            title="Completed"
            status="completed"
            cards={getCardsByStatus('completed')}
            isAdmin={isAdmin}
            onStatusChange={handleStatusChange}
          />
        </div>

        <NewFeatureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadCards}
        />
      </div>
    </div>
  );
};
