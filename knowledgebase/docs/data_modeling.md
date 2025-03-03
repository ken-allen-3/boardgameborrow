# Data Modeling

## Database Structure

### Users Collection
```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
  };
  games: {
    [gameId: string]: {
      dateAdded: string;
      available: boolean;
    }
  };
  friends: {
    [userId: string]: {
      status: 'pending' | 'accepted';
      timestamp: string;
    }
  };
}
```

### Games Collection
```typescript
interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  owner: string; // userId
  status: 'available' | 'borrowed';
  bggId?: string;
  ratings: {
    [userId: string]: {
      score: number;
      comment?: string;
      timestamp: string;
    }
  };
}
```

### Borrow Requests
```typescript
interface BorrowRequest {
  id: string;
  gameId: string;
  borrowerId: string;
  ownerId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'returned';
  requestDate: string;
  returnDate?: string;
  message?: string;
}
```

### Game Nights
```typescript
interface GameNight {
  id: string;
  hostId: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  coverImage?: {
    url: string;
    uploadDate: string;
  };
  attendees: {
    [userId: string]: {
      status: 'invited' | 'attending' | 'declined';
      responseDate?: string;
      suggestedGames?: string[]; // Array of gameIds
    }
  };
  suggestedGames: {
    [gameId: string]: {
      suggestedBy: string;
      votes: number;
      suggestedAt: string;
      notes?: string;
    }
  };
  selectedGames?: string[]; // Final selected games for the night
}
```

### Groups
```typescript
interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: {
    [userId: string]: {
      role: 'admin' | 'member';
      joinDate: string;
    }
  };
  settings: {
    visibility: 'public' | 'private';
    joinPolicy: 'open' | 'approval';
  };
}
```

## Relationships

### User Relationships
- User -> Games (one-to-many)
- User -> Friends (many-to-many)
- User -> Groups (many-to-many)
- User -> Game Nights (many-to-many)

### Game Relationships
- Game -> Owner (many-to-one)
- Game -> Borrowers (one-to-many)
- Game -> Ratings (one-to-many)

### Group Relationships
- Group -> Members (one-to-many)
- Group -> Game Nights (one-to-many)

## Security Rules

### User Data
```javascript
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('users').child(auth.uid).child('friends').child($uid).exists()",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### Game Data
```javascript
{
  "rules": {
    "games": {
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null && (!data.exists() || data.child('owner').val() === auth.uid)"
      }
    }
  }
}
```

### Borrow Requests
```javascript
{
  "rules": {
    "borrowRequests": {
      ".read": "auth != null",
      "$requestId": {
        ".write": "auth != null && (newData.child('borrowerId').val() === auth.token.email || newData.child('ownerId').val() === auth.token.email || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
      }
    }
  }
}
```

> **Note**: The read rule allows any authenticated user to read all borrow requests, and then the application filters the requests to show only those relevant to the current user. This prevents permission errors when a user has 0 active borrow requests.

### Ratings
```javascript
{
  "rules": {
    "ratings": {
      ".read": "auth != null",
      "$userEmail": {
        ".write": "auth != null && auth.token.email.replace('.', ',') === $userEmail"
      }
    }
  }
}
```

> **Note**: The read rule allows any authenticated user to read all ratings, which is necessary for the recommendation system to function properly.

### Friendships
```javascript
{
  "rules": {
    "friendships": {
      ".read": "auth != null",
      "$userEmail": {
        ".write": "auth != null && (auth.token.email.replace('.', ',') === $userEmail || root.child('users').child(auth.token.email.replace('.', ',')).child('isAdmin').val() === true)"
      }
    }
  }
}
```

> **Note**: The read rule allows any authenticated user to read all friendships, which is necessary for the friend system to function properly. The application filters the data to show only relevant friendships to each user.

## Indexing

### Required Indexes
```javascript
{
  "games": {
    ".indexOn": ["owner", "status"]
  },
  "borrowRequests": {
    ".indexOn": ["borrowerId", "ownerId", "status"]
  },
  "gameNights": {
    ".indexOn": ["hostId", "date"]
  }
}
```

## Data Validation

### Game Validation
```javascript
{
  "games": {
    "$gameId": {
      ".validate": "newData.hasChildren(['title', 'owner', 'status'])",
      "status": {
        ".validate": "newData.val() === 'available' || newData.val() === 'borrowed'"
      }
    }
  }
}
```

### User Validation
```javascript
{
  "users": {
    "$uid": {
      ".validate": "newData.hasChildren(['email', 'displayName'])",
      "email": {
        ".validate": "newData.isString() && newData.val().matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$/)"
      }
    }
  }
}
