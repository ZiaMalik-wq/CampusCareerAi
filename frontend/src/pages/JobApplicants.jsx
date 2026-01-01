import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  GraduationCap,
  Calendar,
  FileText,
  ChevronDown,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const JobApplicants = () => {
  const { id } = useParams(); // Job ID
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const reduceMotion = useReducedMotion();
  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" },
    },
  };
  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: reduceMotion ? 0 : 0.06 },
    },
  };

  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Track which specific applicant is being updated
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== "company") {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        const jobRes = await api.get(`/jobs/${id}`);
        setJobTitle(jobRes.data.title);

        const appRes = await api.get(`/applications/job/${id}`);
        setApplicants(appRes.data);
      } catch (error) {
        console.error("Error fetching applicants:", error);
        if (error.response?.status === 403) {
          toast.error("You are not authorized to view these applicants.");
          navigate("/my-jobs");
        } else {
          toast.error("Failed to load applicants.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleStatusChange = async (applicationId, newStatus) => {
    // Prevent multiple clicks
    if (updatingId === applicationId) return;

    setUpdatingId(applicationId);
    const toastId = toast.loading("Updating status...");

    try {
      // 1. Call Backend
      // Payload: { "status": "HIRED" } -> Matches ApplicationUpdate schema
      await api.patch(`/applications/${applicationId}/status`, {
        status: newStatus,
      });

      // 2. Update Local State
      setApplicants((prev) =>
        prev.map((app) =>
          app.application_id === applicationId
            ? { ...app, status: newStatus }
            : app
        )
      );

      toast.success(`Marked as ${newStatus}`, { id: toastId });
    } catch (error) {
      console.error("Status Update Error:", error);
      const errorMsg =
        error.response?.data?.detail || "Failed to update status.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      // 3. Stop Loading State (This ensures the dropdown comes back)
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "HIRED":
        return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      case "SHORTLISTED":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "INTERVIEW":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  if (loading)
    return (
      <motion.div
        className="flex justify-center items-center h-[80vh]"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </motion.div>
    );

  return (
    <motion.div
      className="min-h-screen bg-gray-50 py-10 px-4"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <Toaster position="top-center" />
      <div className="container mx-auto max-w-6xl">
        {/* HEADER */}
        <motion.div variants={fadeUp} className="mb-8">
          <button
            onClick={() => navigate(`/my-jobs`)}
            className="flex items-center text-gray-500 hover:text-blue-600 mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>

          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
              <p className="text-gray-600 mt-1">
                Viewing candidates for{" "}
                <span className="font-semibold text-blue-600">{jobTitle}</span>
              </p>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-medium text-gray-600">
              Total: {applicants.length}
            </div>
          </div>
        </motion.div>

        {/* CONTENT */}
        {applicants.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              No applicants yet
            </h3>
            <p className="text-gray-500 mt-2">
              Wait for students to discover your job posting.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={fadeUp}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Education
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                      Resume
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applicants.map((applicant) => (
                    <tr
                      key={applicant.application_id}
                      className="hover:bg-blue-50/30 transition"
                    >
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                            {applicant.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {applicant.full_name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="w-3 h-3" />
                              {applicant.email}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              Applied:{" "}
                              {new Date(
                                applicant.applied_at
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Education */}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 flex items-center gap-1">
                            <GraduationCap className="w-4 h-4 text-gray-400" />
                            {applicant.university || "N/A"}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            CGPA:{" "}
                            <span className="font-semibold text-gray-700">
                              {applicant.cgpa || "N/A"}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {applicant.skills ? (
                            applicant.skills
                              .split(",")
                              .slice(0, 3)
                              .map((skill, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200"
                                >
                                  {skill.trim()}
                                </span>
                              ))
                          ) : (
                            <span className="text-xs text-gray-400">
                              No skills
                            </span>
                          )}
                        </div>
                      </td>

                      {/* --- STATUS DROPDOWN --- */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative w-fit">
                            <select
                              value={applicant.status}
                              disabled={updatingId === applicant.application_id}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(
                                  applicant.application_id,
                                  e.target.value
                                );
                              }}
                              className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors uppercase 
                                ${getStatusColor(applicant.status)}
                                ${
                                  updatingId === applicant.application_id
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }
                              `}
                            >
                              {/* Ensure these values match your backend Enum exactly */}
                              <option value="applied">Applied</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="interview">Interview</option>
                              <option value="hired">Hired</option>
                              <option value="rejected">Rejected</option>
                            </select>

                            {/* Chevron or Spinner */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              {updatingId === applicant.application_id ? (
                                <Loader2 className="w-3 h-3 animate-spin text-gray-600" />
                              ) : (
                                <ChevronDown
                                  className={`w-3 h-3 ${
                                    applicant.status === "HIRED" ||
                                    applicant.status === "REJECTED"
                                      ? "opacity-70"
                                      : "text-blue-600"
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Resume Action */}
                      <td className="px-6 py-4 text-right">
                        {applicant.resume_url ? (
                          <a
                            href={applicant.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-200 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition"
                          >
                            <FileText className="w-4 h-4" />
                            View CV
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No CV
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default JobApplicants;
