import React, { useState, useEffect } from "react";
import api from "../services/api";
import JobCard from "../components/JobCard";
import {
  Search,
  Sparkles,
  Database,
  Layers,
  X,
  Filter,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("hybrid");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = async (queryOverride = null, modeOverride = null) => {
    setLoading(true);
    setError(null);

    // Determine values to use: Use the override if provided, otherwise use current state
    const queryToUse = queryOverride !== null ? queryOverride : searchQuery;
    const modeToUse = modeOverride !== null ? modeOverride : searchMode;

    try {
      let endpoint = "/jobs/";
      let params = {};

      if (queryToUse.trim()) {
        params = { q: queryToUse };

        if (modeToUse === "semantic") {
          endpoint = "/jobs/semantic";
        } else if (modeToUse === "sql") {
          endpoint = "/jobs/search";
        } else {
          endpoint = "/jobs/hybrid";
        }
      }

      console.log(`Fetching from: ${endpoint} with params:`, params);

      const response = await api.get(endpoint, { params });
      setJobs(response.data);

      // Update isSearching based on the query we actually used
      setIsSearching(!!queryToUse.trim());
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. The server might be busy or offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleClearSearch = () => {
    setSearchQuery(""); // Update UI state
    fetchJobs("");
  };

  // UX Improvement 3: Immediate Search on Mode Change
  const handleModeChange = (newMode) => {
    setSearchMode(newMode); // Update UI state
    // If there is text, trigger search immediately with new mode
    if (searchQuery.trim()) {
      fetchJobs(null, newMode);
    }
  };

  // Helper for UI Modes
  const getModeInfo = (mode) => {
    const modes = {
      hybrid: {
        icon: Layers,
        label: "Hybrid Search",
        description: "Best of both worlds—AI understanding + exact matching",
        badge: "Recommended",
        activeClasses:
          "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30",
        bgClass: "bg-purple-50",
        borderClass: "border-purple-100",
        iconBgClass: "bg-purple-100",
        iconColorClass: "text-purple-600",
        textColorClass: "text-purple-900",
        badgeBgClass: "bg-purple-200",
        badgeTextClass: "text-purple-700",
        descColorClass: "text-purple-700",
      },
      semantic: {
        icon: Sparkles,
        label: "AI Semantic",
        description:
          "Natural language search that understands context and meaning",
        badge: "Smart",
        activeClasses:
          "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30",
        bgClass: "bg-blue-50",
        borderClass: "border-blue-100",
        iconBgClass: "bg-blue-100",
        iconColorClass: "text-blue-600",
        textColorClass: "text-blue-900",
        badgeBgClass: "bg-blue-200",
        badgeTextClass: "text-blue-700",
        descColorClass: "text-blue-700",
      },
      sql: {
        icon: Database,
        label: "Keyword Match",
        description: "Fast, precise text matching for specific terms",
        badge: "Classic",
        activeClasses:
          "bg-green-600 border-green-600 text-white shadow-lg shadow-green-500/30",
        bgClass: "bg-green-50",
        borderClass: "border-green-100",
        iconBgClass: "bg-green-100",
        iconColorClass: "text-green-600",
        textColorClass: "text-green-900",
        badgeBgClass: "bg-green-200",
        badgeTextClass: "text-green-700",
        descColorClass: "text-green-700",
      },
    };
    return modes[mode];
  };

  const currentMode = getModeInfo(searchMode);
  const ModeIcon = currentMode.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Discover Opportunities
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Powered by intelligent search • {jobs.length} positions
                available
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH SECTION */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-grow relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 transition group-focus-within:text-blue-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchMode === "semantic"
                      ? "Try: 'remote data analyst role in fintech'"
                      : "Search by job title, skills, company, location..."
                  }
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition text-gray-700 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Mode Selector */}
              <div className="flex gap-2 lg:min-w-[420px]">
                {["hybrid", "semantic", "sql"].map((mode) => {
                  const info = getModeInfo(mode);
                  const Icon = info.icon;
                  const isActive = searchMode === mode;

                  return (
                    <button
                      key={mode}
                      type="button"
                      // UX Fix: Use the new handler
                      onClick={() => handleModeChange(mode)}
                      className={`flex-1 px-4 py-4 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 border-2 ${
                        isActive
                          ? info.activeClasses
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline">
                        {info.label.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Button */}
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 lg:min-w-[140px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Searching</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>

            {/* Mode Info Bar */}
            <div
              className={`flex items-start gap-3 p-4 rounded-2xl ${currentMode.bgClass} border ${currentMode.borderClass}`}
            >
              <div
                className={`p-2 ${currentMode.iconBgClass} rounded-lg mt-0.5`}
              >
                <ModeIcon className={`w-4 h-4 ${currentMode.iconColorClass}`} />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`font-semibold ${currentMode.textColorClass}`}
                  >
                    {currentMode.label}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${currentMode.badgeBgClass} ${currentMode.badgeTextClass} font-medium`}
                  >
                    {currentMode.badge}
                  </span>
                </div>
                <p className={`text-sm ${currentMode.descColorClass}`}>
                  {currentMode.description}
                </p>
              </div>
            </div>
          </form>

          {/* Quick Search Suggestions */}
          {!searchQuery && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-500">
                  Popular Searches
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Remote React Developer",
                  "Data Analyst NYC",
                  "Marketing Intern",
                  "Full Stack Engineer",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    // UX Fix: Update UI state AND fetch immediately
                    onClick={() => {
                      setSearchQuery(suggestion);
                      fetchJobs(suggestion);
                    }}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm text-gray-700 font-medium transition hover:shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RESULTS SECTION */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-500 mt-6 animate-pulse font-medium">
              {searchMode === "semantic"
                ? "AI is analyzing your query..."
                : "Searching opportunities..."}
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => fetchJobs()} // Simple retry
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No matches found
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {isSearching
                ? "Try adjusting your search terms or switching to a different search mode."
                : "No jobs are currently available. Check back soon!"}
            </p>
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
              >
                Clear Search & View All Jobs
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isSearching ? "Search Results" : "All Opportunities"}
                </h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
                </span>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
