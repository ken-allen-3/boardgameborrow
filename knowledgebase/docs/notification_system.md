# In-App Notification System

## Overview
The notification system provides real-time in-app notifications for various user interactions like friend requests and game borrow requests. It leverages Firebase Realtime Database for storage and real-time updates.

## Technical Architecture

### Data Model
```typescript
interface Notification {
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
    requestId?: string;
  };
}
```

### Firebase Structure
```
/notifications/{userId}/{notificationId}
```

### Security Rules
```json
{
  "rules": {
    "notifications": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid",
        ".indexOn": ["read", "createdAt"]
      }
    }
  }
}
```

## Core Components

### 1. NotificationService
Location: `src/services/notificationService.ts`

Handles all notification-related operations:
- Creating notifications
- Marking notifications as read
- Deleting notifications
- Cleaning up old notifications (30 days)
- Counting unread notifications

### 2. NotificationContext
Location: `src/contexts/NotificationContext.tsx`

Provides real-time notification state management:
- Real-time updates via Firebase subscription
- Global access to notifications
- Unread count tracking
- Mark as read/delete functionality

### 3. NotificationsDropdown
Location: `src/components/NotificationsDropdown.tsx`

UI component that displays notifications:
- Notification bell with unread count
- Dropdown menu with notification list
- Read/unread status indication
- Delete functionality
- Relative timestamp display
- Navigation to relevant pages on click

## Integration Points

### Friend Requests
Location: `src/services/friendService.ts`

Creates notifications when:
- A user sends a friend request
```typescript
await notificationService.createNotification(toUserId, {
  userId: toUserId,
  type: 'FRIEND_REQUEST',
  title: 'New Friend Request',
  message: `${senderName} sent you a friend request`,
  data: { senderId: fromUserId }
});
```

### Game Borrow Requests
Location: `src/services/borrowRequestService.ts`

Creates notifications when:
- A user requests to borrow a game
```typescript
await notificationService.createNotification(ownerId, {
  userId: ownerId,
  type: 'BORROW_REQUEST',
  title: 'New Borrow Request',
  message: `${borrowerName} wants to borrow ${gameName}`,
  data: {
    senderId: borrowerId,
    gameId: gameId,
    requestId: requestId
  }
});
```

## Adding New Notification Types

1. Add the new type to the Notification interface type union:
```typescript
type: 'FRIEND_REQUEST' | 'BORROW_REQUEST' | 'GAME_NIGHT_INVITE' | 'GROUP_INVITE';
```

2. Add any new data fields to the notification data interface:
```typescript
data?: {
  senderId?: string;
  gameId?: string;
  gameNightId?: string;  // Example new field
  // ...
};
```

3. Update the NotificationsDropdown component to handle the new type:
```typescript
case "GAME_NIGHT_INVITE":
  navigate(`/game-nights`);
  break;
```

4. Integrate with the relevant service:
```typescript
await notificationService.createNotification(userId, {
  type: 'GAME_NIGHT_INVITE',
  title: 'Game Night Invitation',
  message: `${hostName} invited you to a game night`,
  data: { gameNightId: nightId }
});
```

## Maintenance

### Automatic Cleanup
Old notifications (>30 days) are automatically cleaned up when:
- A user logs in
- The notification list is first loaded

### Performance Considerations
- Indexed fields: 'read' and 'createdAt' for efficient queries
- Real-time updates only for the current user's notifications
- Automatic cleanup prevents database bloat

### Error Handling
- Failed notification creation doesn't block the main action
- Network errors are caught and logged
- UI remains responsive during notification operations
