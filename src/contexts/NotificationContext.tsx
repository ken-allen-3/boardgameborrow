import { createContext, useContext, useEffect, useState } from "react";
import { ref, onValue, getDatabase } from "firebase/database";
import { auth } from "../config/firebase";
import { Notification, notificationService } from "../services/notificationService";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const notificationsRef = ref(getDatabase(), `notifications/${userId}`);
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notifs: Notification[] = [];
      let unread = 0;
      
      snapshot.forEach((child) => {
        const notification = {
          ...child.val(),
          id: child.key!
        } as Notification;
        
        notifs.push(notification);
        if (!notification.read) unread++;
      });
      
      setNotifications(notifs.sort((a, b) => b.createdAt - a.createdAt));
      setUnreadCount(unread);
    });

    // Cleanup old notifications on mount
    notificationService.cleanupOldNotifications(userId);

    return () => unsubscribe();
  }, []);

  const markAsRead = async (notificationId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await notificationService.markAsRead(userId, notificationId);
  };

  const deleteNotification = async (notificationId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    await notificationService.deleteNotification(userId, notificationId);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        deleteNotification 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
