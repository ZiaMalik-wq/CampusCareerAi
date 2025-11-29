import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const EditJob = () => {
  const { id } = useParams(); // Get Job ID from URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State matching the JobUpdate Schema
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    location: '',
    salary_range: '',
    job_type: 'Full-time',
    max_seats: 1,
    is_active: true
  });

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/jobs/${id}`);
        const data = response.data;
        
        // Populate form with existing data
        setJobData({
          title: data.title,
          description: data.description,
          location: data.location,
          salary_range: data.salary_range || '',
          job_type: data.job_type,
          max_seats: data.max_seats || 1,
          is_active: data.is_active
        });

        // Security check (Frontend side)
        // Note: Backend also checks this, but good to redirect early if not owner
        // (Assuming data.company_name matches user's company or similar logic, 
        //  but strict check happens on backend submission)
        
      } catch (err) {
        console.error('Error fetching job:', err);
        toast.error('Could not load job details.');
        navigate('/my-jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, navigate]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setJobData({ ...jobData, [e.target.name]: value });
  };

  // 2. Submit Updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // API call: PUT /jobs/{id}
      await api.put(`/jobs/${id}`, jobData);
      
      toast.success('Job updated successfully!');
      
      // Navigate back to details page
      setTimeout(() => {
        navigate(`/jobs/${id}`);
      }, 1000);

    } catch (error) {
      console.error('Update Error:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to update job.';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-10">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Edit Job: {jobData.title}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Job Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
            <input 
              type="text" 
              name="title"
              value={jobData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Job Type & Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type</label>
              <select 
                name="job_type"
                value={jobData.job_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Range</label>
              <input 
                type="text" 
                name="salary_range"
                value={jobData.salary_range}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Location & Seats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input 
                type="text" 
                name="location"
                value={jobData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Seats</label>
              <input 
                type="number" 
                name="max_seats"
                value={jobData.max_seats}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
             <input 
                type="checkbox"
                name="is_active"
                checked={jobData.is_active}
                onChange={handleChange}
                id="is_active"
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
             />
             <label htmlFor="is_active" className="text-gray-700 font-medium">
               Job is Active (Visible to students)
             </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
            <textarea 
              name="description"
              value={jobData.description}
              onChange={handleChange}
              required
              rows="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
             <button 
                type="button"
                onClick={() => navigate(-1)}
                className="w-1/3 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
             >
               Cancel
             </button>
             <button 
                type="submit"
                disabled={saving}
                className={`w-2/3 text-white py-3 rounded-lg transition font-bold text-lg ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
             >
                {saving ? 'Saving...' : 'Save Changes'}
             </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default EditJob;