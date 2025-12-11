import React from "react";
import { MapPin, Building, Clock, DollarSign, Calendar } from "lucide-react"; // Added Calendar Icon
import { Link } from "react-router-dom";

const JobCard = ({ job }) => {
  // Helper to format deadline text
  const getDeadlineText = () => {
    if (!job.deadline) return "Open until filled";
    return `Deadline: ${new Date(job.deadline).toLocaleDateString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition duration-300 flex flex-col h-full">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start gap-3 mb-4">
        {/* Title & Company */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-lg sm:text-xl font-bold text-gray-800 line-clamp-2 leading-tight"
            title={job.title}
          >
            {job.title}
          </h3>
          <p className="text-blue-600 font-medium flex items-center gap-1 mt-1 truncate">
            <Building className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {job.company_name || "Hidden Company"}
            </span>
          </p>
        </div>

        {/* Badge */}
        <span
          className={`shrink-0 text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
            job.job_type === "Internship"
              ? "bg-purple-100 text-purple-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {job.job_type}
        </span>
      </div>

      {/* BODY SECTION */}
      <div className="space-y-2 mb-6 flex-grow">
        <p className="text-gray-500 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {job.location || job.company_location}
          </span>
        </p>

        <p className="text-gray-500 text-sm flex items-center gap-2">
          <DollarSign className="w-4 h-4 shrink-0" />
          {job.salary_range || "Not disclosed"}
        </p>

        <p className="text-gray-500 text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          Posted {new Date(job.created_at).toLocaleDateString()}
        </p>

        {/*Deadline Display */}
        <p
          className={`text-sm flex items-center gap-2 ${
            job.deadline ? "text-orange-600 font-medium" : "text-gray-400"
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          {getDeadlineText()}
        </p>

        <p className="text-gray-600 text-sm mt-3 line-clamp-3">
          {job.description}
        </p>
      </div>

      {/* FOOTER BUTTON */}
      <Link
        to={`/jobs/${job.id}`}
        className="mt-auto w-full block text-center bg-gray-50 hover:bg-gray-100 text-blue-600 font-semibold py-2 rounded-lg border border-gray-200 transition"
      >
        View Details
      </Link>
    </div>
  );
};

export default JobCard;
