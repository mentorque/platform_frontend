# Mentorque Platform Setup Guide

## Port Configuration

- **Frontend (Vite)**: `http://localhost:3000`
- **Backend (Express)**: `http://localhost:3001`

## Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3001
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/mentorque?schema=public"
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

4. Update your PostgreSQL connection string in the `DATABASE_URL` variable.

5. Run Prisma migrations:
```bash
npm run prisma:migrate
```

6. Generate Prisma client:
```bash
npm run prisma:generate
```

7. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

## Firebase Configuration

1. Download your Firebase service account JSON file from the Firebase Console
2. Save it as `firebase-service-account.json` in the `backend` directory
3. Make sure this file is added to `.gitignore` (it should be already)

## API Key Generation

The API key generation uses Node.js's built-in `crypto` module and should work out of the box. Keys are generated with the format: `mq_[64 character hex string]`

## Testing the API

Test if the backend is running:
```bash
curl http://localhost:3001/health
```

You should get a response like:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## Common Issues

### Port Already in Use
If you get a port error, make sure nothing else is running on ports 3000 or 3001:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### CORS Errors
Make sure your frontend URL is included in the `ALLOWED_ORIGINS` in the backend `.env` file.

### Crypto Module Error
The crypto module is built into Node.js. If you're getting crypto errors, make sure you're using Node.js v14 or higher:
```bash
node --version
```


