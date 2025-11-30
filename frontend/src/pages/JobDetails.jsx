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
  Eye, // Added Eye icon import
} from "lucide-react";
import toast from "react-hot-toast";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        // 1. Fetch the Job Data first
        const response = await api.get(`/jobs/${id}`);
        let jobData = response.data;

        // 2. Track the View (Silently)
        try {
          // This calls your new endpoint: @router.post("/{job_id}/view")
          const viewResponse = await api.post(`/jobs/${id}/view`);
          if (viewResponse.data.views !== undefined) {
            jobData = { ...jobData, views_count: viewResponse.data.views };
          }
        } catch (viewError) {
          console.log(
            "View tracking skipped:",
            viewError.response?.data?.message || viewError.message
          );
        }

        // 3. Set state with the final data
        setJob(jobData);
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Job not found or has been removed.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchJobDetails();
  }, [id]);

  const handleApply = () => {
    if (!user) {
      toast.error("Please login to apply!");
      navigate("/login");
      return;
    }
    toast.success("Application feature coming in Week 4!");
  };

  const isCompany = user?.role === "company" || user?.role === "COMPANY";

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => navigate("/jobs")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Back to Jobs
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1 font-medium text-blue-700">
                    <Building className="w-4 h-4" />
                    {job.company_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </span>

                  {/* ADDED: View Count Display */}
                  <span
                    className="flex items-center gap-1 text-gray-500"
                    title="Total Views"
                  >
                    <Eye className="w-4 h-4" />
                    {job.views_count || 0} views
                  </span>
                </div>
              </div>

              {/* DYNAMIC ACTION BUTTONS */}
              <div className="flex gap-3 mt-4 md:mt-0">
                {isCompany ? (
                  <>
                    <button
                      onClick={() => navigate(`/jobs/${id}/edit`)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition shadow-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Job
                    </button>
                    <button
                      onClick={() =>
                        toast.success("Applicants page coming in Day 24!")
                      }
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
                    >
                      <Users className="w-4 h-4" />
                      View Applicants
                    </button>
                  </>
                ) : (
                  // --- STUDENT VIEW ---
                  <button
                    onClick={handleApply}
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition transform active:scale-95"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Job Description
                </h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </div>
              </section>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl h-fit border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Job Overview
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Salary
                  </label>
                  <p className="flex items-center gap-2 text-gray-800 font-medium mt-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    {job.salary_range || "Not disclosed"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Job Type
                  </label>
                  <p className="flex items-center gap-2 text-gray-800 font-medium mt-1">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                    {job.job_type}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Max Seats
                  </label>
                  <p className="text-gray-800 font-medium mt-1">
                    {job.max_seats || 1} Opening(s)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
