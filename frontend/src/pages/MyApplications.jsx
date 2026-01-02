import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import {
  Building,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Users, // Added Users icon for Interview
} from "lucide-react";

const MyApplications = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Security Check
    if (user && user.role !== "student" && user.role !== "STUDENT") {
      navigate("/");
      return;
    }

    const fetchApplications = async () => {
      try {
        const response = await api.get("/applications/me");
        setApplications(response.data);
      } catch (err) {
        console.error("Error fetching applications:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchApplications();
  }, [user, navigate]);

  // Helper for Status Styling
  const getStatusBadge = (status) => {
    const s = status.toUpperCase();
    switch (s) {
      case "ACCEPTED":
      case "HIRED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" /> Hired
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case "INTERVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
            <Users className="w-3 h-3" /> Interview
          </span>
        );
      case "SHORTLISTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" /> Shortlisted
          </span>
        );
      default: // APPLIED
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <FileText className="w-3 h-3" /> Applied
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Applications
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Track the status of your job applications.
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Applications Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You haven't applied to any jobs yet. Start exploring!
            </p>
            <Link
              to="/jobs"
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                {/* Left: Job Info */}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {app.job_title}
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Building className="w-4 h-4 text-gray-400" />
                      {app.company_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {app.job_location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      Applied: {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <Link
                    to={`/jobs/${app.job_id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-center w-full md:w-auto"
                  >
                    View Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
