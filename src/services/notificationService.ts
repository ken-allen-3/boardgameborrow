import { getDatabase, ref, push, remove, query, orderByChild, equalTo, endAt, get, update } from 'firebase/database';

export interface Notification {
  id: string;
  userId: string;
  type: 'FRIEND_REQUEST' | 'BORROW_REQUEST' | 'GAME_NIGHT_INVITE' | 'GROUP_INVITE';
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  data?: {
    senderId?: string;
    gameId?: string;
    gameNightId?: string;
    groupId?: string;
    requestId?: string;  // Added for borrow requests
  };
}

export class NotificationService {
  private db = getDatabase();
  
  async createNotification(userId: string, notification: Omit<Notification, 'id' | 'createdAt'>) {
    const notificationsRef = ref(this.db, `notifications/${userId}`);
    await push(notificationsRef, {
      ...notification,
      createdAt: Date.now(),
      read: false
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notificationsRef = ref(this.db, `notifications/${userId}`);
    const unreadQuery = query(notificationsRef, orderByChild('read'), equalTo(false));
    const snapshot = await get(unreadQuery);
    return snapshot.size;
  }

  async markAsRead(userId: string, notificationId: string) {
    const notificationRef = ref(this.db, `notifications/${userId}/${notificationId}`);
    await update(notificationRef, { read: true });
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notificationRef = ref(this.db, `notifications/${userId}/${notificationId}`);
    await remove(notificationRef);
  }

  async cleanupOldNotifications(userId: string) {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const notificationsRef = ref(this.db, `notifications/${userId}`);
    const oldQuery = query(notificationsRef, orderByChild('createdAt'), endAt(thirtyDaysAgo));
    const snapshot = await get(oldQuery);
    
    const updates: Record<string, null> = {};
    snapshot.forEach(child => {
      updates[child.key!] = null;
    });
    
    if (Object.keys(updates).length > 0) {
      await update(ref(this.db, `notifications/${userId}`), updates);
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
