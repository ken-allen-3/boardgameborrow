# Future Tasks and Considerations

## Backend Infrastructure
- **Consider migrating to Firebase Functions**: If Heroku hosting becomes cost-ineffective, migrate the vision/game detection Express server to Firebase Functions
  - Pros of Firebase Functions:
    - Pay-per-use pricing
    - Tighter integration with existing Firebase services
    - Automatic scaling
  - Current setup uses Express server on Heroku for:
    - Vision API integration
    - Game detection service
    - Credential management

## Current Infrastructure
- Frontend: Netlify
- Backend API: Heroku (Express server)
- Database: Firebase
- Image Processing: Google Cloud Vision API
