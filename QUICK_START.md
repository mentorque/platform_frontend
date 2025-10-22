# 🚀 Quick Start - Applied Jobs Feature

## ✅ Issue Fixed!

The import error has been fixed. The backend should now start correctly.

## Start the Backend

```bash
cd backend
node server.js
```

You should see:
```
✅ Allowed Origins: [ 'http://localhost:5173', 'chrome-extension://*' ]
✅ Firebase Admin initialized
Server running on port 3001
```

## Run Database Migration

Before using the feature, you need to create the AppliedJob table:

```bash
cd backend
npx prisma migrate dev --name add_applied_jobs
```

This will:
- Create the migration SQL file
- Apply it to your database
- Generate the Prisma client

**Or if you prefer to see the schema first:**

```bash
cd backend
npx prisma studio
```

This opens a GUI where you can see your database structure.

## Start the Frontend

In a new terminal:

```bash
npm run dev
```

The frontend should start on `http://localhost:5173` (or similar).

## Test the Feature

1. Open your browser to the frontend URL
2. Sign in to your account
3. Click **"Applied Jobs"** in the navigation bar
4. You'll see the Applied Jobs page (empty initially)

## Add Test Data (Optional)

To test with sample data, open Prisma Studio:

```bash
cd backend
npx prisma studio
```

Then:
1. Click "AppliedJob" table
2. Click "Add record"
3. Fill in:
   - **id**: `test-job-001` (any unique string)
   - **userId**: Your user ID (copy from User table)
   - **title**: `Senior Software Engineer`
   - **company**: `Google`
   - **location**: `Mountain View, CA`
   - **url**: `https://careers.google.com/jobs/test`
   - **status**: `Applied`
   - Leave other fields as default

4. Click "Save 1 change"
5. Refresh the Applied Jobs page in your browser

## Verify It's Working

You should be able to:
- ✅ See the test job in a nice big card
- ✅ Click status buttons to change status (Applied → In Progress → Got Call Back → Rejected)
- ✅ See the status change persist after refresh
- ✅ Click "View Job" to open the URL
- ✅ Delete the job
- ✅ Use the filter buttons to filter by status

## Troubleshooting

### Backend won't start

**Check PostgreSQL is running:**
```bash
# On macOS with Homebrew
brew services list

# Start PostgreSQL if needed
brew services start postgresql
```

**Check DATABASE_URL in backend/.env:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mentorque?schema=public"
```

### Migration fails

**Reset and try again (WARNING: Deletes all data):**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Frontend can't connect to backend

**Check backend is running:**
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"...","environment":"development"}
```

**Check VITE_API_URL in your frontend .env:**
```env
VITE_API_URL="http://localhost:3001"
```

## All Set! 🎉

Once both servers are running and migration is complete, the Applied Jobs feature is fully functional!

For more details, see:
- `APPLIED_JOBS_FEATURE.md` - Comprehensive documentation
- `SETUP_APPLIED_JOBS.md` - Detailed setup guide
- `IMPLEMENTATION_COMPLETE.md` - Feature overview

---

**Need Help?** Check the console logs (frontend and backend) for error messages.

