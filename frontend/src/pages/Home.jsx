import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sparkles, Briefcase, Search, Upload, ArrowRight, LayoutDashboard, TrendingUp, Users, Zap } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  const isCompany = user?.role === 'company' || user?.role === 'COMPANY';
  const isStudent = user?.role === 'student' || user?.role === 'STUDENT';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      
      {/* HERO SECTION - Enhanced with better visual hierarchy */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="relative flex flex-col items-center justify-center pt-24 pb-20 text-center px-4 max-w-5xl mx-auto">
          {/* Badge with better styling */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 backdrop-blur-sm text-blue-700 text-sm font-semibold mb-8 hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Advanced AI</span>
          </div>

          {/* Improved typography with better spacing */}
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
            Find Your Dream{' '}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient">
                Career
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-12 leading-relaxed font-light">
            AI-powered platform matching your unique skills with perfect opportunities using semantic search and intelligent scoring.
          </p>

          {/* Enhanced CTAs with better visual weight */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg justify-center mb-8">
            
            {isStudent && (
              <>
                <Link 
                  to="/recommendations" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Sparkles className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">AI Recommendations</span>
                </Link>
                <Link 
                  to="/jobs" 
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-200 rounded-2xl font-bold hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Browse Jobs
                </Link>
              </>
            )}

            {isCompany && (
              <>
                <Link 
                  to="/post-job" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-green-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Briefcase className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Post New Job</span>
                </Link>
                <Link 
                  to="/my-jobs" 
                  className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-200 rounded-2xl font-bold hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link 
                  to="/jobs" 
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Browse Jobs
                </Link>
                <Link 
                  to="/register" 
                  className="group px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 border-2 border-gray-200 rounded-2xl font-bold hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Get Started 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Trust indicators - new section */}
          <div className="flex items-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>10,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>500+ Companies</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span>95% Match Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES SECTION - Improved with better cards */}
      <div className="py-24 px-4 container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose CampusCareer?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of job searching with our AI-powered platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 - Enhanced cards */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Resume Parsing</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your PDF resume and let our AI automatically extract your skills, education, and experience with precision.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Semantic Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                Beyond keywords—our AI understands the meaning behind your skills to find your perfect job match.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Search naturally like "I want a remote python job" and get instant, accurate results powered by AI.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;