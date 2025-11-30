import React, { useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
  User,
  Upload,
  FileText,
  Save,
  CheckCircle,
  Eye,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  Users,
  Sparkles
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Determine user role
  const isCompany = user?.role === 'company' || user?.role === 'COMPANY';
  const isStudent = user?.role === 'student' || user?.role === 'STUDENT';

  // Student Profile State
  const [studentData, setStudentData] = useState({
    full_name: "",
    university: "",
    cgpa: "",
    city: "",
    skills: "",
  });

  // Company Profile State - Updated to match your actual schema
  const [companyData, setCompanyData] = useState({
    company_name: "",
    location: "",
    website: "",
  });

  // Resume State (Students only)
  const [resumeFile, setResumeFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (isStudent) {
        await loadStudentProfile();
      } else if (isCompany) {
        await loadCompanyProfile();
      }
    };

    loadProfileData();
  }, [user, isStudent, isCompany]);

  // Load Student Profile
  const loadStudentProfile = async () => {
    const cachedData = localStorage.getItem("student_profile_cache");

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setStudentData(parsed);
      if (parsed.resume_url || parsed.resume_filename) {
        setExistingResume(parsed.resume_url || parsed.resume_filename);
      }
    } else {
      if (user) {
        setStudentData((prev) => ({ ...prev, full_name: user.full_name || "" }));
      }
      setLoading(true);
    }

    try {
      const response = await api.get("/students/profile");
      const profileData = response.data;
      
      if (Array.isArray(profileData.skills)) {
        profileData.skills = profileData.skills.join(", ");
      }

      setStudentData(profileData);
      const resumeInfo = profileData.resume_url || profileData.resume_filename || null;
      setExistingResume(resumeInfo);

      localStorage.setItem("student_profile_cache", JSON.stringify(profileData));
    } catch (error) {
      console.log("Student profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load Company Profile
  const loadCompanyProfile = async () => {
    const cachedData = localStorage.getItem("company_profile_cache");

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      setCompanyData(parsed);
    } else {
      if (user) {
        setCompanyData((prev) => ({ 
          ...prev, 
          company_name: user.full_name || user.company_name || "" 
        }));
      }
      setLoading(true);
    }

    try {
      const response = await api.get("/companies/profile");
      const profileData = response.data;
      
      setCompanyData(profileData);
      localStorage.setItem("company_profile_cache", JSON.stringify(profileData));
    } catch (error) {
      console.log("Company profile fetch error:", error);
      // If endpoint doesn't exist, use user data
      if (user) {
        const fallbackData = {
          company_name: user.full_name || "",
          location: "",
          website: "",
        };
        setCompanyData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Student Form Changes
  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  // Handle Company Form Changes
  const handleCompanyChange = (e) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  };

  // Update Student Profile
  const handleStudentUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading('Updating profile...');

    const payload = {
      ...studentData,
      cgpa: studentData.cgpa ? parseFloat(studentData.cgpa) : null,
    };

    try {
      await api.put("/students/profile", payload);
      toast.success("Profile updated successfully!", { id: loadingToast });
      localStorage.setItem("student_profile_cache", JSON.stringify(payload));
    } catch (error) {
      console.error("Update Error:", error);
      const errorMsg = error.response?.data?.detail || "Failed to update profile.";
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  // Update Company Profile
  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading('Updating company profile...');

    try {
      await api.put("/companies/profile", companyData);
      toast.success("Company profile updated successfully!", { id: loadingToast });
      localStorage.setItem("company_profile_cache", JSON.stringify(companyData));
    } catch (error) {
      console.error("Update Error:", error);
      const errorMsg = error.response?.data?.detail || "Failed to update profile.";
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  // Handle Resume Upload (Students only)
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setResumeLoading(true);
    const loadingToast = toast.loading('Uploading and analyzing resume...');

    const data = new FormData();
    data.append("file", file);

    try {
      const response = await api.post("/students/resume", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Resume uploaded & analyzed! 🎉", { id: loadingToast });

      setResumeFile(file);
      if (response.data.resume_url) {
        setExistingResume(response.data.resume_url);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      const errorMsg = error.response?.data?.detail || "Failed to upload resume.";
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setResumeLoading(false);
    }
  };

  const getResumeName = () => {
    if (resumeFile) return resumeFile.name;
    if (existingResume) {
      return existingResume.split("/").pop() || "Current Resume.pdf";
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <Toaster position="top-center" />

      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              {isCompany ? (
                <Building2 className="w-8 h-8 text-white" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {isCompany ? "Company Profile" : "My Profile"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isCompany 
                  ? "Manage your company information and job postings" 
                  : "Update your details and upload your resume"}
              </p>
            </div>
          </div>
        </div>

        {/* Student Profile */}
        {isStudent && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Profile Form */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Personal Details</h2>
              </div>

              <form onSubmit={handleStudentUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={studentData.full_name || ""}
                    onChange={handleStudentChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      University / College
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={studentData.university || ""}
                      onChange={handleStudentChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g. MIT"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={studentData.city || ""}
                      onChange={handleStudentChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g. New York"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="cgpa"
                      value={studentData.cgpa || ""}
                      onChange={handleStudentChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="3.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Skills
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={studentData.skills || ""}
                      onChange={handleStudentChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      placeholder="e.g. Python, React, SQL (Comma separated)"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* RIGHT: Resume Upload */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 h-fit">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <FileText className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Resume / CV</h2>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Upload your resume in PDF format. Our AI will analyze it to recommend the best jobs for you.
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 hover:border-blue-300 transition cursor-pointer relative mb-6">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleResumeUpload}
                  disabled={resumeLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {resumeLoading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-100 border-t-purple-600 mb-3"></div>
                    <span className="text-purple-600 font-semibold">Analyzing PDF...</span>
                    <span className="text-xs text-gray-500 mt-1">This may take a moment</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-gray-700 font-semibold text-lg">
                      {existingResume ? "Upload New Resume" : "Click to Upload PDF"}
                    </span>
                    <span className="text-sm text-gray-500 mt-2">PDF files only • Max 5MB</span>
                  </div>
                )}
              </div>

              {(existingResume || resumeFile) && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                        {resumeFile ? "✓ New Upload" : "Current Resume"}
                      </p>
                      <p className="text-sm text-gray-800 truncate font-medium max-w-[150px]" title={getResumeName()}>
                        {getResumeName()}
                      </p>
                    </div>
                  </div>

                  {existingResume && !resumeFile && (
                    <a
                      href={existingResume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-full transition"
                      title="View Resume"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                  )}

                  {resumeFile && <CheckCircle className="w-6 h-6 text-green-600" />}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Profile */}
        {isCompany && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-200">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Company Information</h2>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Company Profile</h4>
                <p className="text-sm text-blue-700">
                  Keep your company information up to date to attract the best talent. This information will be visible to all students.
                </p>
              </div>
            </div>

            <form onSubmit={handleCompanyUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={companyData.company_name || ""}
                  onChange={handleCompanyChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="e.g. Tech Solutions Inc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={companyData.location || ""}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="e.g. Islamabad, Blue Area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={companyData.website || ""}
                    onChange={handleCompanyChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="https://yourcompany.com"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 flex items-start gap-2">
                <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Location and website are optional but recommended for better visibility</span>
              </p>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Company Profile
                    </>
                  )}
                </button>
              </div>

              {/* Quick Stats */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Quick Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {/* You can add actual counts here */}
                      --
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Active Job Posts</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {/* You can add actual counts here */}
                      --
                    </div>
                    <div className="text-xs text-gray-600 font-medium">Total Applications</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;