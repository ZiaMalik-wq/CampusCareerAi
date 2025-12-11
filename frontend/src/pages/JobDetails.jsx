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
import toast, { Toaster } from "react-hot-toast";

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
      toast.error("Please login to apply!");
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
      });

      // Optional: Redirect to My Applications page
      setTimeout(() => navigate("/my-applications"), 1000);
    } catch (error) {
      console.error("Apply Error:", error);
      const errorMsg = error.response?.data?.detail || "Failed to apply.";
      toast.error(errorMsg, { id: loadingToast });
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
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-500 mt-6 animate-pulse font-medium">
          Loading job details...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate("/jobs")}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Back to Jobs
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <Toaster position="top-center" />

      <div className="container mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition font-semibold group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-purple-50/30 to-white">
            <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-6">
              <div className="flex-grow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          job.job_type === "Internship"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {job.job_type}
                      </span>

                      {/* FILLED BADGE */}
                      {isFilled && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <Lock className="w-3 h-3" /> Positions Filled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 ml-14">
                  <span className="flex items-center gap-2 font-semibold text-blue-700">
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
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition shadow-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Job
                    </button>
                    <button
                      onClick={() => navigate(`/jobs/${id}/applicants`)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <Users className="w-5 h-5" />
                      View Applicants
                    </button>
                  </>
                )}

                {/* CASE 2: Student or Guest */}
                {(isStudent || !user) &&
                  (hasApplied ? (
                    // APPLIED STATE
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 cursor-default"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Applied
                    </button>
                  ) : isFilled ? (
                    // FILLED STATE
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl border border-gray-200 cursor-not-allowed"
                    >
                      <Lock className="w-5 h-5" />
                      Positions Filled
                    </button>
                  ) : (
                    // NORMAL APPLY STATE
                    <button
                      onClick={handleApply}
                      className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <Sparkles className="w-5 h-5" />
                      Apply Now
                    </button>
                  ))}

                {/* CASE 3: Other Company */}
                {isCompany && !isOwner && (
                  <div className="px-6 py-3 bg-gray-100 text-gray-500 font-medium rounded-xl border border-gray-200 text-center cursor-default">
                    View Only
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Description */}
            <div className="lg:col-span-2 space-y-6">
              <section>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  Job Description
                </h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {job.description}
                </div>
              </section>

              {job.company_location && (
                <section className="pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    About the Company
                  </h3>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-gray-700">
                      <span className="font-semibold">{job.company_name}</span>{" "}
                      is located in {job.company_location}
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Right Column - Job Overview */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-2xl border border-gray-200 sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Job Overview
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <DollarSign className="w-3 h-3" />
                      Salary Range
                    </label>
                    <p className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                      {job.salary_range || "Not disclosed"}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <Briefcase className="w-3 h-3" />
                      Employment Type
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {job.job_type}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <Users className="w-3 h-3" />
                      Openings
                    </label>
                    <p
                      className={`font-semibold ${
                        isFilled ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {isFilled
                        ? "0 (Filled)"
                        : `${job.max_seats} Position${
                            job.max_seats > 1 ? "s" : ""
                          }`}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <Calendar className="w-3 h-3" />
                      Application Deadline
                    </label>
                    <p
                      className={`font-semibold ${
                        job.deadline ? "text-orange-600" : "text-green-600"
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

                  <div className="pt-4 border-t border-gray-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                      <Eye className="w-3 h-3" />
                      Views
                    </label>
                    <p className="text-gray-900 font-semibold">
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
                      className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 cursor-default"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Applied
                    </button>
                  ) : isFilled ? (
                    <button
                      disabled
                      className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl border border-gray-200 cursor-not-allowed"
                    >
                      <Lock className="w-5 h-5" />
                      Positions Filled
                    </button>
                  ) : (
                    <button
                      onClick={handleApply}
                      className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
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
