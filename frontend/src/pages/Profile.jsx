import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Upload, FileText, Save, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    full_name: '',
    university: '',
    cgpa: '',
    city: '',
    skills: ''
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  useEffect(() => {
    const loadProfileData = async () => {
      // 1. Try to load from Local Storage (Instant Display)
      const cachedData = localStorage.getItem('student_profile_cache');
      
      if (cachedData) {
        setFormData(JSON.parse(cachedData));
        // We have cache, so we don't set 'loading' to true. The UI shows immediately.
      } else {
        // No cache? Fallback to basic user info while we wait
        if (user) {
          setFormData(prev => ({ ...prev, full_name: user.full_name || '' }));
        }
        setLoading(true); // Only show spinner if we have NO data at all
      }

      // 2. Fetch Fresh Data from API (Background Update)
      try {
        const response = await api.get('/students/profile'); 
        
        // Update State
        setFormData(response.data);
        
        // Update Cache for next time
        localStorage.setItem('student_profile_cache', JSON.stringify(response.data));
        
      } catch (error) {
        console.log("Using cached data or backend GET endpoint missing.");
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null
    };

    try {
      const response = await api.put('/students/profile', payload);
      
      toast.success('Profile updated successfully!');
      
      // Update the Cache immediately with the new data
      // This ensures if you refresh, you see the NEW data instantly
      localStorage.setItem('student_profile_cache', JSON.stringify(payload));
      
    } catch (error) {
      console.error('Update Error:', error);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    setResumeFile(file);
    setResumeLoading(true);

    const data = new FormData();
    data.append('file', file);

    try {
      const response = await api.post('/students/resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Resume uploaded & analyzed!');
      setCurrentResume(file.name);
      
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error('Failed to upload resume.');
    } finally {
      setResumeLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Student Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Profile Form */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <User className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Personal Details</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* University & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">University / College</label>
                  <input 
                    type="text" 
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. MIT"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. New York"
                  />
                </div>
              </div>

              {/* CGPA & Skills */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CGPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    name="cgpa"
                    value={formData.cgpa}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="3.5"
                  />
                </div>
                <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
                   <input 
                    type="text" 
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Python, React, SQL (Comma separated)"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
              >
                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Resume Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-fit">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <FileText className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Resume / CV</h2>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Upload your resume in PDF format. Our AI will analyze it to recommend the best jobs for you.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleResumeUpload}
                disabled={resumeLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {resumeLoading ? (
                 <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
                    <span className="text-purple-600 font-medium text-sm">Analyzing PDF...</span>
                 </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-gray-700 font-medium">Click to Upload PDF</span>
                  <span className="text-xs text-gray-400 mt-1">Max 5MB</span>
                </div>
              )}
            </div>

            {/* Status Indicator */}
            {(currentResume || resumeFile) && (
              <div className="mt-6 flex items-center gap-3 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <div className="text-sm overflow-hidden">
                   <p className="font-bold">Resume Uploaded</p>
                   <p className="truncate text-xs opacity-80">{resumeFile ? resumeFile.name : "Current Resume"}</p>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;