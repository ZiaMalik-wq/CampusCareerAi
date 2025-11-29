import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/JobCard';
import { AuthContext } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { 
  PlusCircle, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowUpRight
} from 'lucide-react';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Security Check
    if (user && user.role !== 'company' && user.role !== 'COMPANY') {
      navigate('/');
      return;
    }

    const fetchMyJobs = async () => {
      try {
        const response = await api.get('/jobs/my-jobs');
        setJobs(response.data);
      } catch (err) {
        console.error('Error fetching my jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, [user, navigate]);

  const handleToggleStatus = async (jobId, currentStatus) => {
    // Show loading toast
    const loadingToast = toast.loading(currentStatus ? 'Pausing job...' : 'Activating job...');
    
    try {
      // Using PUT endpoint to update job status
      const jobToUpdate = jobs.find(j => j.id === jobId);
      await api.put(`/jobs/${jobId}`, {
        ...jobToUpdate,
        is_active: !currentStatus
      });
      
      // Update local state immediately
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId ? { ...job, is_active: !currentStatus } : job
      ));
      
      // Show success toast
      toast.success(`Job ${!currentStatus ? 'activated' : 'paused'} successfully!`, {
        id: loadingToast,
        duration: 3000,
      });
    } catch (err) {
      console.error('Error toggling status:', err);
      
      // Show error toast
      const errorMsg = err.response?.data?.detail || 'Failed to update job status. Please try again.';
      toast.error(errorMsg, {
        id: loadingToast,
        duration: 4000,
      });
    }
  };

  // Calculate stats
  const activeJobs = jobs.filter(job => job.is_active).length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0);
  const totalViews = jobs.reduce((sum, job) => sum + (job.views_count || 0), 0);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && job.is_active) || 
      (filterStatus === 'inactive' && !job.is_active);
    
    const matchesSearch = searchQuery === '' || 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Action handlers using your actual API endpoints
  const handleViewDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      // Show loading toast
      const loadingToast = toast.loading('Deleting job...');
      
      try {
        await api.delete(`/jobs/${jobId}`);
        
        // Update UI immediately by removing from state
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        
        // Show success toast
        toast.success('Job deleted successfully!', {
          id: loadingToast,
          duration: 3000,
        });
      } catch (err) {
        console.error('Error deleting job:', err);
        
        // Show error toast
        const errorMsg = err.response?.data?.detail || 'Failed to delete job. Please try again.';
        toast.error(errorMsg, {
          id: loadingToast,
          duration: 4000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      {/* Toast Notifications */}
      <Toaster 
        position="top-center"
        toastOptions={{
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
          loading: {
            style: {
              background: '#3b82f6',
              color: '#fff',
            },
          },
        }}
      />
      
      <div className="container mx-auto max-w-7xl">
        
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Company Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage and track your job postings</p>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/post-job')}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 font-bold"
            >
              <PlusCircle className="w-5 h-5" />
              Post New Job
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active Jobs</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{activeJobs}</div>
                  <div className="text-sm text-gray-500 mt-1">of {jobs.length} total</div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Applications</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{totalApplications}</div>
                  <div className="text-sm text-gray-500 mt-1">total received</div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-purple-600" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Views</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{totalViews}</div>
                  <div className="text-sm text-gray-500 mt-1">impressions</div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your job postings..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filterStatus === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({jobs.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  filterStatus === 'active'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                Active ({activeJobs})
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  filterStatus === 'inactive'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <XCircle className="w-4 h-4 text-gray-600" />
                Inactive ({jobs.length - activeJobs})
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-500 mt-6 animate-pulse font-medium">Loading your jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery || filterStatus !== 'all' 
                ? 'No jobs match your filters' 
                : "You haven't posted any jobs yet"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all'
                ? "Try adjusting your search or filter settings."
                : "Start attracting top talent by posting your first job opportunity."}
            </p>
            {(!searchQuery && filterStatus === 'all') && (
              <button 
                onClick={() => navigate('/post-job')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Post Your First Job
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-4 text-gray-600 text-sm font-medium">
              Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <div key={job.id} className="relative group">
                  {/* Job Card Wrapper with Status Badge */}
                  <div className="relative rounded-2xl overflow-hidden">
                    <JobCard job={job} />
                    
                    {/* Status Badge Overlay - Below job type badge, aligned properly */}
                    <div className="absolute top-14 right-6 z-10">
                      {job.is_active ? (
                        <div className="flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-gray-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                          <Clock className="w-3 h-3" />
                          Paused
                        </div>
                      )}
                    </div>
                    
                    {/* Action Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                      <div className="w-full grid grid-cols-2 gap-2 pointer-events-auto">
                        <button
                          onClick={() => handleViewDetails(job.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // For now, we'll use the job details view as edit
                            // You can create a separate edit page later
                            alert(`Edit functionality coming soon!\n\nFor now, you can:\n1. View the job details\n2. Create a new job with updated info\n3. Delete the old one\n\nJob ID: ${job.id}`);
                          }}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(job.id, job.is_active)}
                          className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-semibold transition text-sm ${
                            job.is_active
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {job.is_active ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Below Card */}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 px-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {job.applications_count || 0} applications
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {job.views_count || 0} views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;