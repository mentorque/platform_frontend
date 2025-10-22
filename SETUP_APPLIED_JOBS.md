# Applied Jobs Feature - Setup Guide

## Quick Setup

Follow these steps to set up the Applied Jobs feature:

### Step 1: Database Migration

The `AppliedJob` model is already defined in `backend/prisma/schema.prisma`, but you need to create and run the database migration.

**Option A: Development Environment (Recommended)**

```bash
cd backend
npx prisma migrate dev --name add_applied_jobs
```

This will:
1. Create a new migration file
2. Apply the migration to your database
3. Regenerate the Prisma Client

**Option B: Production Environment**

```bash
cd backend
npx prisma migrate deploy
```

### Step 2: Verify Database Schema

You can verify the table was created using Prisma Studio:

```bash
cd backend
npx prisma studio
```

This will open a browser window where you can:
- See the `AppliedJob` table
- View its structure
- Manually add test data if needed

### Step 3: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
# From root directory
npm run dev
```

### Step 4: Test the Feature

1. Navigate to `http://localhost:3000` (or your frontend URL)
2. Sign in to your account
3. Click "Applied Jobs" in the navigation bar
4. You should see the Applied Jobs page (it will be empty initially)

## Database Schema Details

The migration will create the following table:

```sql
CREATE TABLE "AppliedJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "url" TEXT NOT NULL,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Applied',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppliedJob_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "AppliedJob_status_idx" ON "AppliedJob"("status");
CREATE INDEX "AppliedJob_userId_idx" ON "AppliedJob"("userId");
CREATE UNIQUE INDEX "AppliedJob_userId_url_key" ON "AppliedJob"("userId", "url");

-- Foreign Key
ALTER TABLE "AppliedJob" ADD CONSTRAINT "AppliedJob_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") 
    ON DELETE CASCADE ON UPDATE CASCADE;
```

## Testing with Sample Data

If you want to test with sample data before integrating with the Chrome Extension:

### Option 1: Using Prisma Studio
1. Run `npx prisma studio` from the backend directory
2. Click on "AppliedJob"
3. Click "Add record"
4. Fill in the fields:
   - **id**: Any unique string (e.g., "job-001")
   - **userId**: Your user ID from the User table
   - **title**: "Senior Software Engineer"
   - **company**: "Google"
   - **location**: "Mountain View, CA"
   - **url**: "https://careers.google.com/jobs/123"
   - **status**: "Applied"
   - Leave other fields as default

### Option 2: Using API (via Postman or curl)

First, get your Firebase auth token:
1. Open your browser console on the Mentorque platform
2. Run: `await firebase.auth().currentUser.getIdToken()`
3. Copy the token

Then make a POST request:


curl -X POST http://localhost:3001/api/applied-jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "id": "job-001",
    "title": "Senior Software Engineer",
    "company": "Google",
    "location": "Mountain View, CA",
    "url": "https://careers.google.com/jobs/123",
    "appliedText": "Excited about this opportunity!"
  }'
```

## Troubleshooting

### "Table 'AppliedJob' does not exist"
**Solution**: Run the Prisma migration:
```bash
cd backend
npx prisma migrate dev --name add_applied_jobs
```

### "PrismaClient is unable to connect to the database"
**Solution**: 
1. Check if PostgreSQL is running
2. Verify `DATABASE_URL` in `backend/.env`
3. Test connection: `npx prisma db pull`

### "Migration failed"
**Solution**:
1. Check if you have write permissions to the database
2. Ensure no other applications are using the database
3. Try resetting: `npx prisma migrate reset` (WARNING: This deletes all data)

### Pages shows "Loading..." forever
**Solution**:
1. Check backend is running on port 3001
2. Open browser console and check for errors
3. Verify you're logged in (token is valid)
4. Check backend logs for errors

### Status updates don't persist
**Solution**:
1. Check browser console for errors
2. Verify backend API is responding: `curl http://localhost:3001/health`
3. Check backend logs for database errors

## Environment Variables

Make sure you have these set in `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mentorque?schema=public"
NODE_ENV="development"
```

And in your frontend `.env`:

```env
VITE_API_URL="http://localhost:3001"
```

## Integration with Chrome Extension

Once the feature is set up, the Chrome Extension should:

1. Call `POST /api/applied-jobs` when a user clicks "Apply" on a job
2. Send the job details (id, title, company, location, url)
3. Use the user's Firebase auth token for authentication

Example extension code:

```javascript
// In your Chrome Extension
const applyToJob = async (jobDetails) => {
  const token = await firebase.auth().currentUser.getIdToken();
  
  const response = await fetch('http://localhost:3001/api/applied-jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: jobDetails.jobId,
      title: jobDetails.title,
      company: jobDetails.company,
      location: jobDetails.location,
      url: window.location.href,
      appliedText: jobDetails.description
    })
  });
  
  if (response.ok) {
    console.log('Job saved to Applied Jobs!');
  }
};
```

## Verification Checklist

- [ ] Database migration completed successfully
- [ ] AppliedJob table visible in Prisma Studio
- [ ] Backend server starts without errors
- [ ] Frontend loads without errors
- [ ] Can navigate to Applied Jobs page
- [ ] Can create test job via API
- [ ] Test job appears on Applied Jobs page
- [ ] Can update job status
- [ ] Can delete job
- [ ] Status filters work
- [ ] Dark mode works

## Next Steps

After setup is complete:

1. **Test the full flow**: Create a few test jobs and try all status transitions
2. **Update Chrome Extension**: Integrate the API calls into your extension
3. **User Testing**: Have a few users test the feature
4. **Monitor**: Check backend logs for any errors
5. **Iterate**: Gather feedback and make improvements

## Support

If you encounter issues:

1. Check the console logs (frontend and backend)
2. Review `APPLIED_JOBS_FEATURE.md` for feature documentation
3. Check `START_SERVERS.md` for general setup help
4. Verify all dependencies are installed (`npm install`)

---

**Ready to go!** Once you complete these steps, the Applied Jobs feature will be fully functional. 🚀

