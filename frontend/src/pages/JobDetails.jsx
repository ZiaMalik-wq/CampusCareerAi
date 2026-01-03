import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  Briefcase,
  ArrowLeft,
  Users,
  Edit,
  Eye,
  Sparkles,
  CheckCircle,
  Calendar,
  Lock, // Added Lock icon
} from "lucide-react";
import toast from "react-hot-toast";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // 1. Fetch Job Details
        const response = await api.get(`/jobs/${id}`);
        let jobData = response.data;

        // 2. View Tracking Logic
        try {
          const viewResponse = await api.post(`/jobs/${id}/view`);
          if (viewResponse.data.views !== undefined) {
            jobData = { ...jobData, views_count: viewResponse.data.views };
          }
        } catch (viewError) {
          console.log("View tracking skipped.");
        }

        setJob(jobData);

        // 3. Check if student has already applied
        if (user && (user.role === "student" || user.role === "STUDENT")) {
          try {
            const appsResponse = await api.get("/applications/me");
            const alreadyApplied = appsResponse.data.some(
              (app) => app.job_id === Number(id)
            );
            setHasApplied(alreadyApplied);
          } catch (appErr) {
            console.error("Failed to check application status:", appErr);
          }
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Job not found or has been removed.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJobDetails();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      toast.error("Please login to apply!", { duration: 3000 });
      navigate("/login");
      return;
    }

    const confirmApply = window.confirm(
      `Apply to ${job.title} at ${job.company_name}?`
    );
    if (!confirmApply) return;

    const loadingToast = toast.loading("Submitting application...");

    try {
      await api.post(`/applications/${id}`);

      toast.success("Application submitted successfully!", {
        id: loadingToast,
        duration: 3000,
      });

      // Optional: Redirect to My Applications page
      setTimeout(() => navigate("/my-applications"), 1000);
    } catch (error) {
      console.error("Apply Error:", error);
      const errorMsg = error.response?.data?.detail || "Failed to apply.";
      toast.error(errorMsg, { id: loadingToast, duration: 4000 });
    }
  };

  const isStudent = user?.role === "student" || user?.role === "STUDENT";
  const isCompany = user?.role === "company" || user?.role === "COMPANY";
  const isOwner = isCompany && user?.company_profile?.id === job?.company_id;

  // Logic to check if job is full
  const isFilled = job?.max_seats <= 0;

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[80vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 dark:border-blue-900/50 border-t-blue-600 dark:border-t-blue-400"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-6 animate-pulse font-medium">
          Loading job details...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Building className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Oops!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => navigate("/jobs")}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
          Back to Jobs
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 md:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-all duration-200 font-semibold group bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-shadow duration-500 overflow-hidden border border-gray-200 dark:border-gray-700/50">
          {/* Header Section */}
          <div className="p-6 md:p-8 border-b border-gray-200 dark:border-gray-700/60 bg-gradient-to-br from-blue-50/80 via-purple-50/40 to-white dark:from-gray-800/80 dark:via-gray-850/60 dark:to-gray-800/80 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6">
              <div className="flex-grow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl shadow-lg shadow-blue-500/30 dark:shadow-blue-500/20">
                    <Briefcase className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${
                          job.job_type === "Internship"
                            ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50"
                            : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/50"
                        }`}
                      >
                        {job.job_type}
                      </span>

                      {/* FILLED BADGE */}
                      {isFilled && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 shadow-sm">
                          <Lock className="w-3 h-3" /> Positions Filled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-600 dark:text-gray-400 ml-0 md:ml-14 mt-2">
                  <span className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400">
                    <Building className="w-4 h-4" />
                    {job.company_name}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  <span
                    className="flex items-center gap-2 text-gray-500"
                    title="Total Views"
                  >
                    <Eye className="w-4 h-4" />
                    {job.views_count || 0} views
                  </span>
                </div>
              </div>

              {/* DYNAMIC ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 lg:mt-0 mt-4">
                {/* CASE 1: Owner Company */}
                {isOwner && (
                  <>
                    <button
                      onClick={() => navigate(`/edit-job/${id}`)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Job
                    </button>
                    <button
                      onClick={() => navigate(`/jobs/${id}/applicants`)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 dark:hover:shadow-purple-500/30 hover:-translate-y-0.5 transition-all duration-300 transform"
                    >
                      <Users className="w-5 h-5" />
                      View Applicants
                    </button>
                  </>
                )}

                {/* CASE 2: Student or Guest */}
                {(isStudent || !user) && (
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* NEW AI PREP BUTTON */}
                    {isStudent && (
                      <button
                        onClick={() => navigate(`/jobs/${id}/interview-prep`)}
                        className="flex items-center justify-center gap-2 px-6 py-4 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-200 dark:border-purple-800/50 font-bold rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700/60 transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-purple-500/20"
                      >
                        <Sparkles className="w-5 h-5" />
                        AI Interview Prep
                      </button>
                    )}

                    {/* EXISTING LOGIC FOR APPLY BUTTON */}
                    {hasApplied ? (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 cursor-default"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Applied
                      </button>
                    ) : isFilled ? (
                      <button
                        disabled
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl border border-gray-200 cursor-not-allowed"
                      >
                        <Lock className="w-5 h-5" />
                        Positions Filled
                      </button>
                    ) : (
                      <button
                        onClick={handleApply}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 dark:hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 transform"
                      >
                        <Sparkles className="w-5 h-5" />
                        Apply Now
                      </button>
                    )}
                  </div>
                )}

                {/* CASE 3: Other Company */}
                {isCompany && !isOwner && (
                  <div className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium rounded-xl border border-gray-200 dark:border-gray-600 text-center cursor-default shadow-sm">
                    View Only
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Description */}
            <div className="lg:col-span-2 space-y-6">
              <section>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <div className="w-1.5 h-7 bg-gradient-to-b from-blue-600 via-purple-600 to-pink-600 rounded-full shadow-sm"></div>
                  Job Description
                </h3>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base bg-gradient-to-br from-gray-50/50 to-transparent dark:from-gray-900/20 dark:to-transparent p-5 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  {job.description}
                </div>
              </section>

              {job.company_location && (
                <section className="pt-6 border-t border-gray-200 dark:border-gray-700/60">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    About the Company
                  </h3>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50/30 dark:from-blue-900/30 dark:to-purple-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800/50 shadow-sm">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      <span className="font-semibold text-blue-700 dark:text-blue-300">
                        {job.company_name}
                      </span>{" "}
                      is located in{" "}
                      <span className="font-medium">
                        {job.company_location}
                      </span>
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Job Overview */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50/80 via-blue-50/40 to-purple-50/30 dark:from-gray-700/80 dark:via-gray-750 dark:to-gray-800/80 p-6 rounded-2xl border border-gray-200 dark:border-gray-600/60 sticky top-4 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  Job Overview
                </h3>
                <div className="space-y-4">
                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      Salary Range
                    </label>
                    <p className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold text-lg">
                      {job.salary_range || "Not disclosed"}
                    </p>
                  </div>

                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Briefcase className="w-3.5 h-3.5" />
                      Employment Type
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-base">
                      {job.job_type}
                    </p>
                  </div>

                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5" />
                      Openings
                    </label>
                    <p
                      className={`font-semibold ${
                        isFilled
                          ? "text-red-600"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {isFilled
                        ? "0 (Filled)"
                        : `${job.max_seats} Position${
                            job.max_seats > 1 ? "s" : ""
                          }`}
                    </p>
                  </div>

                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Application Deadline
                    </label>
                    <p
                      className={`font-semibold text-base ${
                        job.deadline
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Open until filled"}
                    </p>
                  </div>

                  <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Eye className="w-3.5 h-3.5" />
                      Views
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-base">
                      {job.views_count || 0} view
                      {job.views_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Sidebar Apply CTA */}
                {(isStudent || !user) &&
                  (hasApplied ? (
                    <button
                      disabled
                      className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold rounded-xl border border-green-200 dark:border-green-800/50 cursor-default shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Applied
                    </button>
                  ) : isFilled ? (
                    <button
                      disabled
                      className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded-xl border border-gray-200 dark:border-gray-600 cursor-not-allowed shadow-sm"
                    >
                      <Lock className="w-5 h-5" />
                      Positions Filled
                    </button>
                  ) : (
                    <button
                      onClick={handleApply}
                      className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/50 dark:hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 transform"
                    >
                      <Sparkles className="w-5 h-5" />
                      Apply Now
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
