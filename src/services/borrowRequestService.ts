import { getDatabase, ref, set, get, update } from 'firebase/database';
import { updateOnboardingProgress, getUserProfile } from './userService';
import { notificationService } from './notificationService';

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
  const requestId = `${request.gameId}-${request.borrowerId.replace(/\./g, ',')}-${Date.now()}`;
  const requestRef = ref(db, `borrowRequests/${requestId}`);

  const newRequest: BorrowRequest = {
    ...request,
    id: requestId,
    createdAt: new Date().toISOString()
  };

  try {
    await set(requestRef, newRequest);
    
    // Update onboarding progress when user makes their first borrow request
    await updateOnboardingProgress(request.borrowerId, {
      hasBorrowed: true
    });

    // Create notification for the game owner
    const borrowerProfile = await getUserProfile(request.borrowerId);
    await notificationService.createNotification(request.ownerId, {
      userId: request.ownerId,
      type: 'BORROW_REQUEST',
      title: 'New Borrow Request',
      message: `${borrowerProfile.firstName} ${borrowerProfile.lastName} wants to borrow ${request.gameName}`,
      read: false,
      data: {
        senderId: request.borrowerId,
        gameId: request.gameId,
        requestId: requestId
      }
    });
    
    return requestId;
  } catch (error) {
    console.error('Failed to create borrow request:', error);
    throw new Error('Failed to send borrow request. Please try again.');
  }
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
