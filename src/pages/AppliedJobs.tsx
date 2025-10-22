import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Briefcase, MapPin, ExternalLink, Trash2, Calendar, Building2, RefreshCw, FileText, Clock, Phone, XCircle, ChevronDown, Flame, Trophy, Target, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Protected from '@/components/Protected';
import Navbar from '@/components/Navbar';

interface AppliedJob {
  id: string;
  title: string;
  company?: string;
  location?: string;
  url: string;
  appliedDate: string;
  appliedText?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const STATUS_OPTIONS = [
  { 
    value: 'Applied', 
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700', 
    icon: FileText 
  },
  { 
    value: 'In Progress', 
    color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700', 
    icon: Clock 
  },
  { 
    value: 'Got Call Back', 
    color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700', 
    icon: Phone 
  },
  { 
    value: 'Rejected', 
    color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700', 
    icon: XCircle 
  }
];

export default function AppliedJobs() {
  const [jobs, setJobs] = useState<AppliedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchAppliedJobs(user);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAppliedJobs = async (user?: any) => {
    try {
      const currentUser = user || auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const token = await currentUser.getIdToken();
      const response = await fetch(`${API_URL}/api/applied-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch applied jobs');
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error: any) {
      console.error('Error fetching applied jobs:', error);
      toast.error(error.message || 'Failed to load applied jobs');
    } finally {
      setLoading(false);
    }
  };

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    setUpdatingJobId(jobId);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Not authenticated');
        setUpdatingJobId(null);
        return;
      }

      const response = await fetch(`${API_URL}/api/applied-jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      const data = await response.json();
      
      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus, updatedAt: data.job.updatedAt } : job
      ));

      toast.success(`Status updated to "${newStatus}"`);
    } catch (error: any) {
      console.error('Error updating job status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingJobId(null);
    }
  };

  const deleteJob = async (jobId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/applied-jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  const filteredJobs = filterStatus === 'All' 
    ? jobs 
    : jobs.filter(job => job.status === filterStatus);

  const getStatusCounts = () => {
    const counts: { [key: string]: number } = { All: jobs.length };
    STATUS_OPTIONS.forEach(option => {
      counts[option.value] = jobs.filter(job => job.status === option.value).length;
    });
    return counts;
  };

  const calculateStreak = () => {
    if (jobs.length === 0) return { currentStreak: 0, todayCount: 0, needToday: 3 };

    // Group jobs by date
    const jobsByDate: { [key: string]: number } = {};
    jobs.forEach(job => {
      const date = new Date(job.appliedDate).toDateString();
      jobsByDate[date] = (jobsByDate[date] || 0) + 1;
    });

    // Get today's date
    const today = new Date().toDateString();
    const todayCount = jobsByDate[today] || 0;

    // Calculate streak
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toDateString();
      const count = jobsByDate[dateStr] || 0;
      
      if (count >= 3) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (dateStr === today && count > 0) {
        // Today but hasn't reached minimum yet - don't break streak
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak: streak,
      todayCount,
      needToday: Math.max(0, 3 - todayCount)
    };
  };

  const streakData = calculateStreak();
  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <Protected>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Protected>
    );
  }

  return (
    <Protected>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Streak Counter */}
        <div className="mb-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Current Streak */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-xl shadow-md">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {streakData.currentStreak}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Day Streak
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-16 w-px bg-slate-300 dark:bg-slate-600"></div>

              {/* Today's Progress */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl shadow-md">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {streakData.todayCount}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Today's Applications
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-16 w-px bg-slate-300 dark:bg-slate-600"></div>

              {/* Achievement Badge */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 rounded-xl shadow-md">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {streakData.currentStreak >= 30 ? 'Legend' : 
                     streakData.currentStreak >= 14 ? 'Champion' : 
                     streakData.currentStreak >= 7 ? 'Achiever' : 
                     streakData.currentStreak >= 3 ? 'Rising Star' : 'Beginner'}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Achievement Rank
                  </div>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="text-right">
              {streakData.todayCount >= 3 ? (
                <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 text-white rounded-xl shadow-md">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Daily Goal Complete</span>
                </div>
              ) : (
                <div className="text-slate-700 dark:text-slate-300">
                  <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{streakData.needToday}</div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">more to reach goal</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 dark:from-blue-600 dark:via-indigo-600 dark:to-violet-600 transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min((streakData.todayCount / 3) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Applied Jobs
            </h1>
            <button
              onClick={() => fetchAppliedJobs()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => setFilterStatus('All')}
              className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                filterStatus === 'All'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="font-semibold">All Jobs</span>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded text-sm font-bold">{statusCounts['All']}</span>
            </button>
            {STATUS_OPTIONS.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setFilterStatus(option.value)}
                  className={`px-4 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                    filterStatus === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{option.value}</span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded text-sm font-bold">{statusCounts[option.value]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <Briefcase className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
              {filterStatus === 'All' ? 'No Jobs Yet' : `No ${filterStatus} Jobs`}
            </h3>
            {filterStatus !== 'All' && (
              <button
                onClick={() => setFilterStatus('All')}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View All Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const statusConfig = getStatusConfig(job.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div
                  key={job.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-300 dark:border-gray-600"
                >
                  <div className="p-6">
                    {/* Job Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 break-words">
                              {job.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              {job.company && (
                                <div className="flex items-center gap-1.5">
                                  <Building2 className="w-4 h-4 flex-shrink-0" />
                                  <span className="font-medium">{job.company}</span>
                                </div>
                              )}
                              {job.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 flex-shrink-0" />
                                  <span>{job.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 flex-shrink-0" />
                                <span>Applied {new Date(job.appliedDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteJob(job.id, job.title)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                        title="Delete job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                        <div className="relative inline-block">
                          <select
                            value={job.status}
                            onChange={(e) => updateJobStatus(job.id, e.target.value)}
                            disabled={updatingJobId === job.id}
                            style={{
                              backgroundImage: 'none',
                            }}
                            className={`${statusConfig.color} pl-3 pr-9 py-2 rounded-lg font-medium text-sm transition-all border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option 
                                key={option.value} 
                                value={option.value}
                                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              >
                                {option.value}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        <span>View Job</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Protected>
  );
}

