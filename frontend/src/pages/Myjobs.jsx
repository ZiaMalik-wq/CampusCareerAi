import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import JobCard from "../components/JobCard";
import { AuthContext } from "../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  PlusCircle,
  Briefcase,
  TrendingUp,
  Users,
  Eye,
  Edit3,
  Trash2,
  Search,
  Clock, // Required for the status badge
  BarChart2, // For analytics button
} from "lucide-react";

const MY_JOBS_CACHE_TTL_MS = 60_000;
let myJobsCache = {
  userKey: null,
  fetchedAt: 0,
  jobs: null,
};

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // all, active, inactive
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  const userKey = user?.id || user?.email || "anonymous";

  useEffect(() => {
    if (!user) {
      setLoading(true);
      return;
    }

    // Security Check
    if (user.role !== "company" && user.role !== "COMPANY") {
      navigate("/");
      return;
    }

    const now = Date.now();
    const cacheIsValid =
      myJobsCache.jobs &&
      myJobsCache.userKey === userKey &&
      now - myJobsCache.fetchedAt < MY_JOBS_CACHE_TTL_MS;

    if (cacheIsValid) {
      setJobs(myJobsCache.jobs);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const fetchMyJobs = async () => {
      try {
        const response = await api.get("/jobs/my-jobs", {
          signal: controller.signal,
        });
        const nextJobs = response.data || [];
        setJobs(nextJobs);
        myJobsCache = {
          userKey,
          fetchedAt: Date.now(),
          jobs: nextJobs,
        };
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          return;
        }
        console.error("Error fetching my jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();

    return () => {
      controller.abort();
    };
  }, [user, userKey, navigate]);

  const handleToggleStatus = async (jobId, currentStatus) => {
    const loadingToast = toast.loading(
      currentStatus ? "Pausing job..." : "Activating job..."
    );

    try {
      const jobToUpdate = jobs.find((j) => j.id === jobId);
      await api.put(`/jobs/${jobId}`, {
        ...jobToUpdate,
        is_active: !currentStatus,
      });

      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.id !== jobId) return job;
          const updated = { ...job, is_active: !currentStatus };
          if (myJobsCache.jobs) {
            myJobsCache = {
              ...myJobsCache,
              jobs: myJobsCache.jobs.map((j) => (j.id === jobId ? updated : j)),
            };
          }
          return updated;
        })
      );

      toast.success(
        `Job ${!currentStatus ? "activated" : "paused"} successfully!`,
        {
          id: loadingToast,
          duration: 3000,
        }
      );
    } catch (err) {
      console.error("Error toggling status:", err);
      const errorMsg =
        err.response?.data?.detail ||
        "Failed to update job status. Please try again.";
      toast.error(errorMsg, {
        id: loadingToast,
        duration: 4000,
      });
    }
  };

  const handleDelete = async (jobId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job posting? This action cannot be undone."
      )
    )
      return;

    setDeletingId(jobId);
    const loadingToastId = toast.loading("Deleting job...");

    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      if (myJobsCache.jobs) {
        myJobsCache = {
          ...myJobsCache,
          jobs: myJobsCache.jobs.filter((job) => job.id !== jobId),
        };
      }
      toast.dismiss(loadingToastId);
      toast.success("Job deleted successfully!", { duration: 3000 });
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.dismiss(loadingToastId);
      const errorMsg =
        err?.response?.data?.detail ||
        "Failed to delete job. Please try again.";
      toast.error(errorMsg, { duration: 4000 });
    } finally {
      setDeletingId(null);
    }
  };

  // Action handlers
  const handleViewApplicants = (jobId) => {
    navigate(`/jobs/${jobId}/applicants`);
  };

  // Calculate stats
  const activeJobs = jobs.filter((job) => job.is_active).length;
  const totalApplications = jobs.reduce(
    (sum, job) => sum + (job.applications_count || 0),
    0
  );
  const totalViews = jobs.reduce((sum, job) => sum + (job.views_count || 0), 0);
  const recentApplications = jobs.reduce(
    (sum, job) => sum + (job.recent_applications_count || 0),
    0
  );

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && job.is_active) ||
      (filterStatus === "inactive" && !job.is_active);

    const matchesSearch =
      searchQuery === "" ||
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-6 px-4">
      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          success: {
            style: { background: "#10b981", color: "#fff" },
            iconTheme: { primary: "#fff", secondary: "#10b981" },
          },
          error: {
            style: { background: "#ef4444", color: "#fff" },
            iconTheme: { primary: "#fff", secondary: "#ef4444" },
          },
          loading: {
            style: { background: "#3b82f6", color: "#fff" },
          },
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Company Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track your job postings
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/post-job")}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 font-bold"
            >
              <PlusCircle className="w-5 h-5" />
              Post New Job
            </button>
          </div>

          {/* Quick Stats Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 shadow-xl mb-8 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Quick Overview
                  </h2>
                  <p className="text-blue-100 text-sm">
                    Your recruitment metrics at a glance
                  </p>
                </div>
                <button
                  onClick={() => navigate("/analytics")}
                  className="flex items-center gap-2 px-5 py-3 bg-white/20 border border-white/30 rounded-xl hover:bg-white/30 transition text-sm font-semibold"
                >
                  <BarChart2 className="w-5 h-5" />
                  <span>View Full Analytics</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Active Jobs
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-4xl font-bold text-white">
                      {activeJobs}
                    </div>
                    <div className="text-sm text-white/70">
                      of {jobs.length} total
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Applications
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {totalApplications}
                  </div>
                  <div className="text-sm text-white/70 mt-1">
                    total received
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Total Views
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-4xl font-bold text-white">
                        {totalViews}
                      </div>
                      <div className="text-sm text-white/70">impressions</div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                      Last 7 Days
                    </span>
                  </div>
                  <div className="text-4xl font-bold text-white">
                    {recentApplications}
                  </div>
                  <div className="text-sm text-white/70 mt-1">
                    new applications
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your job postings..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition bg-white"
              />
            </div>

            <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
              {["all", "active", "inactive"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                    filterStatus === status
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
            <p className="text-gray-500 mt-6 animate-pulse font-medium">
              Loading your jobs...
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchQuery || filterStatus !== "all"
                ? "No jobs match your filters"
                : "You haven't posted any jobs yet"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filter settings."
                : "Start attracting top talent by posting your first job opportunity."}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <button
                onClick={() => navigate("/post-job")}
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
              Showing {filteredJobs.length}{" "}
              {filteredJobs.length === 1 ? "job" : "jobs"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {filteredJobs.map((job) => (
                // Added h-full to ensure card takes full height of grid row
                <div key={job.id} className="h-full">
                  <JobCard job={job} isActive={job.is_active}>
                    {/* Custom footer content for Company Dashboard */}
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 mt-2">
                      {/* 1. View Applicants (Primary Action) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleViewApplicants(job.id);
                        }}
                        className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition text-sm"
                      >
                        <Users className="w-4 h-4" />
                        View Applicants ({job.applications_count || 0})
                      </button>

                      {/* 2. Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/jobs/${job.id}/edit`);
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>

                      {/* 3. Pause/Activate Toggle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(job.id, job.is_active);
                        }}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition text-sm font-medium border ${
                          job.is_active
                            ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                            : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        }`}
                      >
                        {job.is_active ? "Pause" : "Activate"}
                      </button>

                      {/* 4. Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(job.id);
                        }}
                        disabled={deletingId === job.id}
                        className="col-span-2 flex items-center justify-center gap-2 px-3 py-2.5 text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition text-sm font-medium mt-1"
                      >
                        {deletingId === job.id ? (
                          "Deleting..."
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" /> Delete Job
                          </>
                        )}
                      </button>
                    </div>
                  </JobCard>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyJobs;
