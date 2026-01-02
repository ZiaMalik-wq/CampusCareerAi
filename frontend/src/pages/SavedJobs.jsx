import React, { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import { Bookmark, ArrowRight, Loader2 } from "lucide-react";

const SavedJobs = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Security Check
    if (user && user.role !== "student" && user.role !== "STUDENT") {
      navigate("/");
      return;
    }

    const fetchSavedJobs = async () => {
      try {
        const response = await api.get("/jobs/saved");
        setJobs(response.data);
      } catch (err) {
        console.error("Error fetching saved jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchSavedJobs();
  }, [user, navigate]);

  // Callback to remove job from list immediately when unsaved
  const handleRemoveFromList = (jobId) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <Bookmark className="w-8 h-8 text-blue-600 fill-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Saved Jobs
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Opportunities you have bookmarked for later.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-10 h-10 text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No saved jobs yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">
              Browse jobs and click the bookmark icon to save them here.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Browse Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {jobs.map((job) => (
              <div key={job.id} className="h-full">
                <JobCard
                  job={job}
                  onUnsave={handleRemoveFromList} // Pass callback to remove from UI
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
