// Firestore Security Rules
export const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid != null;
      allow create: if request.auth.uid == userId;
      allow update, delete: if request.auth.uid == userId;
      
      // User's friend requests subcollection
      match /friendRequests/{requestId} {
        allow read: if request.auth.uid == userId;
        allow create: if request.auth.uid != null;
        allow update, delete: if request.auth.uid == userId;
      }
      
      // User's friends subcollection
      match /friends/{friendId} {
        allow read: if request.auth.uid == userId;
        allow write: if request.auth.uid == userId;
      }
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth.uid == resource.data.senderId || request.auth.uid == resource.data.recipientId;
      allow create: if request.auth.uid == request.resource.data.senderId && 
                       request.resource.data.recipientId != null &&
                       request.resource.data.timestamp != null;
      allow delete: if request.auth.uid == resource.data.senderId;
    }
    
    // Conversations collection (for listing)
    match /conversations/{conversationId} {
      allow read: if request.auth.uid in resource.data.participants;
      allow write: if request.auth.uid in request.resource.data.participants;
    }
  }
}
`

// Firebase Storage Rules
export const storageRules = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User avatars
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId && 
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }
    
    // Message attachments
    match /messages/{userId}/{allPaths=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId &&
                      request.resource.size < 10 * 1024 * 1024;
    }
  }
}
`

// Firestore Indexes
export const firestoreIndexes = `
Composite Indexes:

1. Collection: messages
   Fields: 
   - conversationId (Ascending)
   - timestamp (Descending)
   
2. Collection: messages
   Fields:
   - senderId (Ascending)
   - timestamp (Descending)
   
3. Collection: messages
   Fields:
   - recipientId (Ascending)
   - timestamp (Descending)
   
4. Collection: conversations
   Fields:
   - participants (Ascending)
   - lastMessageTime (Descending)
   
5. Collection: users
   Fields:
   - username (Ascending)
   - createdAt (Descending)

Single Field Indexes:
- messages.conversationId (Ascending)
- messages.timestamp (Descending)
- conversations.participants (Ascending)
- users.email (Ascending)
- users.username (Ascending)
`
