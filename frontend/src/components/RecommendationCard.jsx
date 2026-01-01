import React from "react";
import { Link } from "react-router-dom";
import { Building, MapPin, CheckCircle, XCircle, Sparkles } from "lucide-react";

const RecommendationCard = ({ job }) => {
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-orange-600 bg-orange-50 border-orange-200";
  };

  const scoreClass = getScoreColor(job.match_score);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-300 relative overflow-hidden">
      {/* AI Badge Background Effect */}
      <div
        className={`absolute top-0 right-0 p-4 rounded-bl-2xl border-b border-l ${scoreClass}`}
      >
        <div className="flex flex-col items-center leading-tight">
          <span className="text-xl font-bold">{job.match_score}%</span>
          <span className="text-[10px] uppercase font-bold tracking-wider">
            Match
          </span>
        </div>
      </div>

      <div className="pr-16">
        {" "}
        {/* Padding right to avoid overlap with badge */}
        <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
          {job.title}
        </h3>
        <p className="text-gray-600 font-medium text-sm flex items-center gap-1 mt-1">
          <Building className="w-4 h-4" />
          {job.company_name}
        </p>
        <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3" />
          {job.company_location || job.location}
        </p>
      </div>

      {/* AI Reason */}
      <div className="mt-4 bg-purple-50 p-3 rounded-lg border border-purple-100">
        <div className="flex gap-2 items-start">
          <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-purple-800 italic">"{job.why}"</p>
        </div>
      </div>

      {/* Skills Breakdown */}
      <div className="mt-4 space-y-2">
        {/* Matching Skills */}
        {job.matching_skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.matching_skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium"
              >
                <CheckCircle className="w-3 h-3" />
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Missing Skills (Optional: Don't show too many to avoid discouraging user) */}
        {job.missing_skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.missing_skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md border border-gray-200"
              >
                <XCircle className="w-3 h-3" />
                {skill}
              </span>
            ))}
            {job.missing_skills.length > 3 && (
              <span className="text-xs text-gray-400 self-center">
                +{job.missing_skills.length - 3} more missing
              </span>
            )}
          </div>
        )}
      </div>

      <Link
        to={`/jobs/${job.id}`}
        className="mt-6 w-full block text-center bg-gray-900 text-white font-semibold py-2.5 rounded-lg hover:bg-black transition"
      >
        View Job Details
      </Link>
    </div>
  );
};

export default RecommendationCard;
