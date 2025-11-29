import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Users, 
  FileText, 
  Clock,
  Sparkles,
  ArrowRight,
  Building2,
  CheckCircle2
} from 'lucide-react';

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    salary_range: '',
    job_type: 'Full-time',
    max_seats: 1
  });

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Show loading toast
    const loadingToast = toast.loading('Creating your job posting...');

    try {
      const response = await api.post('/jobs/create', jobData);
      
      console.log('Job Posted:', response.data);
      
      // Show success toast with custom styling
      toast.success('Job posted successfully! 🎉', {
        id: loadingToast,
        duration: 3000,
        icon: '✅',
      });
      
      // Navigate to company dashboard to see the new job
      setTimeout(() => {
        navigate('/my-jobs');
      }, 1500);

    } catch (error) {
      console.error('Post Job Error:', error);
      
      // Show error toast
      if (error.response?.status === 403) {
        toast.error('Only Companies can post jobs!', {
          id: loadingToast,
          duration: 4000,
        });
      } else {
        const errorMsg = error.response?.data?.detail || 'Failed to post job. Please try again.';
        toast.error(errorMsg, {
          id: loadingToast,
          duration: 4000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Character count for description
  const descriptionLength = jobData.description.length;
  const minDescriptionLength = 50;

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
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative container mx-auto max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Post a New Opportunity</h1>
          <p className="text-gray-600">Attract top talent with a detailed job posting</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Job Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="title"
                value={jobData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition text-gray-700"
                placeholder="e.g. Senior React Developer"
              />
            </div>

            {/* Job Type & Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select 
                  name="job_type"
                  value={jobData.job_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition appearance-none bg-white cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Salary Range
                </label>
                <input 
                  type="text" 
                  name="salary_range"
                  value={jobData.salary_range}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  placeholder="e.g. 80k - 120k PKR"
                />
              </div>
            </div>

            {/* Location & Seats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Location <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                  placeholder="e.g. Remote, Lahore, or Hybrid"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-600" />
                  Open Positions
                </label>
                <input 
                  type="number" 
                  name="max_seats"
                  value={jobData.max_seats}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="description"
                value={jobData.description}
                onChange={handleChange}
                required
                rows="8"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition resize-none"
                placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
              ></textarea>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className={`${
                  descriptionLength < minDescriptionLength 
                    ? 'text-orange-600' 
                    : 'text-green-600'
                }`}>
                  {descriptionLength < minDescriptionLength 
                    ? `Write at least ${minDescriptionLength - descriptionLength} more characters for a good description` 
                    : '✓ Good description length'}
                </span>
                <span className="text-gray-500">{descriptionLength} characters</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">AI-Powered Matching</h4>
                <p className="text-sm text-blue-700">
                  Your job will be analyzed by our AI to match with the most qualified candidates based on skills, experience, and compatibility.
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="button"
                onClick={() => navigate('/my-jobs')}
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || descriptionLength < minDescriptionLength}
                className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading || descriptionLength < minDescriptionLength
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Creating Job...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Post Job</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Preview Badge */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Building2 className="w-4 h-4" />
              <span>Job will be visible to all students immediately after posting</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;