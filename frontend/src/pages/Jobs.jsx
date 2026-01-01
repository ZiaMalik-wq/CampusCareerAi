import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";
import JobCard from "../components/JobCard";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Search,
  Sparkles,
  Database,
  Layers,
  X,
  SlidersHorizontal,
} from "lucide-react";
import axios from "axios";

const JOBS_CACHE_TTL_MS = 60_000;
const jobsCache = new Map();

function getJobsCacheKey({ query, mode }) {
  const token = localStorage.getItem("token") || "anon";
  const q = (query || "").trim().toLowerCase();
  return `${token}::${mode}::${q}`;
}

const JobSkeleton = () => (
  <div
    aria-hidden="true"
    className="h-full min-h-[16rem] rounded-xl bg-gray-100 animate-pulse border border-gray-200"
  />
);

const COLOR_VARIANTS = {
  purple: "bg-purple-600 text-white border-purple-600",
  blue: "bg-blue-600 text-white border-blue-600",
  green: "bg-green-600 text-white border-green-600",
  white: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
};

const SEARCH_MODES = {
  hybrid: {
    icon: Layers,
    label: "Hybrid Search",
    description: "AI understanding + exact keyword matching",
    badge: "Recommended",
    color: "purple",
  },
  semantic: {
    icon: Sparkles,
    label: "AI Semantic",
    description: "Natural language understanding",
    badge: "Smart",
    color: "blue",
  },
  sql: {
    icon: Database,
    label: "Keyword Match",
    description: "Exact text matching",
    badge: "Classic",
    color: "green",
  },
};

const Jobs = () => {
  const reduceMotion = useReducedMotion();
  const abortRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("hybrid");
  const [showFilters, setShowFilters] = useState(false);
  const [showModeInfo, setShowModeInfo] = useState(false);

  const fetchJobs = useCallback(async (query, mode, isInitial = false) => {
    const cacheKey = getJobsCacheKey({ query, mode });
    const cached = jobsCache.get(cacheKey);
    const now = Date.now();
    const cacheIsValid =
      cached &&
      now - cached.fetchedAt < JOBS_CACHE_TTL_MS &&
      Array.isArray(cached.jobs);

    if (cacheIsValid) {
      setJobs(cached.jobs);
      setError(null);
      setInitialLoading(false);
      setSearchLoading(false);
      return;
    }

    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    if (isInitial) setInitialLoading(true);
    else setSearchLoading(true);

    setError(null);

    try {
      let endpoint = "/jobs/";
      let params = {};

      if (query && query.trim()) {
        params.q = query;
        endpoint =
          mode === "semantic"
            ? "/jobs/semantic"
            : mode === "sql"
            ? "/jobs/search"
            : "/jobs/hybrid";
      }

      const res = await api.get(endpoint, {
        params,
        signal: controller.signal,
      });

      const nextJobs = Array.isArray(res.data) ? res.data : [];
      setJobs(nextJobs);
      jobsCache.set(cacheKey, { fetchedAt: Date.now(), jobs: nextJobs });
    } catch (err) {
      if (axios.isCancel(err) || err.code === "ERR_CANCELED") {
        console.log("Request canceled");
      } else {
        console.error("Fetch error:", err);
        setError("Failed to load jobs. Please check your connection.");
      }
    } finally {
      if (!controller.signal.aborted) {
        setInitialLoading(false);
        setSearchLoading(false);
      }
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchJobs("", "hybrid", true);
    return () => abortRef.current?.abort();
  }, [fetchJobs]);

  // When Mode changes, re-search with CURRENT query
  useEffect(() => {
    if (!initialLoading) {
      fetchJobs(searchQuery, searchMode, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(searchQuery, searchMode, false);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchJobs("", searchMode, false);
  };

  const itemAnim = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Discover Opportunities
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {jobs.length} positions available
          </p>
        </header>

        {/* Search Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white rounded-3xl shadow-xl border p-6 mb-8 space-y-4"
        >
          <div className="relative">
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              id="job-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Search jobs, skills, companies..."
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Search Modes */}
          <div role="radiogroup" className="flex flex-wrap gap-2">
            {Object.entries(SEARCH_MODES).map(([key, m]) => {
              const Icon = m.icon;
              const active = searchMode === key;
              const btnClass = active
                ? COLOR_VARIANTS[m.color]
                : COLOR_VARIANTS["white"];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSearchMode(key)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all duration-200 ${btnClass} flex items-center justify-center gap-2`}
                >
                  <Icon className="w-4 h-4" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {/* Mode Info */}
          <AnimatePresence>
            {showModeInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 overflow-hidden"
              >
                <span className="font-semibold text-gray-900">Info: </span>
                {SEARCH_MODES[searchMode].description}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-2 text-gray-600 font-medium hover:text-gray-900"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <button
              type="button"
              onClick={() => setShowModeInfo((s) => !s)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showModeInfo ? "Hide info" : "Show info"}
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-xl p-4 text-sm text-gray-500 bg-gray-50"
            >
              Filters coming soon (location, remote, salary)
            </motion.div>
          )}

          <button
            type="submit"
            disabled={searchLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {searchLoading ? "Searching..." : "Search Jobs"}
          </button>
        </form>

        {/* Results Section */}
        {initialLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{error}</h3>
            <button
              onClick={handleSearchSubmit}
              className="mt-4 text-blue-600 hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search terms or filters.
            </p>
          </div>
        ) : (
          <motion.div
            key={`${searchMode}-${searchQuery}-${jobs.length}`}
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                variants={itemAnim}
                className="h-full flex flex-col"
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default Jobs;
