# Starting the Mentorque Platform

## Quick Start (Recommended)

### Option 1: Use separate terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```
This starts the backend on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```
This starts the frontend on `http://localhost:3000`

### Option 2: Individual scripts from root

**Backend:**
```bash
npm run backend
```

**Frontend:**
```bash
npm run frontend
```

## Port Configuration

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

The frontend is configured to connect to the backend at `http://localhost:3001` by default (see `src/pages/APIKeys.tsx` line 15).

## Troubleshooting

### Port Already in Use

If you get errors about ports being in use:

**On macOS/Linux:**
```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 3001
lsof -i :3001

# Kill the process (replace PID with the actual process ID)
kill -9 PID
```

**Or use these one-liners:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### API Connection Issues

1. Make sure the backend is running first on port 3001
2. Check the backend health endpoint: http://localhost:3001/health
3. Check browser console for CORS errors
4. Verify the `VITE_API_URL` in the frontend matches the backend URL

### Database Connection Issues

1. Make sure PostgreSQL is running
2. Check your `DATABASE_URL` in `backend/.env`
3. Run migrations: `cd backend && npm run prisma:migrate`
4. Generate Prisma client: `cd backend && npm run prisma:generate`

### Firebase Authentication Issues

1. Make sure `firebase-service-account.json` exists in the `backend` directory
2. Verify the Firebase configuration in your frontend
3. Check that Firebase Authentication is enabled in your Firebase Console


