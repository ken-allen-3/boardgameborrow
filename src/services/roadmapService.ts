import { db } from '../config/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  DocumentData,
} from 'firebase/firestore';

export interface RoadmapCard {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  votes: {
    up: number;
    down: number;
    userVotes: Record<string, 'up' | 'down'>;
  };
  createdAt: Date;
  createdBy: string;
  priority: number;
  tags: string[];
}

const COLLECTION_NAME = 'roadmap_cards';

export const roadmapService = {
  async getAllCards(): Promise<RoadmapCard[]> {
    const cardsRef = collection(db, COLLECTION_NAME);
    const q = query(cardsRef, orderBy('priority', 'desc'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as RoadmapCard[];
  },

  async getCardsByStatus(status: RoadmapCard['status']): Promise<RoadmapCard[]> {
    const cardsRef = collection(db, COLLECTION_NAME);
    const q = query(
      cardsRef,
      where('status', '==', status),
      orderBy('priority', 'desc'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as RoadmapCard[];
  },

  async createCard(card: Omit<RoadmapCard, 'id'>): Promise<string> {
    const cardsRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(cardsRef, {
      ...card,
      createdAt: new Date(),
      votes: {
        up: 0,
        down: 0,
        userVotes: {},
      },
      priority: 0,
    });
    return docRef.id;
  },

  async updateCard(id: string, updates: Partial<RoadmapCard>): Promise<void> {
    const cardRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(cardRef, updates as DocumentData);
  },

  async deleteCard(id: string): Promise<void> {
    const cardRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(cardRef);
  },

  async vote(cardId: string, userId: string, voteType: 'up' | 'down'): Promise<void> {
    const cardRef = doc(db, COLLECTION_NAME, cardId);
    const card = (await getDocs(query(collection(db, COLLECTION_NAME), where('id', '==', cardId)))).docs[0];
    const currentVotes = card.data().votes || { up: 0, down: 0, userVotes: {} };
    const userPreviousVote = currentVotes.userVotes[userId];

    // Remove previous vote if exists
    if (userPreviousVote) {
      currentVotes[userPreviousVote]--;
      delete currentVotes.userVotes[userId];
    }

    // Add new vote
    currentVotes[voteType]++;
    currentVotes.userVotes[userId] = voteType;

    // Update priority score (up votes - down votes)
    const priority = currentVotes.up - currentVotes.down;

    await updateDoc(cardRef, {
      votes: currentVotes,
      priority,
    });
  },
};
