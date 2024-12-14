import { getDatabase, ref, set, get } from 'firebase/database';

export interface BorrowRequest {
  id: string;
  gameId: string;
  borrowerId: string;
  ownerId: string;
  gameName: string;
  startDate: string;
  duration: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export async function createBorrowRequest(request: Omit<BorrowRequest, 'id' | 'createdAt'>): Promise<string> {
  const db = getDatabase();
  const requestId = `${request.gameId}-${request.borrowerId}-${Date.now()}`;
  const requestRef = ref(db, `borrowRequests/${requestId}`);

  const newRequest: BorrowRequest = {
    ...request,
    id: requestId,
    createdAt: new Date().toISOString()
  };

  await set(requestRef, newRequest);
  return requestId;
}

export async function getUserBorrowRequests(userId: string): Promise<BorrowRequest[]> {
  const db = getDatabase();
  const requestsRef = ref(db, 'borrowRequests');
  
  try {
    const snapshot = await get(requestsRef);
    if (!snapshot.exists()) return [];

    const requests = Object.values(snapshot.val() as Record<string, BorrowRequest>);
    return requests.filter(request => request.borrowerId === userId);
  } catch (error) {
    console.error('Error loading borrow requests:', error);
    throw new Error('Failed to load borrow requests');
  }
}