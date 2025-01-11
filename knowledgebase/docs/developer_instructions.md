# Developer Instructions

## Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Firebase CLI
- Git

### Initial Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set up Firebase project
4. Configure environment variables

## Development Environment

### Environment Variables
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_GOOGLE_MAPS_API_KEY=
VITE_VISION_API_KEY=
VITE_BGG_API_RATE_LIMIT=
```

### Local Development
1. Start development server: `npm run dev`
2. Run Firebase emulators: `firebase emulators:start`
3. Access app at `http://localhost:3000`

## Project Structure

### Frontend
```
src/
├── components/     # React components
├── services/      # API and service logic
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── types/         # TypeScript types
└── utils/         # Utility functions
```

### Backend
```
server/
├── functions/     # Firebase functions
└── services/      # Backend services
```

## Development Workflow

### Code Standards
- Use TypeScript
- Follow ESLint rules
- Write unit tests
- Document code changes

### Git Workflow
1. Create feature branch
2. Make changes
3. Run tests
4. Submit PR
5. Address review comments

## Testing

### Unit Tests
- Run: `npm test`
- Coverage: `npm run test:coverage`

### Integration Tests
- Run: `npm run test:integration`
- E2E: `npm run test:e2e`

## Deployment

### Staging
1. Build: `npm run build`
2. Deploy to staging: `npm run deploy:staging`

### Production
1. Build: `npm run build`
2. Deploy: `npm run deploy`

## Common Tasks

### Adding Components
1. Create component file
2. Write component code
3. Add tests
4. Update documentation

### API Integration
1. Add service file
2. Implement API methods
3. Add error handling
4. Write tests

## Troubleshooting

### Common Issues
1. Firebase connection issues
2. Build errors
3. Type mismatches
4. API rate limits

### Debug Tools
- Chrome DevTools
- Firebase Console
- VS Code Debugger
- React DevTools

## Resources

### Documentation
- React docs
- Firebase docs
- TypeScript docs
- Vite docs

### Support
- GitHub Issues
- Team chat
- Documentation
- Code reviews
