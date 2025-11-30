import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Briefcase, User, LogOut, PlusCircle, Menu, X, Home, Search, LayoutDashboard, Sparkles } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  // 1. EXTRACT LOADING FROM CONTEXT
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const getDisplayName = () => {
    if (!user) return "";
    return user.full_name || user.name || user.email || "User";
  };

  const isCompany = () => {
    return user?.role === "company" || user?.role === "COMPANY";
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          
          {/* LOGO */}
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center gap-2 text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition"
          >
            <div className="p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="hidden sm:inline">CampusCareer AI</span>
            <span className="sm:hidden">CampusCareer</span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition ${
                isActive("/")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              to="/jobs"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition ${
                isActive("/jobs")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <Search className="w-4 h-4" />
              Jobs
            </Link>

            {/* 2. AUTH STATUS CHECK LOGIC */}
            {loading ? (
              // OPTION A: Show nothing while loading (prevents flash)
              <div className="w-24"></div> 
            ) : user ? (
              // IF LOADED AND USER EXISTS
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                
                {isCompany() && (
                  <>
                    <Link
                      to="/my-jobs"
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition ${
                        isActive("/my-jobs")
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <Link
                      to="/post-job"
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Post Job</span>
                    </Link>
                  </>
                )}

                {/* User Profile Dropdown Trigger */}
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition">
                        {getDisplayName()}
                      </span>
                      {user.role && (
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-400 transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // IF LOADED AND NO USER (GUEST)
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-in slide-in-from-top">
            <div className="flex flex-col space-y-2">
              
              <Link
                to="/"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                  isActive("/")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              
              <Link
                to="/jobs"
                onClick={handleLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                  isActive("/jobs")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Search className="w-5 h-5" />
                Browse Jobs
              </Link>

              {/* 3. MOBILE AUTH CHECK LOGIC */}
              {loading ? (
                 <div className="px-4 py-3 text-gray-400 text-sm">Checking authentication...</div>
              ) : user ? (
                <>
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          {getDisplayName()}
                        </div>
                        {user.role && (
                          <span className="text-xs uppercase tracking-wider bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                            {user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isCompany() && (
                    <>
                      <Link
                        to="/my-jobs"
                        onClick={handleLinkClick}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                          isActive("/my-jobs")
                            ? "text-blue-600 bg-blue-50"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </Link>

                      <Link
                        to="/post-job"
                        onClick={handleLinkClick}
                        className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                      >
                        <PlusCircle className="w-5 h-5" />
                        Post New Job
                      </Link>
                    </>
                  )}

                  <Link
                    to="/profile"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User className="w-5 h-5" />
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-50 font-medium transition"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleLinkClick}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-semibold"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;