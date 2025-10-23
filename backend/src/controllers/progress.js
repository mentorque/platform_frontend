const prisma = require('../../src/utils/prisma');

// Default weeks structure
const DEFAULT_WEEKS = [
  { 
    week: 1, 
    title: "Resume Review & Analysis", 
    description: "Get your resume reviewed and analysed by your personal mentor",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-blue-50 border-blue-200"
  },
  { 
    week: 2, 
    title: "Resume Rebuild & Optimization", 
    description: "Completely rebuild your resume with expert guidance and ATS optimization",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-green-50 border-green-200"
  },
  { 
    week: 3, 
    title: "AI Assistant & Job Tracker Setup, Portfolio Building", 
    description: "Get your AI assistant setup and build a stunning portfolio that showcases your skills and projects",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-purple-50 border-purple-200"
  },
  { 
    week: 4, 
    title: "Cheat Sheet & Mock Interview Prep Plan", 
    description: "Get your cheat sheets and comprehensive mock interview preparation plan",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-orange-50 border-orange-200"
  },
  { 
    week: 5, 
    title: "Elevator Pitch", 
    description: "Perfect your 30-second introduction",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-green-100 border-green-200"
  },
  { 
    week: 6, 
    title: "Competency Interview", 
    description: "Behavioral questions and soft skills assessment",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-yellow-100 border-yellow-200"
  },
  { 
    week: 7, 
    title: "Technical Interview", 
    description: "Coding challenges and technical deep-dives",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-orange-100 border-orange-200"
  },
  { 
    week: 8, 
    title: "Final Behavioral Round", 
    description: "Executive-level behavioral assessment",
    done: false, 
    completedAt: null, 
    notes: "",
    color: "bg-red-100 border-red-200"
  },
];

// Get or create user progress
const getUserProgress = async (req, res) => {
  try {
    // For now, we'll use a default user ID for testing
    // In production, you'd get this from the authenticated user
    const firebaseUid = req.headers['x-user-id'] || 'test_uid_1760006801185';

    // Find user by firebaseUid
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { Progress: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let progress = user.Progress;

    // If no progress exists, create it with default weeks
    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          userId: user.id,
          weeks: DEFAULT_WEEKS
        }
      });
    } else {
      // Check if we need to update the structure
      const existingWeeks = progress.weeks;
      
      if (existingWeeks.length !== DEFAULT_WEEKS.length || 
          existingWeeks[0]?.title !== DEFAULT_WEEKS[0]?.title) {
        
        const updatedWeeks = DEFAULT_WEEKS.map((newWeek) => {
          const existingWeek = existingWeeks.find(w => w.week === newWeek.week);
          return existingWeek ? { 
            ...newWeek, 
            done: existingWeek.done,
            completedAt: existingWeek.completedAt,
            notes: existingWeek.notes
          } : newWeek;
        });
        
        progress = await prisma.progress.update({
          where: { id: progress.id },
          data: { weeks: updatedWeeks }
        });
      }
    }

    res.json({ weeks: progress.weeks });
  } catch (error) {
    console.error('Error getting user progress:', error);
    res.status(500).json({ error: 'Failed to get user progress' });
  }
};

// Update week completion status
const updateWeekDone = async (req, res) => {
  try {
    console.log('updateWeekDone called with:', {
      params: req.params,
      body: req.body,
      headers: req.headers
    });
    
    const firebaseUid = req.headers['x-user-id'] || 'test_uid_1760006801185';
    const index = parseInt(req.params.index);
    const { done } = req.body;

    console.log('Parsed values:', { index, done, firebaseUid });

    if (isNaN(index) || typeof done !== 'boolean') {
      console.log('Validation failed:', { index, done, isNaNIndex: isNaN(index), typeOfDone: typeof done });
      return res.status(400).json({ error: 'Invalid index or done status' });
    }

    // Find user by firebaseUid
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { Progress: true }
    });

    if (!user || !user.Progress) {
      return res.status(404).json({ error: 'User progress not found' });
    }

    const weeks = user.Progress.weeks;
    const updatedWeeks = weeks.map((w, i) =>
      i === index
        ? { ...w, done, completedAt: done ? new Date().toISOString() : null }
        : w
    );

    await prisma.progress.update({
      where: { id: user.Progress.id },
      data: { weeks: updatedWeeks }
    });

    res.json({ weeks: updatedWeeks });
  } catch (error) {
    console.error('Error updating week status:', error);
    res.status(500).json({ error: 'Failed to update week status' });
  }
};

// Update week notes
const updateWeekNotes = async (req, res) => {
  try {
    const firebaseUid = req.headers['x-user-id'] || 'test_uid_1760006801185';
    const index = parseInt(req.params.index);
    const { notes } = req.body;

    if (isNaN(index) || typeof notes !== 'string') {
      return res.status(400).json({ error: 'Invalid index or notes' });
    }

    // Find user by firebaseUid
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
      include: { Progress: true }
    });

    if (!user || !user.Progress) {
      return res.status(404).json({ error: 'User progress not found' });
    }

    const weeks = user.Progress.weeks;
    const updatedWeeks = weeks.map((w, i) => (i === index ? { ...w, notes } : w));

    await prisma.progress.update({
      where: { id: user.Progress.id },
      data: { weeks: updatedWeeks }
    });

    res.json({ weeks: updatedWeeks });
  } catch (error) {
    console.error('Error updating week notes:', error);
    res.status(500).json({ error: 'Failed to update week notes' });
  }
};

module.exports = {
  getUserProgress,
  updateWeekDone,
  updateWeekNotes
};
